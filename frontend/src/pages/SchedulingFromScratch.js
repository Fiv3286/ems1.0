import { Typography, Box, Button, Alert, Stack } from "@mui/material";
import { Fragment, useEffect, useRef, useState } from 'react';
import ScheduleTable from "../components/ScheduleTable";
import NavBarSteeringChair from '../components/Navbars/NavBarSteeringChair'
import NewScheduleModal from "../components/NewScheduleModal";
import dayjs from 'dayjs';
import AllocationTable from "../components/AllocationTable";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosProtected from "../hooks/useAxiosProtected";
import { useContainerDimensions } from "../hooks/useContainerDimentions";

const yaml = require('yaml');

/**
 * @author Aleksandar Petrov
 */
export default function SchedulingFromScratch() {
    const [schedule, setSchedule] = useState([]);
    const [newScheduleModal, setNewScheduleModal] = useState(false);
    const [editingConference, setEditingConference] = useState(false)
    const [committees, setCommittees] = useState([])
    const [dates, setDates] = useState([]);
    const [conferenceId, setConferenceId] = useState(null);
    const api = useAxiosProtected();

    const [loading, setLoading] = useState(true)
    const [loadingError, setLoadingError] = useState(false)

    const { year } = useParams()
    const currentDate = dayjs().set('year', year)

    const page = useRef();
    let pageDim = useContainerDimensions(page);

    const navigator = useNavigate()

    let commiteeData = [];

    //filters the sessions in the date range
    const filteredSessions = schedule.filter(session => {
        return dates.includes(session.day)
    })

    //get all sessions for the year
    useEffect(() => {
        setNewScheduleModal(false); // in case the year is changed from the url
        setLoading(true)
        setLoadingError(false)
        api.get('conferences/sessions/', { params: { year } }) // get conference by year
            .then((res) => {
                const conference = res.data
                setLoading(false)
                // either open modal for creating new conference or display the schedule
                if (conference.length === 0) {
                    // open modal
                    setSchedule([]);
                    setDates([]);
                    setCommittees([]);
                    setConferenceId();
                    handleOpenNewScheduleModal();
                    return
                }
                setConferenceId(conference[0]._id)
                setDates(conference[0].dates)
                setCommittees(conference[0].committees)
                setLoading(true)
                // get the sessions of the conference
                api.get('sessions', { params: { conference_id: conference[0]._id, full: true, year } })
                    .then((res) => {
                        const sessions = res.data;
                        setSchedule(sessions)
                        setLoading(false)

                    })
                    .catch((err) => {
                        setLoading(false)
                        setLoadingError(true)
                    })

            })
            .catch((err) => {
                setLoading(false)
                setLoadingError(true)
            })
    }, [conferenceId, year, api])

    // open modal for creating a conference
    const handleOpenNewScheduleModal = () => setNewScheduleModal(true);
    // close modal for creating a conference
    const handleCloseNewScheduleModal = () => {
        if (!editingConference) {
            return;
        }
        setNewScheduleModal(false);
        setEditingConference(false)
    }

    /**
     * Function which cretes a conference in the database.
     * @param startDate - start date
     * @param endDate - end date
     * @param includeWeekends - boolean check if to include the weeekends in the date range
     * @param committees - committees which participate
     */
    function handleCreateSchedule(startDate, endDate, includeWeekends, committees) {
        let dates = [];
        // generate dates
        for (let current = startDate; current.isBefore(endDate) || current.isSame(endDate); current = current.add(1, 'day')) {
            if (!includeWeekends && (current.day() === 6 || current.day() === 0)) {
                continue
            }
            dates.push(current.format("YYYY-MM-DD"));
        }
        api.post('conferences/sessions', { year, dates, committees })
            .then((res) => {
                const conference = res.data[0]
                setDates(conference.dates)
                setConferenceId(conference._id);
                setCommittees(conference.committees)
            })
            .catch((err) => {
                setLoadingError(true)
            })
        setNewScheduleModal(false);
    }

    // same as handleCreateSchedule but uses patch request instead of post
    function handleEditConference(startDate, endDate, includeWeekends, committees) {
        let dates = [];
        // generate dates
        for (let current = startDate; current.isBefore(endDate) || current.isSame(endDate, 'day'); current = current.add(1, 'day')) {
            if (!includeWeekends && (current.day() === 6 || current.day() === 0)) {
                continue
            }
            dates.push(current.format("YYYY-MM-DD"));
        }
        api.patch(`conferences/sessions/${conferenceId}`, { year, dates, committees })
            .then((res) => {
                setDates(res.data.dates)
                setCommittees(res.data.committees)
                setNewScheduleModal(false);
            })
            .catch((err) => {
                setLoadingError(true)
                setNewScheduleModal(false);
            })
        setNewScheduleModal(false);
        setEditingConference(false);
    }

    /**
     * Used for downloading the generated YAML file
     */
    function downloadFile() {
        api.get('/exports/conference', { params: { year } })
            .then(res => {
                // const content = yaml.load(JSON.stringify(res.data))
                const file = new Blob([yaml.stringify(res.data)], { type: 'application/x-yml' })
                const url = URL.createObjectURL(file);
                var a = document.createElement("a")
                a.href = url;
                a.download = `Schedule ${year}.yaml`
                document.body.appendChild(a);
                a.click()
            })
            .catch(err => {
                //
            })
    }

    return (
        <Box ref={page}>
            <NavBarSteeringChair />
            <Typography variant="h2" align="center"> Scheduler</Typography>
            {loading && <Alert color="warning">Loading...</Alert>}
            {loadingError && <Alert color="error">Ops something went wrong</Alert>}
            <Box sx={{
                padding: '3rem',
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '4rem'
            }}>
                {!loading && !loadingError &&
                    <NewScheduleModal
                        open={newScheduleModal}
                        handleClose={handleCloseNewScheduleModal}
                        handleCreate={handleCreateSchedule}
                        handleSaveEdit={handleEditConference}
                        initialStartDate={conferenceId ? dayjs(dates[0]) : currentDate}
                        initialEndDate={conferenceId ? dayjs(dates[dates.length - 1]) : currentDate}
                        initialConferenceList={committees}
                        initialIncludeWeekends={true}
                        editing={editingConference}
                    />
                }
                {conferenceId && !loading && !loadingError &&
                    <>
                        <Box marginTop={6}>
                            <AllocationTable
                                schedule={filteredSessions}
                                committees={committees}
                            />
                            {commiteeData.map((commitee) => <Fragment key={commitee.name}><br />{commitee.name}-{commitee.slots}</Fragment>)}
                        </Box>

                        <Box>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={5}
                                sx={{ marginBottom: '20px' }}
                            >
                                <Button size='large' variant="contained" onClick={() => { setEditingConference(true); handleOpenNewScheduleModal(); }} color="warning">Edit Dates & Committees</Button>
                                <Button size='large' variant="contained" color="warning" onClick={() => navigator(`/admin/${year}/detailed-overview`)}>Detailed overview</Button>
                            </Stack>
                            <ScheduleTable
                                commiteeData={commiteeData}
                                setSchedule={setSchedule}
                                schedule={filteredSessions}
                                dates={dates}
                                committees={committees}
                                conferenceId={conferenceId}
                                maxTableWidth={pageDim.width - 350}
                            />
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={5}
                                sx={{ marginBottom: '20px' }}
                                padding={2}
                            >
                                <Button variant="contained" size="large" color="warning" onClick={downloadFile}>Generate YAML</Button>
                            </Stack>
                        </Box>
                    </>
                }
            </Box>
        </Box>
    );
}
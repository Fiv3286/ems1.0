import { Alert, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useState } from 'react';
import ActivityModal from "./ActivityModal";
import useAxiosProtected from "../hooks/useAxiosProtected";
import dayjs from 'dayjs';
import { useParams } from "react-router-dom";
import 'dayjs/locale/en-gb';

const MAX_NUMBER_OF_PARALLEL_CONFERENCES = 7;
// these are used for start and and time but javascript doesnt have only Time objects
const START_TIME_DAY = new Date("0000-01-01 08:00");
const END_TIME_DAY = new Date("0000-01-01 20:00");

export default function ScheduleTable({ setSchedule, schedule, dates, committees, conferenceId, maxTableWidth }){
    // hooks for the modal for adding an activity
    const [activityModal, setActivityModal] = useState(false);
    const [activityModalEdit, setActivityModalEdit] = useState(false);
    const [activityModalSessions, setActivityModalSessions] = useState(null)
    const [activityModalDuration, setActivityModalDuration] = useState("")
    const [activityModalStartTime, setActivityModalStartTime] = useState("")
    const [dayIndex, setDayIndex] = useState(-1);
    const [alert, setAlert] = useState();

    // calculating all times for the schedule
    const timeSlotsAllDays = makeTimeSlots(dates);
    // year from url
    const { year } = useParams()
    // table header and body
    const tableHeader = makeTableHeader(dates);
    const tableBody = makeTableBody(schedule);

    const api = useAxiosProtected()

    /**
     * Show alert message
     * @param message - message to be shown in alert
     */
    function showAlert(message){
        setAlert(<Alert color="error">{message}</Alert>)
    }

    /**
     * Close alert
     */
    function closeAlert(){
        setAlert();
    }

    /**
     * Creates the timeslots from START_TIME_DAY to END_TIME_DAY time separated by 15 minutes
     * @param days - days of the conference
     * @returns 
     */
    function makeTimeSlots(days){
        const timeslots = []
        const allTimeSlots = []
        const numberOfRows = (END_TIME_DAY.getTime() - START_TIME_DAY.getTime())/1000/60/15 ;
        for(let i = 0; i < numberOfRows; i++){;
            var hours = Math.floor(i/4) + START_TIME_DAY.getHours();
            var minutes = i%4 * 15;
            const time = `${hours}:${minutes < 10? '0' + minutes : minutes}`
            timeslots.push(time);
        } 
        days.forEach(_ => {
            allTimeSlots.push(timeslots.slice());
        })
        return allTimeSlots
    }

    /**
     * Open modal for adding/editing an activity
     * @param index - the index of the day in the dates array 
     * @param sessions - in case of editing to show
     * @param edit - open the modal in adding/editing mode
     */
    const openActivityModal = (index, sessions, edit) => {
        setActivityModalEdit(edit);
        if(edit){
            let copy_sessions = []
            sessions.forEach((session) => copy_sessions.push({...session}))
            setActivityModalSessions(copy_sessions);
        }
        else{
            setActivityModalStartTime("")
            setActivityModalDuration("")
            setActivityModalSessions(null)
        }
        setDayIndex(index);
        setActivityModal(true);
    }
    const handleCloseActivityModal = () => {
        setActivityModalSessions(null);
        setActivityModal(false);
    }

    /**
     * Executes when sessions are added/edited
     * @param activities - activities to be added/edited/deleted
     * @param dayIndex - day index in the dates array
     * @returns 
     */
    function handleConfirmActivity(activities, dayIndex){
        let error = false;
        activities.every((act) => {
            if(act.start_time === ""){
                showAlert("Start time has not been assigned!");
                error = true;
                return false;
            }
            if(act.duration === ""){
                showAlert("Duration has not been assigned");
                error = true;
                return false;
            }
            if(act.type === "CONFERENCE" && act.conference === ""){
                showAlert("Missing commitee for a conference!");
                error = true;
                return false;
            }
            act.day = dates[dayIndex];
            act.duration = parseInt(act.duration)
            act.year = year
            let end_time = new Date(new Date("0000-01-01 " + act.start_time).getTime() + act.duration * 60 * 1000);
            act.end_time = end_time.getHours() + ':' + end_time.getMinutes();
            act.presentations = []
            act.conference_id = conferenceId
            return true;
        })
        if(error){
            return false;
        }
        //edit mode
        if(activityModalEdit){
            const date = dates[dayIndex]
            const st = `${activityModalStartTime}:00`
            const editActivities = activities.filter(session => !!session._id)
            const createActivities = activities.filter(session => !session._id)
            const removeActivities = schedule.filter(session => session.day === date && session.start_time === st && !!session._id && !editActivities.some(el => el._id === session._id))
            let requests = []
            if(editActivities.length > 0){
                requests = editActivities.map((session) => api.patch(`sessions/${session._id}`, session))
            }
            if(createActivities.length > 0){
                requests.push(api.post(`sessions/`, createActivities))
            }
            if(removeActivities.length > 0){
                requests = requests.concat(removeActivities.map((session) => api.delete(`sessions/${session._id}`, session)))
            }
            Promise.all(requests)
            .then((results) => {
                let newSchedule = schedule.slice();
                //edit
                for(let i = 0; i < editActivities.length; i++){
                    let index = newSchedule.findIndex((session) => session._id === results[i].data._id)
                    newSchedule[index] = results[i].data;
                }
                //create
                if(createActivities.length > 0){
                    newSchedule = newSchedule.concat(results[editActivities.length].data)
                }
                //delete
                removeActivities.forEach(act => newSchedule = newSchedule.filter(session => session._id !== act._id))
                
                setSchedule(newSchedule)
            })
            .catch((err) => {
                // TO DO
            })
        }
        // create mode
        else{
            api.post('sessions/', activities)
            .then((res) => {
                setSchedule(schedule.concat(res.data))
            })
            .catch((err) => {
            })
        }

        closeAlert();
        handleCloseActivityModal();
    }

    /**
     * Open the activity modal in edit mode and prepare the initial values
     * @param sessions - sessions data
     * @param duration - duration of the sessions
     * @param day - index of the day in the dates array 
     */
    function handleEdit(sessions, duration, day){
        setActivityModalStartTime((sessions[0].start_time).substring(0, 5))
        setActivityModalDuration(duration);
        openActivityModal(day, sessions, true)
    }

    /**
     * Delete session
     * @param sessions - sessions to be deleted 
     */
    function handleDelete(sessions){
        Promise.all(sessions.map(session => api.delete(`sessions/${session._id}`)))
        .then((res) => {
            const ids = sessions.map(session => session._id); // ids which were deleted
            setSchedule(schedule.filter(session => !ids.includes(session._id)))
        })
        .catch((err) => {
        })
    }
    
    /**
     * Creates the header row ot the table
     * @param days - days of the conference
     * @returns array of cells for the top row
     */
    function makeTableHeader(days){
        let header = []
        header.push(<TableCell key={`time`}><Typography variant="h6">Time</Typography></TableCell>);
        days.forEach((day, dayIndex) => {
            const cell = (
                <TableCell key={`${day} header`} align="center" colSpan={MAX_NUMBER_OF_PARALLEL_CONFERENCES + 1}>
                    <Typography variant="h6">{dayjs(day).format("LL")} </Typography>
                    <Button variant="contained" onClick={() => openActivityModal(dayIndex, null, false)}>+ Add activity</Button>
                </TableCell>
            )
            header.push(cell);
        });
        return header
    }

    /**
     * Makes the body of the table
     * @param schedule - array of sessions to be displayed 
     * @returns Array of rows of table
     */
    function makeTableBody(schedule){
        let tableBody = [];
        const numberOfRows = (END_TIME_DAY.getTime() - START_TIME_DAY.getTime())/1000/60/15 ;
        // make the left column of the table showing all the timeslots
        for(let i = 0; i < numberOfRows; i++){
            tableBody.push([]);
            var hours = Math.floor(i/4) + START_TIME_DAY.getHours();
            var minutes = i%4 * 15;
            const time = `${hours}:${minutes < 10? '0' + minutes : minutes}`
            tableBody[i].push(<TableCell key={"time row " + i}>{time}</TableCell>);
            const emptyCells = []
            dates.forEach(element => {
                emptyCells.push(<TableCell colSpan={MAX_NUMBER_OF_PARALLEL_CONFERENCES + 1} key={`col for ${element} ${time}`}></TableCell>)
            });
            tableBody[i] = tableBody[i].concat(emptyCells) // this is like this to fix warnings
        }

        // group sessions by day
        let days = schedule.reduce((days, session) => ({
            ...days,
            [session.day]: [...(days[session.day] || []), session]
        }), {});
        days = Object.entries(days).map((entry) => ({"date": entry[0], "sessions": entry[1]})); // array of objects with date and session for each day in the conference
        days.forEach((day) => {
            const dayIndex = dates.findIndex((x) => x === day.date)
            // group sessions by start time
            let activities = day.sessions.reduce((activities, session) => ({
                ...activities,
                [session.start_time]: [...(activities[session.start_time] || []), session]
            }), {});
            activities = Object.entries(activities).map((entry) => ({"start_time": entry[0], "sessions": entry[1]})); // array of objects with start time and session for each allocated slot in the conference
            activities.forEach((activity) => {
                const index = (((new Date("0000-01-01 " + activity.sessions[0].start_time)).getTime()) - START_TIME_DAY.getTime())/1000/60/15
                let padding = MAX_NUMBER_OF_PARALLEL_CONFERENCES + 1;
                let cspan = Math.floor((MAX_NUMBER_OF_PARALLEL_CONFERENCES) / activity.sessions.length);
                const duration = Math.max(...activity.sessions.map(o => o.duration))/15
                let cell = []
                // map through each session and add a tablecell for it
                activity.sessions.forEach((session, index) => {
                    let heading = <Typography variant="h6" align="center">{session_types[session.type] || "Unknown"}</Typography>;
                    let body = [];
                    padding -= cspan;
                    switch(session.type){
                        case "CONFERENCE":
                            body.push(`${session.conference} - ${session.duration/30} slots`)
                            break;
                        default:
                            body.push(session.description)
                            break
                    }
                    // scuffed code
                    if(index === activity.sessions.length - 1){
                        cell.push(<TableCell colSpan={padding + cspan - 1} rowSpan={duration} key={`${session._id} cell`}>{heading} {body}</TableCell>);
                    }
                    else{
                        cell.push(<TableCell colSpan={cspan} rowSpan={duration} key={`${session._id} cell`}>{heading} {body}</TableCell>);
                    }
                })
                // add the edit and delete buttons
                const buttons = [];
                buttons.push(<Button variant='outlined' size="small" key='edit' onClick={() => handleEdit(activity.sessions, duration * 15, dayIndex)}>Edit</Button>)
                buttons.push(<Button variant='outlined' size="small" color='error' key='delete' onClick={() => handleDelete(activity.sessions)}>Delete</Button>)
                cell.push(<TableCell colSpan={1} rowSpan={duration} align="center" key={`${day.date}${index} buttons`}>
                    <Stack
                        direction="column"
                        spacing={1}
                        align="center"
                        justifyContent="center"
                    >
                    {buttons}
                    </Stack>
                </TableCell>)
                tableBody[index][dayIndex + 1] = cell; 
                timeSlotsAllDays[dayIndex][index] = null;
                // remove all empty cells which are for the slots used by the sessions which were added
                for(let i = 1; i < duration; i++){
                    timeSlotsAllDays[dayIndex][index + i] = null;
                    tableBody[index + i][dayIndex + 1] = null;
                }
            })
        })
        tableBody = tableBody.map((row, index) => (
            <TableRow key={`${index}row`} hover>{row}</TableRow>
        ))
        return tableBody;
    }

    return (
        <> 
            {activityModal && 
                <ActivityModal
                    open={activityModal}
                    handleClose={handleCloseActivityModal}
                    handleConfirm={handleConfirmActivity}
                    dayIndex={dayIndex}
                    sessions={activityModalSessions}
                    start_time_initial={activityModalStartTime}
                    duration_initial={activityModalDuration}
                    timeslots={timeSlotsAllDays[dayIndex]}
                    committees={committees}
                    alert={alert}
                    MAX_NUMBER_OF_PARALLEL_CONFERENCES={MAX_NUMBER_OF_PARALLEL_CONFERENCES}
                    START_TIME_DAY={START_TIME_DAY}
                />
            }
            <TableContainer component={Paper} sx={{maxHeight: '800px', maxWidth: maxTableWidth}}>
                <Table sx={tableStyle} size="small" stickyHeader>
                    <TableHead>
                        <TableRow key='header'>
                            {tableHeader}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableBody}
                    </TableBody>
                </ Table>
            </TableContainer>
        </>
    );
}

const session_types = {
    BREAK: "Break",
    CONFERENCE: "Conference",
    PLENARY: "Plenary session",
    MISC: "Miscellaneous session",
    SPEAKER: "Invited Speaker",
    TUTORIAL: "Tutorial",
}

const tableStyle = {
    width: 'auto',
    "& .MuiTableCell-root": {
        border: "1px solid rgba(224, 224, 224, 1)",
    }
}

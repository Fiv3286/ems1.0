import { Typography, Box, Button, Alert, CircularProgress } from '@mui/material';
import NavBarProgramChair from '../components/Navbars/NavBarProgramChair';
import DayCard from '../components/DayCard';
import { useState, useEffect } from 'react'
import useAxiosProtected from "../hooks/useAxiosProtected"
import { useParams } from 'react-router-dom';

/**
 * Groups the data by days and sorts the sessions on the time
 * @param data - the sessions received from the database 
 * @returns 
 */
function processData(data) {
    let days = data.reduce((groups, session) => ({
        ...groups,
        [session.day]: [...(groups[session.day] || []), session]
    }), {});
    days = Object.entries(days).map((entry) => ({ "date": entry[0], "sessions": entry[1] }))
    days.sort((day1, day2) => {
        return new Date(day1.date) - new Date(day2.date)
    })
    return days
}
/**
 * @author Aleksandar Petrov
 */
export default function SessionSelection() {
    const [programData, setProgramData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { year, committee } = useParams()
    const api = useAxiosProtected();
    const [alert, setAlert] = useState("")

    // load the sessions for a committee
    useEffect(() => {
        const params = {
            conference: committee,
            year: year,
        }
        api.get(`sessions`, { params })
            .then(res => {
                const proccessedData = processData(res.data);
                setProgramData(proccessedData);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                setAlert("Something went wrong with loading the page!")
            })
    }, [committee, year, api]);

    /**
     * Sends a html file to the api
     * @param e - the event caused by the uploading of file
     */
    function handleUpload(e){
        const file = e.target.files[0]
        let formData = new FormData();
        formData.append('file', file); // prob this works
        // return
        api.post('accepted_papers', formData, {
            params:{
                year: year,
                conference: committee
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(res => {
        })
        .catch(err => {
            switch(err.response.status){
                case 418:
                    setAlert("Uploading papers failed! Not html document.")
                    break;
                case 420:
                    setAlert("Uploading papers failed! Document was in the wrong format.")
                    break;
                default:
                    setAlert("Uploading papers failed!")
            }
            
        })
    }

    return (
        <>
            <NavBarProgramChair />
            {alert && <Alert color="error" onClose={() => setAlert("")}>{alert}</Alert>}
            <Typography variant="h2" align="center"> {committee}</Typography>
            <Box sx={{ padding: "5%" }}>
                {programData &&
                    <>
                        <input
                            type="file"
                            accept=".html"
                            style={{ display: 'none' }}
                            id="file"
                            onChange={handleUpload}
                        />
                        <label htmlFor="file">
                            <Button size="large" color="warning" variant="contained" component="span">Upload papers</Button> 
                        </label>
                        
                        {programData.length === 0 ?
                            <Typography variant="h2" align="center" gutterBottom> No sessions :(</Typography>
                            :
                            <>
                                <Typography variant="h4" gutterBottom> Sessions:</Typography>
                                {
                                    programData.map((day) => (
                                        <DayCard day={day} committee={committee} key={day.date}></DayCard>
                                    ))
                                }
                            </>
                        }
                    </>
                }
                {loading &&
                    <CircularProgress/>
                }

            </Box>
        </>
    );
}
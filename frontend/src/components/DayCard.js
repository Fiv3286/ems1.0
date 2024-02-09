import { Typography, Box, Stack, CardActionArea } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const optionsForDate = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

export default function SessionSelection({ day, committee }) {
    const navigation = useNavigate();
    const {year} = useParams()
    function goToSession(id){
        navigation(`/chair/${committee}/${year}/session/${id}`);
    }
    // sort the days by start time
    day.sessions.sort((session1, session2) => {
        return session1.start_time > session2.start_time
    })
    // make a card for each session
    const sessionsItems = day.sessions.map((session) => {
        return (
            <CardActionArea key={session._id} onClick= {() => goToSession(session._id)} sx={{maxWidth:'fit-content'}}>
                <Box  bgcolor={"white"} borderRadius={5} padding={3} height={100} >
                    <Typography variant="h5" align='center' noWrap> {session.title?session.title:"Untitled session"} </Typography>
                    <Typography variant="h6" align='center' noWrap> {session.date} </Typography>
                    <Typography variant="h6" align='center' noWrap> {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}</Typography>
                    <Typography variant="h6" align='center' noWrap> {session.duration/30} slots</Typography>
                </Box>
            </CardActionArea>
        );
    })

    return (
        <Box mb={5} sx={{ 
            background: '#ADD8E6',
            borderRadius: '2rem',
            paddingBottom: '2rem',
            overflow: "auto",
        }}>
            <Typography variant="h6" paddingLeft={2}>{(new Date(day.date + " 00:00:00")).toLocaleDateString("en-GB", optionsForDate)}</Typography>
            <Stack 
                direction="row" 
                spacing={5}
                sx={{
                    width: "auto",
                    paddingLeft: '1rem',  
            }}>
                {sessionsItems}
            </Stack>
        </Box>
    );
}
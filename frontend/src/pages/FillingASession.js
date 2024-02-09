import { Typography, Box, Alert, Stack, CircularProgress } from "@mui/material";
import SessionTable from "../components/SessionTable";
import NavBar from "../components/Navbars/NavBarProgramChair";
import { TextField, Button } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import useAxiosProtected from "../hooks/useAxiosProtected"
import { useNavigate, useParams } from "react-router-dom";

const optionsForDate = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
const optionsForTime = {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
};

/**
 * @author Aleksandar Petrov
 */
export default function FillingASession() {
  const [conference, setConference] = useState("Unknown?");
  const [conferenceId, setConferenceId] = useState();

  const [title, setTitle] = useState("");
  const [titleEditMode, setTitleEditMode] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const api = useAxiosProtected();

  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [day, setDay] = useState();

  const [program, setProgram] = useState([]);

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState("");

  const [sessionData, setSessionData] = useState()

  const { year, id } = useParams()
  const navigator = useNavigate();
  const saveButton = useRef()

 

  // get the session data by id
  useEffect(() => {
    setLoading(true)
    api.get(`sessions/${id}`, { params: { full: true } })
      .then((res) => {
        const session = res.data;
        setSessionData(session)
        session.presentations.forEach(p => p.id = p._id)
        setProgram(session.presentations);

        setConference(session.conference);
        setConferenceId(session.conference_id)
        
        setTitle(session.title ? session.title : "Untitled session");
        setStartTime(new Date(`${session.day} ${session.start_time}`));
        setEndTime(new Date(`${session.day} ${session.end_time}`));
        setDay(session.day)

        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        setAlert("Something went wrong with loading the session!")
      })
  }, [id]);

 /**
   * Save the new title in the database
   */
 function changeSessionTitle() {
  setTitleEditMode(false);
  setTitle(tempTitle);

  const newSession = { ...sessionData };
  newSession.title = tempTitle;
  api.patch(`sessions/${newSession._id}`, { title: newSession.title })
    .then((res) => {
      setSessionData(res.data)
    })
    .catch((err) => {
      setAlert("Something went wrong with changing the title")
    })
  Promise.all(program.map(pres => api.patch('programs/update', {...pres, session: newSession.title}, {params: {_id: pres._id}})))
  .then(res => {
    //Cool
  })
  .catch(err => {
    setAlert("Something went wrong with changing the title")
  })
  setTempTitle("");
}


  function handleKeyDown(e){
    if(e.keyCode === 13){
      saveButton.current.click()
    }
  }

  return (
    <>
      <NavBar />
      {loading && <CircularProgress/>}
      {alert && <Alert color="error" onClose={() => setAlert("")}>{alert}</Alert>}
      {!loading && conferenceId && (
        <>
          <Typography variant="h2" align="center">
            {conference}
          </Typography>
          <Typography variant="h4" align="center">
            Session on: {startTime.toLocaleDateString("en-GB", optionsForDate)}
          </Typography>
          <Typography variant="h5" align="center">
            {startTime.toLocaleTimeString("en-GB", optionsForTime)} -{" "}
            {endTime.toLocaleTimeString("en-GB", optionsForTime)}
          </Typography>
          <Box
            sx={{
              padding: "3rem",
            }}
          >
            {titleEditMode ? (
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <TextField
                  id="title-conference"
                  label="Title"
                  variant="outlined"
                  value={tempTitle}
                  onChange={(e) => {
                    setTempTitle(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  autoFocus 
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={changeSessionTitle}
                  ref={saveButton}
                >
                  {" "}
                  Save <SaveIcon />
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setTitleEditMode(false);
                    setTempTitle("");
                  }}
                >
                  {" "}
                  Cancel <CancelIcon />
                </Button>
              </Stack>
            ) : (
              <>
                <Typography variant="h4">{title}</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setTitleEditMode(true)
                  }}
                >
                  {" "}
                  Change <EditIcon />
                </Button>
              </>
            )}
            <SessionTable
              startTime={startTime}
              endTime={endTime}
              day={day}
              program={program}
              sessionTitle={title}
              conference={conference}
              conferenceId={conferenceId}
            />

            <Button variant="outlined" size="large" sx={{ marginTop: "10px" }} onClick={() => navigator(-1)}>Back</Button>
          </Box>
        </>
      )}
    </>
  );
}

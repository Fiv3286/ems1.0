import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupsIcon from "@mui/icons-material/Groups";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosProtected from "../hooks/useAxiosProtected";
import NavBarSteeringChair from "../components/Navbars/NavBarSteeringChair";

function EditSelectionCommitteeProcess() {
  const [newConference, setNewConference] = useState("");
  const [conferenceList, setConferenceList] = useState([]);
  const navigation = useNavigate();
  const [error, setError] = useState("");
  const { year } = useParams();
  const [conferenceId, setConferenceId] = useState("");
  const axiosProtected = useAxiosProtected();
  /**
   * Async function to load the member data for a committee.
   * @param {*} year - the year of the committee to be loaded.
   * @param {*} committee - the committee name (TACAS, ESOP, etc.).
   * @param {*} newConferenceList  - the updated list of conferences.
   */
  async function getSpecificCommitteeData(year, committee, newConferenceList) {
    axiosProtected
      .get("/committees", {
        params: { conference: committee, year: year },
      })
      .then((res) => {
        if (newConferenceList.length >= 1) {
          updateListOfConferences(newConferenceList);
        }
        deleteSpecificCommitteeData(res.data[0]._id);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  /**
   * Async function to delete the data for a committee.
   * @param {*} id - the id of the committee which has to be deleted.
   */
  async function deleteSpecificCommitteeData(id) {
    await axiosProtected
      .delete(`/committees/${id}`)
      .then((res) => {
      })
      .catch((err) => {
        console.error(err);
      });
  }
  /**
   * Update the list of conferences/committees on the dedicated endpoint.
   * @param {*} updatedConferenceList - the updated list of conferences.
   */
  async function updateListOfConferences(updatedConferenceList) {
    await axiosProtected
      .patch(`/conferences/committees/${conferenceId}`, {
        committees: updatedConferenceList,
      })
      .then((res) => {
      })
      .catch((err) => {
        console.error(err);
      });
  }
  /**
   * Async function that deletes the whole list of conferences object from the database.
   * @param {} id - the id of the list of conferences object.
   */
  async function deleteListOfConferences(id) {
    await axiosProtected
      .delete(`/conferences/committees/${id}`)
      .then((res) => {
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Async function to load the list of committees from the backend.
   */
  async function loadListOfConferences() {
    axiosProtected
      .get("conferences/committees/", {
        params: {
          year: year,
        },
      })
      .then((response) => {
        const isDataAvailable = response.data && response.data.length;
        let parsedArray = [];
        // If there is list of committees, load the current page
        if (isDataAvailable) {
          parsedArray = response.data[0].committees;
          setConferenceId(response.data[0]._id);
          setConferenceList(response.data[0].committees);
        }
        // If there are no committees, load the creation of committees page.
        if (parsedArray.length === 0) {
          navigation(`/admin/${year}/committee-creation`);
        }
      });
  }
  /**
   * Add new  committee to the list of committee.
   */
  function addConference() {
    if (newConference === "") {
      setError("Committee name cannot be empty!");
    } else if (conferenceList.includes(newConference.toUpperCase())) {
      setError("Committee already exist");
    } else {
      let newConferenceList = conferenceList.slice();
      newConferenceList.push(newConference.toUpperCase());
      setConferenceList(newConferenceList);
      // setNewConference("");
    }
  }

  function handleKeyPress(e) {
    if (e.keyCode === 13) {
      addConference();
    }
  }
  /**
   * Function to delete all the data related to a specific conference.
   * @param {*} index - of the committee that needs to be deleted.
   */
  function deleteConference(index) {
    let newConferenceList = conferenceList.slice();
    // Just remove the conference from the list
    // Remove the whole conference object for that year.
    if (newConferenceList.length === 1) {
      deleteListOfConferences(conferenceId);
    }
    getSpecificCommitteeData(year, newConferenceList[index], newConferenceList);
    newConferenceList.splice(index, 1);
    if (newConferenceList.length === 0) {
      navigation(`/admin/${year}/committee-creation`);
    }
    setConferenceList(newConferenceList);
  }

  /**
   * Create a new committee with empty data.
   * @param {*} newConference - the name of the committee/conference,
   * @returns - the new committee object.
   */
  function createCommittees(newConference) {
    let committeeArray = conferenceList;
    let committeeJSON = {
      conference: newConference,
      year: year,
      slots: 10,
      members: [],
    };
    committeeArray.push(committeeJSON);
    setConferenceList(committeeArray);
    return [committeeJSON];
  }
  // Effect used to update all conferences when new conference is added.
  useEffect(() => {
    setError("");
  }, [newConference]);

  const cachedLoadListOfConferences = useCallback(loadListOfConferences, [axiosProtected, navigation, year]) // remove wanrnigs
  // Effect used to load all conferences for specific year.
  useEffect(() => {
    cachedLoadListOfConferences();
  }, [cachedLoadListOfConferences]);

  function submitCommittees() {
    if (!conferenceList.length) {
      setError("There are no committees, please add committees");
    }
    if (newConference === "") {
      navigation(`/admin/${year}/overview-committee-members`);
    } else {
      axiosProtected
        .patch(`conferences/committees/${conferenceId}`, {
          year: year,
          dates: ["2023-04-06"],
          committees: conferenceList,
        })
        .then((response1) => {
          if (response1.status === 200) {
            let newlyCreatedCommittee = createCommittees(newConference);
            axiosProtected
              .post("committees/", newlyCreatedCommittee)
              .then((response2) => {
                if (response2.status === 200) {
                  navigation(`/admin/${year}/overview-committee-members`);
                }
              });
          }
        });
    }
  }

  return (
    <div>
      <NavBarSteeringChair />
      {error === "" ? <></> : <Alert severity="error">{error}</Alert>}
      <Typography variant="h4" fontWeight="bold" align="center" sx={{ mt: 10 }}>
        Existing Selection Committee Process
      </Typography>
      <Stack
        display="flex"
        maxWidth={850}
        width={700}
        height="auto"
        margin="auto"
        marginTop={5}
        padding={5}
        borderRadius={10}
        boxShadow={"20px 20px 50px #ccc"}
        direction="column"
        justifyContent="space-between"
        alignItems="center"
        spacing={10}
        sx={{
          ":hover": {
            boxShadow: "40px 40px 60px #ccc",
          },
        }}
      >
        <Stack
          display="flex"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          width={600}
        >
          <Stack>
            <Typography align="center">
              Edit Participating Committees
            </Typography>
            <Stack
              display="flex"
              direction="row"
              justifyContent="space-between"
              spacing={2}
              sx={{ margin: 2 }}
            >
              <TextField
                value={newConference}
                onChange={(e) => {
                  setNewConference(e.target.value);
                }}
                label="Add Committee"
                variant="outlined"
                sx={{ justifySelf: "flex-start" }}
                onKeyDown={handleKeyPress}
              ></TextField>
              <Button
                variant="contained"
                color="success"
                onClick={addConference}
              >
                Add Committee
              </Button>
            </Stack>
            {conferenceList.length === 0 ? (
              <></>
            ) : (
              <Paper sx={{ minWidth: "200px" }}>
                <List>
                  {conferenceList.map((name, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => deleteConference(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <GroupsIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={name} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Stack>
        </Stack>
        <Stack
          display="flex"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          width={600}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => navigation(-1)}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={submitCommittees}>
            Confirm
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}

export default EditSelectionCommitteeProcess;

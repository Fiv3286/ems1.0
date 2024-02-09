import { useState, useEffect } from 'react';
import { Alert, ListItemAvatar, Avatar, ListItemText, Stack, Typography, Button, TextField, Paper, List, ListItem, IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate, useParams } from 'react-router-dom';
import useAxiosProtected from "../hooks/useAxiosProtected";
import NavBarSteeringChair from '../components/Navbars/NavBarSteeringChair';

/**
 * @author Daniel Mocanu
 * 
 * Reference: page 2.3 in the Figma design
 */

function NewCommitteeCreation() {

    const [newCommittee, setNewCommittee] = useState("");
    const [committeeList, setCommitteeList] = useState([]); 
    const navigation = useNavigate();
    const [error, setError] = useState("");
    const { year } = useParams();

    const axiosProtected = useAxiosProtected();

    /**
     * Adds a committee to the current (local) committeeList
     */
    function addCommittee() {
        // If no new committee has been specified
        if (newCommittee === "") {
            setError("Committee name cannot be empty!");
        // If the committee already exists in the list
        } else if (committeeList.includes(newCommittee.toUpperCase())) {
            setError("Committee already exist");
        // Add committee to the committeeList
        } else {
            let newCommitteeList = committeeList.slice();
            newCommitteeList.push(newCommittee.toUpperCase());
            setCommitteeList(newCommitteeList)
            setNewCommittee("");
        }
    }

    function handleKeyPress(e) {
        if (e.keyCode === 13) {
            addCommittee();
        }
    }

    /**
     * Removes a conference from the current (local) committee list
     * @param index - the index of the committee in the committeeList 
     */
    function deleteConference(index) {
        let newCommitteeList = committeeList.slice();
        newCommitteeList.splice(index, 1);
        setCommitteeList(newCommitteeList);
    }

    /**
     * Creates a list of JSON objects in the format needed for the back-end
     * @param {*} committeeList - the current local committee list
     * @returns the generated list of JSON objects converted from committees
     */
    function createCommittees(committeeList) {
        var committeeArray = [];
        // Create a JSON object for every single committee in the committeeList
        committeeList.forEach((comm) => {
                let committeeJSON = {
                "conference" : comm,
                "year" : year,
                "slots" : 10,
                "members" : []
            }
            committeeArray.push(committeeJSON);
        });
        
        return committeeArray;
    }

    // Reset the error
    useEffect(() => {
        setError('');
    }, [newCommittee])

    // Whenether a new year is selected check if the year has any new committees
    useEffect(() => {
        // Request the committees of the current year
        axiosProtected.get('conferences/committees/', {
            params: {
                year : year,
            },
        }).then((response) => {
            const isDataAvailable = response.data && response.data.length;
            var parsedArray = [];
            if (isDataAvailable) {
                parsedArray = response.data[0].committees;
            } 
            if (parsedArray.length) {
                navigation(`/admin/${year}/overview-committee-members`);
            } else {
                navigation(`/admin/${year}/committee-creation`);
            }
        }).catch((e) => {
            setError(e?.response);
        })
    }, [year, axiosProtected, navigation])

    /**
     * Submits the committee list to the back-end
     */
    function submitCommittees() {
        // Make sure that the committeeList is not empty before sending
        if (!committeeList.length) {
            setError("There are no committees, please add committees");
        } else {
            // Post the new committeesList to the back-end
            axiosProtected.post("conferences/committees/", {
                "year" : year,
                "dates": [
                    "2023-04-06"
                ],
                "committees" : committeeList
        }).then(() => {
            var jsonArray = createCommittees(committeeList);
            // Since our DataBase is NoSQL, 2 requests need to be made to the back-end
            axiosProtected.post("committees/", jsonArray
            ).then(() => {
                navigation(`/admin/${year}/overview-committee-members`);
            }).catch((e) => {
                setError(e?.response);
            })
        }).catch((e) => {
            setError(e?.response);
        })
        }
    }

    return (
        <div>
            <NavBarSteeringChair/>
            {/* Display an error if there exists one */}
            {   error === ''
                ? <></>
                : <Alert severity="error">{error}</Alert>
            }
            <Typography variant = "h4" fontWeight = 'bold' align = "center" sx = {{mt : 10}}>
            Start New Selection Committee Proccess</Typography>
            <Stack
                display="flex" 
                maxWidth = {850}
                width = {700}
                height = "auto"
                margin = "auto"
                marginTop = {5}
                padding = {5}
                borderRadius={10}
                boxShadow={"20px 20px 50px #ccc"}
                direction="column"
                justifyContent="space-between"
                alignItems="center"
                spacing={10}
                sx = {{
                    ":hover":{
                        boxShadow : '40px 40px 60px #ccc'
                    }
                }}    
            >
                <Stack
                    display="flex"
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    width = {600}
                > 
                    <Stack
                    alignItems = "center"
                    width = {600}
                    >
                        {/* Display the current year of the committee */}
                        <Typography align = "center" variant = "h4">Year: {year}</Typography>
                        <Typography align = "center" variant = "h7">Add Participating Committees</Typography>
                        <Stack
                            display = "flex"
                            direction="row"
                            justifyContent="space-between"
                            spacing={2}
                            sx = {{margin: 2}}
                        >
                            <TextField
                            value = {newCommittee}
                            onChange = {(e) => {setNewCommittee(e.target.value)}}
                            label="Add Committee" 
                            variant="outlined" 
                            sx={{justifySelf:"flex-start"}}
                            onKeyDown={handleKeyPress}
                            ></TextField>
                            <Button variant="contained" color="success" onClick={addCommittee}>Add Committee</Button>
                        </Stack>
                        {/* If any committees have been added to the committeeList display those committees */}
                        {
                            committeeList.length === 0?
                            <></>
                            : 
                            <Paper sx={{minWidth:"200px"}}>
                                <List>
                                {committeeList.map((name, index) => (
                                        <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => deleteConference(index)}>
                                            <DeleteIcon />
                                            </IconButton>
                                        }
                                        >
                                        <ListItemAvatar>
                                        <Avatar>
                                        <GroupsIcon />
                                        </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={name}
                                        />
                                        </ListItem>
                                    ))
                                    }
                                </List>
                            </Paper>
                        }
                    </Stack>
                </Stack>
                <Stack
                    display = "flex"
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    width = {600}
                >
                    <Button variant="contained" color="error" onClick = {() => navigation(`/admin/${year}/mainpage`)}>Cancel</Button>
                    <Button variant="contained" onClick = {submitCommittees}>Confirm</Button>
                </Stack>        
            </Stack>
        </div>
    )
}

export default NewCommitteeCreation;
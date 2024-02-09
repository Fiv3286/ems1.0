import React from 'react';
import NavBarSteeringChair from '../components/Navbars/NavBarSteeringChair';
import { Paper, Alert, Box, TextField, Typography, Stack, FormControl, Select, MenuItem, InputLabel, Button, Divider, Modal } from '@mui/material';
import useAxiosProtected from "../hooks/useAxiosProtected";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @author Daniel Mocanu
 */

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    bgcolor: "#FFFFFF",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

function AccountManagement() {

    const axiosProtected = useAxiosProtected();
    const [usersList, setUserList] = useState([]);
    //This list is used just as a trigger to change the userList when requesting new data(in order to avoid infinite requests)
    const [triggerList, setTriggerList] = useState([]);
    const [error, setError] = useState("");
    const [error2, setError2] = useState("");
    const [error3, setError3] = useState("");
    const navigate = useNavigate();


    const [open, setOpen] = React.useState(false);
    /**
     * Opens the Material UI modal and sets the Textfields to the User Object values
     * @param {*} user - the user Object who's data will be edited
     */
    const handleOpen = async (user) => {
        setOpen(true);
        // Create a delay so the useRef can render
        await setTimeout(1);
        editUser.current.value = user.username;
        editEmail.current.value = user.email;
        setEditRole(user.role);
        setEditId(user._id);
    };

    /**
     * Closes the Material UI modal and resets the default hooks of the editUser
     */
    const handleClose = () => {
        setOpen(false);
        editUser.current.value = "";
        editEmail.current.value = "";
        setEditRole("");
        setEditId("");
        setError2("");
    };

    //All the data contained by the new user that needs to be added
    const newUser = useRef();
    const newEmail = useRef();
    const newPassword = useRef();
    const [newRole, setNewRole] = useState("");

    //All the data contained by the current user that is being edited
    const editUser = useRef();
    const editEmail = useRef();
    const editPassword = useRef();
    const [editId, setEditId] = useState("");
    const [editRole, setEditRole] = useState("");

    // Reset error upon reloading
    useEffect(() => {
        setError3("")
    }, [])

    // Request the list of all users every time upon reloading
    useEffect(() => {
        axiosProtected.get("/users/all").then((response) => {
            setUserList(response.data);
        }).catch((e) => {
            setError3(e?.response);
        })
    },[triggerList])
    
    /**
     * Removes a user from the database by making a request to the API
     * @param {*} user - the user Object that is removed from the database 
     */
    function deleteAccount(user) {
        const id = user._id;
        // Send a delete request
        axiosProtected.delete("/users/" + id).then(() => {
            setTriggerList([]);
        }).catch((e) => {
            setError3(e?.response);
        })
    }

    /**
     * Enforces the edit changes towards the designated user
     */
    function editAccount() {
        // If any of the edit fields (except password) are missing display an error
        if (!editUser.current.value || !editEmail.current.value || !editRole) {
            setError2("Please input all the data necessary to edit a user");
        } else {
            var requestBody = {}
            // If the password field in the edit is missing create an appropriate request body
            if (!editPassword.current.value) {
                requestBody = {
                    "username" : editUser.current.value,
                    "email" : editEmail.current.value,
                    "role" : editRole
                }
            } else {
                requestBody = {
                    "username" : editUser.current.value,
                    "email" : editEmail.current.value,
                    "password" : editPassword.current.value,
                    "role" : editRole
                }
            }
            //Send a patch request to edit the user
            axiosProtected.patch(("/users/" + editId), requestBody).then(() => { 
                handleClose();
                //Reset the current userList and reset the values of the newUser fields
                setTriggerList([]);
            }).catch((e) => {
                setError3(e?.response);
            })
        }
    }

    /**
     * Adds a new user with the specified values to the database 
     */
    function addAccount() {
        // If any of the new fields are missing display an error
        if (!newUser.current.value|| !newEmail.current.value || !newPassword.current.value || !newRole) {
            setError("Please input all the data necessary to create a new user");
        } else {
            //Send a post request for the new user
            axiosProtected.post("/users/register", {
                "username" : newUser.current.value,
                "email" : newEmail.current.value,
                "password" : newPassword.current.value,
                "role" : newRole,
            }).then(() => { 
                //Reset the current userList and reset the values of the newUser fields
                setTriggerList([]);
                newUser.current.value = "";
                newEmail.current.value = "";
                newPassword.current.value = "";
                setNewRole("");
                setError("");
            }).catch((e) => {
                setError3(e?.response);
            })
        }
    }

  return (
    <div>
        {/* This modal is a pop-up when the user presses the edit button next to a user*/}
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="parent-modal-title"
        >
            <Box
                style = {style}
                borderRadius={10}
                component={Paper}
            >
                <Typography id="modal-modal-title" variant="h4" align="center" sx ={{mt: 2}}>
                    Editing User
                </Typography>
                <Stack
                    display = "flex"
                    direction="column"
                    justifyContent="space-around"
                    alignItems="center"
                    spacing={2}
                    width = {850}
                    height = {300}
                    borderRadius={10}
                >
                    <Stack
                        display = "flex"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        {/* All the fields corelating with the data of the user that is being edited */}
                        <TextField label = "username" inputRef = {editUser} defaultValue = ""></TextField>
                        <TextField label = "email" inputRef = {editEmail} defaultValue = ""></TextField>
                        <TextField label = "password" inputRef = {editPassword} defaultValue = ""></TextField>
                        <FormControl sx={{ minWidth:'100px', m: 2}}>
                        <InputLabel id="roleModal">Role</InputLabel>
                        <Select 
                            labelId = "roleModal"
                            label = "role"
                            value={editRole}
                            onChange = {(e) => setEditRole(e.target.value)}
                            >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="non_admin">Non-admin</MenuItem>
                        </Select>
                    </FormControl>  
                    </Stack>
                    {/* Display an error if there is one */}
                    {   error2 === ''
                    ? <></>
                    : <Alert severity="error" sx= {{width : 750}}>{error2}</Alert>
                    }
                    <Stack
                        display = "flex"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        width = {600}
                    >
                        <Button variant="contained" color="error" size="large" onClick = {() => {handleClose()}}>Cancel</Button>
                        <Button variant="contained" size="large" onClick = {() => {editAccount()}}>Confirm</Button>
                    </Stack>
                </Stack>               
            </Box>
        </Modal>
        <NavBarSteeringChair/>
        {/* Display an error if there is one */}
        {   error3 === ''
            ? <></>
            : <Alert severity="error">{error3}</Alert>
        }
        <Typography variant = "h4" fontWeight = 'bold' align = "center" sx = {{mt : 10}}
        >Account Management</Typography>

        <Stack
            display="flex" 
            maxWidth = "auto"
            width = {900}
            height = "auto"
            direction="column"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            margin = "auto"
            marginTop = {5}
            padding = {5}
            borderRadius={10}
            boxShadow={"20px 20px 50px #ccc"}
            sx = {{
                ":hover":{
                    boxShadow : '40px 40px 60px #ccc'
                }
            }} 
            >
        {/* If there are current users in the system or rather if the userList variable has been populated*/}
        {
            usersList.length === 0
            ? <></>
            : <Stack
                alignItems="center"
            >
            {/* Create all the read-only fields which are related to the data of individual users */}
                {
                    usersList.map((user) => (
                        <div key={user._id}>
                            <TextField sx={{m: 2}}
                            label="Email"
                            value = {user.email}
                            InputProps={{
                                readOnly: true,
                            }}
                            >
                            </TextField>
                            <TextField sx={{m: 2}}
                            label="Role"
                            value = {user.role}
                            InputProps={{
                                readOnly: true,
                            }}
                            style = {{width : 120}}
                            >
                            </TextField>
                            <TextField sx={{m: 2}}
                            label="Username"
                            value = {user.username}
                            InputProps={{
                                readOnly: true,
                            }}
                            ></TextField>
                            <Button variant="contained" color="secondary" sx={{m: 3, width: '90px'}} onClick = {() => handleOpen(user)}>Edit</Button>
                            <Button variant="contained" color="error" sx={{m: 3}} onClick={() => deleteAccount(user)}>Delete</Button>
                            <Divider sx={{borderBottomWidth: 2.5}}/>
                        </div>
                    ))
                } 
                <Stack
                    display = "flex"
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    width = {900}
                >
                    {/* The fields corelating with the user that needs to be added to the system */}
                    <TextField label = "User" sx={{m: 2}} inputRef = {newUser}></TextField>
                    <TextField label = "Email" sx={{m: 2}} inputRef = {newEmail}></TextField>
                    <TextField label="Password" sx={{m: 2}} inputRef = {newPassword}></TextField>
                    <FormControl sx={{ minWidth:'100px', m: 2}}>
                        <InputLabel id="role">Role</InputLabel>
                        <Select 
                            labelId = "role"
                            label = "role"
                            value = {newRole}
                            onChange = {(e) => setNewRole(e.target.value)}
                            >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="non_admin">Non-admin</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="success" sx={{m: 3}}
                        style = {{width: '130px', height: '40px'}}
                        onClick={() => addAccount()}
                    >Add User</Button>
                    
                </Stack>
                {/* If an error exists display it */}
                {   error === ''
                ? <></>
                : <Alert severity="error" sx= {{width : 900}}>{error}</Alert>
                }                           
            </Stack>
        }
            <Stack
                display = "flex"
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
                spacing={2}
                width = {750}
                height = {75}
            >
                <Button variant="contained" size="large" onClick = {() => navigate(-1)}>Back</Button>
            </Stack>
        </Stack>
        
    </div>
    
  )
}

export default AccountManagement;
import { Alert, Avatar, Button, FormControlLabel, IconButton, List, ListItem, ListItemAvatar, ListItemText, Modal, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import 'dayjs/locale/en-gb';
import { useNavigate } from "react-router-dom";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    bgcolor: "white",
    border: "2px solid #000",
    p: 4,
  };

export default function NewScheduleModal({ handleClose, open, handleCreate, handleSaveEdit, initialStartDate, initialEndDate, initialConferenceList, initialIncludeWeekends, editing }){
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [conferenceList, setConferenceList] = useState(initialConferenceList)
    const [newConference, setNewConference] = useState("")
    const [includeWeekends, setIncludeWeekends] = useState(initialIncludeWeekends);
    const [alert, setAlert] = useState("")
    const navigator = useNavigate()
    
    /**
     * Adds a conference to the list of conferences from the input box for conference
     */
    function addConference() {
        let newConferenceList = conferenceList.slice();
        if(!newConference){
            setAlert("Cannot add empty committee")
        }
        else{
            setAlert("")
            newConferenceList.push(newConference);
            setConferenceList(newConferenceList)
            setNewConference("");
        }
    }

    /**
     * Removes a conference from the list of conferences
     * @param index - of the clicked conference
     */
    function deleteConference(index){
        let newConferenceList = conferenceList.slice();
        newConferenceList.splice(index, 1)
        setConferenceList(newConferenceList)
    }

    /**
     * Update the schedule after editing
     */
    function onSaveEdit(){
        if(!(startDate.isBefore(endDate) || startDate.isSame(endDate))){
            //err
            setAlert("The end date is before the start date!")
            return
        }
        setAlert("")
        handleSaveEdit(startDate, endDate, includeWeekends, conferenceList)
    }

    /**
     * Cancel editing
     */
    function handleCancel(){
        // setStartDate(initi)
        setStartDate(initialStartDate)
        setEndDate(initialEndDate)
        setConferenceList(initialConferenceList)
        setIncludeWeekends(initialIncludeWeekends)
        handleClose()
    }

    function handleKeyPress(e){
        if(e.keyCode === 13){
            addConference();
        }
      }

    return (
        <Modal 
            open={open}
            onClose={handleClose}
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h4" align="center">
                    Creating a new ETAPS conference schedule
                </Typography>
                <Typography variant="h6">Choose dates for the conferences</Typography>
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                    sx={{ width: "100%" }}
                    p={2}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                        <DatePicker
                            label={'Start date'}
                            views={['day']}
                            value={startDate}
                            onChange={(newDate) => setStartDate(newDate)}
                            slotProps={{
                                textField: {
                                  helperText: 'Day/Month/Year',
                                },
                              }}
                        />
                        <DatePicker
                            label={'End date'}
                            views={['day']}
                            value={endDate}
                            onChange={(newDate) => setEndDate(newDate)}
                            minDate={startDate}
                            slotProps={{
                                textField: {
                                  helperText: 'Day/Month/Year',
                                },
                              }}
                        />
                    </LocalizationProvider>
                    <FormControlLabel control={<Switch checked={includeWeekends} onChange={(e) => setIncludeWeekends(e.target.checked)} />} label="Include weekends" />
                </Stack>
                <Typography variant="h6">Add committees which are participating</Typography>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={3}
                    sx={{ width: "100%" }}
                    p={2}
                >   
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1}
                    >
                        <TextField 
                            value={newConference}
                            onChange={(e) => setNewConference(e.target.value)}
                            label="Add committee" 
                            variant="outlined" 
                            sx={{justifySelf:"flex-start"}}
                            onKeyDown={handleKeyPress}
                        />
                        <Button variant="contained" color="success" onClick={addConference}> Add committee</Button>
                    </Stack>
                    {
                        conferenceList.length === 0?
                        <Typography>There are no committees!</Typography>
                        :
                        <Paper sx={{minWidth:"200px"}}>
                            <List>
                                {conferenceList.map((name, index) => (
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
                {editing && <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>}
                {editing && <Button variant="contained" color="success" onClick={onSaveEdit} sx={{marginLeft:"10px"}}>Save</Button>}
                {!editing && <Button variant="outlined" onClick={() => navigator(-1)} sx={{marginLeft: 2}}>Back</Button>}
                {!editing && <Button variant="contained" onClick={() => handleCreate(startDate, endDate, includeWeekends, conferenceList)} sx={{marginLeft: 2}}>Create</Button>}
                {alert && <Alert color="error" sx={{marginTop: '10px'}}>{alert}</Alert>}
            </Box>
        </Modal>
    );

}
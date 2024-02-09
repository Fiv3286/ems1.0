import React, { useEffect, useState } from 'react';
import {Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'
import useAxiosProtected from "../hooks/useAxiosProtected"
import NavBarLogoutOnly from '../components/Navbars/NavBarLogoutOnly';

/**
 * @author Daniel Mocanu
* 
* Reference: page 1.5 in the Figma design 
*/

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

const START_YEAR = 2021
/**
 * @author Aleksandar Petrov
 */
function ScheduleSelection() {
    const [year, setYear] = useState("");
    const [committeeList, setCommitteeList] = useState()
    const [loading, setLoading] = useState(false)

    const api = useAxiosProtected();
    const navigator = useNavigate();
    const [error, setError] = useState("");

    const possibleYears = [];
    const curryear = dayjs().year();
    // Create the list of all the year options that are displayed to the front-end
    for(let year = START_YEAR ; year <= curryear + 3; year++){
        possibleYears.push(year);
    }

    // Reset the error
    useEffect(() => {
        setError("");
    }, [])

    // Get all the committees for the selected year
    useEffect(() => {
        // Wait until the user picks a year
        if(year === ""){
            return
        }
        setLoading(true)
        api.get('conferences/sessions', {params: {year}})
        .then(res => {
            setLoading(false)
            if(res.data.length === 0){
                setCommitteeList(null)
                return
            }
            setCommitteeList(res.data[0].committees)
        })
        .catch(err => {
            setLoading(false);
            setError(err?.response);
        })


    }, [year, api])

    function handleSelect(event){
        setCommitteeList()
        setYear(event.target.value)
    }

  return (
    <div>
        <NavBarLogoutOnly/>
        {/* Display an error if there is one */}
        {   error === ''
            ? <></>
            : <Alert severity="error">{error}</Alert>
        }
        <Box
            display="flex" flexDirection={"column"} 
            maxWidth = {350} 
            alignItems = "center" 
            justifyContent={"center"}
            margin = "auto"
            marginTop = {15}
            padding = {5}
            borderRadius={10}
            boxShadow={"20px 20px 50px #ccc"}
            sx = {{
                ":hover":{
                    boxShadow : '40px 40px 60px #ccc'
                }
            }}
        >
            <Typography variant="h5"> Choose year</Typography>
            <FormControl sx={{ minWidth: '100px'}}>
                <InputLabel id="year">Year</InputLabel>
                <Select
                    labelId="year"
                    id="year"
                    value={year}
                    label="Year"
                    MenuProps={MenuProps}
                    onChange={(e) => handleSelect(e)}
                >
                    {possibleYears.map((year) => (
                        <MenuItem value={parseInt(year)} key={year}>{year}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {/* If the committeeList is not empty display all the available committees */}
            {committeeList &&
                <>
                <Typography fontWeight='bold' sx = {{paddingBottom : 3.5, borderRadius:2.5, fontSize : 20}}>Choose your committee</Typography>
                {committeeList.map(displayCommittee => {
                    return (
                        // <MakeButton key={displayCommittee.committee} committee = {displayCommittee.committee}></MakeButton>
                        <Button 
                            sx = {{padding: 1.5, width: '8.3rem', height: '2.0rem', borderRadius: 5, margin: 2.0,}} 
                            variant='contained'
                            onClick={() => navigator(`/chair/${displayCommittee}/${year}/program`)}
                            key={displayCommittee}
                            >
                            {displayCommittee}
                        </Button>   
                    )
                })}
                </>
            }
            {loading && 
                <CircularProgress />
            }
            {/* If there is no committee in the selected year display an Alert */}
            {year && !committeeList && !loading &&
                <Alert color="warning">No committees found</Alert>
            }
        </Box>
    </div>
  )
}

export default ScheduleSelection;
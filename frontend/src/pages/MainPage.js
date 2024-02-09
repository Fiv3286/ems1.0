import React from 'react';
import { useState, useEffect } from 'react';
import { Alert, Box, Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import NavBarSteeringChair from '../components/Navbars/NavBarSteeringChair';
import useAxiosProtected from "../hooks/useAxiosProtected";

/**
 * @author Daniel Mocanu
 * 
 * Reference: page 2.2 in the Figma design
 */

function MainPage() {
    
    const navigator = useNavigate()
    const { year } = useParams();
    const axiosProtected = useAxiosProtected(); 
    const [error, setError] = useState("");

    // Reset the error upon loading
    useEffect(() => {
        setError('');
    }, [])

    /**
     * Navigate either to the overview of the committee members page or
     * navigate to the creation of committee page
     * (Depends on if there are any existing committees in the current year)
     */
    function handleNavigation() {
        axiosProtected.get('conferences/committees/', {
            params: {
                year : year,
            },
        }).then((response) => {
            const isDataAvailable = response?.data && response?.data?.length;
            var parsedArray = [];
            if (isDataAvailable) {
                parsedArray = response?.data[0]?.committees;
            } 
            if (parsedArray.length) {
                navigator(`/admin/${year}/overview-committee-members`);
            } else {
                navigator(`/admin/${year}/committee-creation`);
            }
        }).catch((e) => {
            setError(e?.response);
        })
    }

    return(
        <div>
            <NavBarSteeringChair/>
            {/* If there is an error display it */}
            {   error === ''
                ? <></>
                : <Alert severity="error">{error}</Alert>
            }
            <Typography variant = "h4" fontWeight = 'bold' align = "center" sx = {{mt : 10}}>Main Page</Typography>  
                <Box
                    display="flex" 
                    maxWidth = {650}
                    width = {600}
                    height = {275}
                    direction = "row"
                    justifyContent = "space-between"
                    alignItems = "center"
                    spacing = {2} 
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
                    <Button 
                        sx = {{padding: 1.5, width: '14.3rem', height: '3.5rem', borderRadius: 2.5, margin: 2.0, fontSize:"15px"}} 
                        variant='contained'
                        onClick={() => navigator(`/admin/${year}/conference-creation`)}
                    >
                        Conference Creation
                    </Button>
                    <Button
                        variant = "contained"
                        sx = {{padding: 1.5, width: '14.3rem', height: '3.5rem', borderRadius: 2.5, margin: 2.0, fontSize:"15px"}}
                        onClick = {() => navigator(`/admin/${year}/account-management`)}
                    >Account Management</Button>
                    <Button
                        variant = "contained"
                        sx = {{padding: 1.5, width: '14.3rem', height: '3.5rem', borderRadius: 2.5, margin: 2.0, fontSize:"15px"}} 
                        onClick={() => handleNavigation()}
                    >
                        Selection Committee
                    </Button>
            </Box>
        </div>
    )
}

export default MainPage;
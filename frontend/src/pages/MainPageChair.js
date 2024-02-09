import React from 'react';
import {Box, Typography, Button} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavBarLogoutOnly from '../components/Navbars/NavBarLogoutOnly';

/**
 * @author Daniel Mocanu
 */

function MainPageChair() {
    const navigator = useNavigate();
    return(
        <div>
            <NavBarLogoutOnly/>
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
                        onClick={() => navigator(`/chair/scheduleSelection`)}
                    >
                        Conference System
                    </Button>
                    <Button
                        sx = {{padding: 1.5, width: '14.3rem', height: '3.5rem', borderRadius: 2.5, margin: 2.0, fontSize:"15px"}} 
                        variant='contained'
                        onClick={() => navigator(`/chair/committeeSelection`)
                        }
                    >
                        Selection Committee System
                    </Button>
            </Box>
        </div>
    )
}

export default MainPageChair;
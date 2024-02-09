import React from 'react';
import axios from '../api/api';
import { useEffect } from 'react';
import { Box, Typography, TextField, Button, AppBar, Toolbar, IconButton, Alert } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import dayjs from 'dayjs';

/**
 * @author Daniel Mocanu
 * 
 * Reference: page 2.1 in the Figma design
 */

function Login() {

    const { setAuth } = useAuth();
    const fromAdmin = `/admin/${dayjs().year()}/mainpage`;
    const fromChair = "/chair/mainpage";
    const [error, setError] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const navigation = useNavigate();
    window.history.replaceState({}, document.title);

    // Reset the error whenether the user 
    useEffect(() => {
        setError('');
    }, [username, password])
    
    /**
     * Sends the credentials to the back-end for verification 
     */
    const handleSubmit = (e) => {

        e.preventDefault()

        // Post the credentials to the back-end
        axios.post('/users/login',
            JSON.stringify({ email: username, password: password }), 
            {
                headers: {'Content-Type': 'application/json'},
                withCredentials: true
            }  
        ).then((response) => {
            const accessToken = response.data[0];
            const userType = response.data[1];
            setAuth({username, userType, accessToken});
            setUsername('');
            setPassword('');
            // Redirect the user to the appropriate page based on the user type 
            if (userType === 'admin') {
                navigation(fromAdmin, { replace: true });
            } else if (userType === 'non_admin') {
                navigation(fromChair, { replace: true });
            } else {
                return setError('User type non-existent');
            }
        // Catch the error from the user
        }).catch ((error) => {
            if (error?.response?.status === 401) {
                setError('Login Failed, Credentials do not exist');
            } else {
                setError(`Login Failed, ${error?.message} Happened`);
            }
        });
    }

    return (
        <div>
            <AppBar position='static'>
                <Toolbar>
                    <IconButton size='large' edge='start' color='FF0000' aria-label='logo'>
                    </IconButton>
                </Toolbar>
            </AppBar>
            {/* If there exists an error display it */}
            {   error === ''
                ? <></>
                : <Alert severity="error">{error}</Alert>
            }
            <form onSubmit={handleSubmit} id = "form">
                <Box
                    display="flex" flexDirection={"column"}
                    maxWidth={500}
                    alignItems="center"
                    justifyContent={"center"}
                    margin="auto"
                    marginTop={15}
                    padding={5}
                    borderRadius={10}
                    boxShadow={"20px 20px 50px #ccc"}
                    sx={{
                        ":hover": {
                            boxShadow: '40px 40px 60px #ccc'
                        }
                    }}
                >
                    <Typography variant="h2" padding={1} textAlign="center" fontWeight="bold">Welcome!</Typography>
                    <Typography color='#696969' padding={1.5} textAlign="center" fontWeight="italics">Please enter your details</Typography>
                    <TextField
                        margin="normal"
                        type={'text'}
                        variant="outlined"
                        placeholder="login"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete='false'
                    />
                    <TextField 
                        margin="normal" 
                        type={'password'} 
                        variant="outlined" 
                        placeholder="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete='false'
                    />
                    <Button form="form" type = "submit" sx={{ marginTop: 3, borderRadius: 2.5, backgroundColor: 'white' }} variant="outlined"> Login </Button>
                </Box>
            </form>
        </div>
    )
}

export default Login;

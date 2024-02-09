import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Link, AppBar, Toolbar, IconButton } from "@mui/material";

/**
 * @author Daniel Mocanu
 */


function ErrorPage() {

  const navigator = useNavigate();  

  return (
    <div>
      <AppBar position='static'>
          <Toolbar>
              <IconButton size='large' edge='start' color='FF0000' aria-label='logo'>
              </IconButton>
          </Toolbar>
      </AppBar>
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
        <Typography>This page does not exist</Typography>
        {/* Refer the user back to the login page */}
        <Link href="#" onClick={() => {
            navigator('/');
        }}>Go to Login Page</Link>
      </Box>
    </div>
  )
  }

export default ErrorPage;
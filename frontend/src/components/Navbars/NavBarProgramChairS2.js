import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Link as RouterLink, useNavigate} from 'react-router-dom';
import { Link, Stack } from '@mui/material';
import useAuth from "../../hooks/useAuth";
import useAxiosProtected from '../../hooks/useAxiosProtected';


function NavBarProgramChairS2() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const axiosProtected = useAxiosProtected();
    
    /**
     * Log out the user
     */
    function logout(){
        axiosProtected.post('/users/logout', null,{
        }).finally(() => {
            setAuth({});
            navigate('/');      
        })
    }
  return (
    <AppBar position="static">
      <Container maxWidth="false">
        <Toolbar disableGutters>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
            >
                <Box key="logo">
                    <Link 
                        component={RouterLink} 
                        to={`/chair/mainpage`}
                        variant="h6"
                        noWrap
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                            justifySelf: 'left'
                        }}
                    >
                        ETAPS
                    </Link>
                </Box>
                <Stack
                    direction="row"
                    justifyContent="space-around"
                    alignItems="center"
                    width="60%"
                    key="links"
                >
                    
                </Stack>
                <Box key="logout">
                    <Button 
                        onClick={logout}
                        key="settings"
                        sx={{ my: 2, color: 'white', display: 'block', justifySelf: "right" }}    
                    >
                        Logout
                    </Button>
                </Box>
            </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavBarProgramChairS2;


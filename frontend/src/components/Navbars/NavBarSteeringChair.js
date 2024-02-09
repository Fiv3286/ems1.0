import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { Link as RouterLink, useLocation, useNavigate} from 'react-router-dom';
import { FormControl, Link, Select, Stack } from '@mui/material';
import { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import useAuth from "../../hooks/useAuth";
import useAxiosProtected from '../../hooks/useAxiosProtected';

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
const START_YEAR = 2021;
const YEARS_IN_THE_FUTURE = 3;

function NavBarSteeringChair() {
    const [year, setYear] = useState('');
    const [possibleYears, setPossibleYears] = useState([]);
    const navigate = useNavigate();
    const url = useLocation();
    const { setAuth } = useAuth();

    const axiosProtected = useAxiosProtected();

    // on loading calculate the options for the years
    useEffect(() => {
        const possibleYears = []
        const curryear = dayjs().year()
        for(let year = START_YEAR; year <= curryear + YEARS_IN_THE_FUTURE; year++){
            possibleYears.push(year);
        }
        setYear()
        setPossibleYears(possibleYears)
    }, [])

    // whenever the url changes update the state of year
    useEffect(() => {
        setYear(url.pathname.split("/")[2])
    }, [url])

    /**
     * Changes the year in the url
     * @param e - the event from selecting a year from the select menu 
     */
    function handleSelect(e){
        const newYear = e.target.value;
        setYear(newYear);
        let newUrl = url.pathname.split("/")
        newUrl[2] = newYear
        newUrl = newUrl.join('/')
        navigate(newUrl);
    }

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
      <Container maxWidth="xl">
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
                        to={`/admin/${year}/mainpage`}
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
                    justifyContent="space-between"
                    alignItems="center"
                    width="60%"
                    key="links"
                >
                    <Link 
                        component={RouterLink} 
                        to={`/admin/${year}/conference-creation`}
                        variant="h6"
                        sx={{ my: 2, color: 'white', display: 'block', textDecoration: 'none'}}
                    >
                        Conferences
                    </Link>
                    <Link 
                        component={RouterLink} 
                        to={`/admin/${year}/overview-committee-members`}
                        variant="h6"
                        sx={{ my: 2, color: 'white', display: 'block', textDecoration: 'none' }}
                    >
                        Commitees
                    </Link>
                    <FormControl sx={{ minWidth: '100px'}} variant="standard">
                        {/* <InputLabel id="year">Year</InputLabel> */}
                        <Select
                            labelId="year"
                            id="year"
                            value={year}
                            label="Year"
                            MenuProps={MenuProps}
                            sx={{ color: "white"}}
                            onChange={(e) => handleSelect(e)}
                        >
                            {possibleYears.map((year) => (
                                <MenuItem value={parseInt(year)} key={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
export default NavBarSteeringChair;


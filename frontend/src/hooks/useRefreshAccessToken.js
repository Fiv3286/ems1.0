import axios from '../api/api';
import useAuth from './useAuth';
import { useNavigate } from "react-router-dom";

// A function used to request a new access token from the back-end
const useRefreshAccessToken = () => {

    const { setAuth } = useAuth();
    const navigation = useNavigate();

    // Request a new access token 
    const refreshToken = async () => {
        try {
            const response = await axios.get('users/refresh_token', {
            withCredentials: true
        });
        // Set the relevant data (userRole and accessToken) corresponding to the current user
        setAuth(prevVals => {
            return {...prevVals, userType: response.data.role, accessToken: response.data.access_token}
        });
        return response.data.access_token;
        } catch (error) {
            // If an error occurs, navigate the user to the logout page 
            setAuth({});
            navigation('/');

        }
    }
    return refreshToken;
};

export default useRefreshAccessToken;
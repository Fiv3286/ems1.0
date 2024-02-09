import { axiosProtected } from "../api/api";
import { useEffect } from "react";
import useRefreshAccessToken from "./useRefreshAccessToken";
import useAuth from "./useAuth";

// Make sure that a new access token is being requested every single time the old one expires
const useAxiosProtected = () => {
    const refreshToken = useRefreshAccessToken();
    const { auth } = useAuth();

    // Update the user data and access token when the user of the system gets updated
    useEffect(() => {
        // Set a new Authorization header if the authorization header does not exist
        const requestIntercept = axiosProtected.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        // Upon a request, if the server returns a 401, 403 or the server is not running, try and request a new AccessToken
        const responseIntercept = axiosProtected.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if((error?.response?.status === 401 || error?.response?.status === 403 || !error.response) && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    // Use the refreshToken function to get a new accessToken
                    const newAccessToken = await refreshToken();
                    // Set the new accessToken in the header
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosProtected(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return() => {
            axiosProtected.interceptors.request.eject(requestIntercept);
            axiosProtected.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refreshToken])

    return axiosProtected;
}

export default useAxiosProtected;
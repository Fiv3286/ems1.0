import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshAccessToken";
import useAuth from "../hooks/useAuth";

const ConsistentLogin = () => {

    const [loading, setLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    // Make sure that the user data is not removed when you refresh the page 
    // since the that data is not stored locally(for security reasons) 
    // this data needs to be requested(together with a new access token) from the back-end when refreshing the page
    useEffect(() => {

        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                // Request a new access token from the back-end
                await refresh();
            }
            catch (error) {
                console.error(error);
            }
            finally {
                isMounted && setLoading(false);
            }
        }
        // If the accessToken is missing, trigger the request for the data
        if (!auth?.accessToken) {
            verifyRefreshToken();
        } else {
            setLoading(false);
        }
        return () => isMounted = false;
    }, [])
    // Wait while the requests are still loading
    if (!loading) {
        return <Outlet/>
    }
}

export default ConsistentLogin;
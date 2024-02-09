import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Ensure that the userType of the user trying to access the system is the same as the required userType
const RequireAuth = ({ expectedUserType }) => {
    
    const { auth } = useAuth();
    // Compare the current userType with the required one
    if (auth?.userType === expectedUserType) {
        // If the userType is the expected one, navigate the user to the right page
        return <Outlet />
    } else {
        // If the userType is not the same, redirect the user to the Login page
        return <Navigate to ="/"/>
    }
}

export default RequireAuth;

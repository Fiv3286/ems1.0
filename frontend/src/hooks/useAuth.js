import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

// A context type constant used to pass down the user data when they are logged in
const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;
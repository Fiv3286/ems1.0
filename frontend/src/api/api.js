import axios from "axios";

// const BASE_URL = "http://10.10.73.120:8000"
const BASE_URL = "http://127.0.0.1:8000";
// const BASE_URL = "https://etaps.org/mngmt-back"

export default axios.create({
	baseURL: BASE_URL,
	// withCredentials: true
});

export const axiosProtected = axios.create({
	baseURL: BASE_URL,
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

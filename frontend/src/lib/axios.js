import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3001/api":
      "http://13.234.238.153:5174/api",
      // : "http://ezyshopper-env.eba-x2zz233e.ap-south-1.elasticbeanstalk.com/api",
  withCredentials: true,
});

export default axiosInstance;

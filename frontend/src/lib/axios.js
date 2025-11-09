import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3001/api":
      "http://3.110.105.30:3001/api",
      // : "http://ezyshopper-env.eba-x2zz233e.ap-south-1.elasticbeanstalk.com/api",
  withCredentials: true,
});

export default axiosInstance;

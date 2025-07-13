// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.MODE==="development"?"http://localhost:5000/api":"/api", // or your backend URL
  withCredentials: true, // very important for cookies
});

export default instance;

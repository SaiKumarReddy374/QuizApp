// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // or your backend URL
  withCredentials: true, // very important for cookies
});

export default instance;

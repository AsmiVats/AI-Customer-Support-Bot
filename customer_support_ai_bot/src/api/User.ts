import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"; 

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // only if using cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});


export const signup = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

// Login
export const login = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};


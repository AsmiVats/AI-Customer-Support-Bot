import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/session";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // set to true if your server uses cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});

export const createSession = async (userId?: string) => {
  const response = await api.post("/session/new", userId ? { userId } : {});
  return response.data; // { sessionId }
};

export const sendMessage = async (sessionId: string, message: string) => {
  const response = await api.post("/session/chat", { sessionId, message });
  return response.data;
};

export const getSession = async (sessionId: string) => {
  const response = await api.get(`/session/${sessionId}`);
  return response.data;
};

export const endSession = async (sessionId: string) => {
  const response = await api.post(`/${sessionId}/end`);
  return response.data;
};

// export const summarize = async (sessionId: string) => {
//   const response = await api.post(`/session/${sessionId}/summarize`);
//   return response.data;
// };

export default { createSession, sendMessage, getSession, endSession };

import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // set to true if your server uses cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});
const coerceUserId = (userId?: any): string | undefined => {
  if (!userId) return undefined
  if (typeof userId === 'string') return userId
  if (typeof userId === 'object') {
    const candidate = userId._id || userId.id || userId.userId || (userId.user && (userId.user._id || userId.user.id))
    if (candidate) return String(candidate)
    try {
      // avoid returning '[object Object]'
      const json = JSON.stringify(userId)
      const cleaned = json.replace(/"/g, '')
      if (/^[0-9a-fA-F]{24}$/.test(cleaned)) return cleaned
    } catch (e) {
      // ignore
    }
    return undefined
  }
  return String(userId)
}

export const createSession = async (userId?: any) => {
  const idToSend = coerceUserId(userId)
  const payload = idToSend ? { userId: idToSend } : {}
  const response = await api.post("/session/new", payload);
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
  const response = await api.post(`/session/${sessionId}/end`);
  return response.data;
};

export const listSessions = async (userId?: any) => {
  console.log("userId:", userId)
  const response = await api.get(`/session/list/${userId}`);
  return response.data;
};

// export const summarize = async (sessionId: string) => {
//   const response = await api.post(`/session/${sessionId}/summarize`);
//   return response.data;
// };

export default { createSession, sendMessage, getSession, endSession };

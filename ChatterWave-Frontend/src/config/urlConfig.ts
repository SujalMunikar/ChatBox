const env = import.meta.env;
export const BACKEND_URL = env.VITE_REACT_BACKENDURL || "http://localhost:8000";
export const SOCKET_URL = env.VITE_REACT_SOCKETURL || "http://localhost:8000";

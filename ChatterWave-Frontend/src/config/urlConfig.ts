const env = import.meta.env;
// Provide sane defaults when env vars are missing so local development still functions.
export const BACKEND_URL = env.VITE_REACT_BACKENDURL || "http://localhost:8000";
export const SOCKET_URL = env.VITE_REACT_SOCKETURL || "http://localhost:8000";

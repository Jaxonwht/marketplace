export const DEV_MODE = process.env.NODE_ENV === "development";
export const WEB_BACKEND_ENDPOINT = DEV_MODE ? "http://localhost:5000" : "/api";
export const SCHEDULER_ENDPOINT = DEV_MODE
  ? "http://localhost:4000"
  : "/scheduler";

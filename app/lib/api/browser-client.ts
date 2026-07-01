import axios from "axios";

// ── Browser-safe axios client ──
// Runs in the browser and calls the backend (:3030) DIRECTLY.
// Do NOT import "next/headers" here — that is server-only and would crash
// any client component. `withCredentials: true` makes the browser send the
// httpOnly `token` cookie automatically, so there is no token to read in JS.
//
// Requires CORS on the backend:
//   Access-Control-Allow-Origin: http://localhost:3000   (exact, not "*")
//   Access-Control-Allow-Credentials: true
const browserClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

export default browserClient;

import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  phoneNo?: number;
  avatar?: string;
  provider?: string;
}

// GET /user/me — returns the logged-in user (cookie sent via withCredentials).
// Throws (401) when not authenticated.
export async function getMe(): Promise<CurrentUser> {
  const { data } = await browserClient.get(ENDPOINTS.user.me);
  return data.user;
}

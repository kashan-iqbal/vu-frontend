import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export interface Handout {
  code: string;
  examType: string;
  content: string;
}

// Auth-gated handout fetch — hits the backend directly from the browser, so the
// httpOnly cookie rides along via withCredentials.
export async function getHandout(
  code: string,
  examType: string,
): Promise<Handout> {
  const { data } = await browserClient.get(
    ENDPOINTS.handout.get(code, examType),
  );
  return data;
}

import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

// Course codes that already have a contributed PDF (one per course, globally).
export async function getUploadedCodes(): Promise<string[]> {
  const { data } = await browserClient.get(ENDPOINTS.contribution.codes);
  return Array.isArray(data) ? data : [];
}

// POST /contributions/<code> — multipart. Override the client's JSON
// content-type so axios sets the multipart boundary, and raise the timeout since
// PDFs can be up to 50 MB.
export async function uploadContribution(
  code: string,
  form: FormData,
): Promise<{ success: boolean; message: string }> {
  const { data } = await browserClient.post(
    ENDPOINTS.contribution.upload(code),
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    },
  );
  return data;
}

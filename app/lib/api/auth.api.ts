import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";
import type { ActionResult } from "@/types/api.types";

// Shape of an axios-style error that carries a backend message.
type ApiError = { response?: { data?: { message?: string } } };

// ── Browser-side auth service ──
// Every call hits the backend (:3030) DIRECTLY from the browser.
// The backend is responsible for setting / clearing the httpOnly `token`
// cookie via Set-Cookie; `browserClient` sends credentials, so there is no
// token to read or write in JS here.

// ── Login ──
export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<ActionResult> {
  try {
    await browserClient.post(ENDPOINTS.auth.login, payload);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: (error as ApiError).response?.data?.message || "Login failed.",
    };
  }
}

// ── Signup flow (send-otp → verify-otp → register) ──
export interface SendOtpPayload {
  email: string;
}

export async function sendOtp(payload: SendOtpPayload): Promise<ActionResult> {
  try {
    const { data } = await browserClient.post(ENDPOINTS.auth.sendOtp, payload);
    return { success: data.success, message: data.message };
  } catch (error) {
    return {
      success: false,
      message:
        (error as ApiError).response?.data?.message || "Failed to send OTP. Please try again.",
    };
  }
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<ActionResult> {
  try {
    const { data } = await browserClient.post(ENDPOINTS.auth.verifyOtp, payload);
    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      message: (error as ApiError).response?.data?.message || "Invalid OTP. Please try again.",
    };
  }
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phoneNo: string;
}

export async function register(payload: RegisterPayload): Promise<ActionResult> {
  try {
    const { data } = await browserClient.post(ENDPOINTS.auth.register, payload);
    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      message:
        (error as ApiError).response?.data?.message || "Registration failed. Please try again.",
    };
  }
}

// ── Forgot password flow (forgot-password → verify-reset-otp → reset-password) ──
export interface ForgotPasswordPayload {
  email: string;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ActionResult> {
  try {
    const { data } = await browserClient.post(
      ENDPOINTS.auth.forgotPassword,
      payload,
    );
    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      message:
        (error as ApiError).response?.data?.message ||
        "Failed to send reset code. Please try again.",
    };
  }
}

export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
}

export async function verifyResetOtp(
  payload: VerifyResetOtpPayload,
): Promise<ActionResult> {
  try {
    const { data } = await browserClient.post(
      ENDPOINTS.auth.verifyResetOtp,
      payload,
    );
    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      message: (error as ApiError).response?.data?.message || "Invalid OTP. Please try again.",
    };
  }
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ActionResult> {
  try {
    const { data } = await browserClient.post(
      ENDPOINTS.auth.resetPassword,
      payload,
    );
    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      message:
        (error as ApiError).response?.data?.message || "Password reset failed. Please try again.",
    };
  }
}

// ── Logout ──
// Hits the backend so it can clear the httpOnly cookie (JS cannot delete it).
export async function logout(): Promise<void> {
  await browserClient.post(ENDPOINTS.auth.logout);
}

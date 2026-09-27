"use client";

import { useMutation } from "@tanstack/react-query";
import {
  login,
  googleLogin,
  sendOtp,
  verifyOtp,
  register,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  type LoginPayload,
  type GoogleLoginPayload,
  type SendOtpPayload,
  type VerifyOtpPayload,
  type RegisterPayload,
  type ForgotPasswordPayload,
  type VerifyResetOtpPayload,
  type ResetPasswordPayload,
} from "@/lib/api/auth.api";

// ── Login ──
export const useLogin = () =>
  useMutation({ mutationFn: (p: LoginPayload) => login(p) });

// ── Google Sign-In ──
export const useGoogleAuth = () =>
  useMutation({ mutationFn: (p: GoogleLoginPayload) => googleLogin(p) });

// ── Signup flow ──
export const useSendOtp = () =>
  useMutation({ mutationFn: (p: SendOtpPayload) => sendOtp(p) });

export const useVerifyOtp = () =>
  useMutation({ mutationFn: (p: VerifyOtpPayload) => verifyOtp(p) });

export const useRegister = () =>
  useMutation({ mutationFn: (p: RegisterPayload) => register(p) });

// ── Forgot password flow ──
export const useForgotPassword = () =>
  useMutation({ mutationFn: (p: ForgotPasswordPayload) => forgotPassword(p) });

export const useVerifyResetOtp = () =>
  useMutation({ mutationFn: (p: VerifyResetOtpPayload) => verifyResetOtp(p) });

export const useResetPassword = () =>
  useMutation({ mutationFn: (p: ResetPasswordPayload) => resetPassword(p) });
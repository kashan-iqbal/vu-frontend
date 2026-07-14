"use client";

import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { readNextParam, withNext } from "@/lib/redirect";
import { useRouter } from "next/navigation";
import { Mail, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { toast } from "sonner";
import {
  useForgotPassword,
  useVerifyResetOtp,
  useResetPassword,
} from "@/hooks/use-auth";
import {
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  fieldErrors,
} from "@/lib/validation/auth.schema";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">(
    "email",
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const forgotMutation = useForgotPassword();
  const verifyResetMutation = useVerifyResetOtp();
  const resetMutation = useResetPassword();

  // ── Step 1: Send reset OTP ──
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = sendOtpSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    forgotMutation.mutate(
      { email },
      {
        onSuccess: (result) => {
          if (result.success) {
            setStep("otp");
          } else {
            toast.error(result.message ?? "Failed to send OTP.");
          }
        },
        onError: () => toast.error("Something went wrong. Please try again."),
      },
    );
  };

  // ── Step 2: Verify reset OTP ──
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = verifyOtpSchema.safeParse({ otp });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    verifyResetMutation.mutate(
      { email, otp },
      {
        onSuccess: (result) => {
          if (result.success) {
            setStep("password");
          } else {
            toast.error(result.message ?? "Invalid OTP.");
          }
        },
        onError: () => toast.error("Something went wrong. Please try again."),
      },
    );
  };

  // ── Step 3: Reset password ──
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = resetPasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    resetMutation.mutate(
      { email, otp, newPassword },
      {
        onSuccess: (result) => {
          if (result.success) {
            setStep("success");
          } else {
            toast.error(result.message ?? "Password reset failed.");
          }
        },
        onError: () => toast.error("Something went wrong. Please try again."),
      },
    );
  };

  const isLoading =
    forgotMutation.isPending ||
    verifyResetMutation.isPending ||
    resetMutation.isPending;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 flex items-center justify-center px-4 py-8">
      {/* Decorative blurred glow accents for depth */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-400 opacity-20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500 opacity-20 blur-3xl animate-pulse" />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 mx-auto mb-6 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-bold text-white">ExamPrep AI</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-blue-100">Recover your account securely</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6" noValidate>
              <p className="text-slate-600 mb-6">
                Enter your email address and we&apos;ll send you a verification
                code to reset your password.
              </p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({});
                    }}
                    placeholder="student@university.edu"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push(withNext("/login", readNextParam()))}
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-6" noValidate>
              <div>
                <p className="text-slate-600 mb-2">
                  We&apos;ve sent a 6-digit verification code to:
                </p>
                <p className="font-semibold text-slate-900">{email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Verification Code
                </label>
                <OtpInput
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    setErrors({});
                  }}
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                )}
              </div>

              <div className="text-center text-sm text-slate-600">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setErrors({});
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Resend
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === "password" && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-6"
              noValidate
            >
              <p className="text-slate-600">
                Enter your new password. Make sure it&apos;s at least 6
                characters long.
              </p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({});
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({});
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          )}

          {/* ── Step 4: Success ── */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  Password Reset Successful!
                </h2>
                <p className="text-slate-600">
                  Your password has been successfully reset. You can now log in
                  with your new password.
                </p>
              </div>

              <Button
                onClick={() => router.push(withNext("/login", readNextParam()))}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                Back to Login
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin } from "@/hooks/use-auth";
import { toast } from "sonner";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { loginSchema, fieldErrors } from "@/lib/validation/auth.schema";
import { readNextParam, withNext } from "@/lib/redirect";

export default function Login() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    loginMutation.mutate(parsed.data, {
      onSuccess: async (result) => {
        if (result.success) {
          // Cookie is now set; refetch the cached (logged-out) /user/me so the
          // Header immediately reflects the authenticated user.
          await queryClient.invalidateQueries({ queryKey: ["me"] });
          // Hand the user back to the page that sent them here (e.g. a shared
          // /contribute link), falling back to the landing page.
          router.push(readNextParam() ?? "/");
        } else {
          toast.error(result.message ?? "Login failed.");
        }
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    });
  };

  // const handleGoogleSuccess = async (
  //   credentialResponse: CredentialResponse,
  // ) => {
  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         credentials: "include",
  //         body: JSON.stringify({ credential: credentialResponse.credential }),
  //       },
  //     );

  //     const data = await res.json();
  //     if (!res.ok) {
  //       toast.error(data.message || "Google login failed");
  //       return;
  //     }

  //     toast.success("Logged in with Google!");
  //     await queryClient.invalidateQueries({ queryKey: ["me"] });
  //     router.push("/course");
  //   } catch {
  //     toast.error("Google login failed. Please try again.");
  //   }
  // };

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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100">
            Log in to continue your exam preparation
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/*
            Google Login Button
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed")}
                theme="outline"
                size="large"
                text="continue_with"
                width="400"
              />
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">or log in with email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div> */}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-teal-500" />
                <Input
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-teal-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-teal-500"
                />
                <span className="ml-2 text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  router.push(withNext("/forgot-password", readNextParam()))
                }
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push(withNext("/signup", readNextParam()))}
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                Create one now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { useCurrentUser } from "@/hooks/use-user";
import { logout } from "@/lib/api/auth.api";

// Header is hidden on these (auth) pages.
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile dropdown when clicking outside it.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (AUTH_PAGES.includes(pathname)) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Clear client state regardless of the network result.
    }
    queryClient.removeQueries({ queryKey: ["me"] });
    setMenuOpen(false);
    router.push("/login");
  };

  const initials = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold text-blue-900">ExamPrep AI</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/contribute"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-blue-900"
          >
            Contribute
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:block">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="font-medium text-slate-700 transition-colors hover:text-blue-900">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-lg bg-teal-500 text-white hover:bg-teal-600">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

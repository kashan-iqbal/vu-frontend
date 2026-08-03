"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileUp,
  BookOpen,
  ListChecks,
  Sparkles,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/contributions", label: "Contributions", icon: FileUp },
  { href: "/admin/handouts", label: "Handouts", icon: BookOpen },
  { href: "/admin/mcqs/past", label: "Past MCQs", icon: ListChecks },
  { href: "/admin/mcqs/ai", label: "AI MCQs", icon: Sparkles },
  { href: "/admin/mcqs/wrong-answers", label: "Wrong Answers", icon: XCircle },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, isError } = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && (isError || !isAdmin)) {
      router.replace("/login");
    }
  }, [isLoading, isError, isAdmin, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border w-64 shrink-0 border-r p-4">
        <p className="px-2 pb-4 text-lg font-semibold">Admin</p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6">{children}</main>
    </div>
  );
}

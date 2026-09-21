"use client";

import { useRouter } from "next/navigation";
import { Bell, Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { clearStoredTokens, getStoredRefreshToken } from "@/features/auth/client/token-storage";
import { authFetch } from "@/lib/api/client";

interface DashboardHeaderProps {
  user?: {
    name: string;
    email?: string;
    role?: "supervisor" | "technician";
    image?: string;
  };
  onMenuClick?: () => void;
}

export function DashboardHeader({
  user = {
    name: "User",
    email: "user@example.com",
    role: "supervisor",
  },
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      const refresh = getStoredRefreshToken();
      if (refresh) {
        await authFetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        }).catch(() => {
          // ignore error to ensure local cleanup
        });
      }
    } finally {
      clearStoredTokens();
      router.replace("/login");
      router.refresh();
    }
  }

  const profileHref = user.role === "technician" ? "/technician/profile" : "/supervisor/profile";

  const initials = user.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>

        <div>
          <h2 className="text-sm font-medium text-foreground">
            Dashboard
          </h2>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Welcome back, {user.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User avatar - redirects directly to profile page */}
        <button
          type="button"
          onClick={() => router.push(profileHref)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/80 text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="View profile"
          aria-label="User Profile"
        >
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage
              src={user.image}
              alt={user.name}
            />

            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left md:block">
            <p className="max-w-[140px] truncate text-sm font-medium">
              {user.name}
            </p>

            {user.role && (
              <p className="text-xs capitalize text-muted-foreground">
                {user.role}
              </p>
            )}
          </div>
        </button>

        {/* Option to logout */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleLogout()}
          className="gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 cursor-pointer"
          title="Log out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

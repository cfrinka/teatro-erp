"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
} from "lucide-react";
import { rolesLabels } from "@/lib/utils";

interface HeaderProps {
  collapsed: boolean;
  onMobileMenuToggle?: () => void;
}

export function Header({ collapsed, onMobileMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [notifications] = React.useState(3);

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center gap-2 border-b border-zinc-200 bg-white/80 backdrop-blur-sm px-4 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/80",
        "left-0",
        collapsed ? "md:left-16" : "md:left-64",
        "md:px-6"
      )}
    >
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuToggle}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {notifications > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {notifications}
          </span>
        )}
      </Button>

      {/* Theme Toggle */}
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoUrl || undefined} />
              <AvatarFallback className="bg-zinc-200 text-xs font-medium dark:bg-zinc-800">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {user?.name || "Usuário"}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {user?.role ? rolesLabels[user.role] : ""}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.name}</span>
              <span className="text-xs font-normal text-zinc-500">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

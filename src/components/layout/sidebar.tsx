"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  UserPlus,
  CalendarCheck,
  DollarSign,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Theater,
  ShieldCheck,
  X,
  Menu,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "COORDINATION", "FINANCIAL", "TEACHER", "RECEPTION"],
  },
  {
    label: "Alunos",
    href: "/students",
    icon: Users,
    roles: ["ADMIN", "COORDINATION", "FINANCIAL", "TEACHER", "RECEPTION"],
  },
  {
    label: "Professores",
    href: "/teachers",
    icon: GraduationCap,
    roles: ["ADMIN", "COORDINATION"],
  },
  {
    label: "Cursos",
    href: "/courses",
    icon: BookOpen,
    roles: ["ADMIN", "COORDINATION"],
  },
  {
    label: "Turmas",
    href: "/classes",
    icon: ClipboardList,
    roles: ["ADMIN", "COORDINATION", "TEACHER", "RECEPTION"],
  },
  {
    label: "Matrículas",
    href: "/enrollments",
    icon: UserPlus,
    roles: ["ADMIN", "COORDINATION", "FINANCIAL", "RECEPTION"],
  },
  {
    label: "Frequência",
    href: "/attendance",
    icon: CalendarCheck,
    roles: ["ADMIN", "COORDINATION", "TEACHER"],
  },
  {
    label: "Financeiro",
    href: "/financial",
    icon: DollarSign,
    roles: ["ADMIN", "FINANCIAL"],
  },
  {
    label: "Agenda",
    href: "/schedule",
    icon: Calendar,
    roles: ["ADMIN", "COORDINATION", "TEACHER", "RECEPTION"],
  },
  {
    label: "Comunicação",
    href: "/communications",
    icon: MessageSquare,
    roles: ["ADMIN", "COORDINATION", "TEACHER", "RECEPTION"],
  },
  {
    label: "Documentos",
    href: "/documents",
    icon: FileText,
    roles: ["ADMIN", "COORDINATION", "RECEPTION"],
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "COORDINATION", "FINANCIAL"],
  },
  {
    label: "Auditoria",
    href: "/audit",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  showMobileToggle?: boolean;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, showMobileToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "ADMIN";
  const closeRef = React.useRef<HTMLDivElement>(null);

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  // Close on click outside for mobile
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (closeRef.current && !closeRef.current.contains(event.target as Node) && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    }
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, onMobileClose]);

  // Close on escape
  React.useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    }
    if (mobileOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, onMobileClose]);

  const sidebarContent = (
    <aside
      ref={closeRef}
      className={cn(
        "flex h-full flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        {showMobileToggle && mobileOpen && (
          <Button variant="ghost" size="icon" onClick={onMobileClose} className="mr-1 md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
          <Theater className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Teatro ERP
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Sistema de Gestão
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobileOpen ? onMobileClose : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      {!mobileOpen && (
        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Recolher
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-0 z-40 h-screen">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-screen w-64">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

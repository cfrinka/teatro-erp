export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string | null;
}

export interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClasses: number;
  monthlyRevenue: number;
  expectedRevenue: number;
  overduePayments: number;
  dueTodayPayments: number;
  delinquentStudents: number;
  todayEvents: EventItem[];
  upcomingEvents: EventItem[];
}

export interface EventItem {
  id: string;
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  location?: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  key: string;
  value: string;
  operator?: "contains" | "equals" | "startsWith" | "endsWith" | "gt" | "gte" | "lt" | "lte";
}

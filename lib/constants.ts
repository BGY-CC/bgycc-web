export const APP_NAME = "BGYCC Admin";
export const APP_DESCRIPTION = "BGYCC School of Leadership — Admin Dashboard";

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  // Dashboard sections
  DASHBOARD: "/dashboard",
  CLUBS: "/clubs",
  PATHWAY_CHECKLISTS: "/pathway-checklists",
  ONBOARDING_EDITOR: "/onboarding-editor",
  RESOURCES: "/resources",
  ANNOUNCEMENT: "/announcement",
  USERS: "/users",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "Administrator",
  [USER_ROLES.USER]: "User",
  [USER_ROLES.VIEWER]: "Viewer",
};

export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
    canManageReports: boolean;
    canManageWidgets: boolean;
    canManageNavigation: boolean;
  }
> = {
  [USER_ROLES.ADMIN]: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canManageReports: true,
    canManageWidgets: true,
    canManageNavigation: true,
  },
  [USER_ROLES.USER]: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canManageReports: false,
    canManageWidgets: false,
    canManageNavigation: true,
  },
  [USER_ROLES.VIEWER]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageReports: false,
    canManageWidgets: false,
    canManageNavigation: false,
  },
};

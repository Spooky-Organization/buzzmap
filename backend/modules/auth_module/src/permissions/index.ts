import { UserRole } from "../../../shared/types";

export enum Permission {
  POV_CREATE = "pov:create",
  POV_READ = "pov:read",
  POV_UPDATE = "pov:update",
  POV_DELETE = "pov:delete",
  POV_MODERATE_INDECENT = "pov:moderate:indecent",
  PRODUCT_CREATE = "product:create",
  PRODUCT_UPDATE = "product:update",
  PRODUCT_DELETE = "product:delete",
  ORDER_VIEW_OWN = "order:view:own",
  ORDER_VIEW_BUSINESS = "order:view:business",
  ORDER_UPDATE_STATUS = "order:update:status",
  BUSINESS_UPDATE = "business:update",
  BUSINESS_DELETE = "business:delete",
  BUSINESS_VERIFY = "business:verify",
  USER_MANAGE = "user:manage",
  AD_CREATE = "ad:create",
  AD_MANAGE = "ad:manage",
  ANALYTICS_VIEW = "analytics:view",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: [
    Permission.POV_CREATE,
    Permission.POV_READ,
    Permission.POV_UPDATE,
    Permission.POV_DELETE,
    Permission.ORDER_VIEW_OWN,
    Permission.ANALYTICS_VIEW,
  ],
  [UserRole.BUSINESS_OWNER]: [
    Permission.POV_READ,
    Permission.POV_MODERATE_INDECENT,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.ORDER_VIEW_BUSINESS,
    Permission.ORDER_UPDATE_STATUS,
    Permission.BUSINESS_UPDATE,
    Permission.AD_CREATE,
    Permission.AD_MANAGE,
    Permission.ANALYTICS_VIEW,
  ],
  [UserRole.ADMIN]: Object.values(Permission),
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

"use client";

import { createContext, createElement, useContext } from "react";
import { can, canAny, type Permission, type Role } from "./permissions";

type SessionContextValue = {
  userId: string;
  email: string;
  fullName: string | null;
  role: Role;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: Omit<SessionContextValue, "can" | "canAny">;
  children: React.ReactNode;
}) {
  const ctx: SessionContextValue = {
    ...value,
    can: (permission) => can(value.role, permission),
    canAny: (permissions) => canAny(value.role, permissions),
  };

  return createElement(SessionContext.Provider, { value: ctx }, children);
}

export function usePermissions(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("usePermissions must be used inside <SessionProvider>");
  }
  return ctx;
}

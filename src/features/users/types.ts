export type MemberRole = "owner" | "admin" | "staff" | "viewer";
export type MemberStatus = "active" | "suspended";

export type MemberRow = {
  userId: string;
  membershipId: string;
  email: string;
  fullName: string | null;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string;
  invitedAt: string | null;
  acceptedAt: string | null;
  isPending: boolean;
};

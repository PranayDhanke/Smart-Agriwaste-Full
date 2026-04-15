import { Waste } from "./waste";

export interface AdminOverview {
  buyers: number;
  farmers: number;
  admins: number;
  wastes: number;
  orders: number;
  negotiations: number;
  communityPosts: number;
  bannedUsers: number;
  pendingReports: number;
  pendingVerifications: number;
}

export interface VerificationInfo {
  status: "not_requested" | "pending" | "verified" | "rejected";
  requestedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string;
  reason?: string;
}

export interface ManagedUser {
  _id: string;
  buyerId?: string;
  farmerId?: string;
  adminId?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  isBanned?: boolean;
  bannedReason?: string;
  createdAt?: string;
  aadharnumber?: string;
  aadharUrl?: string;
  farmDocUrl?: string;
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  houseBuildingName?: string;
  roadarealandmarkName?: string;
  farmNumber?: string;
  farmArea?: string;
  farmUnit?: string;
  verification?: VerificationInfo;
}

export interface ModerationReport {
  _id: string;
  reporterId: string;
  reporterRole: "buyer" | "farmer" | "admin";
  targetType: "buyer" | "farmer" | "waste";
  targetId: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  resolutionNote?: string;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface AdminDashboardResponse {
  overview: AdminOverview;
  recentUsers: ManagedUser[];
  recentWastes: Waste[];
}

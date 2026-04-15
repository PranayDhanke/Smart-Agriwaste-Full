"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileBadge,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserX,
  Users,
  Eye,
  FileWarning,
  Leaf,
  LayoutDashboard,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetWastesQuery } from "@/redux/api/wasteApi";
import {
  useDeleteManagedUserMutation,
  useDeleteWasteAsAdminMutation,
  useGetAdminDashboardQuery,
  useGetAdminUsersQuery,
  useGetReportsQuery,
  useUpdateReportStatusMutation,
  useUpdateUserBanStatusMutation,
  useUpdateUserVerificationStatusMutation,
} from "@/redux/api/adminApi";
import { ManagedUser, ModerationReport } from "@/components/types/admin";
import { Waste } from "@/components/types/waste";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserTab = "buyer" | "farmer" | "admin";
type SidebarSection = "overview" | "users" | "verifications" | "reports" | "wastes";

// ─── Stat config ──────────────────────────────────────────────────────────────
const statCards = [
  { key: "buyers",               label: "Buyers",                color: "blue"   },
  { key: "farmers",              label: "Farmers",               color: "green"  },
  { key: "admins",               label: "Admins",                color: "purple" },
  { key: "wastes",               label: "Waste Listings",        color: "amber"  },
  { key: "pendingReports",       label: "Pending Reports",       color: "red"    },
  { key: "pendingVerifications", label: "Pending Verifications", color: "orange" },
  { key: "orders",               label: "Orders",                color: "teal"   },
  { key: "bannedUsers",          label: "Banned Users",          color: "rose"   },
] as const;

const colorMap: Record<string, string> = {
  blue:   "bg-blue-50   text-blue-700   border-blue-100",
  green:  "bg-green-50  text-green-700  border-green-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  amber:  "bg-amber-50  text-amber-700  border-amber-100",
  red:    "bg-red-50    text-red-700    border-red-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  teal:   "bg-teal-50   text-teal-700   border-teal-100",
  rose:   "bg-rose-50   text-rose-700   border-rose-100",
};

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const navItems: { id: SidebarSection; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "overview",       label: "Overview",        icon: LayoutDashboard },
  { id: "users",          label: "Users",           icon: Users           },
  { id: "verifications",  label: "Verifications",   icon: FileBadge       },
  { id: "reports",        label: "Reports",         icon: FileWarning     },
  { id: "wastes",         label: "Waste Listings",  icon: Leaf            },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const role = user?.unsafeMetadata?.role;

  const [activeSection, setActiveSection] = useState<SidebarSection>("overview");
  const [activeTab, setActiveTab]         = useState<UserTab>("buyer");
  const [search, setSearch]               = useState("");
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [expandedVerificationId, setExpandedVerificationId] = useState<string | null>(null);

  const token        = useSelector((state: RootState) => state.auth.token);
  const adminEnabled = isLoaded && isSignedIn && role === "admin" && !!token;

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: dashboard,       isLoading: dashboardLoading,  refetch: refetchDashboard  } =
    useGetAdminDashboardQuery(undefined, { skip: !adminEnabled });
  const { data: usersResponse,   isLoading: usersLoading,      refetch: refetchUsers      } =
    useGetAdminUsersQuery(activeTab, { skip: !adminEnabled });
  const { data: buyerUsersResponse,  refetch: refetchBuyerUsers  } =
    useGetAdminUsersQuery("buyer",  { skip: !adminEnabled });
  const { data: farmerUsersResponse, refetch: refetchFarmerUsers } =
    useGetAdminUsersQuery("farmer", { skip: !adminEnabled });
  const { data: reportsResponse,     refetch: refetchReports     } =
    useGetReportsQuery(undefined, { skip: !adminEnabled });
  const { data: wastesResponse,  isLoading: wastesLoading,      refetch: refetchWastes    } =
    useGetWastesQuery({ limit: 50 }, { skip: !adminEnabled });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [updateUserBanStatus,          { isLoading: banLoading          }] = useUpdateUserBanStatusMutation();
  const [updateUserVerificationStatus, { isLoading: verificationLoading }] = useUpdateUserVerificationStatusMutation();
  const [deleteManagedUser,            { isLoading: deleteUserLoading   }] = useDeleteManagedUserMutation();
  const [deleteWasteAsAdmin,           { isLoading: deleteWasteLoading  }] = useDeleteWasteAsAdminMutation();
  const [updateReportStatus,           { isLoading: reportLoading       }] = useUpdateReportStatusMutation();

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const users = usersResponse?.users ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.email} ${e.username}`.toLowerCase().includes(q),
    );
  }, [search, usersResponse?.users]);

  const filteredWastes = useMemo(() => {
    const wastes = wastesResponse?.wastedata ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return wastes;
    return wastes.filter((e) =>
      `${e.title.en} ${e.wasteProduct} ${e.seller.name} ${e.seller.email}`.toLowerCase().includes(q),
    );
  }, [search, wastesResponse?.wastedata]);

  const pendingVerifications = useMemo(
    () =>
      [...(buyerUsersResponse?.users ?? []), ...(farmerUsersResponse?.users ?? [])].filter(
        (e) => e.verification?.status === "pending",
      ),
    [buyerUsersResponse?.users, farmerUsersResponse?.users],
  );

  const pendingReports = useMemo(
    () => (reportsResponse?.reports ?? []).filter((r) => r.status === "pending"),
    [reportsResponse?.reports],
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const refetchEverything = () => {
    refetchDashboard(); refetchUsers(); refetchBuyerUsers();
    refetchFarmerUsers(); refetchReports(); refetchWastes();
  };

  const runAdminAction = async (action: () => Promise<unknown>, msg: string) => {
    try {
      await action();
      toast.success(msg);
      refetchEverything();
    } catch (error: unknown) {
      const apiError = error as {
        data?: {
          message?: string;
        };
      };
      const message =
        typeof apiError?.data?.message === "string"
          ? apiError.data.message
          : "Admin action failed";
      toast.error(message);
    }
  };

  const handleBanToggle = (entry: ManagedUser, targetRole: "buyer" | "farmer") => {
    const next = !entry.isBanned;
    if (!window.confirm(next ? `Ban ${entry.firstName} ${entry.lastName}?` : `Unban ${entry.firstName} ${entry.lastName}?`)) return;
    runAdminAction(
      () => updateUserBanStatus({ role: targetRole, userId: entry.buyerId || entry.farmerId || "", isBanned: next, reason: next ? "Banned by admin panel" : "" }).unwrap(),
      next ? "User banned" : "User unbanned",
    );
  };

  const handleDeleteUser = (entry: ManagedUser, targetRole: UserTab) => {
    if (!window.confirm(`Delete ${entry.firstName} ${entry.lastName}? This permanently removes the account.`)) return;
    runAdminAction(
      () => deleteManagedUser({ role: targetRole, userId: entry.buyerId || entry.farmerId || entry.adminId || "" }).unwrap(),
      "User deleted",
    );
  };

  const handleDeleteWaste = (waste: Waste) => {
    if (!window.confirm(`Delete "${waste.title.en}"?`)) return;
    runAdminAction(() => deleteWasteAsAdmin(waste._id).unwrap(), "Waste deleted");
  };

  const handleVerification = (entry: ManagedUser, targetRole: "buyer" | "farmer", status: "verified" | "rejected") => {
    const reason = status === "rejected" ? (window.prompt("Optional rejection reason:", entry.verification?.reason ?? "") ?? "") : "";
    runAdminAction(
      () => updateUserVerificationStatus({ role: targetRole, userId: entry.buyerId || entry.farmerId || "", status, reason }).unwrap(),
      status === "verified" ? "Verification approved" : "Verification rejected",
    );
  };

  const handleReportStatus = (report: ModerationReport, status: "reviewed" | "resolved" | "rejected") => {
    const resolutionNote = window.prompt("Optional admin note:", report.resolutionNote ?? "") ?? "";
    runAdminAction(() => updateReportStatus({ reportId: report._id, status, resolutionNote }).unwrap(), "Report updated");
  };

  // ── Auth guards ───────────────────────────────────────────────────────────
  if (!isLoaded) return <FullScreenSpinner />;
  if (!isSignedIn) return <SignInPrompt onLogin={() => router.push("/admin/sign-in")} />;
  if (role !== "admin") return <AccessDenied onSwitch={() => router.push("/admin/sign-in")} onHome={() => router.push("/")} />;

  // ── Badge counts ──────────────────────────────────────────────────────────
  const badgeCounts: Partial<Record<SidebarSection, number>> = {
    verifications: pendingVerifications.length,
    reports:       pendingReports.length,
  };

  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen bg-[#f5f5f0] font-sans overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col shrink-0 transition-all duration-300 bg-[#1a1f2e] text-white ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        {/* Logo row */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sm tracking-wide truncate">Admin Panel</span>
          )}
          <button
            className="ml-auto text-white/40 hover:text-white transition-colors"
            onClick={() => setSidebarOpen((p) => !p)}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon  = item.icon;
            const count = badgeCounts[item.id];
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-green-500/20 text-green-400 font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {count != null && count > 0 && (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        {sidebarOpen && (
          <div className="border-t border-white/10 p-4">
            <p className="text-xs text-white/40 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
            <p className="text-xs font-medium text-white/70 mt-0.5">Administrator</p>
          </div>
        )}
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 shrink-0">
          <div>
            <h1 className="text-base font-semibold text-slate-900 capitalize">{activeSection}</h1>
            <p className="text-xs text-slate-400">
              {activeSection === "overview"      && "Platform statistics at a glance"}
              {activeSection === "users"         && "Manage platform accounts"}
              {activeSection === "verifications" && "Pending verification requests"}
              {activeSection === "reports"       && "Submitted moderation reports"}
              {activeSection === "wastes"        && "Review and moderate waste listings"}
            </p>
          </div>

          <div className="relative ml-auto w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-8 text-sm bg-slate-50 border-slate-200"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
          {activeSection === "overview" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card) => (
                  <div
                    key={card.key}
                    className={`rounded-xl border p-4 ${colorMap[card.color]}`}
                  >
                    <p className="text-xs font-medium opacity-70">{card.label}</p>
                    <p className="text-3xl font-bold mt-1">
                      {dashboardLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin opacity-40" />
                      ) : (
                        dashboard?.overview?.[card.key] ?? 0
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick-action shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickCard
                  title="Pending Verifications"
                  count={pendingVerifications.length}
                  color="orange"
                  onClick={() => setActiveSection("verifications")}
                />
                <QuickCard
                  title="Pending Reports"
                  count={pendingReports.length}
                  color="red"
                  onClick={() => setActiveSection("reports")}
                />
                <QuickCard
                  title="Waste Listings"
                  count={wastesResponse?.wastedata?.length ?? 0}
                  color="green"
                  onClick={() => setActiveSection("wastes")}
                />
              </div>
            </>
          )}

          {/* ══ USERS ═════════════════════════════════════════════════════ */}
          {activeSection === "users" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center gap-1 border-b border-slate-100 px-4 py-2 bg-slate-50">
                {(["buyer", "farmer", "admin"] as UserTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                  </button>
                ))}
                <span className="ml-auto text-xs text-slate-400">
                  {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usersLoading ? (
                      <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-400">No users found.</td></tr>
                    ) : (
                      filteredUsers.map((entry) => (
                        <tr key={entry._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-900">
                            {entry.firstName} {entry.lastName}
                            <div className="text-xs text-slate-400 font-normal">@{entry.username}</div>
                          </td>
                          <td className="px-5 py-3 text-slate-500">{entry.email}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                entry.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                              }`}>
                                {entry.isBanned ? "Banned" : "Active"}
                              </span>
                              {entry.verification?.status && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  entry.verification.status === "verified"  ? "bg-blue-100 text-blue-700"   :
                                  entry.verification.status === "pending"   ? "bg-amber-100 text-amber-700" :
                                  "bg-slate-100 text-slate-500"
                                }`}>
                                  {entry.verification.status}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {activeTab !== "admin" && (
                                <>
                                  <ActionBtn
                                    onClick={() => handleBanToggle(entry, activeTab)}
                                    disabled={banLoading}
                                    label={entry.isBanned ? "Unban" : "Ban"}
                                    color={entry.isBanned ? "green" : "amber"}
                                    icon={entry.isBanned ? <CheckCircle2 className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                                  />
                                  {entry.verification?.status === "pending" && (
                                    <>
                                      <ActionBtn onClick={() => handleVerification(entry, activeTab, "verified")}  disabled={verificationLoading} label="Approve" color="green"  icon={<FileBadge className="h-3.5 w-3.5" />} />
                                      <ActionBtn onClick={() => handleVerification(entry, activeTab, "rejected")} disabled={verificationLoading} label="Reject"  color="amber"  icon={<Ban className="h-3.5 w-3.5" />}      />
                                    </>
                                  )}
                                </>
                              )}
                              <ActionBtn onClick={() => handleDeleteUser(entry, activeTab)} disabled={deleteUserLoading} label="Delete" color="red" icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ VERIFICATIONS ═════════════════════════════════════════════ */}
          {activeSection === "verifications" && (
            <div className="space-y-3">
              {pendingVerifications.length === 0 ? (
                <EmptyState icon={<FileBadge className="h-8 w-8" />} title="No pending verifications" desc="All verification requests have been handled." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingVerifications.map((entry) => {
                    const targetRole = entry.buyerId ? "buyer" : "farmer";
                    const verificationId = entry.buyerId || entry.farmerId || entry._id;
                    const isExpanded = expandedVerificationId === verificationId;
                    return (
                      <div key={entry._id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{entry.firstName} {entry.lastName}</p>
                            <p className="text-xs text-slate-500">{entry.email}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                            {targetRole}
                          </span>
                        </div>
                        {entry.verification?.reason && (
                          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{entry.verification.reason}</p>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-8 text-xs border-slate-200"
                          onClick={() =>
                            setExpandedVerificationId(isExpanded ? null : verificationId)
                          }
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View details
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 ml-1" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          )}
                        </Button>
                        {isExpanded && <VerificationDetails entry={entry} role={targetRole} />}
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                            onClick={() => handleVerification(entry, targetRole, "verified")}
                            disabled={verificationLoading}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs border-slate-200"
                            onClick={() => handleVerification(entry, targetRole, "rejected")}
                            disabled={verificationLoading}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ REPORTS ═══════════════════════════════════════════════════ */}
          {activeSection === "reports" && (
            <div className="space-y-3">
              {pendingReports.length === 0 ? (
                <EmptyState icon={<FileWarning className="h-8 w-8" />} title="No pending reports" desc="All submitted reports have been reviewed." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingReports.map((report) => (
                    <div key={report._id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <FileWarning className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">{report.targetType} report</p>
                          <p className="text-xs text-slate-500">Reason: {report.reason}</p>
                        </div>
                      </div>
                      {report.description && (
                        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">{report.description}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs"   onClick={() => handleReportStatus(report, "reviewed")} disabled={reportLoading}>Review</Button>
                        <Button size="sm" className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReportStatus(report, "resolved")} disabled={reportLoading}>Resolve</Button>
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReportStatus(report, "rejected")} disabled={reportLoading}>Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ WASTES ════════════════════════════════════════════════════ */}
          {activeSection === "wastes" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Active Listings</p>
                <span className="text-xs text-slate-400">{filteredWastes.length} listings</span>
              </div>
              {wastesLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading listings…
                </div>
              ) : filteredWastes.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">No listings found.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredWastes.map((entry) => (
                    <div key={entry._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Leaf className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{entry.title.en}</p>
                        <p className="text-xs text-slate-500 truncate">{entry.seller.name} — Rs. {entry.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs shrink-0"
                        onClick={() => handleDeleteWaste(entry)}
                        disabled={deleteWasteLoading}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function QuickCard({ title, count, color, onClick }: { title: string; count: number; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-5 transition-all hover:shadow-md ${colorMap[color]}`}
    >
      <p className="text-xs font-medium opacity-70">{title}</p>
      <p className="text-3xl font-bold mt-1">{count}</p>
      <p className="text-xs mt-2 opacity-60 flex items-center gap-1">View all <ChevronRight className="h-3 w-3" /></p>
    </button>
  );
}

function ActionBtn({ onClick, disabled, label, color, icon }: {
  onClick: () => void; disabled: boolean; label: string; color: "green" | "amber" | "red"; icon: React.ReactNode;
}) {
  const cls = {
    green: "text-green-700 hover:bg-green-50 border-green-200",
    amber: "text-amber-700 hover:bg-amber-50 border-amber-200",
    red:   "text-red-700   hover:bg-red-50   border-red-200",
  }[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors disabled:opacity-40 ${cls}`}
    >
      {icon} {label}
    </button>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 py-20 flex flex-col items-center text-center gap-3 text-slate-400">
      <div className="opacity-30">{icon}</div>
      <p className="font-medium text-slate-600">{title}</p>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  );
}

function SignInPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-lg p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto">
          <Shield className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Admin Sign-in Required</h2>
        <p className="text-sm text-slate-500">Please log in with your administrator credentials.</p>
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onLogin}>Open Admin Login</Button>
      </div>
    </div>
  );
}

function AccessDenied({ onSwitch, onHome }: { onSwitch: () => void; onHome: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-amber-200 shadow-lg p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto">
          <Ban className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">This area is limited to administrators only.</p>
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={onSwitch}>Switch Accounts</Button>
          <Button variant="outline" className="w-full" onClick={onHome}>Return to Home</Button>
        </div>
      </div>
    </div>
  );
}

function VerificationDetails({
  entry,
  role,
}: {
  entry: ManagedUser;
  role: "buyer" | "farmer";
}) {
  const address = [entry.village, entry.taluka, entry.district, entry.state]
    .filter(Boolean)
    .join(", ");
  const joinedAddress = [entry.houseBuildingName, entry.roadarealandmarkName]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <DetailItem label="Phone" value={entry.phone} />
        <DetailItem label="Email" value={entry.email} />
        <DetailItem label="Username" value={entry.username} />
        <DetailItem label="Aadhar" value={entry.aadharnumber} />
        <DetailItem label="Requested" value={entry.verification?.requestedAt ? new Date(entry.verification.requestedAt).toLocaleString() : undefined} />
        <DetailItem label="Address" value={address || joinedAddress || undefined} />
        {role === "farmer" && <DetailItem label="Farm Number" value={entry.farmNumber} />}
        {role === "farmer" && <DetailItem label="Farm Area" value={entry.farmArea ? `${entry.farmArea} ${entry.farmUnit ?? ""}`.trim() : undefined} />}
      </div>
      <div className="flex flex-wrap gap-2">
        {entry.aadharUrl && (
          <a
            href={entry.aadharUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            View Aadhar <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {role === "farmer" && entry.farmDocUrl && (
          <a
            href={entry.farmDocUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            View Farm Doc <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 border border-slate-200">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-700">{value || "-"}</p>
    </div>
  );
}

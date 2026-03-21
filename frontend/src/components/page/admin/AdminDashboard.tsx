"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle2,
  FileBadge,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type UserTab = "buyer" | "farmer" | "admin";

const statCards = [
  { key: "buyers", label: "Buyers" },
  { key: "farmers", label: "Farmers" },
  { key: "admins", label: "Admins" },
  { key: "wastes", label: "Waste Listings" },
  { key: "pendingReports", label: "Pending Reports" },
  { key: "pendingVerifications", label: "Pending Verifications" },
  { key: "orders", label: "Orders" },
  { key: "bannedUsers", label: "Banned Users" },
] as const;

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const role = user?.unsafeMetadata?.role;

  const [activeTab, setActiveTab] = useState<UserTab>("buyer");
  const [search, setSearch] = useState("");

  
  const token = useSelector((state: RootState) => state.auth.token);

  const adminEnabled = isLoaded && isSignedIn && role === "admin" && !!token;

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useGetAdminDashboardQuery(undefined, {
    skip: !adminEnabled,
  });
  const {
    data: usersResponse,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery(activeTab, {
    skip: !adminEnabled,
  });
  const { data: buyerUsersResponse, refetch: refetchBuyerUsers } =
    useGetAdminUsersQuery("buyer", { skip: !adminEnabled });
  const { data: farmerUsersResponse, refetch: refetchFarmerUsers } =
    useGetAdminUsersQuery("farmer", { skip: !adminEnabled });
  const { data: reportsResponse, refetch: refetchReports } = useGetReportsQuery(
    undefined,
    {
      skip: !adminEnabled,
    },
  );
  const {
    data: wastesResponse,
    isLoading: wastesLoading,
    refetch: refetchWastes,
  } = useGetWastesQuery({ limit: 50 }, { skip: !adminEnabled });

  const [updateUserBanStatus, { isLoading: banLoading }] =
    useUpdateUserBanStatusMutation();
  const [updateUserVerificationStatus, { isLoading: verificationLoading }] =
    useUpdateUserVerificationStatusMutation();
  const [deleteManagedUser, { isLoading: deleteUserLoading }] =
    useDeleteManagedUserMutation();
  const [deleteWasteAsAdmin, { isLoading: deleteWasteLoading }] =
    useDeleteWasteAsAdminMutation();
  const [updateReportStatus, { isLoading: reportLoading }] =
    useUpdateReportStatusMutation();

  const filteredUsers = useMemo(() => {
    const users = usersResponse?.users ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((entry) =>
      `${entry.firstName} ${entry.lastName} ${entry.email} ${entry.username}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, usersResponse?.users]);

  const filteredWastes = useMemo(() => {
    const wastes = wastesResponse?.wastedata ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return wastes;

    return wastes.filter((entry) =>
      `${entry.title.en} ${entry.wasteProduct} ${entry.seller.name} ${entry.seller.email}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, wastesResponse?.wastedata]);

  const pendingVerifications = useMemo(
    () =>
      [
        ...(buyerUsersResponse?.users ?? []),
        ...(farmerUsersResponse?.users ?? []),
      ].filter((entry) => entry.verification?.status === "pending"),
    [buyerUsersResponse?.users, farmerUsersResponse?.users],
  );

  const pendingReports = useMemo(
    () =>
      (reportsResponse?.reports ?? []).filter(
        (report) => report.status === "pending",
      ),
    [reportsResponse?.reports],
  );

  const refetchEverything = () => {
    refetchDashboard();
    refetchUsers();
    refetchBuyerUsers();
    refetchFarmerUsers();
    refetchReports();
    refetchWastes();
  };

  const runAdminAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    try {
      await action();
      toast.success(successMessage);
      refetchEverything();
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Admin action failed";

      toast.error(message);
    }
  };

  const handleBanToggle = (
    entry: ManagedUser,
    targetRole: "buyer" | "farmer",
  ) => {
    const nextStatus = !entry.isBanned;
    if (
      !window.confirm(
        nextStatus
          ? `Ban ${entry.firstName} ${entry.lastName}?`
          : `Unban ${entry.firstName} ${entry.lastName}?`,
      )
    ) {
      return;
    }

    runAdminAction(
      () =>
        updateUserBanStatus({
          role: targetRole,
          userId: entry.buyerId || entry.farmerId || "",
          isBanned: nextStatus,
          reason: nextStatus ? "Banned by admin panel" : "",
        }).unwrap(),
      nextStatus ? "User banned successfully" : "User unbanned successfully",
    );
  };

  const handleDeleteUser = (entry: ManagedUser, targetRole: UserTab) => {
    if (
      !window.confirm(
        `Delete ${entry.firstName} ${entry.lastName}? This permanently removes the account.`,
      )
    ) {
      return;
    }

    runAdminAction(
      () =>
        deleteManagedUser({
          role: targetRole,
          userId: entry.buyerId || entry.farmerId || entry.adminId || "",
        }).unwrap(),
      "User deleted successfully",
    );
  };

  const handleDeleteWaste = (waste: Waste) => {
    if (!window.confirm(`Delete waste listing "${waste.title.en}"?`)) {
      return;
    }

    runAdminAction(
      () => deleteWasteAsAdmin(waste._id).unwrap(),
      "Waste deleted successfully",
    );
  };

  const handleVerification = (
    entry: ManagedUser,
    targetRole: "buyer" | "farmer",
    status: "verified" | "rejected",
  ) => {
    const reason =
      status === "rejected"
        ? (window.prompt(
            "Optional rejection reason:",
            entry.verification?.reason ?? "",
          ) ?? "")
        : "";

    runAdminAction(
      () =>
        updateUserVerificationStatus({
          role: targetRole,
          userId: entry.buyerId || entry.farmerId || "",
          status,
          reason,
        }).unwrap(),
      status === "verified"
        ? "Verification approved successfully"
        : "Verification rejected successfully",
    );
  };

  const handleReportStatus = (
    report: ModerationReport,
    status: "reviewed" | "resolved" | "rejected",
  ) => {
    const resolutionNote =
      window.prompt("Optional admin note:", report.resolutionNote ?? "") ?? "";

    runAdminAction(
      () =>
        updateReportStatus({
          reportId: report._id,
          status,
          resolutionNote,
        }).unwrap(),
      "Report updated successfully",
    );
  };

  if (!isLoaded || (!isSignedIn && role !== "admin")) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }
  if (!isSignedIn) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <Card className="w-full border-green-100 shadow-lg">
          <CardHeader className="text-center">
            <Shield className="mx-auto mb-2 h-10 w-10 text-green-600" />
            <CardTitle>Admin Sign-in Required</CardTitle>
            <CardDescription>
              Please log in with your administrator credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/admin/sign-in")}
            >
              Open Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <Card className="w-full border-amber-200 bg-amber-50/50 shadow-lg">
          <CardHeader className="text-center">
            <Ban className="mx-auto mb-2 h-10 w-10 text-amber-500" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This area is limited to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => router.push("/admin/sign-in")}
            >
              Switch Accounts
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100/80 px-3 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20">
              <Shield className="h-3.5 w-3.5" />
              Administrator Panel
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Moderate users, reports, verification requests, and waste
              listings.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users, emails, or listings..."
              className="w-full bg-white pl-10 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {statCards.map((card) => (
            <Card
              key={card.key}
              className="border-slate-200/60 bg-white shadow-sm"
            >
              <CardHeader className="p-4">
                <CardDescription className="text-xs font-medium">
                  {card.label}
                </CardDescription>
                <CardTitle className="text-2xl text-slate-800">
                  {dashboardLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                  ) : (
                    (dashboard?.overview?.[card.key] ?? 0)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-slate-200/60 bg-white shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <CardDescription>
                    View, ban, verify, or delete platform accounts.
                  </CardDescription>
                </div>
                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500">
                  {(["buyer", "farmer", "admin"] as UserTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                        activeTab === tab
                          ? "bg-white text-slate-900 shadow-sm"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">User Details</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(usersLoading ? [] : filteredUsers).map((entry) => (
                      <tr
                        key={entry._id}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {entry.firstName} {entry.lastName}
                          </div>
                          <div className="text-slate-500">
                            {entry.email}{" "}
                            <span className="mx-1 text-slate-300">|</span> @
                            {entry.username}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={
                                entry.isBanned ? "destructive" : "secondary"
                              }
                            >
                              {entry.isBanned ? "Banned" : "Active"}
                            </Badge>
                            {entry.verification?.status && (
                              <Badge variant="outline">
                                {entry.verification.status}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab !== "admin" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={
                                    entry.isBanned
                                      ? "text-green-600 hover:text-green-700"
                                      : "text-amber-600 hover:text-amber-700"
                                  }
                                  onClick={() =>
                                    handleBanToggle(entry, activeTab)
                                  }
                                  disabled={banLoading}
                                  title={
                                    entry.isBanned ? "Unban User" : "Ban User"
                                  }
                                >
                                  {entry.isBanned ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <UserX className="h-4 w-4" />
                                  )}
                                </Button>
                                {entry.verification?.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() =>
                                        handleVerification(
                                          entry,
                                          activeTab,
                                          "verified",
                                        )
                                      }
                                      disabled={verificationLoading}
                                      title="Approve Verification"
                                    >
                                      <FileBadge className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-amber-600 hover:text-amber-700"
                                      onClick={() =>
                                        handleVerification(
                                          entry,
                                          activeTab,
                                          "rejected",
                                        )
                                      }
                                      disabled={verificationLoading}
                                      title="Reject Verification"
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDeleteUser(entry, activeTab)}
                              disabled={deleteUserLoading}
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!usersLoading && filteredUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="mb-4 h-8 w-8 text-slate-200" />
                    <p className="text-sm font-medium text-slate-900">
                      No users found
                    </p>
                    <p className="text-sm text-slate-500">
                      Try changing your search or selected tab.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-1">
            <Card className="border-slate-200/60 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Verification Queue</CardTitle>
                <CardDescription>
                  Approve or reject pending buyer and farmer verification
                  requests.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingVerifications.slice(0, 6).map((entry) => {
                  const targetRole = entry.buyerId ? "buyer" : "farmer";
                  return (
                    <div
                      key={entry._id}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <p className="font-medium text-slate-900">
                        {entry.firstName} {entry.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{entry.email}</p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleVerification(entry, targetRole, "verified")
                          }
                          disabled={verificationLoading}
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleVerification(entry, targetRole, "rejected")
                          }
                          disabled={verificationLoading}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {pendingVerifications.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No pending verification requests.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Report Review</CardTitle>
                <CardDescription>
                  Check submitted reports for buyers, farmers, and waste
                  listings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingReports.slice(0, 6).map((report) => (
                  <div
                    key={report._id}
                    className="rounded-xl border border-slate-100 p-3"
                  >
                    <p className="font-medium text-slate-900">
                      {report.targetType} report
                    </p>
                    <p className="text-xs text-slate-500">
                      Reason: {report.reason}
                    </p>
                    {report.description && (
                      <p className="mt-1 text-xs text-slate-500">
                        {report.description}
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReportStatus(report, "reviewed")}
                        disabled={reportLoading}
                      >
                        Review
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleReportStatus(report, "resolved")}
                        disabled={reportLoading}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReportStatus(report, "rejected")}
                        disabled={reportLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingReports.length === 0 && (
                  <p className="text-sm text-slate-500">No pending reports.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Waste Moderation</CardTitle>
                <CardDescription>
                  Delete inappropriate or low-quality listings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {wastesLoading ? (
                  <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading listings...
                  </div>
                ) : filteredWastes.length > 0 ? (
                  filteredWastes.slice(0, 8).map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {entry.title.en}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {entry.seller.name} | Rs. {entry.price}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteWaste(entry)}
                        disabled={deleteWasteLoading}
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No active listings found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

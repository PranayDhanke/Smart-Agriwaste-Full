import { clerkClient } from "@clerk/express";
import { Request, Response } from "express";
import { env } from "../config/env";
import adminAccount from "../models/admin.model";
import buyeraccount from "../models/buyer.model";
import farmeraccount from "../models/farmer.model";
import communityPost from "../models/communityPost.model";
import negotiationModel from "../models/negotiation.model";
import orderModel from "../models/order.model";
import reportModel from "../models/report.model";
import wasteModel from "../models/waste.model";
import { getRequestActor } from "../middlewares/authz.middleware";
import { AppError } from "../utils/AppError";

const toSingleParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const upsertAdminAccount = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);
  const email =
    user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";

  const firstName = user.firstName || user.fullName?.split(" ")[0] || "Admin";
  const lastName =
    user.lastName || user.fullName?.split(" ").slice(1).join(" ") || "User";
  const username = user.username || email.split("@")[0] || user.id;

  return adminAccount.findOneAndUpdate(
    { adminId: userId },
    {
      adminId: userId,
      firstName,
      lastName,
      username,
      email,
      isActive: true,
    },
    { new: true, upsert: true },
  );
};

export const bootstrapAdmin = async (req: Request, res: Response) => {
  const actor = await getRequestActor(req);

  if (!env.adminBootstrapEmails.includes(actor.email.toLowerCase())) {
    throw new AppError("This account is not allowed to bootstrap admin access", 403);
  }

  await clerkClient.users.updateUser(actor.userId, {
    unsafeMetadata: {
      ...(actor.user.unsafeMetadata ?? {}),
      role: "admin",
    },
  });

  const account = await upsertAdminAccount(actor.userId);

  res.status(200).json({
    message: "Admin access enabled successfully",
    accountdata: account,
  });
};

export const getAdminAccount = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);

  if (!id) {
    throw new AppError("No admin ID provided", 400);
  }

  const accountdata = await adminAccount.findOne({ adminId: id });

  if (!accountdata) {
    throw new AppError("Admin profile not found", 404);
  }

  res.status(200).json({ accountdata });
};

export const getAdminDashboard = async (_req: Request, res: Response) => {
  const [
    buyers,
    farmers,
    admins,
    wastes,
    orders,
    negotiations,
    communityPosts,
    pendingReports,
    pendingVerifications,
  ] =
    await Promise.all([
      buyeraccount.countDocuments(),
      farmeraccount.countDocuments(),
      adminAccount.countDocuments(),
      wasteModel.countDocuments(),
      orderModel.countDocuments(),
      negotiationModel.countDocuments(),
      communityPost.countDocuments(),
      reportModel.countDocuments({ status: "pending" }),
      Promise.all([
        buyeraccount.countDocuments({ "verification.status": "pending" }),
        farmeraccount.countDocuments({ "verification.status": "pending" }),
      ]).then(([buyerPending, farmerPending]) => buyerPending + farmerPending),
    ]);

  const [bannedBuyers, bannedFarmers, recentUsers, recentWastes] = await Promise.all([
    buyeraccount.countDocuments({ isBanned: true }),
    farmeraccount.countDocuments({ isBanned: true }),
    Promise.all([
      buyeraccount.find().sort({ createdAt: -1 }).limit(4).lean(),
      farmeraccount.find().sort({ createdAt: -1 }).limit(4).lean(),
      adminAccount.find().sort({ createdAt: -1 }).limit(4).lean(),
    ]).then(([buyerUsers, farmerUsers, adminUsers]) =>
      [...buyerUsers, ...farmerUsers, ...adminUsers]
        .sort(
          (left, right) =>
            new Date(right.createdAt ?? 0).getTime() -
            new Date(left.createdAt ?? 0).getTime(),
        )
        .slice(0, 6),
    ),
    wasteModel.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  res.status(200).json({
    overview: {
      buyers,
      farmers,
      admins,
      wastes,
      orders,
      negotiations,
      communityPosts,
      bannedUsers: bannedBuyers + bannedFarmers,
      pendingReports,
      pendingVerifications,
    },
    recentUsers,
    recentWastes,
  });
};

export const getAdminUsers = async (req: Request, res: Response) => {
  const role = toSingleParam(req.query.role as string | string[] | undefined) as
    | "buyer"
    | "farmer"
    | "admin"
    | undefined;

  if (!role || !["buyer", "farmer", "admin"].includes(role)) {
    throw new AppError("A valid role query is required", 400);
  }

  const users =
    role === "buyer"
      ? await buyeraccount.find().sort({ createdAt: -1 }).lean()
      : role === "farmer"
        ? await farmeraccount.find().sort({ createdAt: -1 }).lean()
        : await adminAccount.find().sort({ createdAt: -1 }).lean();

  res.status(200).json({ users });
};

export const updateUserBanStatus = async (req: Request, res: Response) => {
  const role = toSingleParam(req.params.role) as "buyer" | "farmer" | undefined;
  const userId = toSingleParam(req.params.userId);
  const { isBanned, reason } = req.body as {
    isBanned?: boolean;
    reason?: string;
  };

  if (!role || !userId || !["buyer", "farmer"].includes(role) || typeof isBanned !== "boolean") {
    throw new AppError("Invalid ban request", 400);
  }

  const update = {
    isBanned,
    bannedAt: isBanned ? new Date() : null,
    bannedReason: isBanned ? reason ?? "" : "",
  };

  const updated =
    role === "buyer"
      ? await buyeraccount.findOneAndUpdate({ buyerId: userId }, update, { new: true })
      : await farmeraccount.findOneAndUpdate({ farmerId: userId }, update, { new: true });

  if (!updated) {
    throw new AppError("User account not found", 404);
  }

  await clerkClient.users.updateUserMetadata(userId, {
    unsafeMetadata: {
      role,
      isBanned,
    },
  });

  res.status(200).json({
    message: isBanned ? "User banned successfully" : "User unbanned successfully",
    user: updated,
  });
};

export const deleteManagedUser = async (req: Request, res: Response) => {
  const role = toSingleParam(req.params.role) as "buyer" | "farmer" | "admin" | undefined;
  const userId = toSingleParam(req.params.userId);

  if (!role || !userId || !["buyer", "farmer", "admin"].includes(role)) {
    throw new AppError("Invalid role provided", 400);
  }

  const actor = await getRequestActor(req);
  if (actor.userId === userId) {
    throw new AppError("Admins cannot delete their own account", 400);
  }

  const deleted =
    role === "buyer"
      ? await buyeraccount.findOneAndDelete({ buyerId: userId })
      : role === "farmer"
        ? await farmeraccount.findOneAndDelete({ farmerId: userId })
        : await adminAccount.findOneAndDelete({ adminId: userId });

  if (!deleted) {
    throw new AppError("User account not found", 404);
  }

  if (role === "farmer") {
    await wasteModel.deleteMany({ "seller.farmerId": userId });
  }

  await clerkClient.users.deleteUser(userId);

  res.status(200).json({ message: "User deleted successfully" });
};

export const deleteWasteAsAdmin = async (req: Request, res: Response) => {
  const wasteId = toSingleParam(req.params.id);

  if (!wasteId) {
    throw new AppError("Waste id is required", 400);
  }

  const deleted = await wasteModel.findByIdAndDelete(wasteId);

  if (!deleted) {
    throw new AppError("Waste not found", 404);
  }

  res.status(200).json({ message: "Waste deleted successfully" });
};

export const deleteCommunityPostAsAdmin = async (req: Request, res: Response) => {
  const postId = toSingleParam(req.params.id);

  if (!postId) {
    throw new AppError("Community post id is required", 400);
  }

  const deleted = await communityPost.findByIdAndDelete(postId);

  if (!deleted) {
    throw new AppError("Community post not found", 404);
  }

  res.status(200).json({ message: "Community post deleted successfully" });
};

export const getReports = async (_req: Request, res: Response) => {
  const reports = await reportModel.find().sort({ createdAt: -1 }).lean();

  res.status(200).json({ reports });
};

export const updateReportStatus = async (req: Request, res: Response) => {
  const reportId = toSingleParam(req.params.id);
  const actor = await getRequestActor(req);
  const { status, resolutionNote } = req.body as {
    status?: "reviewed" | "resolved" | "rejected";
    resolutionNote?: string;
  };

  if (!reportId || !status) {
    throw new AppError("Report id and status are required", 400);
  }

  const updated = await reportModel.findByIdAndUpdate(
    reportId,
    {
      status,
      resolutionNote: resolutionNote ?? "",
      reviewedBy: actor.userId,
      reviewedAt: new Date(),
    },
    { new: true },
  );

  if (!updated) {
    throw new AppError("Report not found", 404);
  }

  res.status(200).json({
    message: "Report updated successfully",
    report: updated,
  });
};

export const updateUserVerificationStatus = async (req: Request, res: Response) => {
  const actor = await getRequestActor(req);
  const role = toSingleParam(req.params.role) as "buyer" | "farmer" | undefined;
  const userId = toSingleParam(req.params.userId);
  const { status, reason } = req.body as {
    status?: "verified" | "rejected";
    reason?: string;
  };

  if (!role || !userId || !status) {
    throw new AppError("Role, user id, and verification status are required", 400);
  }

  const verificationUpdate = {
    verification: {
      status,
      requestedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: actor.userId,
      reason: status === "rejected" ? reason ?? "" : "",
    },
  };

  const updated =
    role === "buyer"
      ? await buyeraccount.findOneAndUpdate({ buyerId: userId }, verificationUpdate, {
          new: true,
        })
      : await farmeraccount.findOneAndUpdate(
          { farmerId: userId },
          verificationUpdate,
          { new: true },
        );

  if (!updated) {
    throw new AppError("User account not found", 404);
  }

  res.status(200).json({
    message:
      status === "verified"
        ? "Verification approved successfully"
        : "Verification rejected successfully",
    user: updated,
  });
};

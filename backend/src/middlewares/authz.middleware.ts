import { clerkClient, getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import adminAccount from "../models/admin.model";
import buyeraccount from "../models/buyer.model";
import farmeraccount from "../models/farmer.model";
import { wasteRepository } from "../repositories/waste.repository";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export type AppRole = "admin" | "buyer" | "farmer" | "guest";

interface AccountStatus {
  isBanned: boolean;
}

const toSingleParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getRoleModel = (role: AppRole) => {
  if (role === "buyer") return buyeraccount;
  if (role === "farmer") return farmeraccount;
  if (role === "admin") return adminAccount;
  return null;
};

export const getRequestActor = async (req: Request) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new AppError("Authentication required", 401);
  }

  const user = await clerkClient.users.getUser(auth.userId);
  const role = (user.unsafeMetadata?.role as AppRole | undefined) ?? "guest";
  const primaryEmail =
    user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId,
    )?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";

  return {
    user,
    userId: user.id,
    role,
    email: primaryEmail,
  };
};

export const requireRoles = (roles: AppRole[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const actor = await getRequestActor(req);

    if (!roles.includes(actor.role)) {
      throw new AppError("You do not have permission to access this resource", 403);
    }

    res.locals.actor = actor;
    next();
  });

export const requireActiveAccount = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const actor = await getRequestActor(req);
    const model = getRoleModel(actor.role);

    if (!model || actor.role === "admin") {
      next();
      return;
    }

    const account =
      actor.role === "buyer"
        ? ((await buyeraccount.findOne({ buyerId: actor.userId }).lean()) as
            | AccountStatus
            | null)
        : ((await farmeraccount.findOne({ farmerId: actor.userId }).lean()) as
            | AccountStatus
            | null);

    if (account?.isBanned) {
      throw new AppError("Your account has been banned by an administrator", 403);
    }

    next();
  },
);

export const requireSelfOrAdmin = (
  getTargetUserId: (req: Request) => string | string[] | undefined,
  allowedRoles: AppRole[],
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const actor = await getRequestActor(req);
    const targetUserId = toSingleParam(getTargetUserId(req));

    if (!targetUserId) {
      throw new AppError("Missing target user id", 400);
    }

    if (actor.role === "admin") {
      res.locals.actor = actor;
      next();
      return;
    }

    if (!allowedRoles.includes(actor.role) || actor.userId !== targetUserId) {
      throw new AppError("You do not have permission to access this resource", 403);
    }

    res.locals.actor = actor;
    next();
  });

export const requireWasteOwnerOrAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const actor = await getRequestActor(req);
    const wasteId = toSingleParam(req.params.id);

    if (!wasteId) {
      throw new AppError("Waste id is required", 400);
    }

    if (actor.role === "admin") {
      res.locals.actor = actor;
      next();
      return;
    }

    if (actor.role !== "farmer") {
      throw new AppError("Only farmers or admins can manage waste listings", 403);
    }

    const waste = await wasteRepository.findById(wasteId);

    if (!waste) {
      throw new AppError("Waste not found", 404);
    }

    if (waste.seller?.farmerId !== actor.userId) {
      throw new AppError("You can only manage your own waste listings", 403);
    }

    res.locals.actor = actor;
    next();
  },
);

export const requireWasteCreatorOrAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const actor = await getRequestActor(req);
    const farmerId = req.body?.seller?.farmerId;

    if (actor.role === "admin") {
      res.locals.actor = actor;
      next();
      return;
    }

    if (actor.role !== "farmer" || !farmerId || farmerId !== actor.userId) {
      throw new AppError("You can only create waste listings for your own account", 403);
    }

    res.locals.actor = actor;
    next();
  },
);

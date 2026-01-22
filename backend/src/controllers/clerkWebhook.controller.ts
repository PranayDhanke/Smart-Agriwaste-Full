import { UserJSON, WebhookEvent } from "@clerk/clerk-sdk-node";
import { Request, Response } from "express";
import { Webhook } from "svix";
import buyeraccount from "../models/buyer.model";
import farmeraccount from "../models/farmer.model";

const Clerk_Webhook_Secret = process.env.CLERK_WEBHOOK_SECRET as string;

if (!Clerk_Webhook_Secret) {
  console.log("Clerk Webhook Secret is not defined");
}

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  const header = req.headers;

  const svixHeaders = {
    "svix-id": header["svixid"] as string,
    "svix-timestamp": header["svixtimestamp"] as string,
    "svix-signature": header["svixsignature"] as string,
  };

  let event: WebhookEvent;

  try {
    const webhook = new Webhook(Clerk_Webhook_Secret);
    event = webhook.verify(payload, svixHeaders) as WebhookEvent;
  } catch {
    return res.status(400).send("Invalid signature");
  }

  const { type, data } = event;

  switch (type) {
    case "user.updated":
      await handleUserUpdated(data);
      break;
  }

  res.status(200).json({ received: true });
};

const handleUserUpdated = async (data: UserJSON) => {
  const role = data.unsafe_metadata?.role;
  if (role === "farmer") {
    await farmeraccount.findOneAndUpdate(
      { farmerId: data.id },
      {
        firstName: data.first_name,
        lastName: data.last_name,
        username: data.username,
        email: data.email_addresses?.[0]?.email_address,
      },
      { new: true },
    );
  }
  if (role === "buyer") {
    await buyeraccount.findOneAndUpdate(
      { buyerId: data.id },
      {
        firstName: data.first_name,
        lastName: data.last_name,
        username: data.username,
        email: data.email_addresses?.[0]?.email_address,
      },
      { new: true },
    );
  }
};

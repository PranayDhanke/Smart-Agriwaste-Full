import { Negotiation } from "@/components/types/negotiation";
import { Button } from "@/components/ui/button";
import { useUpdateNegotiationStatusMutation } from "@/redux/api/negotiationApi";
import { useSendNotificationMutation } from "@/redux/api/notificationAPi";
import { useUser } from "@clerk/nextjs";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

const FarmerNegotiationButton = ({ neg }: { neg: Negotiation }) => {
  const t = useTranslations("profile.farmer.Negotiation");

  const { user } = useUser();

  const [updateNegotiationStatus, { isLoading }] =
    useUpdateNegotiationStatusMutation();

  const [sendNotification, {}] = useSendNotificationMutation();

  async function handleAction(
    id: string,
    action: "accepted" | "rejected",
    data: {
      buyerId: string;
      farmerName: string;
      itemTitle: string;
    },
  ) {
    try {
      await updateNegotiationStatus({ id, status: action }).unwrap();

      sendNotification({
        data: {
          userId: data.buyerId || "",
          title: `Negotiation Request ${action}`,
          message: `Farmer ${data.farmerName} has ${action} Negotiation Request for the Product ${data.itemTitle}.`,
          type: "negotiation",
        },
      });
      toast.success(
        action === "accepted"
          ? "✓ Negotiation accepted successfully"
          : "✗ Negotiation rejected",
      );
    } catch {
      toast.error(t("toast.actionFailed"));
    }
  }
  return (
    <div>
      {neg.status === "pending" ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 border-2 hover:text-red-700 hover:border-red-300"
            onClick={() =>
              handleAction(neg._id, "rejected", {
                buyerId: neg.buyerId,
                farmerName: user?.fullName || "Farmer",
                itemTitle: neg.item.title.en,
              })
            }
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            {t("reject")}
          </Button>

          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() =>
              handleAction(neg._id, "accepted", {
                buyerId: neg.buyerId,
                farmerName: user?.fullName || "Farmer",
                itemTitle: neg.item.title.en,
              })
            }
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-2" />
            {t("accept")}
          </Button>
        </div>
      ) : (
        <div
          className={`py-3 text-center rounded-lg font-semibold ${
            neg.status === "accepted"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {neg.status === "accepted"
            ? t("statusAccepted")
            : t("statusRejected")}
        </div>
      )}
    </div>
  );
};

export default FarmerNegotiationButton;

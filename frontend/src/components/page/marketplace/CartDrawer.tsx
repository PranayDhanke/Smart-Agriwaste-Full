"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Store,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import { CartItem } from "@/components/types/order";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  addToCart,
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/redux/features/cartSlice";
import { selectTotalAmount } from "@/redux/selectors/cartSelectors";

type FarmerOrderGroup = {
  items: CartItem[];
  totalAmount: number;
};

function groupItemsByFarmer(cartItems: CartItem[]) {
  return cartItems.reduce<Record<string, FarmerOrderGroup>>((acc, item) => {
    const farmerId = item.sellerInfo.seller.farmerId;

    if (!acc[farmerId]) {
      acc[farmerId] = {
        items: [],
        totalAmount: 0,
      };
    }

    acc[farmerId].items.push(item);

    // ✅ calculate total price for this farmer
    acc[farmerId].totalAmount += item.price * item.quantity;

    return acc;
  }, {});
}

export default function CartDrawer() {
  const locale = useLocale() as "en" | "hi" | "mr";

  const dispatch = useDispatch();

  const TotalAmount = useSelector((state: RootState) =>
    selectTotalAmount(state),
  );

  const { cart } = useSelector((state: RootState) => state.cart);
  const t = useTranslations("marketplace.CartDrawer");

  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(true);

  const { user } = useUser();

  const [loading, setloading] = useState(false);

  const proceedOrder = async () => {
    if (!deliveryMethod) {
      toast.error(t("errors.selectDelivery"));
      return;
    }

    //     const groupedByFarmer = groupItemsByFarmer(cart);

    //     // 3️⃣ Create orders per farmer
    //     const orders = Object.entries(groupedByFarmer).map(([farmerId, items]) => ({
    //       buyerId: user?.id,
    //       farmerId,
    //       items: items.items,
    //       status: "pending",
    //       hasPayment: false,
    //       isDelivered: false,
    //       isOutForDelivery: false,
    //       totalAmount: items.totalAmount,
    //       paymentId: "",
    //       deliveryMode: deliveryMethod,
    //       buyerInfo: {
    //         buyerName: user?.fullName,
    //         buyerMobile: "",
    //         address: "buyerAddress",
    //       },
    //     }));

    //       Object.entries(groupedByFarmer).map(([farmerId]) =>
    // {
    //           userId: farmerId.replace("fam_", "user_"),
    //           message: `New Order Placed by Buyer ${user?.fullName}`,
    //           title: "New Order Placed",
    //           type: "order",
    //         }
    //       );
    //       toast.success(
    // 5️⃣ UX feedback
    t("success.orderPlaced");

    // 6️⃣ Clear cart after successful checkout

    dispatch(clearCart());
  };

  /* ---------------- Empty State ---------------- */
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-5 mb-4">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold">{t("empty.title")}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          {t("empty.subtitle")}
        </p>

        <Link href="/marketplace">
          <Button className="px-6">{t("empty.browse")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ---------------- Cart Items ---------------- */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {cart.map((item) => (
          <Card key={item.prodId} className="border-muted">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden border bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title.en}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-semibold line-clamp-2">
                    {item.title[locale]}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{item.price} / {item.unit}
                  </p>

                  {/* Item total */}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Item total: ₹{item.price * item.quantity}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-3 bg-muted/40 rounded-md px-2 py-1 w-fit">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      disabled={item.quantity < 1}
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            prodId: item.prodId,
                            quantity: item.quantity-1,
                            maxQuantity: item.maxQuantity,
                          }),
                        )
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-medium">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / max {item.maxQuantity}
                      </span>
                    </div>

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      disabled={item.quantity >= item.maxQuantity}
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            prodId: item.prodId,
                            quantity: item.quantity+1,
                            maxQuantity: item.maxQuantity,
                          }),
                        )
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Remove */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={() => removeFromCart(item.prodId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------------- Summary ---------------- */}
      <Card className="sticky bottom-0 rounded-none border-t">
        <CardContent className="p-0">
          {/* Summary Header */}
          <button
            onClick={() => setSummaryOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 border-b bg-background"
          >
            <span className="text-sm font-semibold">{t("summary.title")}</span>

            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                summaryOpen ? "rotate-0" : "rotate-180",
              )}
            />
          </button>

          {/* Summary Body */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              summaryOpen ? "max-h-[500px]" : "max-h-0",
            )}
          >
            <div className="p-4 space-y-5">
              {/* Clear Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 self-end"
                onClick={() => dispatch(clearCart())}
              >
                {t("summary.clearCart")}
              </Button>

              {/* Delivery Method */}
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  {t("delivery.title")}
                </h4>
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={setDeliveryMethod}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    {
                      value: "PICKUPBYBUYER",
                      label: t("delivery.pickup"),
                      icon: Store,
                    },
                    {
                      value: "DELIVERYBYFARMER",
                      label: t("delivery.farmer"),
                      icon: Truck,
                    },
                  ].map(({ value, label, icon: Icon }) => (
                    <Label
                      key={value}
                      className={cn(
                        "flex items-center gap-2 border rounded-md p-3 cursor-pointer transition",
                        deliveryMethod === value
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "hover:bg-muted",
                      )}
                    >
                      <RadioGroupItem value={value} />
                      <Icon className="h-4 w-4" />
                      {label}
                    </Label>
                  ))}
                </RadioGroup>

                {deliveryMethod === "DELIVERYBYFARMER" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("delivery.farmerCharges")}
                  </p>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t("total.label")}</span>
                  <span className="text-lg font-semibold text-green-700">
                    ₹{TotalAmount}
                  </span>
                </div>
              </div>

              {/* Checkout */}
              <Button
                size="lg"
                className="w-full"
                disabled={!deliveryMethod}
                onClick={() => proceedOrder()}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {!deliveryMethod
                      ? t("checkout.select")
                      : t("checkout.proceed")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

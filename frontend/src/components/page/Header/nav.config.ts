import {
  Home,
  IndianRupee,
  List,
  Package,
  ShoppingCart,
  TrendingUp,
  User,
} from "lucide-react";
import { JSX } from "react";

export type Role = "farmer" | "buyer" | "guest";

export interface NavItem {
  key: string;
  href: string;
  icon: JSX.ElementType;
}

export const NAVIGATION: Record<Role, NavItem[]> = {
  guest: [
    { key: "nav.home", href: "/", icon: Home },
    { key: "nav.marketplace", href: "/marketplace", icon: ShoppingCart },
    { key: "nav.community", href: "/community", icon: User },
  ],

  farmer: [
    { key: "nav.home", href: "/", icon: Home },
    { key: "nav.marketplace", href: "/marketplace", icon: ShoppingCart },
    {
      key: "nav.myListings",
      href: "/profile/farmer/my-listing",
      icon: Package,
    },
    { key: "nav.orders", href: "/profile/farmer/my-orders", icon: IndianRupee },
    {
      key: "nav.analytics",
      href: "/profile/farmer/analytics",
      icon: TrendingUp,
    },
    { key: "nav.community", href: "/community", icon: User },
    { key: "nav.Nego", href: "/profile/farmer/negotiations", icon: List },
  ],

  buyer: [
    { key: "nav.home", href: "/", icon: Home },
    { key: "nav.marketplace", href: "/marketplace", icon: ShoppingCart },
    {
      key: "nav.myPurchases",
      href: "/profile/buyer/my-purchases",
      icon: Package,
    },
    {
      key: "nav.analytics",
      href: "/profile/buyer/analytics",
      icon: TrendingUp,
    },
    { key: "nav.Nego", href: "/profile/buyer/negotiations", icon: List },
    { key: "nav.community", href: "/community", icon: User },
  ],
};

import { Address, TranslatedString, } from "./waste";
interface Seller {
  farmerId: string;
  farmerName: string;
}

interface sellerInfo {
  seller: Seller;
  address: Address;
}

interface buyerInfo {
  buyerName: string;
  address: Address;
  buyerMobile: string;
}

export interface CartItem {
  prodId: string;
  title: TranslatedString;
  wasteType: string;
  wasteProduct: string;

  moisture: string;
  quantity: number;
  maxQuantity: number;
  price: number;
  unit: string;
  description: TranslatedString;
  image: string;

  sellerInfo: sellerInfo;
}

export interface Negotiation {
  _id: string;

  buyerId: string;
  buyerName: string;

  farmerId: string;

  item: CartItem;

  negotiatedPrice: number;

  status: "pending" | "accepted" | "rejected";
}

export interface Order {
  _id: string;

  buyerId: string;

  buyerInfo: buyerInfo;

  // quick filtering for farmer dashboard
  farmerId: string;

  items: CartItem[];

  deliveryMode: "PICKUPBYBUYER" | "DELIVERYBYFARMER";

  totalAmount: number;

  status: "pending" | "confirmed" | "cancelled";

  hasPayment: boolean;
  isDelivered: boolean;
  isOutForDelivery?: boolean;

  paymentId?: string;

  createdAt: string;
  updatedAt?: string;
}

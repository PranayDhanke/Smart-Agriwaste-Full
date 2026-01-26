export interface TranslatedString {
  en: string;
  hi: string;
  mr: string;
}

export interface Address {
  houseBuildingName: string;
  roadarealandmarkName: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
}

export interface NegotiationItem {
  prodId: string;
  title: TranslatedString;
  wasteType: string;
  wasteProduct: string;
  moisture: string;
  quantity: number;
  price: number;
  unit: string;
  description: TranslatedString;
  image: string;
  sellerInfo: {
    seller: {
      farmerId: string;
      farmerName: string;
    };
    address: Address;
  };
}

export interface Negotiation {
  _id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  item: NegotiationItem;
  negotiatedPrice: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface NegotiationListResponse {
  data: Negotiation[];
  stats: {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
  pagination: {
    hasNext: boolean;
    nextCursor?: string;
    limit: number;
  };
}

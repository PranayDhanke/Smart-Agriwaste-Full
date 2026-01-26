export interface TranslatedString {
  en: string;
  hi: string;
  mr: string;
}

export type WasteType = "crop" | "fruit" | "vegetable";

export interface Address {
  houseBuildingName: string;
  roadarealandmarkName: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
}

export interface seller {
  farmerId: string;
  name: string;
  phone: string;
  email: string;
}

export interface Waste {
  _id: string;
  title: TranslatedString;
  description: TranslatedString;
  wasteType: string;
  wasteProduct: string;
  wasteCategory: string;
  quantity: number;
  moisture: string;
  price: number;
  imageUrl: string;
  unit: string;
  isActive: boolean;
  seller: seller;
  address: Address;
  createdAt?: string;
}

export interface WasteListResponse {
  success: boolean;
  wastedata: Waste[];
  pagination: {
    nextCursor: string | null;
    limit: number;
    hasNext: boolean;
  };
}

export interface FilterState {
  search: string;
  category: string;
  address: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

// redux/api/negotiationApi.ts
import { NegotiationListResponse } from "@/components/types/negotiation";
import { baseApi } from "./baseApi";
import { Negotiation } from "@/components/types/order";

export const negotiationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- QUERIES ---------- */

    // Farmer negotiations (cursor pagination)
    // Farmer negotiations (cursor pagination + filters)
    getNegotiationsByFarmer: builder.query<
      NegotiationListResponse,
      {
        farmerId: string;
        cursor?: string;
        limit?: number;
        status?: "pending" | "accepted" | "rejected";
        search?: string;
      }
    >({
      query: ({ farmerId, cursor, limit = 5, status, search }) => ({
        url: `/negotiation/get-negotiation/farmer/${farmerId}`,
        params: {
          cursor,
          limit,
          status,
          search,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((n) => ({
                type: "Negotiation" as const,
                id: n._id,
              })),
              { type: "Negotiation", id: "FARMER_LIST" },
            ]
          : [{ type: "Negotiation", id: "FARMER_LIST" }],
    }),

    // Buyer negotiations (cursor pagination)
    getNegotiationsByBuyer: builder.query<
      NegotiationListResponse,
      {
        buyerId: string;
        cursor?: string;
        limit?: number;
        status?: "pending" | "accepted" | "rejected";
        search?: string;
      }
    >({
      query: ({ buyerId, cursor, limit = 5, status, search }) => ({
        url: `/negotiation/get-negotiation/buyer/${buyerId}`,
        params: { cursor, limit, status, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result?.data?.map((n) => ({
                type: "Negotiation" as const,
                id: n._id,
              })),
              { type: "Negotiation", id: "BUYER_LIST" },
            ]
          : [{ type: "Negotiation", id: "BUYER_LIST" }],
    }),

    /* ---------- MUTATIONS ---------- */

    // Create negotiation
    createNegotiation: builder.mutation<
      { message: string },
      { data: Partial<Negotiation> }
    >({
      query: (body) => ({
        url: `/negotiation/add-negotiation`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Negotiation", id: "FARMER_LIST" },
        { type: "Negotiation", id: "BUYER_LIST" },
      ],
    }),

    // Update negotiation status (accept / reject)
    updateNegotiationStatus: builder.mutation<
      { success: true },
      { id: string; status: "accepted" | "rejected" }
    >({
      query: (body) => ({
        url: `/negotiation/update-status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Negotiation", id },
        { type: "Negotiation", id: "FARMER_LIST" },
        { type: "Negotiation", id: "BUYER_LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

/* =======================
   HOOK EXPORTS
======================= */

export const {
  useLazyGetNegotiationsByFarmerQuery,
  useLazyGetNegotiationsByBuyerQuery,
  useCreateNegotiationMutation,
  useUpdateNegotiationStatusMutation,
} = negotiationApi;

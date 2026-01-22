// redux/api/wasteApi.ts
import { Waste, WasteListResponse } from "@/components/types/waste";
import { baseApi } from "./baseApi";

export const wasteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- QUERIES ---------- */

    // Public wastes (Home / Buyer)
    getWastes: builder.query<
      WasteListResponse,
      { cursor?: string; limit?: number }
    >({
      query: ({ cursor, limit = 12 }) => ({
        url: `/waste/get-wastes`,
        params: { cursor, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.wastedata.map((w) => ({
                type: "Waste" as const,
                id: w._id,
              })),
              { type: "Waste", id: "LIST" },
            ]
          : [{ type: "Waste", id: "LIST" }],
    }),

    // Farmer-specific wastes
    getWastesByFarmer: builder.query<
      WasteListResponse,
      { farmerId: string; cursor?: string; limit?: number }
    >({
      query: ({ farmerId, cursor, limit = 9 }) => ({
        url: `/waste/get-waste/${farmerId}`,
        params: { cursor, limit },
      }),
      providesTags: (result) => [{ type: "Waste", id: "FARMER_LIST" }],
    }),

    // Single waste (public)
    getSingleWaste: builder.query<Waste, string>({
      query: (id) => `/waste/get-single/${id}`,
      transformResponse: (res: { singleWaste: Waste }) => res.singleWaste,
      providesTags: (_, __, id) => [{ type: "Waste", id }],
    }),

    /* ---------- MUTATIONS ---------- */

    // Create waste
    createWaste: builder.mutation({
      query: (body) => ({
        url: `/waste/create-waste`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Waste", id: "FARMER_LIST" }],
    }),

    // Update waste
    updateWaste: builder.mutation<
      { message: string; updatedWaste: Waste },
      { id: string; data: Partial<Waste> }
    >({
      query: ({ id, data }) => ({
        url: `/waste/update-waste/${id}`,
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Waste", id: "FARMER_LIST" },
      ],
    }),

    // Delete waste
    deleteWaste: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/waste/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Waste", id: "FARMER_LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

/* =======================
   HOOK EXPORTS
======================= */

export const {
  useGetWastesQuery,
  useLazyGetWastesByFarmerQuery,
  useGetSingleWasteQuery,
  useCreateWasteMutation,
  useUpdateWasteMutation,
  useDeleteWasteMutation,
} = wasteApi;

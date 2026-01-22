// redux/api/orderApi.ts

export interface CursorPagination {
  nextCursor: string | null;
  limit: number;
  hasNext: boolean;
}

export interface OrderListResponse {
  success: boolean;
  orderdata: Order[];
  pagination: CursorPagination;
}

export interface CreateOrderResponse {
  message: string;
  count: number;
  orders: Order[];
}

import { Order } from "@/components/types/order";
import { baseApi } from "./baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* -------------------- QUERIES -------------------- */

    getOrdersByBuyer: builder.query<
      OrderListResponse,
      { buyerId: string; cursor?: string; limit?: number }
    >({
      query: ({ buyerId, cursor, limit = 10 }) => ({
        url: `/order/get-order/buyer/${buyerId}`,
        params: { cursor, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.orderdata.map((o) => ({
                type: "Order" as const,
                id: o._id,
              })),
              { type: "Order", id: "BUYER_LIST" },
            ]
          : [{ type: "Order", id: "BUYER_LIST" }],
    }),

    getOrdersByFarmer: builder.query<
      OrderListResponse,
      { farmerId: string; cursor?: string; limit?: number }
    >({
      query: ({ farmerId, cursor, limit = 10 }) => ({
        url: `/order/get-order/farmer/${farmerId}`,
        params: { cursor, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.orderdata.map((o) => ({
                type: "Order" as const,
                id: o._id,
              })),
              { type: "Order", id: "FARMER_LIST" },
            ]
          : [{ type: "Order", id: "FARMER_LIST" }],
    }),

    viewOrder: builder.query<Order, string>({
      query: (orderId) => `/order/get-order/${orderId}`,
      transformResponse: (res: { orderdata: Order }) => res.orderdata,
      providesTags: (_, __, id) => [{ type: "Order", id }],
    }),

    /* -------------------- MUTATIONS -------------------- */

    createOrder: builder.mutation<CreateOrderResponse, any>({
      query: (payload) => ({
        url: `/order/create-order`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Order", id: "BUYER_LIST" },
        { type: "Order", id: "FARMER_LIST" },
      ],
    }),

    confirmOrder: builder.mutation<
      { message: string; orderId: string },
      string
    >({
      query: (orderId) => ({
        url: `/order/confirm-order/${orderId}`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, orderId) => [
        { type: "Order", id: orderId },
        { type: "Order", id: "FARMER_LIST" },
      ],
    }),

    cancelOrder: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/order/cancel-order/${orderId}`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, orderId) => [
        { type: "Order", id: orderId },
        { type: "Order", id: "BUYER_LIST" },
        { type: "Order", id: "FARMER_LIST" },
      ],
    }),

    confirmDelivery: builder.mutation<void, string>({
      query: (id) => ({
        url: `/order/confirm-delivery/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Order", id }],
    }),

    setOutForDelivery: builder.mutation<void, string>({
      query: (id) => ({
        url: `/order/setoutFor-delivered/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Order", id }],
    }),
  }),
});

export const {
  useGetOrdersByBuyerQuery,
  useGetOrdersByFarmerQuery,
  useViewOrderQuery,
  useCreateOrderMutation,
  useConfirmOrderMutation,
  useCancelOrderMutation,
  useConfirmDeliveryMutation,
  useSetOutForDeliveryMutation,
} = orderApi;

import { baseApi } from "./baseApi";

export interface AuthProfileAccount {
  buyerId?: string;
  farmerId?: string;
  adminId?: string;
  email?: string;
  phone?: string;
  district?: string;
  houseBuildingName?: string;
  roadarealandmarkName?: string;
  state?: string;
  taluka?: string;
  village?: string;
  aadharnumber?: string;
  aadharUrl?: string;
  farmDocUrl?: string;
  farmNumber?: string;
  farmArea?: string;
  farmUnit?: string;
  isBanned?: boolean;
  verification?: {
    status?: "not_requested" | "pending" | "verified" | "rejected";
    requestedAt?: string | null;
    reviewedAt?: string | null;
    reviewedBy?: string;
    reason?: string;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<
      {
        accountdata: AuthProfileAccount;
      },
      { id: string; role: string }
    >({
      query: ({ id, role }) => `/${role}/get-account/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: "Profile", id }],
    }),
    createProfile: builder.mutation({
      query: ({ role, data }) => ({
        url: `${role}/create-account`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { data }) => {
        const profileId = data.buyerId ?? data.farmerId;
        return profileId ? [{ type: "Profile", id: profileId }] : [];
      },
    }),
    updateProfile: builder.mutation({
      query: ({ userId, role, data }) => ({
        url: `${role}/update-account/${userId}`,
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Profile", id: userId },
      ],
    }),
    requestVerification: builder.mutation<
      { message: string },
      { role: "buyer" | "farmer"; userId: string }
    >({
      query: ({ role, userId }) => ({
        url: `${role}/request-verification/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Profile", id: userId },
      ],
    }),
  }),
});

export const {
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useLazyGetProfileQuery,
  useRequestVerificationMutation,
} = authApi;

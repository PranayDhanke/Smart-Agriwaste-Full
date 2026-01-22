import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<
      {
        accountdata: any;
      },
      { id: string; role: string }
    >({
      query: ({ id, role }) => `/${role}/get-account/${id}`,
    }),
    createProfile: builder.mutation({
      query: ({ role, data }) => ({
        url: `${role}/create-account`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, data) => [
        { type: "Profile", id: data.userId },
      ],
    }),
    updateProfile: builder.mutation({
      query: ({ userId, role, data }) => ({
        url: `${role}/update-account/${userId}`,
        method: "PUT",
        body: data,
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
} = authApi;

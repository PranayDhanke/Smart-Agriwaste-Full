"use client";

import { useLazyGetProfileQuery } from "@/redux/api/authApi";
import { setToken, setUser, User } from "@/redux/features/authSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Address } from "../types/waste";

export function AuthProvider() {
  const { getToken } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const dispatch = useDispatch();

  const [getProfile, { data, isSuccess }] = useLazyGetProfileQuery();

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken();
      dispatch(setToken(token));
    };

    const loadUser = async () => {
      if (user && isLoaded && isSignedIn) {
        const role = user.unsafeMetadata.role;
        const id = user.id;
        getProfile({ id, role: role as string });
      }
    };

    loadUser();
    loadToken();
  }, [getToken, dispatch, user, isLoaded, isSignedIn]);

  useEffect(() => {
    const loadUser = () => {
      if (data && isSuccess && user && data.accountdata) {
        const address: Address = {
          district: data.accountdata.district,
          houseBuildingName: data.accountdata.houseBuildingName,
          roadarealandmarkName: data.accountdata.roadarealandmarkName,
          state: data.accountdata.state,
          taluka: data.accountdata.taluka,
          village: data.accountdata.village,
        };
        const User: User = {
          email: data.accountdata.email,
          id: user.id,
          name: user.fullName || "",
          phone: data.accountdata.phone,
        };
       
        dispatch(setUser({ address, user: User }));
      }
    };

    loadUser();
  }, [data, isSuccess]);

  return null;
}

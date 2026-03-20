"use client";

import { Address } from "@/components/types/waste";
import { usePathname, useRouter } from "@/i18n/navigation";
import { connectSocketForUser, disconnectSocket } from "@/lib/socket";
import { useLazyGetProfileQuery } from "@/redux/api/authApi";
import { setToken, setUser, User } from "@/redux/features/authSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function AuthProvider() {
  const { getToken } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const dispatch = useDispatch();

  const router = useRouter();
  const pathname = usePathname();

  const role = user?.unsafeMetadata.role;

  const [getProfile, { data, isFetching, isUninitialized }] =
    useLazyGetProfileQuery();

  const isCreateAccountPage = pathname?.startsWith("/create-account");

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken();
      dispatch(setToken(token));
    };

    const loadUser = async () => {
      if (user && isLoaded && isSignedIn && role) {
        const role = user.unsafeMetadata.role;
        const id = user.id;
        getProfile({ id, role: role as string });
      }
    };

    loadUser();
    loadToken();
  }, [getToken, dispatch, user, isLoaded, isSignedIn, role, getProfile]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user?.id) {
      connectSocketForUser(user.id);
      return;
    }

    disconnectSocket();
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user || !role) return;
    if (isUninitialized || isFetching) return;

    if (data?.accountdata) {
      const address: Address = {
        district: data.accountdata.district,
        houseBuildingName: data.accountdata.houseBuildingName,
        roadarealandmarkName: data.accountdata.roadarealandmarkName,
        state: data.accountdata.state,
        taluka: data.accountdata.taluka,
        village: data.accountdata.village,
      };
      
      const authUser: User = {
        email: data.accountdata.email,
        id: user.id,
        name: user.fullName || "",
        phone: data.accountdata.phone,
      };

      dispatch(setUser({ address, user: authUser }));
      return;
    }

    if (!isCreateAccountPage) {
      router.replace(`/create-account/${role}`);
    }
  }, [
    data,
    dispatch,
    isCreateAccountPage,
    isFetching,
    isLoaded,
    isSignedIn,
    isUninitialized,
    role,
    router,
    user,
  ]);

  return null;
}

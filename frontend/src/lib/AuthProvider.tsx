"use client";

import { Address } from "@/components/types/waste";
import { usePathname, useRouter } from "@/i18n/navigation";
import { connectSocketForUser, disconnectSocket } from "@/lib/socket";
import { useLazyGetProfileQuery } from "@/redux/api/authApi";
import { setToken, setUser, User } from "@/redux/features/authSlice";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function AuthProvider() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();
  const dispatch = useDispatch();

  const router = useRouter();
  const pathname = usePathname();

  const role = user?.unsafeMetadata.role;

  const [getProfile, { data, error, isError, isFetching, isUninitialized }] =
    useLazyGetProfileQuery();

  const isCreateAccountPage = pathname?.startsWith("/create-account");

  useEffect(() => {
    let isCancelled = false;

    const loadAuthState = async () => {
      if (!isLoaded) return;

      const token = await getToken();
      if (isCancelled) return;

      dispatch(setToken(token));

      if (user && isSignedIn && role && token) {
        await getProfile({ id: user.id, role: role as string });
      }
    };

    loadAuthState();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, getProfile, getToken, isLoaded, isSignedIn, role, user]);

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
      if (data.accountdata.isBanned) {
        signOut({ redirectUrl: "/" });
        return;
      }

      const address: Address | null =
        role === "admin"
          ? null
          : {
              district: data.accountdata.district || "",
              houseBuildingName: data.accountdata.houseBuildingName || "",
              roadarealandmarkName: data.accountdata.roadarealandmarkName || "",
              state: data.accountdata.state || "",
              taluka: data.accountdata.taluka || "",
              village: data.accountdata.village || "",
            };

      const authUser: User = {
        email: data.accountdata.email || "",
        id: user.id,
        name: user.fullName || "",
        phone: data.accountdata.phone || "",
        role: role as "admin" | "buyer" | "farmer",
        isBanned: Boolean(data.accountdata.isBanned),
      };

      dispatch(setUser({ address, user: authUser }));

      if (isCreateAccountPage) {
        if (role === "admin") {
          router.replace("/profile/admin");
          return;
        }

        router.replace(`/profile/${role}`);
      }

      return;
    }

    if (isError && "status" in error && error.status === 404 && !isCreateAccountPage) {
      if (role === "admin") {
        router.replace("/profile/admin");
        return;
      }

      router.replace(`/create-account/${role}`);
    }
  }, [
    data,
    dispatch,
    error,
    isCreateAccountPage,
    isError,
    isFetching,
    isLoaded,
    isSignedIn,
    isUninitialized,
    role,
    router,
    signOut,
    user,
  ]);

  return null;
}

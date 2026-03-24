"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/common/form/FormInput";
import { FileUploadInput } from "@/components/common/form/FileUploadInput";
import { SelectInput } from "@/components/common/form/SelectInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useLazyGetProfileQuery,
  useRequestVerificationMutation,
  useUpdateProfileMutation,
} from "@/redux/api/authApi";
import { uploadImage } from "@/utils/imagekit";
import addressJson from "@/../public/Address.json";

// Icons
import {
  MapPin,
  Phone,
  FileText,
  Loader2,
  Sparkles,
  User,
  Fingerprint,
} from "lucide-react";

const formSchema = z.object({
  phone: z.string().optional(),
  aadharnumber: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  taluka: z.string().optional(),
  village: z.string().optional(),
  houseBuildingName: z.string().optional(),
  roadarealandmarkName: z.string().optional(),
  aadharUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressType {
  states: string[];
  districts: { [key: string]: string[] };
  talukas: { [key: string]: string[] };
  villages: { [key: string]: string[] };
}

const getFieldLabels = (
  t: (key: string) => string,
): Record<string, string> => ({
  phone: t("fields.phone"),
  aadharnumber: t("fields.aadharnumber"),
  state: t("fields.state"),
  district: t("fields.district"),
  taluka: t("fields.taluka"),
  village: t("fields.village"),
  houseBuildingName: t("fields.houseBuildingName"),
  roadarealandmarkName: t("fields.roadarealandmarkName"),
  firstName: t("fields.firstName"),
  lastName: t("fields.lastName"),
  username: t("fields.username"),
  emailAddress: t("fields.emailAddress"),
});

export default function Profile() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const t = useTranslations("profile.buyer.Profile");
  const Address: AddressType = addressJson;
  const statusLabel = (status?: string | null) =>
    status && t.has(`status.${status}` as Parameters<typeof t>[0])
      ? t(`status.${status}` as Parameters<typeof t>[0])
      : (status ?? "not_requested");

  const fieldLabels = getFieldLabels(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const selectedState = useWatch({ control: form.control, name: "state" });
  const selectedDistrict = useWatch({
    control: form.control,
    name: "district",
  });
  const selectedTaluka = useWatch({ control: form.control, name: "taluka" });
  const aadharPreview = useWatch({ control: form.control, name: "aadharUrl" });
  const previousStateRef = useRef<string | undefined>(undefined);
  const previousDistrictRef = useRef<string | undefined>(undefined);
  const hasHydratedRef = useRef(false);
  const isHydratingAddressRef = useRef(false);

  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const buyerId = user ? user.id : "";
  const role = user ? user.unsafeMetadata.role : "";

  const [getProfile, { data: profileData, isFetching, isLoading, isSuccess }] =
    useLazyGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [requestVerification, { isLoading: isRequestingVerification }] =
    useRequestVerificationMutation();

  useEffect(() => {
    if (isLoaded && user?.id) {
      getProfile({
        id: buyerId || user.id,
        role: role as string,
      });
    }
  }, [buyerId, getProfile, isLoaded, role, user?.id]);

  useEffect(() => {
    const data = profileData?.accountdata;

    if (!isLoading && !data && !buyerId) {
      router.push("/create-account/buyer");
      return;
    }

    if (data) {
      isHydratingAddressRef.current = true;

      form.reset({
        phone: data.phone || "",
        aadharnumber: data.aadharnumber || "",
        state: "",
        district: "",
        taluka: "",
        village: "",
        houseBuildingName: data.houseBuildingName || "",
        roadarealandmarkName: data.roadarealandmarkName || "",
        aadharUrl: data.aadharUrl || "",
      });

      form.setValue("state", data.state || "");
      form.setValue("district", data.district || "");
      form.setValue("taluka", data.taluka || "");
      form.setValue("village", data.village || "");

      queueMicrotask(() => {
        previousStateRef.current = data.state || "";
        previousDistrictRef.current = data.district || "";
        hasHydratedRef.current = true;
        isHydratingAddressRef.current = false;
      });
    }
  }, [buyerId, form, isLoading, profileData, router]);

  useEffect(() => {
    if (isHydratingAddressRef.current) {
      return;
    }

    if (
      hasHydratedRef.current &&
      previousStateRef.current !== undefined &&
      previousStateRef.current !== selectedState
    ) {
      form.setValue("district", "");
      form.setValue("taluka", "");
      form.setValue("village", "");
    }
    previousStateRef.current = selectedState;
  }, [form, selectedState]);

  useEffect(() => {
    if (isHydratingAddressRef.current) {
      return;
    }

    if (
      hasHydratedRef.current &&
      previousDistrictRef.current !== undefined &&
      previousDistrictRef.current !== selectedDistrict
    ) {
      form.setValue("taluka", "");
      form.setValue("village", "");
    }
    previousDistrictRef.current = selectedDistrict;
  }, [form, selectedDistrict]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (aadharFile) {
        const url = await uploadImage(aadharFile, "aadhar");
        form.setValue("aadharUrl", url);
        values.aadharUrl = url;
      }

      const res = await updateProfile({
        userId: buyerId,
        role: role as string,
        data: values,
      });

      if ("data" in res) {
        toast.success(
          t("toasts.updated") || "Profile Updated Successfully! ✨",
        );
      } else {
        toast.error(t("toasts.updateFailed") || "Failed to update profile.");
      }
    } catch {
      toast.error(t("toasts.genericError") || "Something went wrong.");
    }
  };

  const verification = profileData?.accountdata?.verification;

  const handleVerificationRequest = async () => {
    try {
      await requestVerification({
        role: "buyer",
        userId: buyerId,
      }).unwrap();
      await getProfile({ id: buyerId, role: role as string }).unwrap();
      toast.success(
        t.has("verification.requestSubmitted")
          ? t("verification.requestSubmitted")
          : "Verification request submitted.",
      );
    } catch {
      toast.error(
        t.has("verification.requestFailed")
          ? t("verification.requestFailed")
          : "Unable to submit verification request.",
      );
    }
  };

  if (!user || (isFetching && isLoading)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-indigo-900 font-medium">
          {t.has("ui.loadingProfile")
            ? t("ui.loadingProfile")
            : "Loading your colorful profile..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-cyan-100 py-10 px-4 sm:px-6">
      <Card className="max-w-4xl mx-auto border-0 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        {/* Vibrant Header */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 sm:p-10 relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-300 opacity-20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center tracking-tight">
                {t("title") || "Buyer Profile"}{" "}
                <Sparkles className="w-6 h-6 ml-3 text-yellow-300" />
              </h1>
              <p className="text-indigo-100 mt-2 text-base max-w-lg">
                {t("description") ||
                  "Manage your personal information, delivery addresses, and identity documents all in one place."}
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner inline-flex items-center self-start sm:self-auto">
              <Fingerprint className="w-4 h-4 text-indigo-200 mr-2" />
              <span className="text-xs font-mono text-indigo-50">
                ID: {buyerId.slice(0, 10)}...
              </span>
            </div>
          </div>
        </div>

        {isSuccess && (
          <CardContent className="p-6 sm:p-10">
            <div className="mb-8 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-violet-800">
                    {t.has("verification.heading")
                      ? t("verification.heading")
                      : "Verification status"}
                  </p>
                  <p className="mt-1 text-sm text-violet-700">
                    {t.has("verification.currentStatus")
                      ? t("verification.currentStatus", {
                          status: statusLabel(verification?.status),
                        })
                      : `Current status: ${statusLabel(verification?.status)}`}
                  </p>
                  {verification?.reason && (
                    <p className="mt-1 text-xs text-violet-700">
                      {t.has("verification.adminNote")
                        ? t("verification.adminNote", { note: verification.reason })
                        : `Admin note: ${verification.reason}`}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerificationRequest}
                  disabled={
                    isRequestingVerification || verification?.status === "pending"
                  }
                >
                  {isRequestingVerification
                    ? t.has("verification.requesting")
                      ? t("verification.requesting")
                      : "Requesting..."
                    : verification?.status === "verified"
                      ? t.has("verification.verified")
                        ? t("verification.verified")
                        : "Verified"
                      : verification?.status === "pending"
                        ? t.has("verification.pending")
                          ? t("verification.pending")
                          : "Pending review"
                        : t.has("verification.request")
                          ? t("verification.request")
                          : "Request verification"}
                </Button>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-10"
              >
                {/* 1. Account Info (Colorful Grid) */}
                <div className="relative">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <User className="w-4 h-4" />
                    </div>
                    {t("accountInformation") || "Account Information"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: fieldLabels.firstName,
                        value: user?.firstName,
                        color: "bg-pink-50/70 border-pink-100 text-pink-900",
                      },
                      {
                        label: fieldLabels.lastName,
                        value: user?.lastName,
                        color:
                          "bg-purple-50/70 border-purple-100 text-purple-900",
                      },
                      {
                        label: fieldLabels.username,
                        value: user?.username,
                        color:
                          "bg-indigo-50/70 border-indigo-100 text-indigo-900",
                      },
                      {
                        label: fieldLabels.emailAddress,
                        value: user?.primaryEmailAddress?.emailAddress,
                        color: "bg-blue-50/70 border-blue-100 text-blue-900",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border ${item.color} transition-all hover:shadow-md`}
                      >
                        <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p
                          className="font-bold truncate"
                          title={item.value || ""}
                        >
                          {item.value || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Contact Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <Phone className="w-4 h-4" />
                    </div>
                    {t("contactPersonalDetails") || "Contact Details"}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 p-6 bg-orange-50/30 rounded-3xl border border-orange-100/50">
                    <FormInput
                      control={form.control}
                      name="phone"
                      label={fieldLabels.phone}
                      type="text"
                      placeholder={t("enterField", {
                        field: fieldLabels.phone,
                      })}
                      classname="h-12 rounded-xl bg-white border-gray-200 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                    />
                    <FormInput
                      control={form.control}
                      name="aadharnumber"
                      label={fieldLabels.aadharnumber}
                      type="text"
                      placeholder={t("enterField", {
                        field: fieldLabels.aadharnumber,
                      })}
                      classname="h-12 rounded-xl bg-white border-gray-200 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* 3. Address */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <MapPin className="w-4 h-4" />
                    </div>
                    {t("addressDetails") || "Delivery Address"}
                  </h3>
                  <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <SelectInput
                        control={form.control}
                        name="state"
                        label={fieldLabels.state}
                        option={Address.states.map((s) => ({
                          label: s,
                          value: s,
                        }))}
                        placeholder={fieldLabels.state}
                        classname="h-12 rounded-xl bg-white shadow-sm"
                      />
                      <SelectInput
                        control={form.control}
                        name="district"
                        label={fieldLabels.district}
                        option={
                          selectedState
                            ? (Address.districts[selectedState] || []).map(
                                (d) => ({ label: d, value: d }),
                              )
                            : []
                        }
                        placeholder={
                          selectedState
                            ? fieldLabels.district
                            : t.has("ui.stateFirst")
                              ? t("ui.stateFirst")
                              : "State first"
                        }
                        disabled={!selectedState}
                        classname="h-12 rounded-xl bg-white shadow-sm"
                      />
                      <SelectInput
                        control={form.control}
                        name="taluka"
                        label={fieldLabels.taluka}
                        option={
                          selectedDistrict
                            ? (Address.talukas[selectedDistrict] || []).map(
                                (t) => ({ label: t, value: t }),
                              )
                            : []
                        }
                        placeholder={
                          selectedDistrict
                            ? fieldLabels.taluka
                            : t.has("ui.districtFirst")
                              ? t("ui.districtFirst")
                              : "District first"
                        }
                        disabled={!selectedDistrict}
                        classname="h-12 rounded-xl bg-white shadow-sm"
                      />
                      <SelectInput
                        control={form.control}
                        name="village"
                        label={fieldLabels.village}
                        option={
                          selectedTaluka
                            ? (Address.villages[selectedTaluka] || []).map(
                                (v) => ({ label: v, value: v }),
                              )
                            : []
                        }
                        placeholder={
                          selectedTaluka
                            ? fieldLabels.village
                            : t.has("ui.talukaFirst")
                              ? t("ui.talukaFirst")
                              : "Taluka first"
                        }
                        disabled={!selectedTaluka}
                        classname="h-12 rounded-xl bg-white shadow-sm"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="houseBuildingName"
                        label={fieldLabels.houseBuildingName}
                        type="text"
                        placeholder={t("enterField", {
                          field: fieldLabels.houseBuildingName,
                        })}
                        classname="h-12 rounded-xl bg-white border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      />
                      <FormInput
                        control={form.control}
                        name="roadarealandmarkName"
                        label={fieldLabels.roadarealandmarkName}
                        type="text"
                        placeholder={t("enterField", {
                          field: fieldLabels.roadarealandmarkName,
                        })}
                        classname="h-12 rounded-xl bg-white border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Documents */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <FileText className="w-4 h-4" />
                    </div>
                    {t("document") || "Verification Documents"}
                  </h3>
                  <div className="p-6 bg-cyan-50/30 rounded-3xl border border-cyan-100/50">
                    <FileUploadInput
                      control={form.control}
                      name="aadharUrl"
                      label={t("aadharDocument") || "Aadhar Document Image"}
                      preview={aadharPreview || null}
                      onFileChange={setAadharFile}
                      classname="max-w-md"
                    />
                  </div>
                </div>

                {/* Vibrant Submit Button */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-10 py-6 h-auto rounded-2xl shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 transition-all text-lg"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />{" "}
                        {t.has("ui.savingChanges")
                          ? t("ui.savingChanges")
                          : "Saving Changes..."}
                      </>
                    ) : (
                      t("saveChanges")
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

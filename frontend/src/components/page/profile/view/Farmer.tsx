"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api/authApi";
import { FileUploadInput } from "@/components/common/form/FileUploadInput";
import { FormInput } from "@/components/common/form/FormInput";
import { SelectInput } from "@/components/common/form/SelectInput";
import { uploadImage } from "@/utils/imagekit";
import addressJson from "@/../public/Address.json";

// Vibrant icons
import {
  MapPin,
  Tractor,
  FileText,
  Loader2,
  Sparkles,
  Fingerprint,
  User,
  Phone,
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
  farmNumber: z.string().optional(),
  farmArea: z.string().optional(),
  farmUnit: z.string().optional(),
  aadharUrl: z.string().optional(),
  farmDocUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressType {
  states: string[];
  districts: { [key: string]: string[] };
  talukas: { [key: string]: string[] };
  villages: { [key: string]: string[] };
}

export default function Profile() {
  const { user, isLoaded } = useUser();
  const t = useTranslations("profile.farmer.Profile");
  const Address: AddressType = addressJson;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { control, handleSubmit } = form;
  const selectedState = useWatch({ control, name: "state" });
  const selectedDistrict = useWatch({ control, name: "district" });
  const selectedTaluka = useWatch({ control, name: "taluka" });
  const aadharPreview = useWatch({ control, name: "aadharUrl" });
  const farmDocPreview = useWatch({ control, name: "farmDocUrl" });

  const [files, setFiles] = useState<{
    aadharFile: File | null;
    farmdocFile: File | null;
  }>({
    aadharFile: null,
    farmdocFile: null,
  });

  const farmerId = user ? user.id : "";
  const role = user ? user.unsafeMetadata.role : "";
  const [getProfile, { data: profiledata, isFetching, isLoading, isSuccess }] =
    useLazyGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  useEffect(() => {
    if (isLoaded && user?.id) {
      getProfile({ id: farmerId || user.id, role: role as string });
    }
  }, [farmerId, getProfile, isLoaded, role, user?.id]);

  useEffect(() => {
    if (!farmerId) return;
    const data = profiledata?.accountdata;
    if (data) {
      setTimeout(() => {
        form.reset({
          ...data,
        });
      }, 100);
    }
  }, [farmerId, form, profiledata]);

  const onSubmit = async () => {
    try {
      if (files.aadharFile) {
        const aadharUrl = await uploadImage(files.aadharFile, "aadhar");
        form.setValue("aadharUrl", aadharUrl);
      }
      if (files.farmdocFile) {
        const farmDocUrl = await uploadImage(files.farmdocFile, "farmdoc");
        form.setValue("farmDocUrl", farmDocUrl);
      }

      const res = await updateProfile({
        userId: farmerId,
        role: role as string,
        data: form.getValues(),
      });

      if ("data" in res)
        toast.success(
          t("profileUpdated") || "Profile Updated Successfully! 🌾",
        );
      else toast.error(t("profileUpdateFailed") || "Update failed.");
    } catch {
      toast.error(t("somethingWentWrong") || "An error occurred.");
    }
  };

  if (!user || (isFetching && isLoading)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-emerald-900 font-medium">
          Loading your colorful profile...
        </p>
      </div>
    );
  }

  // Common input styling class
  const inputStyle =
    "h-12 rounded-xl bg-white border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-green-100 via-white to-emerald-100 py-10 px-4 sm:px-6">
      <Card className="max-w-4xl mx-auto border-0 shadow-[0_20px_50px_rgba(16,_185,_129,_0.07)] bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        {/* Vibrant Header */}
        <div className="bg-gradient-to-r rounded-2xl from-emerald-600 via-green-600 to-teal-600 p-8 sm:p-10 relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-lime-300 opacity-20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center tracking-tight">
                {t("title") || "Farmer Profile"}{" "}
                <Sparkles className="w-6 h-6 ml-3 text-yellow-300" />
              </h1>
              <p className="text-emerald-50 mt-2 text-base max-w-lg">
                Manage your personal details, farm location, and agricultural
                verification documents.
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner inline-flex items-center self-start sm:self-auto">
              <Fingerprint className="w-4 h-4 text-emerald-200 mr-2" />
              <span className="text-xs font-mono text-emerald-50">
                ID: {farmerId.slice(0, 10)}...
              </span>
            </div>
          </div>
        </div>

        {isSuccess && (
          <CardContent className="p-6 sm:p-10">
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {/* 1. Account Info (Colorful Grid) */}
                <div className="relative">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <User className="w-4 h-4" />
                    </div>
                    {t("account.heading") || "Account Information"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: t("account.firstName") || "First Name",
                        value: user?.firstName,
                        color:
                          "bg-emerald-50/70 border-emerald-100 text-emerald-900",
                      },
                      {
                        label: t("account.lastName") || "Last Name",
                        value: user?.lastName,
                        color: "bg-teal-50/70 border-teal-100 text-teal-900",
                      },
                      {
                        label: t("account.username") || "Username",
                        value: user?.username,
                        color: "bg-cyan-50/70 border-cyan-100 text-cyan-900",
                      },
                      {
                        label: t("account.emailAddress") || "Email",
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
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <Phone className="w-4 h-4" />
                    </div>
                    {t("contact.heading") || "Contact Details"}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 p-6 bg-amber-50/30 rounded-3xl border border-amber-100/50">
                    <FormInput
                      control={control}
                      classname={inputStyle}
                      name="phone"
                      label={t("fields.phone")}
                      type="tel"
                      placeholder="10-digit number"
                    />
                    <FormInput
                      control={control}
                      classname={inputStyle}
                      name="aadharnumber"
                      label={t("fields.aadharnumber")}
                      type="text"
                      placeholder="12-digit number"
                    />
                  </div>
                </div>

                {/* 3. Address */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <MapPin className="w-4 h-4" />
                    </div>
                    {t("address.heading") || "Location Details"}
                  </h3>
                  <div className="p-6 bg-cyan-50/30 rounded-3xl border border-cyan-100/50 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <SelectInput
                        classname={inputStyle}
                        control={control}
                        placeholder="Select State"
                        name="state"
                        label={t("fields.state")}
                        option={Address.states.map((s) => ({
                          label: s,
                          value: s,
                        }))}
                      />
                      <SelectInput
                        classname={inputStyle}
                        control={control}
                        name="district"
                        placeholder="Select District"
                        label={t("fields.district")}
                        option={
                          selectedState
                            ? (Address.districts[selectedState] || []).map(
                                (d) => ({ label: d, value: d }),
                              )
                            : []
                        }
                        disabled={!selectedState}
                      />
                      <SelectInput
                        classname={inputStyle}
                        control={control}
                        name="taluka"
                        placeholder="Select Taluka"
                        label={t("fields.taluka")}
                        option={
                          selectedDistrict
                            ? (Address.talukas[selectedDistrict] || []).map(
                                (t) => ({ label: t, value: t }),
                              )
                            : []
                        }
                        disabled={!selectedDistrict}
                      />
                      <SelectInput
                        classname={inputStyle}
                        control={control}
                        name="village"
                        placeholder="Select Village"
                        label={t("fields.village")}
                        option={
                          selectedTaluka
                            ? (Address.villages[selectedTaluka] || []).map(
                                (v) => ({ label: v, value: v }),
                              )
                            : []
                        }
                        disabled={!selectedTaluka}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormInput
                        type="text"
                        classname={inputStyle}
                        control={control}
                        name="houseBuildingName"
                        label={t("fields.houseBuildingName")}
                        placeholder="House No / Building"
                      />
                      <FormInput
                        type="text"
                        classname={inputStyle}
                        control={control}
                        name="roadarealandmarkName"
                        label={t("fields.roadarealandmarkName")}
                        placeholder="Landmark / Area"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Farm Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-lime-400 to-green-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <Tractor className="w-4 h-4" />
                    </div>
                    {t("farm.heading") || "Farm Information"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-lime-50/30 rounded-3xl border border-lime-100/50">
                    <FormInput
                      type="text"
                      classname={inputStyle}
                      control={control}
                      name="farmNumber"
                      label={t("fields.farmNumber")}
                      placeholder="e.g. Survey No. 12A"
                    />
                    <FormInput
                      classname={inputStyle}
                      control={control}
                      name="farmArea"
                      label={t("fields.farmArea")}
                      type="number"
                      placeholder="Total Area size"
                    />
                    <SelectInput
                      classname={inputStyle}
                      placeholder="Select Unit"
                      control={control}
                      name="farmUnit"
                      label={t("fields.farmUnit")}
                      option={[
                        { label: "Hectare", value: "hectare" },
                        { label: "Acre", value: "acre" },
                      ]}
                    />
                  </div>
                </div>

                {/* 5. Documents */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-5">
                    <div className="bg-gradient-to-br from-indigo-400 to-violet-500 p-2 rounded-xl mr-3 shadow-sm text-white">
                      <FileText className="w-4 h-4" />
                    </div>
                    {t("documents.heading") || "Verification Documents"}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
                    <FileUploadInput
                      control={control}
                      name="aadharUrl"
                      label={t("documents.aadhar") || "Aadhar Image"}
                      preview={aadharPreview || null}
                      onFileChange={(file) =>
                        setFiles((prev) => ({ ...prev, aadharFile: file }))
                      }
                      classname="max-w-md"
                    />

                    <FileUploadInput
                      control={control}
                      name="farmDocUrl"
                      label={
                        t("documents.farm") || "Farm Document (7/12 Extract)"
                      }
                      preview={farmDocPreview || null}
                      onFileChange={(file) =>
                        setFiles((prev) => ({ ...prev, farmdocFile: file }))
                      }
                      classname="max-w-md"
                    />
                  </div>
                </div>

                {/* Vibrant Submit Button */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-10 py-6 h-auto rounded-2xl shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5 transition-all text-lg"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving
                        Changes...
                      </>
                    ) : (
                      t("saveChanges") || "Save Profile Updates"
                    )}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

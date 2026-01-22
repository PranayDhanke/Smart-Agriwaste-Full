"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Leaf,
  CheckCircle2,
  User,
  MapPin,
  FileText,
  Upload,
  Phone,
  CreditCard,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import addressJson from "@/../public/Address.json";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FarmerAccountForm,
  farmerAccountSchema,
} from "@/components/types/zod/farmerAccount.zod";
import { uploadImage } from "@/utils/imagekit";
import { useCreateProfileMutation } from "@/redux/api/authApi";

interface AddressType {
  states: string[];
  districts: { [key: string]: string[] };
  talukas: { [key: string]: string[] };
  villages: { [key: string]: string[] };
}

export default function CreateAccountFarmer() {
  const { user, isLoaded, isSignedIn } = useUser();
  const t = useTranslations("profile.farmer.CreateAccount");
  const router = useRouter();
  const Address: AddressType = addressJson;

  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(farmerAccountSchema),
    defaultValues: {
      aadharnumber: "",
      phone: "",
      state: "",
      district: "",
      taluka: "",
      village: "",
      houseBuildingName: "",
      roadarealandmarkName: "",
      farmNumber: "",
      farmArea: "",
      farmUnit: "hectare",
    },
    mode: "onBlur",
  });

  const role = user?.unsafeMetadata.role;

  useEffect(() => {
    if (role === "buyer") {
      router.replace(`/create-account/buyer`);
    }
  }, [role, router]);

  const [createProfile, { isLoading }] = useCreateProfileMutation();

  const formatAadhaar = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const uploadToImageKit = async (file: File, folder: string) => {
    const upload = uploadImage(file, folder);

    return upload;
  };

  const step1Fields: (keyof FarmerAccountForm)[] = [
    "aadharnumber",
    "aadhar",
    "phone",
    "state",
    "district",
    "taluka",
    "village",
    "houseBuildingName",
    "roadarealandmarkName",
  ];

  const step2Fields: (keyof FarmerAccountForm)[] = [
    "farmNumber",
    "farmdoc",
    "farmArea",
    "farmUnit",
  ];

  const handleNextStep = async () => {
    const ok = await trigger(step1Fields);
    if (ok) setStep(2);
  };

  const onSubmit = async (data: FarmerAccountForm) => {
    try {
      let aadharUrl = "";
      let farmDocUrl = "";

      if (data.aadhar) {
        toast.loading("Uploading Aadhaar...");
        aadharUrl = await uploadToImageKit(data.aadhar, "aadhar");
      }

      if (data.farmdoc) {
        toast.loading("Uploading Farm Document...");
        farmDocUrl = await uploadToImageKit(data.farmdoc, "farmdoc");
      }

      const payload = {
        farmerId: user!.id,
        firstName: user!.firstName || "",
        lastName: user!.lastName || "",
        username: user!.username || "",
        email: user!.primaryEmailAddress?.emailAddress || "",

        phone: data.phone.replace(/\D/g, ""),
        aadharnumber: data.aadharnumber.replace(/\s/g, ""),
        state: data.state,
        district: data.district,
        taluka: data.taluka,
        village: data.village,
        houseBuildingName: data.houseBuildingName,
        roadarealandmarkName: data.roadarealandmarkName,

        farmNumber: data.farmNumber,
        farmArea: data.farmArea,
        farmUnit: data.farmUnit,

        aadharUrl,
        farmDocUrl,
      };

      createProfile({ role, data: payload }).then(() => {
        toast.success("suceess");
        toast.dismiss();
        router.push("/");
      });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="text-green-600 text-lg font-medium">
            {t("loading")}
          </span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="p-8 shadow-xl max-w-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              You must be signed in to access this page
            </p>
            <Button
              onClick={() => router.push("/sign-up?role=farmer")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Sign Up
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedState = watch("state");
  const selectedDistrict = watch("district");
  const selectedTaluka = watch("taluka");
  const aadharFile = watch("aadhar");
  const farmDocFile = watch("farmdoc");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 flex items-center justify-center">
      <Card className="w-full max-w-3xl shadow-2xl border-0 overflow-hidden animate-in fade-in duration-500">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-10 pt-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Leaf className="w-8 h-8" />
            </div>
            <div className="text-center">
              <CardTitle className="text-3xl font-bold">
                {t("header.title")}
              </CardTitle>
              <CardDescription className="text-green-50 text-sm mt-1">
                {t("header.description", { firstName: user.firstName || "" })}
              </CardDescription>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 -z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-white -translate-y-1/2 transition-all duration-500 -z-0"
                style={{ width: step === 2 ? "100%" : "50%" }}
              />
              {/* Step 1 */}
              <div className="flex flex-col pr-10 items-center gap-2 z-10 relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= 1
                      ? "bg-white text-green-600 scale-110 shadow-lg"
                      : "bg-white/30 text-white scale-100"
                  }`}
                >
                  {step === 2 ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    step >= 1 ? "text-white" : "text-green-200"
                  }`}
                >
                  Personal Info
                </span>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col pl-10 items-center gap-2 z-10 relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step === 2
                      ? "bg-white text-green-600 scale-110 shadow-lg"
                      : "bg-white/30 text-white scale-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    step === 2 ? "text-white" : "text-green-200"
                  }`}
                >
                  Farm Details
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {/* User Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${(step - 1) * 100}%)`,
                }}
              >
                {/* STEP 1 - PERSONAL DETAILS */}
                <div className="w-full flex-shrink-0 space-y-6">
                  {/* Identity Verification */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("sections.identity.title")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" />
                        {t("fields.aadhaarNumber")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register("aadharnumber")}
                        value={watch("aadharnumber")}
                        onChange={(e) =>
                          setValue(
                            "aadharnumber",
                            formatAadhaar(e.target.value),
                            { shouldValidate: true },
                          )
                        }
                        placeholder="XXXX XXXX XXXX"
                        maxLength={14}
                        className={`h-12 ${
                          errors.aadharnumber ? "border-red-500" : ""
                        }`}
                      />
                      {errors.aadharnumber && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.aadharnumber.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        Aadhaar Card Photo{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className={`h-12 ${
                            errors.aadhar ? "border-red-500" : ""
                          }`}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            setValue("aadhar", file as File, {
                              shouldValidate: true,
                            });
                            await trigger("aadhar");
                          }}
                        />
                        {aadharFile && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 text-sm font-medium">
                              {aadharFile.name.slice(0, 20)}...
                            </span>
                          </div>
                        )}
                      </div>
                      {errors.aadhar && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.aadhar.message as string}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Max size: 1MB | Formats: JPG, PNG
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Phone className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("sections.contact.title")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {t("fields.phone")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register("phone")}
                        value={watch("phone")}
                        onChange={(e) =>
                          setValue("phone", formatPhone(e.target.value), {
                            shouldValidate: true,
                          })
                        }
                        placeholder="+91 XXXXX XXXXX"
                        maxLength={15}
                        className={`h-12 ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("sections.location.title")}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* State */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("fields.state")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={selectedState}
                          onValueChange={async (value) => {
                            setValue("state", value, { shouldValidate: true });
                            setValue("district", "", { shouldValidate: true });
                            setValue("taluka", "", { shouldValidate: true });
                            setValue("village", "", { shouldValidate: true });
                            await trigger([
                              "state",
                              "district",
                              "taluka",
                              "village",
                            ]);
                          }}
                        >
                          <SelectTrigger
                            className={
                              errors.state ? "border-red-500 h-12" : "h-12"
                            }
                          >
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {Address.states.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.state && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                      {watch("farmArea") && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">
                              {t("labels.totalFarmArea")}
                            </span>{" "}
                            {watch("farmArea")}{" "}
                            {watch("farmUnit") === "hectare"
                              ? t("units.hectarePlural")
                              : t("units.acrePlural")}
                            {watch("farmUnit") === "hectare" &&
                              watch("farmArea") && (
                                <span className="text-blue-600">
                                  {" "}
                                  ≈{" "}
                                  {(
                                    parseFloat(watch("farmArea")) * 2.471
                                  ).toFixed(2)}{" "}
                                  {t("units.acrePlural")}
                                </span>
                              )}
                            {watch("farmUnit") === "acre" &&
                              watch("farmArea") && (
                                <span className="text-blue-600">
                                  {" "}
                                  ≈{" "}
                                  {(
                                    parseFloat(watch("farmArea")) / 2.471
                                  ).toFixed(2)}{" "}
                                  {t("units.hectarePlural")}
                                </span>
                              )}
                          </p>
                        </div>
                      )}

                      {/* District */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("fields.district")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={selectedDistrict}
                          disabled={!selectedState}
                          onValueChange={async (value) => {
                            setValue("district", value, {
                              shouldValidate: true,
                            });
                            setValue("taluka", "", { shouldValidate: true });
                            setValue("village", "", { shouldValidate: true });
                            await trigger(["district", "taluka", "village"]);
                          }}
                        >
                          <SelectTrigger
                            className={`h-12 ${
                              !selectedState
                                ? "opacity-50"
                                : errors.district
                                  ? "border-red-500"
                                  : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                selectedState
                                  ? "Select District"
                                  : "Select State first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(Address.districts[getValues("state")] || []).map(
                              (d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {errors.district && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.district.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Taluka */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("fields.taluka")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={selectedTaluka}
                          disabled={!selectedDistrict}
                          onValueChange={async (value) => {
                            setValue("taluka", value, {
                              shouldValidate: true,
                            });
                            setValue("village", "", { shouldValidate: true });
                            await trigger(["taluka", "village"]);
                          }}
                        >
                          <SelectTrigger
                            className={`h-12 ${
                              !selectedDistrict
                                ? "opacity-50"
                                : errors.taluka
                                  ? "border-red-500"
                                  : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                selectedDistrict
                                  ? "Select Taluka"
                                  : "Select District first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(Address.talukas[getValues("district")] || []).map(
                              (t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {errors.taluka && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.taluka.message}
                          </p>
                        )}
                      </div>

                      {/* Village */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("fields.village")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={watch("village")}
                          disabled={!selectedTaluka}
                          onValueChange={async (value) => {
                            setValue("village", value, {
                              shouldValidate: true,
                            });
                            await trigger("village");
                          }}
                        >
                          <SelectTrigger
                            className={`h-12 ${
                              !selectedTaluka
                                ? "opacity-50"
                                : errors.village
                                  ? "border-red-500"
                                  : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                selectedTaluka
                                  ? "Select Village/City"
                                  : "Select Taluka first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(Address.villages[getValues("taluka")] || []).map(
                              (v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {errors.village && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.village.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Home className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("sections.address.title")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {t("fields.houseNumber")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register("houseBuildingName")}
                        placeholder="e.g., House No. 123, Residential Complex"
                        className={`h-12 ${
                          errors.houseBuildingName ? "border-red-500" : ""
                        }`}
                      />
                      {errors.houseBuildingName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.houseBuildingName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {t("fields.road")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register("roadarealandmarkName")}
                        placeholder="e.g., Near Town Hall, MG Road"
                        className={`h-12 ${
                          errors.roadarealandmarkName ? "border-red-500" : ""
                        }`}
                      />
                      {errors.roadarealandmarkName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.roadarealandmarkName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Continue to Farm Details
                      <CheckCircle2 className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* STEP 2 - FARM DETAILS */}
                <div className="w-full flex-shrink-0 space-y-6 pl-4">
                  {/* Farm Documentation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <FileText className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("sections.farmDocs.title")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        {t("fields.farmNumber")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register("farmNumber")}
                        placeholder="Enter your land document number"
                        className={`h-12 ${
                          errors.farmNumber ? "border-red-500" : ""
                        }`}
                      />
                      {errors.farmNumber && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.farmNumber.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t("hints.farmNumber")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        Upload Farm Document{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          className={`h-12 ${
                            errors.farmdoc ? "border-red-500" : ""
                          }`}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            setValue("farmdoc", file as File, {
                              shouldValidate: true,
                            });
                            await trigger("farmdoc");
                          }}
                        />
                        {farmDocFile && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 text-sm font-medium">
                              {farmDocFile.name.slice(0, 15)}...
                            </span>
                          </div>
                        )}
                      </div>
                      {errors.farmdoc && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.farmdoc.message as string}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t("hints.farmDoc")}
                      </p>
                    </div>
                  </div>

                  {/* Farm Area */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("sections.farmArea.title")}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("fields.totalArea")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register("farmArea")}
                          value={watch("farmArea")}
                          onChange={(e) =>
                            setValue("farmArea", e.target.value, {
                              shouldValidate: true,
                            })
                          }
                          placeholder="e.g., 5.5"
                          className={`h-12 ${
                            errors.farmArea ? "border-red-500" : ""
                          }`}
                        />
                        {errors.farmArea && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.farmArea.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("fields.unit")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={watch("farmUnit")}
                          onValueChange={async (value) => {
                            setValue("farmUnit", value as "hectare" | "acre", {
                              shouldValidate: true,
                            });
                            await trigger("farmUnit");
                          }}
                        >
                          <SelectTrigger className="h-12 border-green-300 bg-green-50/30">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hectare">
                              {t("units.hectare")}
                            </SelectItem>
                            <SelectItem value="acre">
                              {t("units.acre")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {watch("farmArea") && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">
                            Total Farm Area:
                          </span>{" "}
                          {watch("farmArea")}{" "}
                          {watch("farmUnit") === "hectare"
                            ? "hectares"
                            : "acres"}
                          {watch("farmArea") &&
                            watch("farmUnit") === "hectare" && (
                              <>
                                {" "}
                                (
                                <span className="text-blue-600">
                                  {(
                                    parseFloat(watch("farmArea")) * 2.471
                                  ).toFixed(2)}{" "}
                                  acres
                                </span>
                                )
                              </>
                            )}
                          {watch("farmArea") &&
                            watch("farmUnit") === "acre" && (
                              <>
                                {" "}
                                (
                                <span className="text-blue-600">
                                  {(
                                    parseFloat(watch("farmArea")) / 2.471
                                  ).toFixed(2)}{" "}
                                  hectares
                                </span>
                                )
                              </>
                            )}
                        </p>
                      </div>
                    )}
                  </div>

                  {errors.root && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errors.root.message as string}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={isLoading || isSubmitting}
                      className="w-full sm:w-1/2 border-2 border-green-600 text-green-600 hover:bg-green-50 h-14 text-base font-semibold"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5 rotate-180" />
                      {t("actions.back")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="w-full sm:w-1/2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading || isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Profile...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Complete Registration
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-gray-500 pt-2">
                    By completing registration, you agree to our{" "}
                    <span className="text-green-600 underline cursor-pointer">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="text-green-600 underline cursor-pointer">
                      Privacy Policy
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

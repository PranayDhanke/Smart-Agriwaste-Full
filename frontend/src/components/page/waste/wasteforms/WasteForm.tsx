"use client";
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Info,
  ImageIcon,
  Loader2,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import productCategoryMap from "@/../public/Products/Product.json";
import {
  wasteFormDataType,
  wasteFormSchema,
} from "@/components/types/zod/waste.zod";
import { WasteType } from "@/components/types/waste";
import { uploadImage } from "@/utils/imagekit";
import { useCreateWasteMutation } from "@/redux/api/wasteApi";
import { ReactElement, use, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLazyGetProfileQuery } from "@/redux/api/authApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function ListWaste() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { address, user: farmerUser } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(wasteFormSchema),
  });

  const formValues = watch();

  if (isLoaded && !user) {
    router.push("/sign-in");
  }

  const [file, setFile] = useState<File | null>(null);

  const [createWaste, { isLoading, isSuccess, isError, error, status }] =
    useCreateWasteMutation();

  const t = useTranslations("waste");
  const c = useTranslations("wasteCommon");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (wasteData: wasteFormDataType) => {
    if (!address && !farmerUser) {
      toast.error(
        "Error while loading the farmer data please refresh the page",
      );
      return;
    }
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    const toastId = toast.loading(t("messages.uploadingImage"));

    const upload = await uploadImage(
      file,
      `waste_images/${user?.id}_${wasteData.wasteProduct}`,
    );

    if (!upload) {
      toast.dismiss();
      toast.error(t("messages.genericError"));
      return;
    }

    toast.dismiss(toastId);

    createWaste({
      description: wasteData.description,
      imageUrl: upload,
      moisture: wasteData.moisture,
      price: wasteData.price,
      quantity: wasteData.quantity,
      address: address,
      seller: {
        email: farmerUser?.email,
        phone: farmerUser?.phone,
        name: farmerUser?.name,
        farmerId: farmerUser?.id,
      },
      title: wasteData.title,
      unit: wasteData.unit,
      wasteCategory: wasteData.wasteCategory,
      wasteProduct: wasteData.wasteProduct,
      wasteType: wasteData.wasteType,
    }).unwrap();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Listing created successfully!");
      router.push("/profile/farmer/my-listing");
    }
    if (isError) {
      toast.error("error");
      console.log(error);
    }
    if (status) {
      console.log(status);
    }
  }, [isSuccess, isError]);

  const selectedWasteType = watch("wasteType");

  // Step indicator component
  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center flex-1">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
              num <= currentStep
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {num < currentStep ? <CheckCircle2 className="w-5 h-5" /> : num}
          </div>
          {num < 3 && (
            <div
              className={`flex-1 h-1 mx-2 rounded transition-all ${
                num < currentStep
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (!isLoaded || !address || !farmerUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-900">
                {t("pageTitle")}
              </h1>
              <p className="text-green-700/70 text-sm mt-1">
                {t("pageSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 sm:px-8 py-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {step === 1 ? "📦 " : step === 2 ? "📊 " : "🖼️ "}
                {step === 1
                  ? "Waste Details"
                  : step === 2
                    ? "Specifications"
                    : "Product Image"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1
                  ? "Tell us about your agricultural waste"
                  : step === 2
                    ? "Add quantity, price, and condition details"
                    : "Upload a clear photo of your waste"}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <StepIndicator currentStep={step} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* STEP 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-base font-semibold text-gray-900"
                    >
                      Give your listing a title{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Fresh Rice Straw, Wheat Residue"
                      {...register("title")}
                      className={`h-12 text-base rounded-lg border-2 transition-all ${
                        formValues.title
                          ? "border-green-300 bg-green-50/30"
                          : "border-gray-200"
                      } ${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{" "}
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Waste Type Selection - Visual */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900">
                      What type of waste?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: "crop",
                          emoji: "🌾",
                          label: c("wasteTypes.crop"),
                        },
                        {
                          value: "fruit",
                          emoji: "🍓",
                          label: c("wasteTypes.fruit"),
                        },
                        {
                          value: "vegetable",
                          emoji: "🥬",
                          label: c("wasteTypes.vegetable"),
                        },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setValue("wasteType", type.value as WasteType, {
                              shouldValidate: true,
                            });
                            setValue("wasteCategory", "");
                            setValue("wasteProduct", "");
                          }}
                          className={`p-4 rounded-xl border-2 transition-all font-semibold flex flex-col items-center gap-2 ${
                            formValues.wasteType === type.value
                              ? "border-green-500 bg-green-50 shadow-lg scale-105"
                              : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                          }`}
                        >
                          <span className="text-3xl">{type.emoji}</span>
                          <span className="text-xs sm:text-sm text-gray-900">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.wasteType && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{" "}
                        {errors.wasteType.message}
                      </p>
                    )}
                  </div>

                  {/* Category Selection */}
                  {selectedWasteType && (
                    <div className="space-y-2 animate-fadeIn">
                      <Label
                        htmlFor="wasteCategory"
                        className="text-base font-semibold text-gray-900"
                      >
                        Select category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formValues.wasteCategory}
                        onValueChange={(value) => {
                          setValue("wasteCategory", value, {
                            shouldValidate: true,
                          });
                          setValue("wasteProduct", "");
                        }}
                      >
                        <SelectTrigger
                          id="wasteCategory"
                          className={`h-12 text-base rounded-lg border-2 transition-all ${
                            formValues.wasteCategory
                              ? "border-green-300 bg-green-50/30"
                              : "border-gray-200"
                          } ${errors.wasteCategory ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedWasteType &&
                            Object.keys(
                              (productCategoryMap as any)[selectedWasteType],
                            ).map((item: string) => (
                              <SelectItem key={item} value={item}>
                                {c(`wasteCat.${selectedWasteType}.${item}`)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {errors.wasteCategory && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {errors.wasteCategory.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Product Selection */}
                  {formValues.wasteCategory && (
                    <div className="space-y-2 animate-fadeIn">
                      <Label
                        htmlFor="wasteProduct"
                        className="text-base font-semibold text-gray-900"
                      >
                        Select product <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(productCategoryMap as any)[watch("wasteType")][
                          watch("wasteCategory")
                        ].map((item: { name: string; icon: ReactElement }) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setValue("wasteProduct", item.name)}
                            className={`p-3 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium flex flex-col items-center gap-2 ${
                              formValues.wasteProduct === item.name
                                ? "border-green-500 bg-green-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-green-300"
                            }`}
                          >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-gray-900">
                              {c(
                                `productSet.${watch("wasteType")}.${watch(
                                  "wasteCategory",
                                )}.${item.name}`,
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.wasteProduct && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {errors.wasteProduct.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 1 Navigation */}
                  {formValues.wasteProduct && formValues.title && (
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full h-12 mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                    >
                      Continue <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              )}

              {/* STEP 2: Specifications */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Quantity & Unit */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="quantity"
                        className="text-base font-semibold text-gray-900"
                      >
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="e.g., 100"
                        {...register("quantity", { valueAsNumber: true })}
                        className={`h-12 text-base rounded-lg border-2 transition-all ${
                          formValues.quantity
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200"
                        } ${errors.quantity ? "border-red-500" : ""}`}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {errors.quantity.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="unit"
                        className="text-base font-semibold text-gray-900"
                      >
                        Unit <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formValues.unit}
                        onValueChange={(value) =>
                          setValue("unit", value as any, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger
                          id="unit"
                          className={`h-12 text-base rounded-lg border-2 transition-all ${
                            formValues.unit
                              ? "border-green-300 bg-green-50/30"
                              : "border-gray-200"
                          } ${errors.unit ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">📦 Kilogram (kg)</SelectItem>
                          <SelectItem value="ton">🚛 Metric Ton</SelectItem>
                          <SelectItem value="gram">⚖️ Gram (g)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.unit && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {errors.unit.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Moisture */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="price"
                        className="text-base font-semibold text-gray-900"
                      >
                        Price per unit (₹){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        id="price"
                        placeholder="e.g., 500"
                        {...register("price", { valueAsNumber: true })}
                        className={`h-12 text-base rounded-lg border-2 transition-all ${
                          formValues.price
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200"
                        } ${errors.price ? "border-red-500" : ""}`}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="moisture"
                        className="text-base font-semibold text-gray-900"
                      >
                        Moisture level <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formValues.moisture}
                        onValueChange={(value) =>
                          setValue("moisture", value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger
                          id="moisture"
                          className={`h-12 text-base rounded-lg border-2 transition-all ${
                            formValues.moisture
                              ? "border-green-300 bg-green-50/30"
                              : "border-gray-200"
                          } ${errors.moisture ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select moisture" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dry">☀️ Dry</SelectItem>
                          <SelectItem value="semiwet">🌤️ Semi-wet</SelectItem>
                          <SelectItem value="wet">💧 Wet</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.moisture && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />{" "}
                          {errors.moisture.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-base font-semibold text-gray-900"
                    >
                      Add description (optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell buyers more about the waste quality, origin, storage conditions..."
                      {...register("description")}
                      rows={4}
                      className={`resize-none text-base rounded-lg border-2 transition-all ${
                        formValues.description
                          ? "border-green-300 bg-green-50/30"
                          : "border-gray-200"
                      } ${errors.description ? "border-red-500" : ""}`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />{" "}
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Step 2 Navigation */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-lg border-2 font-semibold"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={
                        !formValues.quantity ||
                        !formValues.price ||
                        !formValues.moisture
                      }
                      className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                    >
                      Continue <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Image Upload */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Upload a clear, well-lit photo of your waste product. This
                      helps buyers trust your listing.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="image"
                      className="text-base font-semibold text-gray-900"
                    >
                      Product Image <span className="text-red-500">*</span>
                    </Label>

                    {/* Image Preview */}
                    {previewImage ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-300 bg-green-50">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="image" className="block">
                        <div className="relative border-2 border-dashed border-gray-300 hover:border-green-400 rounded-lg p-8 text-center cursor-pointer transition-all hover:bg-green-50">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-base font-semibold text-gray-900">
                            Tap to upload photo
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            JPG, PNG up to 10MB
                          </p>
                        </div>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Step 3 Navigation */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 rounded-lg border-2 font-semibold"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isLoading || !file}
                      className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Leaf className="mr-2 h-5 w-5" />
                          Publish Listing
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Info Cards Below */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📸</div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Quality Photos
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Clear images increase buyer interest
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Fair Pricing
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Competitive prices attract more buyers
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Good Details
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Complete information builds trust
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

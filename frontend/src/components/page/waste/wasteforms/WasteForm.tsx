"use client";
import productCategoryMap from "@/../public/Products/Product.json";
import { FormInput } from "@/components/common/form/FormInput";
import { ProcessSelectInput } from "@/components/common/form/ProcessSelectInput";
import { SelectInput } from "@/components/common/form/SelectInput";
import {
  wasteFormDataType,
  wasteFormSchema,
} from "@/components/types/zod/waste.zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { useCreateWasteMutation } from "@/redux/api/wasteApi";
import type { RootState } from "@/redux/store";
import { uploadImage } from "@/utils/imagekit";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronRight,
  Info,
  Leaf,
  Loader2,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function ListWaste() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { address, user: farmerUser } = useSelector(
    (state: RootState) => state.auth,
  );

  const form = useForm<wasteFormDataType>({
    resolver: zodResolver(wasteFormSchema),
    defaultValues: {
      description: "",
      moisture: undefined,
      price: undefined,
      quantity: undefined,
      title: "",
      unit: undefined,
      wasteCategory: "",
      wasteProduct: "",
      wasteType: undefined,
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;

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
    toast.success("Listing created successfully!");
    setTimeout(() => {
      router.push("/profile/farmer/my-listing");
    }, 500);
  };

  useEffect(() => {
    if (isError) {
      toast.error("error");
      console.log(error);
    }
  }, [isSuccess, isError]);
  const a = 10;

  const selectedWasteType = watch("wasteType");
  const selectedWasteCategory = watch("wasteCategory");

  useEffect(() => {
    if (!selectedWasteType) return;

    setValue("wasteCategory", "");
    setValue("wasteProduct", "");
  }, [selectedWasteType, setValue]);
  useEffect(() => {
    if (!selectedWasteCategory) return;

    setValue("wasteProduct", "");
  }, [selectedWasteCategory, setValue]);

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

  const CategoryObject =
    selectedWasteType &&
    Object.keys((productCategoryMap as any)?.[selectedWasteType] ?? {}).map(
      (item) => ({
        value: item,
        label: c(`wasteCat.${item}`),
      }),
    );

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
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* STEP 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Title */}
                    <FormInput
                      control={control}
                      label="Give your listing a title *"
                      name="title"
                      placeholder="e.g., Fresh Rice Straw, Wheat Residue"
                      type="text"
                      classname={`h-12 text-base rounded-lg border-2 transition-all ${
                        formValues.price
                          ? "border-green-300 bg-green-50/30"
                          : "border-gray-200"
                      } `}
                    />

                    {/* Waste Type Selection - Visual */}
                    <ProcessSelectInput
                      classNames="grid grid-cols-3 gap-3"
                      control={control}
                      isProduct={false}
                      label="What type of waste? *"
                      name="wasteType"
                      option={[
                        {
                          value: "crop",
                          icon: "🌾",
                          name: c("wasteTypes.crop"),
                        },
                        {
                          value: "fruit",
                          icon: "🍓",
                          name: c("wasteTypes.fruit"),
                        },
                        {
                          value: "vegetable",
                          icon: "🥬",
                          name: c("wasteTypes.vegetable"),
                        },
                      ]}
                    />

                    {/* Category Selection */}
                    {selectedWasteType && (
                      <SelectInput
                        control={control}
                        label="Select category *"
                        name="wasteCategory"
                        option={CategoryObject as []}
                        placeholder="Choose a category"
                        classname={`w-full text-base rounded-lg border-2 transition-all ${
                          selectedWasteCategory
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200"
                        }`}
                        disabled={!selectedWasteType}
                      />
                    )}
                    {selectedWasteType && selectedWasteCategory && (
                      <ProcessSelectInput
                        classNames="grid grid-cols-2 sm:grid-cols-3 gap-2"
                        control={control}
                        isProduct={true}
                        label=" Select product *"
                        name="wasteProduct"
                        option={
                          (productCategoryMap as any)?.[selectedWasteType]?.[
                            selectedWasteCategory
                          ]
                        }
                        disabled={!selectedWasteType && !selectedWasteCategory}
                      />
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
                      <FormInput
                        control={control}
                        label="Quantity *"
                        name="quantity"
                        placeholder="e.g., 100"
                        type="number"
                        classname={`h-12 text-base rounded-lg border-2 transition-all ${
                          formValues.price
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200"
                        } `}
                      />

                      <SelectInput
                        control={control}
                        label="Unit *"
                        name="unit"
                        placeholder="Select unit"
                        classname={`h-12 text-base rounded-lg border-2 transition-all ${
                          formValues.unit
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200"
                        }`}
                        option={[
                          { label: "📦 Kilogram (kg)", value: "kg" },
                          { value: "ton", label: "🚛 Metric Ton" },
                          { value: "gram", label: "⚖️ Gram (g)" },
                        ]}
                      />
                    </div>

                    {/* Price & Moisture */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        control={control}
                        label="Price per unit (₹) *"
                        name="price"
                        placeholder="e.g., 500"
                        type="number"
                        classname={`h-12 text-base rounded-lg border-2 transition-all ${
                          formValues.price
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200"
                        } `}
                      />
                      <SelectInput
                        control={control}
                        label="Moisture level *"
                        name="moisture"
                        placeholder="Select moisture"
                        classname={`h-12 text-base rounded-lg border-2 transition-all ${
                          formValues.moisture
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200"
                        } `}
                        option={[
                          {
                            value: "dry",
                            label: "☀️ Dry",
                          },
                          {
                            value: "semiwet",
                            label: "🌤️ Semi-wet",
                          },
                          {
                            value: "wet",
                            label: "💧 Wet",
                          },
                        ]}
                      />
                    </div>

                    {/* Description */}
                    <FormInput
                      classname={`resize-none text-base rounded-lg border-2 transition-all ${
                        formValues.description
                          ? "border-green-300 bg-green-50/30"
                          : "border-gray-200"
                      } `}
                      control={control}
                      label="Add description (optional)"
                      name="description"
                      type="text"
                      placeholder="Tell buyers more about the waste quality, origin, storage conditions..."
                    />

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
                        Upload a clear, well-lit photo of your waste product.
                        This helps buyers trust your listing.
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
            </Form>
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

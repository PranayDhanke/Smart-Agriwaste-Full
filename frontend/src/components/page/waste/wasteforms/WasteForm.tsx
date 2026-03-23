"use client";
import productCategoryMap from "@/../public/Products/Product.json";
import { FormInput } from "@/components/common/form/FormInput";
import { ProcessSelectInput } from "@/components/common/form/ProcessSelectInput";
import { SelectInput } from "@/components/common/form/SelectInput";
import VoiceInput from "@/components/provider/VoiceInput";
import ReadAloud from "@/components/provider/ReadAloud";
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
  const c = useTranslations("wasteCommon"); // Ensure wasteCommon has translations for categories/types

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
      toast.error(t("messages.genericError"));
      return;
    }
    if (!file) {
      toast.error(t("fields.image.noImageSelected"));
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
    toast.success(t("messages.success"));
    setTimeout(() => {
      router.push("/profile/farmer/my-listing");
    }, 500);
  };

  useEffect(() => {
    if (isError) {
      toast.error(t("messages.failure"));
      console.log(error);
    }
  }, [isSuccess, isError, t]);

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
                  ? t("sections.wasteDetails")
                  : step === 2
                    ? t("sections.specifications")
                    : t("sections.productImage")}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1
                  ? t("sections.wasteDetailsDesc") // Consider adding to your JSON
                  : step === 2
                    ? t("sections.specificationsDesc") // Consider adding to your JSON
                    : t("sections.productImageDesc")} // Consider adding to your JSON
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
                    <div className="flex w-full items-start gap-3">
                      <div className="pt-1">
                        <ReadAloud text={t("fields.title.label")} />
                      </div>
                      <div className="min-w-0 flex-1 flex gap-2 items-end">
                        <div className="flex-1">
                          <FormInput
                            control={control}
                            label={`${t("fields.title.label")} *`}
                            name="title"
                            placeholder={t("fields.title.placeholder")}
                            type="text"
                            classname={`h-12 text-base rounded-lg border-2 transition-all ${
                              formValues.price
                                ? "border-green-300 bg-green-50/30"
                                : "border-gray-200"
                            } `}
                          />
                        </div>
                        <VoiceInput
                          onText={(txt) => {
                            setValue("title", txt, {
                              shouldDirty: true,
                              shouldValidate: true,
                              shouldTouch: true,
                            });
                          }}
                        />
                      </div>
                    </div>

                    {/* Waste Type Selection - Visual */}
                    <div className="flex w-full items-start gap-3">
                      <div className="pt-1">
                        <ReadAloud text={t("fields.wasteType.label")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <ProcessSelectInput
                          classNames="grid grid-cols-3 gap-3"
                          control={control}
                          isProduct={false}
                          label={`${t("fields.wasteType.label")} *`}
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
                      </div>
                    </div>

                    {/* Category Selection */}
                    {selectedWasteType && (
                      <div className="flex w-full items-start gap-3 animate-fadeIn">
                        <div className="pt-1">
                          <ReadAloud text={t("fields.wasteCategory.label")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <SelectInput
                            control={control}
                            label={`${t("fields.wasteCategory.label")} *`}
                            name="wasteCategory"
                            option={CategoryObject as []}
                            placeholder={t("fields.wasteCategory.placeholder")}
                            classname={`w-full text-base rounded-lg border-2 transition-all ${
                              selectedWasteCategory
                                ? "border-green-300 bg-green-50/30"
                                : "border-gray-200"
                            }`}
                            disabled={!selectedWasteType}
                          />
                        </div>
                      </div>
                    )}

                    {selectedWasteType && selectedWasteCategory && (
                      <div className="flex w-full items-start gap-3 animate-fadeIn">
                        <div className="pt-1">
                          <ReadAloud text={t("fields.wasteProduct.label")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <ProcessSelectInput
                            classNames="grid grid-cols-2 sm:grid-cols-3 gap-2"
                            control={control}
                            isProduct={true}
                            label={`${t("fields.wasteProduct.label")} *`}
                            name="wasteProduct"
                            option={
                              (productCategoryMap as any)?.[selectedWasteType]?.[
                                selectedWasteCategory
                              ]
                            }
                            disabled={!selectedWasteType && !selectedWasteCategory}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 1 Navigation */}
                    {formValues.wasteProduct && formValues.title && (
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full h-12 mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                      >
                        {t("buttons.continue")} <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                )}

                {/* STEP 2: Specifications */}
                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Quantity & Unit */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex w-full items-start gap-3">
                        <div className="pt-1">
                          <ReadAloud text={t("fields.quantity.label")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <FormInput
                            control={control}
                            label={`${t("fields.quantity.label")} *`}
                            name="quantity"
                            placeholder={t("fields.quantity.placeholder")}
                            type="number"
                            classname={`h-12 text-base rounded-lg border-2 transition-all ${
                              formValues.price
                                ? "border-green-300 bg-green-50/30"
                                : "border-gray-200"
                            } `}
                          />
                        </div>
                      </div>

                      <div className="flex w-full items-start gap-3">
                        <div className="pt-1">
                          <ReadAloud text={t("fields.unit.label")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <SelectInput
                            control={control}
                            label={`${t("fields.unit.label")} *`}
                            name="unit"
                            placeholder={t("fields.unit.placeholder")}
                            classname={`h-12 text-base rounded-lg border-2 transition-all ${
                              formValues.unit
                                ? "border-green-300 bg-green-50/30"
                                : "border-gray-200"
                            }`}
                            option={[
                              { label: `📦 ${t("unit.kg")}`, value: "kg" },
                              { label: `🚛 ${t("unit.ton")}`, value: "ton" },
                              { label: `⚖️ ${t("unit.gram")}`, value: "gram" },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price & Moisture */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex w-full items-start gap-3">
                        <div className="pt-1">
                          <ReadAloud text={t("fields.price.label")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <FormInput
                            control={control}
                            label={`${t("fields.price.label")} *`}
                            name="price"
                            placeholder={t("fields.price.placeholder")}
                            type="number"
                            classname={`h-12 text-base rounded-lg border-2 transition-all ${
                              formValues.price
                                ? "border-green-300 bg-green-50/30"
                                : "border-gray-200"
                            } `}
                          />
                        </div>
                      </div>
                      
                      <div className="flex w-full items-start gap-3">
                        <div className="pt-1">
                          <ReadAloud text={t("fields.moisture.label")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <SelectInput
                            control={control}
                            label={`${t("fields.moisture.label")} *`}
                            name="moisture"
                            placeholder={t("fields.moisture.placeholder")}
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
                                value: "semi_wet",
                                label: "🌤️ Semi-wet",
                              },
                              {
                                value: "wet",
                                label: "💧 Wet",
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex w-full items-start gap-3">
                      <div className="pt-1">
                        <ReadAloud text={t("fields.description.label")} />
                      </div>
                      <div className="min-w-0 flex-1 flex gap-2 items-end">
                        <div className="flex-1">
                          <FormInput
                            classname={`resize-none text-base rounded-lg border-2 transition-all ${
                              formValues.description
                                ? "border-green-300 bg-green-50/30"
                                : "border-gray-200"
                            } `}
                            control={control}
                            label={t("fields.description.label")}
                            name="description"
                            type="text"
                            placeholder={t("fields.description.placeholder")}
                          />
                        </div>
                        <VoiceInput
                          onText={(txt) =>
                            setValue("description", txt, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Step 2 Navigation */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 rounded-lg border-2 font-semibold"
                      >
                        {t("buttons.back")}
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
                        {t("buttons.continue")} <ChevronRight className="w-5 h-5 ml-2" />
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
                        {t("sections.productImageDesc")}
                      </p>
                    </div>

                    <div className="flex w-full items-start gap-3">
                      <div className="pt-1">
                        <ReadAloud text={t("fields.image.label")} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <Label
                          htmlFor="image"
                          className="text-base font-semibold text-gray-900"
                        >
                          {t("fields.image.label")} <span className="text-red-500">*</span>
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
                                {t("fields.image.click")}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {t("fields.image.or")}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {t("fields.image.helper")}
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
                    </div>

                    {/* Step 3 Navigation */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1 h-12 rounded-lg border-2 font-semibold"
                      >
                        {t("buttons.back")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || isLoading || !file}
                        className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("buttons.submitting")}
                          </>
                        ) : (
                          <>
                            <Leaf className="mr-2 h-5 w-5" />
                            {t("buttons.submit")}
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
              {t("infoCards.photos.title")}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {t("infoCards.photos.desc")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {t("infoCards.pricing.title")}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {t("infoCards.pricing.desc")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {t("infoCards.details.title")}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {t("infoCards.details.desc")}
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
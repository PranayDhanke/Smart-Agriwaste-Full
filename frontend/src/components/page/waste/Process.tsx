"use client";

import {
  processFormDataType,
  processSchema,
} from "@/components/types/zod/process.zod";
import { useLazyGetRecommendationsQuery } from "@/redux/api/agriApi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Droplet,
  DropletOff,
  Loader,
  Recycle,
  Sun,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import ProductList from "@/../public/Products/Product.json";
import { ProcessSelectInput } from "@/components/common/form/ProcessSelectInput";
import { SelectInput } from "@/components/common/form/SelectInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

export default function Process() {
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState(1);
  const locale = useLocale() as "en" | "mr" | "hi";
  const t = useTranslations("process");
  const c = useTranslations("wasteCommon");

  const form = useForm({
    resolver: zodResolver(processSchema),
  });

  const { control, handleSubmit, watch, setValue, reset } = form;
  const wasteType = watch("wasteType")
  const wasteCategory = watch("wasteCategory")

  useEffect(() => {
    if (!wasteType) return;

    setValue("wasteCategory", "");
    setValue("wasteProduct", "");
  }, [wasteType, setValue]);
  useEffect(() => {
    if (!wasteCategory) return;

    setValue("wasteProduct", "");
  }, [wasteCategory, setValue]);

  const [getRecommendations, { isLoading, isError, error, data }] =
    useLazyGetRecommendationsQuery();

  const onSubmit = async (formData: processFormDataType) => {
    try {
      const result = await getRecommendations({
        product: formData.wasteProduct,
        moisture: formData.moisture,
        intendedUse: formData.intendedUse,
        lang: locale,
      }).unwrap();

      setResult(result);
      setStep(3); // Show results
    } catch {
      setResult(null);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
    setStep(1);
  };

  // Progress indicator
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
            {num < currentStep ? <CheckCircle className="w-5 h-5" /> : num}
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

  const CategoryObject =
    wasteType &&
    Object.keys((ProductList as any)?.[wasteType] ?? {}).map((item) => ({
      value: item,
      label: c(`wasteCat.${item}`),
    }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg">
              <Recycle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t("header.title")}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {t("header.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Main content area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section - Takes up more space */}
          <div className="lg:col-span-2">
            {!result ? (
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-5">
                  <CardTitle className="text-xl text-gray-900">
                    {step === 1 ? "🌾 " : "💧 "}
                    {step === 1
                      ? t("form.wasteType")
                      : step === 2
                        ? t("form.moisture")
                        : "Processing..."}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    {step === 1
                      ? "Select your agricultural waste type"
                      : step === 2
                        ? "Tell us about the moisture level and intended use"
                        : "Analyzing your waste..."}
                  </p>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  <StepIndicator currentStep={step} />

                  <Form {...form}>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Step 1: Waste Type Selection */}
                      {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                          <ProcessSelectInput
                            isProduct={false}
                            control={control}
                            label={`${t("form.wasteType")} *`}
                            name="wasteType"
                            option={[
                              {
                                value: "crop",
                                icon: "🌾",
                                name: c("wasteTypes.crop"),
                              },
                              {
                                value: "vegetable",
                                icon: "🥬",
                                name: c("wasteTypes.vegetable"),
                              },
                              {
                                value: "fruit",
                                icon: "🍎",
                                name: c("wasteTypes.fruit"),
                              },
                            ]}
                            classNames="grid grid-cols-1 sm:grid-cols-3 gap-3"
                            key={wasteType}
                          />

                          {wasteType && (
                            <SelectInput
                              control={control}
                              label={`${t("form.wasteCategory")} *`}
                              name="wasteCategory"
                              placeholder={t("placeholders.selectCategory")}
                              classname={`w-full text-base rounded-lg border-2 transition-all ${
                                wasteCategory
                                  ? "border-green-300 bg-green-50/30"
                                  : "border-gray-200"
                              }`}
                              option={CategoryObject as []}
                              disabled={!wasteType}
                              key={wasteCategory}
                            />
                          )}

                          {wasteType && wasteCategory && (
                            <ProcessSelectInput
                              isProduct={true}
                              control={control}
                              label={`${t("form.wasteProduct")} *`}
                              classNames="grid grid-cols-2 sm:grid-cols-3 gap-2"
                              name="wasteProduct"
                              option={
                                (ProductList as any)?.[wasteType]?.[
                                  wasteCategory
                                ]
                              }
                              disabled={!wasteType && !wasteCategory}
                              key={wasteCategory + wasteType}
                            />
                          )}

                          {watch("wasteProduct") && (
                            <Button
                              type="button"
                              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                              onClick={() => setStep(2)}
                            >
                              Continue <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Step 2: Moisture & Intended Use */}
                      {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                          <ProcessSelectInput
                            classNames="grid grid-cols-1 sm:grid-cols-3 gap-3"
                            control={control}
                            isProduct={false}
                            label={`💧 ${t("form.moisture")} *`}
                            name="moisture"
                            option={[
                              {
                                value: "dry",
                                icon: <Sun />,
                                name: c("moisture.dry"),
                              },
                              {
                                value: "semi_wet",
                                icon: <DropletOff />,
                                name: c("moisture.semi_wet"),
                              },
                              {
                                value: "wet",
                                icon: <Droplet />,
                                name: c("moisture.wet"),
                              },
                            ]}
                            key={watch("moisture")}
                          />

                          <ProcessSelectInput
                            classNames="grid grid-cols-2 sm:grid-cols-2 gap-3"
                            control={control}
                            isProduct={false}
                            label={`🎯 ${t("form.intendedUse")} *`}
                            name="intendedUse"
                            option={[
                              {
                                value: "compost",
                                icon: "🌱",
                                name: t("intendedUse.compost"),
                              },
                              {
                                value: "feed",
                                icon: "🐄",
                                name: t("intendedUse.feed"),
                              },
                              {
                                value: "sell",
                                icon: "💰",
                                name: t("intendedUse.sell"),
                              },
                              {
                                value: "biogas",
                                icon: "⚡",
                                name: t("intendedUse.biogas"),
                              },
                            ]}
                            key={watch("intendedUse")}
                          />

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 h-12 rounded-lg border-2"
                              onClick={() => setStep(1)}
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              disabled={
                                isLoading ||
                                !watch("moisture") ||
                                !watch("intendedUse")
                              }
                              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg"
                            >
                              {isLoading ? (
                                <>
                                  <Loader className="animate-spin w-5 h-5 mr-2" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  Get Recommendations{" "}
                                  <Zap className="w-5 h-5 ml-2" />
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
            ) : (
              /* Results Card */
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <CardTitle className="text-xl text-gray-900">
                      {t("result.title")}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-6">
                    {/* Process Steps */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-lg">📋</span> Processing Steps
                      </h3>
                      <div className="space-y-3">
                        {data?.process.map((step: string, i: number) => (
                          <div
                            key={i}
                            className="flex gap-4 p-4 rounded-lg bg-green-50 border border-green-200"
                          >
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-semibold text-sm">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">
                                {step}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Output & Benefits */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span>🎯</span> {t("result.finalOutput")}
                        </h4>
                        <p className="text-gray-700">{data?.finalOutput}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span>✨</span> {t("result.benefits")}
                        </h4>
                        <p className="text-gray-700">{data?.benefits}</p>
                      </div>
                    </div>

                    {data?.notes && (
                      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{data.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 rounded-lg border-2"
                        onClick={handleReset}
                      >
                        Try Another
                      </Button>
                      <Button className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg">
                        Share Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Handling */}
            {isError && (
              <Card className="border-0 shadow-lg rounded-2xl border-red-200 bg-red-50 mt-4">
                <CardContent className="p-6 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">
                      {(error as any)?.status === 404 ? "Not Found" : "Error"}
                    </h3>
                    <p className="text-sm text-red-800">
                      {(error as any)?.status === 404
                        ? t("result.notFound")
                        : "Something went wrong. Please try again."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Info & Tips */}
          <div className="lg:col-span-1 space-y-4">
            {/* Info Card */}
            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-lg">💡</span> Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-lg">🌍</span>
                    <span>
                      Proper waste management reduces environmental impact
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lg">💚</span>
                    <span>Composting improves soil quality naturally</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lg">⚡</span>
                    <span>Biogas generation provides renewable energy</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-lg">💰</span>
                    <span>Process waste to create additional income</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Step-by-step guidance
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Personalized recommendations
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Multiple language support
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Practical implementation tips
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
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

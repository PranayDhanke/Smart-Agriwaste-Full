"use client";

import {
  processFormDataType,
  processSchema,
} from "@/components/types/zod/process.zod";
import {
  RecommendationResult,
  useLazyGetRecommendationsQuery,
} from "@/redux/api/agriApi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock3,
  Droplet,
  DropletOff,
  Loader,
  PackageCheck,
  Recycle,
  ShieldCheck,
  Sun,
  Trees,
  Wrench,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import ProductList from "@/../public/Products/Product.json";
import { ProcessSelectInput } from "@/components/common/form/ProcessSelectInput";
import { SelectInput } from "@/components/common/form/SelectInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import ReadAloud from "@/components/provider/ReadAloud";

type SupportedLocale = "en" | "mr" | "hi";
type ProductOption = {
  name: string;
  icon: string;
};
type WasteCatalog = Record<string, Record<string, ProductOption[]>>;
type ApiError = {
  status?: number;
};

const productCatalog = ProductList as unknown as WasteCatalog;

export default function Process() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [step, setStep] = useState(1);
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("process");
  const c = useTranslations("wasteCommon");

  const form = useForm({
    resolver: zodResolver(processSchema),
  });

  const { control, handleSubmit, watch, setValue, reset } = form;
  const wasteType = watch("wasteType");
  const wasteCategory = watch("wasteCategory");

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
      const recommendation = await getRecommendations({
        product: formData.wasteProduct,
        moisture: formData.moisture,
        intendedUse: formData.intendedUse,
        lang: locale,
      }).unwrap();

      setResult(recommendation);
      setStep(3);
    } catch {
      setResult(null);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
    setStep(1);
  };

  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="mb-8 flex items-center justify-between">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex flex-1 items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
              num <= currentStep
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {num < currentStep ? <CheckCircle className="h-5 w-5" /> : num}
          </div>
          {num < 3 && (
            <div
              className={`mx-2 h-1 flex-1 rounded transition-all ${
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

  const categoryOptions =
    wasteType &&
    Object.keys(productCatalog[wasteType] ?? {}).map((item) => ({
      value: item,
      label: c(`wasteCat.${item}`),
    }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="sticky top-0 z-10 border-b border-green-100 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 p-3 shadow-lg">
              <Recycle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {t("header.title")}
              </h1>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                {t("header.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {!result ? (
              <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
                <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5">
                  <CardTitle className="text-xl text-gray-900">
                    {step === 1
                      ? t("content.typeSelection")
                      : t("content.moistureSelection")}
                  </CardTitle>
                  <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                    {step === 1
                      ? t("content.selectWasteType")
                      : step === 2
                        ? t("content.selectMoistureAndUse")
                        : t("content.analyzing")}
                  </p>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  <StepIndicator currentStep={step} />

                  <Form {...form}>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {step === 1 && (
                        <div className="animate-fadeIn space-y-6">
                          <div className="flex w-full items-start gap-3">
                            <div className="pt-1">
                              <ReadAloud text={`${t("form.wasteType")}`} />
                            </div>
                            <div className="min-w-0 flex-1">
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
                                classNames="grid grid-cols-1 gap-3 sm:grid-cols-3"
                                key={wasteType}
                              />
                            </div>
                          </div>

                          {wasteType && (
                            <div
                              key={wasteCategory}
                              className="flex w-full items-start gap-3 animate-fadeIn"
                            >
                              <div className="pt-1">
                                <ReadAloud
                                  text={`${t("form.wasteCategory")}`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <SelectInput
                                  control={control}
                                  label={`${t("form.wasteCategory")} *`}
                                  name="wasteCategory"
                                  placeholder={t("placeholders.selectCategory")}
                                  classname={`w-full rounded-lg border-2 text-base transition-all ${
                                    wasteCategory
                                      ? "border-green-300 bg-green-50/30"
                                      : "border-gray-200"
                                  }`}
                                  option={categoryOptions as []}
                                  disabled={!wasteType}
                                />
                              </div>
                            </div>
                          )}

                          {wasteType && wasteCategory && (
                            <div
                              key={wasteCategory + wasteType}
                              className="flex w-full items-start gap-3 animate-fadeIn"
                            >
                              <div className="pt-1">
                                <ReadAloud text={`${t("form.wasteProduct")}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <ProcessSelectInput
                                  isProduct={true}
                                  control={control}
                                  label={`${t("form.wasteProduct")} *`}
                                  classNames="grid grid-cols-2 gap-2 sm:grid-cols-3"
                                  name="wasteProduct"
                                  option={
                                    productCatalog[wasteType]?.[wasteCategory]
                                  }
                                  disabled={!wasteType && !wasteCategory}
                                />
                              </div>
                            </div>
                          )}

                          {watch("wasteProduct") && (
                            <Button
                              type="button"
                              className="mt-4 h-12 w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-emerald-700"
                              onClick={() => setStep(2)}
                            >
                              {t("actions.continue")}
                              <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      )}

                      {step === 2 && (
                        <div className="animate-fadeIn space-y-6">
                          <div className="flex w-full items-start gap-3">
                            <div className="pt-1">
                              <ReadAloud text={`${t("form.moisture")}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <ProcessSelectInput
                                classNames="grid grid-cols-1 gap-3 sm:grid-cols-3"
                                control={control}
                                isProduct={false}
                                label={`${t("form.moisture")} *`}
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
                            </div>
                          </div>

                          <div className="flex w-full items-start gap-3">
                            <div className="pt-1">
                              <ReadAloud text={`${t("form.intendedUse")}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <ProcessSelectInput
                                classNames="grid grid-cols-2 gap-3 sm:grid-cols-2"
                                control={control}
                                isProduct={false}
                                label={`${t("form.intendedUse")} *`}
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
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-12 flex-1 rounded-lg border-2"
                              onClick={() => setStep(1)}
                            >
                              {t("actions.back")}
                            </Button>
                            <Button
                              type="submit"
                              disabled={
                                isLoading ||
                                !watch("moisture") ||
                                !watch("intendedUse")
                              }
                              className="h-12 flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 font-semibold text-white shadow-lg hover:from-green-600 hover:to-emerald-700"
                            >
                              {isLoading ? (
                                <>
                                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                                  {t("actions.processing")}
                                </>
                              ) : (
                                <>
                                  {t("actions.getRecommendations")}
                                  <Zap className="ml-2 h-5 w-5" />
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
              <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
                <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-xl text-gray-900">
                      {t("result.title")}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <span className="text-lg">1.</span>{" "}
                        {t("result.process")}
                      </h3>
                      <div className="space-y-3">
                        {data?.process.map((item: string, index: number) => (
                          <div
                            key={`${item}-${index}`}
                            className="flex gap-4 rounded-lg border border-green-200 bg-green-50 p-4"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-semibold text-white">
                              {index + 1}
                            </div>
                            <p className="font-medium text-gray-900">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          {t("result.finalOutput")}
                        </h4>
                        <p className="text-gray-700">{data?.finalOutput}</p>
                      </div>
                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          {t("result.benefits")}
                        </h4>
                        <p className="text-gray-700">{data?.benefits}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <PackageCheck className="h-4 w-4 text-emerald-700" />
                          {t("result.requiredMaterials")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {data?.requiredMaterials?.length ? (
                            data.requiredMaterials.map((item: string) => (
                              <span
                                key={item}
                                className="rounded-full bg-white px-3 py-1 text-sm text-emerald-900 shadow-sm"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">-</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <Wrench className="h-4 w-4 text-amber-700" />
                          {t("result.requiredEquipment")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {data?.requiredEquipment?.length ? (
                            data.requiredEquipment.map((item: string) => (
                              <span
                                key={item}
                                className="rounded-full bg-white px-3 py-1 text-sm text-amber-900 shadow-sm"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">-</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                          <Clock3 className="h-4 w-4 text-cyan-700" />
                          {t("result.processDuration")}
                        </h4>
                         <div className="flex flex-wrap gap-2">
                          {data?.processDuration?.length ? (
                            data.processDuration.map((item: string) => (
                              <span
                                key={item}
                                className="rounded-full bg-white px-3 py-1 text-sm text-lime-900 shadow-sm"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">-</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-lime-200 bg-lime-50 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <ShieldCheck className="h-4 w-4 text-lime-700" />
                          {t("result.recommendedFor")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {data?.recommendedFor?.length ? (
                            data.recommendedFor.map((item: string) => (
                              <span
                                key={item}
                                className="rounded-full bg-white px-3 py-1 text-sm text-lime-900 shadow-sm"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">-</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                          <Trees className="h-4 w-4 text-teal-700" />
                          {t("result.environmentalImpact")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {data?.environmentalImpact?.length ? (
                            data.environmentalImpact.map((item: string) => (
                              <span
                                key={item}
                                className="rounded-full bg-white px-3 py-1 text-sm text-lime-900 shadow-sm"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">-</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {data?.notes && (
                      <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                        <p className="text-sm text-gray-700">{data.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 flex-1 rounded-lg border-2"
                        onClick={handleReset}
                      >
                        {t("actions.tryAnother")}
                      </Button>
                      <Button className="h-12 flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 font-semibold text-white hover:from-green-600 hover:to-emerald-700">
                        {t("actions.shareResults")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isError && (
              <Card className="mt-4 rounded-2xl border-0 border-red-200 bg-red-50 shadow-lg">
                <CardContent className="flex gap-4 p-6">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="mb-1 font-semibold text-red-900">
                      {(error as ApiError)?.status === 404
                        ? t("content.notFoundTitle")
                        : t("content.errorTitle")}
                    </h3>
                    <p className="text-sm text-red-800">
                      {(error as ApiError)?.status === 404
                        ? t("result.notFound")
                        : t("content.errorMessage")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 lg:col-span-1">
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <span className="text-lg">{t("content.tips")}</span>
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span>Earth</span>
                    <span>{t("content.tipEnvironmental")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span>Soil</span>
                    <span>{t("content.tipCompost")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span>Energy</span>
                    <span>{t("content.tipBiogas")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span>Income</span>
                    <span>{t("content.tipIncome")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-gray-900">
                  {t("content.features")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {t("content.featureGuidance")}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {t("content.featureRecommendations")}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {t("content.featureLanguages")}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {t("content.featurePractical")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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

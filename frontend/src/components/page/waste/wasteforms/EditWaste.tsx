"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Loader2, Upload, Leaf } from "lucide-react";
import { toast } from "sonner";

import { useLocale, useTranslations } from "next-intl";
import productCategoryMap from "@/../public/Products/Product.json";
import {
  wasteFormDataType,
  wasteFormSchema,
} from "@/components/types/zod/waste.zod";
import { WasteType } from "@/components/types/waste";
export default function EditWaste() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const t = useTranslations("waste");
  const c = useTranslations("wasteCommon");

  const locale = useLocale() as "en" | "mr" | "hi";

  const formdata = useForm({
    resolver: zodResolver(wasteFormSchema),
  });

  const { register, handleSubmit, reset, watch, control, formState } = formdata;
  const values = watch();

  // Local state for file/image preview
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedWasteType = watch("wasteType");
  const selectedCategory = watch("wasteCategory");

  // Load waste to edit
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function fetchWaste() {
      try {
        const res = await axios.get(`/api/waste/singlewaste/${id}`);
        if (!mounted) return;
        if (res?.data?.singleWaste) {
          const data = res.data.singleWaste;

          reset({
            ...data,
            title: "",
            description: "",
            image: data.image ?? data.image ?? "",
          });

          setTimeout(() => {
            reset({
              ...data,
              wasteCategory: data.wasteCategory,
            });
          }, 100);
          setTimeout(() => {
            reset({
              ...data,
              title: data.title[locale],
              description: data.description[locale],
              wasteProduct: data.wasteProduct,
            });
          }, 200);

          setImagePreview(data.imageUrl ?? data.image ?? null);
        } else {
          alert(t("messages.loadNotFound"));
        }
      } catch {
        alert(t("messages.loadFailed"));
      }
    }

    fetchWaste();

    return () => {
      mounted = false;
    };
  }, [id, reset, t]);

  // Handle file selection (optional replace)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setNewImageFile(f);
  };

  // Submit: upload image if newImageFile present, then PUT update
  const onSubmit = async (formValues: wasteFormDataType) => {
    if (!id) {
      alert(t("messages.missingId"));
      return;
    }

    setLoading(true);

    try {
      // If user selected a new file, upload it
      if (newImageFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(newImageFile);
        });

        toast.loading(t("messages.uploadingImage"));

        const uploadRes = await axios.post("/api/waste/upload", {
          base64,
          fileName: `waste_${id}`,
        });

        if (uploadRes?.data?.url) {
        } else {
          throw new Error("Image upload failed");
        }

        toast.dismiss();
      }

      const payload: Partial<wasteFormDataType> = {
        ...formValues,
      };

      const updateRes = await axios.put(`/api/waste/update/${id}`, payload);

      if (updateRes.status >= 200 && updateRes.status < 300) {
        toast.success(t("messages.updateSuccess"));
        router.push("/profile/farmer/my-listing");
      } else {
        toast.error(t("messages.updateFailure"));
      }
    } catch {
      toast.error(t("messages.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-green-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-600 rounded-xl shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                {t("pageTitleEdit")}
              </h1>
              <p className="text-sm text-green-700/80">
                {t("pageSubtitleEdit")}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>{t("sections.wasteDetails")}</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">{t("fields.title.label")}</Label>
                <Input
                  id="title"
                  value={watch(`title`)}
                  className="mt-2"
                  placeholder={t("fields.title.placeholder")}
                />
                {formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Type & Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wasteType">
                    {t("fields.wasteType.label")}
                  </Label>
                  <Controller
                    control={control}
                    name="wasteType"
                    render={({ field }) => (
                      <Select
                        onValueChange={(v: WasteType) => {
                          field.onChange(v);
                          formdata.setValue("wasteCategory", "");
                          formdata.setValue("wasteProduct", "");
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue
                            placeholder={t("fields.wasteType.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crop">
                            🌾 {c("wasteTypes.crop")}
                          </SelectItem>
                          <SelectItem value="fruit">
                            🍓 {c("wasteTypes.fruit")}
                          </SelectItem>
                          <SelectItem value="vegetable">
                            🥬 {c("wasteTypes.vegetable")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formState.errors.wasteType && (
                    <p className="text-sm text-red-500">
                      {formState.errors.wasteType.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="wasteCategory">
                    {t("fields.wasteCategory.label")}
                  </Label>
                  <Controller
                    control={control}
                    name="wasteCategory"
                    render={({ field }) => (
                      <Select
                        disabled={!selectedWasteType}
                        onValueChange={(v: string) => {
                          field.onChange(v);
                          formdata.setValue("wasteProduct", "");
                        }}
                        value={field.value}
                      >
                        <SelectTrigger
                          id="wasteCategory"
                          className={`mt-2 ${
                            !selectedWasteType ? "opacity-50" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              selectedWasteType
                                ? t("fields.wasteCategory.placeholder")
                                : t("fields.wasteCategory.disabledPlaceholder")
                            }
                          />
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
                    )}
                  />
                  {formState.errors.wasteCategory && (
                    <p className="text-sm text-red-500">
                      {formState.errors.wasteCategory.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Product */}
              <div>
                <Label htmlFor="wasteProduct">
                  {t("fields.wasteProduct.label")}
                </Label>
                <Controller
                  control={control}
                  name="wasteProduct"
                  render={({ field }) => (
                    <Select
                      disabled={!selectedWasteType || !selectedCategory}
                      onValueChange={(v: string) => field.onChange(v)}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="wasteProduct"
                        className={`mt-2 ${
                          !selectedWasteType ? "opacity-50" : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            selectedCategory
                              ? t("fields.wasteProduct.placeholder")
                              : t("fields.wasteProduct.disabledPlaceholder")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedWasteType &&
                          selectedCategory &&
                          (productCategoryMap as any)[selectedWasteType][
                            selectedCategory
                          ].map((prod: string) => (
                            <SelectItem key={prod} value={prod}>
                              {c(
                                `productSet.${selectedWasteType}.${selectedCategory}.${prod}`,
                              )}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formState.errors.wasteProduct && (
                  <p className="text-sm text-red-500">
                    {formState.errors.wasteProduct.message}
                  </p>
                )}
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">{t("fields.quantity.label")}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                    className="mt-2"
                    placeholder={t("fields.quantity.placeholder")}
                  />
                  {formState.errors.quantity && (
                    <p className="text-sm text-red-500">
                      {formState.errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit">{t("fields.unit.label")}</Label>
                  <Controller
                    control={control}
                    name="unit"
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => field.onChange(v)}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2" id="unit">
                          <SelectValue
                            placeholder={t("fields.unit.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">{t("unit.kg")}</SelectItem>
                          <SelectItem value="ton">{t("unit.ton")}</SelectItem>
                          <SelectItem value="gram">{t("unit.gram")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formState.errors.unit && (
                    <p className="text-sm text-red-500">
                      {formState.errors.unit.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Moisture & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moisture">{t("fields.moisture.label")}</Label>
                  <Controller
                    name="moisture"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(v: string) => field.onChange(v)}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2" id="moisture">
                          <SelectValue
                            placeholder={t("fields.moisture.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dry">
                            ☀️ {c("moisture.dry")}
                          </SelectItem>
                          <SelectItem value="semi_wet">
                            🌤️ {c("moisture.semiwet")}
                          </SelectItem>
                          <SelectItem value="wet">
                            💧 {c("moisture.wet")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formState.errors.moisture && (
                    <p className="text-sm text-red-500">
                      {formState.errors.moisture.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price">{t("fields.price.label")}</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="mt-2"
                    placeholder={t("fields.price.placeholder")}
                  />
                  {formState.errors.price && (
                    <p className="text-sm text-red-500">
                      {formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">
                  {t("fields.description.label")}
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="mt-2"
                  rows={4}
                  placeholder={t("fields.description.placeholder")}
                />
                {formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">{t("fields.image.label")}</Label>

                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="preview"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-lg border-dashed border-2 border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="mx-auto mb-2" />
                        <p className="text-sm">
                          {t("fields.image.noImageSelected")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("fields.image.helper")}
                </p>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      {t("buttons.saving")}
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-4 w-4" /> {t("buttons.save")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

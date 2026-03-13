"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api/authApi";
import { uploadImage } from "@/utils/imagekit";

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

  const fieldLabels = getFieldLabels(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const buyerId = user ? user.id : "";
  const role = user ? user.unsafeMetadata.role : "";

  const [getProfile, { data: profileData, isFetching, isLoading, isSuccess }] =
    useLazyGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

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
      form.reset({
        phone: data.phone || "",
        aadharnumber: data.aadharnumber || "",
        state: data.state || "",
        district: data.district || "",
        taluka: data.taluka || "",
        village: data.village || "",
        houseBuildingName: data.houseBuildingName || "",
        roadarealandmarkName: data.roadarealandmarkName || "",
        aadharUrl: data.aadharUrl || "",
      });

      if (data.aadharUrl) setAadharPreview(data.aadharUrl);
    }
  }, [buyerId, form, isLoading, profileData, router]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    field: { onChange: (value: string | ArrayBuffer | null) => void },
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAadharFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      field.onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadToImageKit = async (file: File, folder: string) => {
    return uploadImage(file, folder);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (aadharFile) {
        const url = await uploadToImageKit(aadharFile, "aadhar");
        form.setValue("aadharUrl", url);
        values.aadharUrl = url;
      }

      const res = await updateProfile({
        userId: buyerId,
        role: role as string,
        data: values,
      });

      if ("data" in res) {
        toast.success(t("toasts.updated"));
      } else {
        toast.error(t("toasts.updateFailed"));
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error(t("toasts.genericError"));
    }
  };

  if (!user) return <p className="text-center py-10">{t("loadingUser")}</p>;
  if (isFetching || isLoading) {
    return <p className="text-center py-10">{t("loadingBuyerData")}</p>;
  }

  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto border-gray-200 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-2xl font-bold text-blue-700">
            {t("title")}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">{t("description")}</p>
        </CardHeader>

        {isSuccess && (
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm">
                    <span className="font-semibold text-blue-700">
                      {t("buyerIdLabel")}
                    </span>{" "}
                    <span className="text-gray-700">{buyerId}</span>
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t("accountInformation")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <FormLabel className="text-gray-700">
                        {fieldLabels.firstName}
                      </FormLabel>
                      <Input
                        value={user?.firstName || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <FormLabel className="text-gray-700">
                        {fieldLabels.lastName}
                      </FormLabel>
                      <Input
                        value={user?.lastName || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <FormLabel className="text-gray-700">
                        {fieldLabels.username}
                      </FormLabel>
                      <Input
                        value={user?.username || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <FormLabel className="text-gray-700">
                        {fieldLabels.emailAddress}
                      </FormLabel>
                      <Input
                        value={user?.primaryEmailAddress?.emailAddress || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t("contactPersonalDetails")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {fieldLabels.phone}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("enterField", {
                                field: fieldLabels.phone,
                              })}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aadharnumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {fieldLabels.aadharnumber}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("enterField", {
                                field: fieldLabels.aadharnumber,
                              })}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t("addressDetails")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      "state",
                      "district",
                      "taluka",
                      "village",
                      "houseBuildingName",
                      "roadarealandmarkName",
                    ].map((key) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={key as keyof FormValues}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {fieldLabels[key]}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("enterField", {
                                  field: fieldLabels[key],
                                })}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t("document")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="aadharUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("aadharDocument")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e, setAadharPreview, field)
                              }
                            />
                          </FormControl>
                          {aadharPreview && (
                            <div className="mt-3">
                              <Image
                                src={aadharPreview}
                                alt="Aadhar preview"
                                className="rounded-lg border-2 border-gray-200 shadow-sm"
                                width={200}
                                height={120}
                              />
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold"
                  >
                    {t("saveChanges")}
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

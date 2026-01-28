import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import React, { ReactElement } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

interface Option {
  value?: string;
  name: string;
  icon?: any;
}

interface props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  option: Option[];
  classNames: string;
  isProduct: boolean;
}

export function ProcessSelectInput<T extends FieldValues>({
  control,
  label,
  name,
  disabled,
  option = [],
  classNames,
  isProduct,
}: props<T>) {
  const t = useTranslations("wasteCommon");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold text-gray-900  block">
            {label}
          </FormLabel>
          <div className={classNames}>
            {option.map((item) => (
              <Button
                type="button"
                size={null}
                variant={"outline"}
                key={item.value || item.name}
                disabled={disabled}
                onClick={() => {
                  field.onChange(item.value || item.name);
                }}
                className={`p-4 rounded-xl border-2 transition-all font-semibold text-sm flex flex-col items-center gap-2 ${
                  field.value === item.name || field.value === item.value
                    ? "border-green-500 bg-green-50 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                }`}
              >
                {item.icon && <span className="text-3xl">{item.icon}</span>}
                <span className="text-gray-900">
                  {isProduct ? t(`productSet.${item.name}`) : item.name}
                </span>
              </Button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

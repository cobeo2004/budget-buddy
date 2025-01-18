import { InferObjectShapeInArray } from "@/lib/types";

export const currencies = [
  {
    value: "USD",
    label: "$ Dollar",
    locale: "en-US",
  },
  {
    value: "EUR",
    label: "€ Euro",
    locale: "de-DE",
  },
  {
    value: "GBP",
    label: "£ Pound",
    locale: "en-GB",
  },
  {
    value: "CAD",
    label: "$ Canadian Dollar",
    locale: "en-CA",
  },
  {
    value: "AUD",
    label: "$ Australian Dollar",
    locale: "en-AU",
  },
  {
    value: "JPY",
    label: "¥ Japanese Yen",
    locale: "ja-JP",
  },
  {
    value: "CHF",
    label: "₣ Swiss Franc",
    locale: "de-CH",
  },
  {
    value: "CNY",
    label: "¥ Chinese Yuan",
    locale: "zh-CN",
  },
  {
    value: "VND",
    label: "₫ Vietnamese Dong",
    locale: "vi-VN",
  },
];

export type Currency = InferObjectShapeInArray<typeof currencies>;

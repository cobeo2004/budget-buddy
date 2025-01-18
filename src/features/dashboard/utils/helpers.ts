import { currencies } from "@/features/wizard/utils/currencies";

export const DateToUTCDate = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  );

export const GetFormatterForCurrency = (currency: string) => {
  const locale = currencies.find((c) => c.value === currency)?.locale;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  });
};

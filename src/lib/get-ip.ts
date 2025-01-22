import "server-only";
import { headers } from "next/headers";

export const getIp = async () => {
  const forwadedFor = (await headers()).get("x-forwarded-for");
  const realIp = String((await headers()).get("x-real-ip"));

  if (forwadedFor) {
    return forwadedFor.split(",")[0]!.trim();
  }
  if (realIp) {
    return realIp.trim();
  }

  return null;
};

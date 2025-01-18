import { getCookie } from "@/lib/cookies";
import { useEffect, useState } from "react";

export const useGetCookie = () => {
  const [cookie, setCookie] = useState<string | null>(null);
  useEffect(() => {
    getCookie("authjs.session-token").then((cookie) =>
      setCookie(cookie || null),
    );
  }, []);
  return cookie;
};

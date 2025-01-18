"use client";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type AuthLayoutProps = {
  children: React.ReactNode;
};

function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isSignUp = pathname === "/sign-up";
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;

  return (
    <main
      className={cn(
        "min-h-screen",
        theme === "dark" ? "bg-blue-" : "bg-neutral-100",
      )}
    >
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="secondary" asChild>
              <Link href={isSignUp ? "/sign-in" : "/sign-up"}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Link>
            </Button>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
          {children}
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;

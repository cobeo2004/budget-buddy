"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavbarItemProps = {
  label: string;
  href: string;
  onClick?: VoidFunction;
};

function NavbarItem({ label, href, onClick }: NavbarItemProps) {
  const pathName = usePathname();
  const isActive = pathName === href;
  return (
    <div className="relative flex items-center">
      <Link
        href={href}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start text-start text-muted-foreground hover:text-foreground",
          isActive && "text-foreground",
        )}
      >
        {label}
      </Link>
      {isActive && (
        <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block" />
      )}
    </div>
  );
}

export default NavbarItem;

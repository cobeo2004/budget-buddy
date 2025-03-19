"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import React, { useState } from "react";
import NavbarItem from "./NavbarItem";
import { navItems } from "../utils/navItems";
import { ThemeSwitcher } from "@/features/ui-extensions/components/ThemeSwitcher";
import { UserButton } from "@/features/auth/components/UserButton";
import Logo from "@/components/logo";

function MobileNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="block border-separate bg-background md:hidden">
      <nav className="container flex items-center justify-between px-8">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]" side="left">
            <Logo />
            <div className="flex flex-col gap-1 pt-4">
              {navItems.map((val) => (
                <NavbarItem
                  key={val.label}
                  label={val.label}
                  href={val.href}
                  onClick={() => setIsOpen((prev) => !prev)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserButton />
        </div>
      </nav>
    </div>
  );
}

export default MobileNavBar;

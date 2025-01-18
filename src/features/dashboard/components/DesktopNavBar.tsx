import React from "react";
import { navItems } from "../utils/navItems";
import NavbarItem from "./NavbarItem";
import { ThemeSwitcher } from "@/features/ui-extensions/components/ThemeSwitcher";
import { UserButton } from "@/features/auth/components/UserButton";
import Logo from "@/components/logo";

function DesktopNavBar() {
  return (
    <div className="hidden border-separate border-b bg-background md:block">
      <nav className="container flex items-center justify-between px-4">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          {/* <Link href="/dashboard">
            <Image src="/logo.svg" alt="logo" width={150} height={150} />
          </Link> */}
          <Logo />
          <div className="flex h-full">
            {navItems.map((item) => (
              <NavbarItem
                key={item.label}
                label={item.label}
                href={item.href}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserButton />
        </div>
      </nav>
    </div>
  );
}

export default DesktopNavBar;

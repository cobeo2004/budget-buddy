"use client";

import * as React from "react";
import { LogOut, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { getInitials } from "../utils/getInitials";
import { signOut } from "next-auth/react";
import { useState } from "react";
import EditUserModal from "./EditUserModal";
export function UserButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({
      redirectTo: "/sign-in",
    });
  };

  const handleOpenEditUserModal = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image ?? ""} alt="@username" />
              <AvatarFallback>
                {getInitials(session?.user?.name ?? "")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32" align="end" forceMount>
          <DropdownMenuLabel>
            <span className="text-sm font-medium">{session?.user?.name}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleOpenEditUserModal}
          >
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit user</span>
          </DropdownMenuItem>
          {process.env.NODE_ENV !== "production" && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">Log out</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <EditUserModal isOpen={isOpen} onClose={handleOpenEditUserModal} />
    </>
  );
}

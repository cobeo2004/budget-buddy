"use client";

import React from "react";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NotificationButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-h-[400px] w-[300px] overflow-y-auto"
        align="end"
      >
        <div className="flex items-center justify-between">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground"
            onClick={() => {
              // Add clear notifications logic here
              console.log("Clear all notifications");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Notification 1</DropdownMenuItem>
        <DropdownMenuItem>Notification 2</DropdownMenuItem>
        <DropdownMenuItem>Notification 3</DropdownMenuItem>
        <DropdownMenuItem>Notification 4</DropdownMenuItem>
        <DropdownMenuItem>Notification 5</DropdownMenuItem>
        <DropdownMenuItem>Notification 6</DropdownMenuItem>
        <DropdownMenuItem>Notification 7</DropdownMenuItem>
        <DropdownMenuItem>Notification 8</DropdownMenuItem>
        <DropdownMenuItem>Notification 9</DropdownMenuItem>
        <DropdownMenuItem>Notification 10</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationButton;

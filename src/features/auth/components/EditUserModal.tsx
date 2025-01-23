"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UpdateUserSchema, updateUserSchema } from "../utils/schema";
import { useRouter } from "next/navigation";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function EditUserModal({ isOpen, onClose }: EditUserModalProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
    values: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  const { mutate: updateUser } = api.auth.updateUser.useMutation({
    onMutate: () => {
      toast.loading("Updating user...");
    },
    onSuccess: async () => {
      router.refresh();
      toast.dismiss();
      toast.success("User updated successfully");

      onClose();
    },
    onError: () => {
      toast.dismiss();
      toast.error("Failed to update user");
    },
    onSettled: () => {
      toast.dismiss();
    },
  });

  const onSubmit = (data: UpdateUserSchema) => {
    updateUser(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter your name"
              defaultValue={session?.user?.name ?? ""}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter your email"
              defaultValue={session?.user?.email ?? ""}
              disabled
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserModal;

"use client";

import {
  AlertDialogContent,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { type TransactionType } from "@/features/dashboard/utils/types";
import { api } from "@/trpc/react";
import { type Category } from "@prisma/client";
import {
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import React from "react";
import { toast } from "sonner";

type DeleteCateogoryDialog = {
  trigger: React.ReactNode;
  category: Category;
};

function DeleteCategoryDialog({ trigger, category }: DeleteCateogoryDialog) {
  const utils = api.useUtils();
  const { mutateAsync } = api.categories.deleteCategory.useMutation({
    onMutate: () => {
      toast.loading("Deleting category...");
    },
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Category deleted successfully 🥂");
      await utils.categories.invalidate();
    },
    onError: () => {
      toast.dismiss();
      toast.error("Oops! Something went wrong ❗");
    },
    onSettled: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.dismiss();
    },
  });

  const handleDelete = async () => {
    await mutateAsync({
      name: category.name,
      type: category.type as TransactionType,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            category.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCategoryDialog;

import { type FunctionWithArgs } from "@/lib/functions";
import React from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteTransactionDialogProps = {
  open: boolean;
  setOpen: FunctionWithArgs<[boolean], void>;
  transactionId: string;
};

function DeleteTransactionDialog({
  open,
  setOpen,
  transactionId,
}: DeleteTransactionDialogProps) {
  const utils = api.useUtils();
  const { mutateAsync } = api.transactions.deleteTransaction.useMutation({
    onMutate: () => {
      toast.loading("Deleting transaction...");
    },
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Transaction deleted successfully 🥂");
      await utils.transactions.invalidate();
      await utils.stats.invalidate();
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
      id: transactionId,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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

export default DeleteTransactionDialog;

"use client";

import { useForm } from "react-hook-form";
import { type TransactionType } from "../utils/types";
import {
  createCategorySchema,
  type CreateCategorySchema,
} from "../utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import IconPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { type Category } from "@prisma/client";
import { useTheme } from "next-themes";

interface CreateCategoryDialogProps {
  type: TransactionType;
  onSuccess: (data: Category) => void;
  trigger?: React.ReactNode;
}

export function CreateCategoryDialog({
  type,
  onSuccess,
  trigger,
}: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type,
      icon: "",
      name: "",
    },
  });
  const utils = api.useUtils();
  const { resolvedTheme } = useTheme();
  const { mutateAsync, isPending } = api.categories.createCategory.useMutation({
    onMutate: () => {
      toast.loading("Creating category...");
    },
    onError: () => {
      toast.dismiss();
      toast.error("Failed to create category 😢");
    },
    onSuccess: async (data) => {
      await utils.categories.getCategories.invalidate();
      form.reset();
      toast.dismiss();
      toast.success("Category created 🎉");
      onSuccess(data);
      setOpen((prev) => !prev);
    },
    onSettled: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.dismiss();
    },
  });

  const handleSubmit = async (data: CreateCategorySchema) => {
    await mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Create new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create{""}
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {type}
            </span>
            {""}
            category
          </DialogTitle>
          <DialogDescription>
            Categories help you organize your transactions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-8"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>The name of your category</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-[100px] w-full">
                          {form.watch("icon") ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-5xl" role="img">
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOff className="h-[48px] w-[48px]" />
                              <p className="text-xs text-muted-foreground">
                                Select an icon
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full">
                        <IconPicker
                          data={data}
                          onEmojiSelect={(emoji: { native: string }) =>
                            field.onChange(emoji.native)
                          }
                          theme={resolvedTheme}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    This is how your category will be displayed in the
                    dashboard.
                  </FormDescription>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

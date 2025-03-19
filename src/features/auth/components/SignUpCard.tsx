"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DottedSeparator } from "@/features/ui-extensions/components/DottedSeparator";
import React, { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type SignUpSchema, signUpSchema } from "../utils/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function SignUpCard() {
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { mutateAsync: signUp, isPending } = api.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success("Sign up successful");
      router.push("/sign-in");
    },
    onError: (error) => {
      setSignUpError(error.message);
    },
    onSettled: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.dismiss();
      setSignUpError(null);
    },
  });

  const onSubmit = async (data: SignUpSchema) => {
    await signUp(data);
  };

  return (
    <Card
      className={cn(
        "h-full w-full border-none shadow-none md:w-[487px]",
        theme === "dark" ? "bg-gray-900" : "bg-white",
      )}
    >
      <CardHeader className="flex items-center justify-center p-7 text-center">
        <CardTitle className={cn(theme !== "dark" ? "text-background" : "")}>
          Sign Up To{" "}
          <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text font-bold text-transparent">
            BudgetBuddy
          </span>
        </CardTitle>
        <CardDescription>
          By signing up, you agree to our{" "}
          <Link href="/privacy">
            <span className="font-bold text-blue-500">Privacy Policy</span>
          </Link>{" "}
          and{" "}
          <Link href="/terms">
            <span className="font-bold text-blue-500">Terms of Service</span>
          </Link>
        </CardDescription>
      </CardHeader>
      <div className="mb-2 px-7">
        <DottedSeparator color={theme === "dark" ? "#fff" : undefined} />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="text-background"
                      type="text"
                      placeholder="Enter your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      className="text-background"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      className="text-background"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button size="lg" className="w-full" disabled={isPending}>
              <p className="text-foreground">
                {isPending ? "Signing up..." : "Sign Up"}
              </p>
            </Button>
            {signUpError && (
              <p className="text-center text-sm text-red-500">{signUpError}</p>
            )}
          </form>
        </Form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="flex items-center justify-center p-7">
        <p
          className={cn(
            "text-center text-sm",
            theme !== "dark" ? "text-background" : "",
          )}
        >
          Already have an account or sign-up via social media?{" "}
          <Link href="/sign-in" className="text-blue-500">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default SignUpCard;

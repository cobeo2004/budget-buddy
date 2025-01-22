"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";
import { DottedSeparator } from "@/features/ui-extensions/components/DottedSeparator";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { type SignInSchema, signInSchema } from "../utils/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function SignInCard() {
  const [signInError, setSignInError] = useState<string | null>(null);
  const { theme } = useTheme();

  const router = useRouter();
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchema) => {
    console.log(data);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setSignInError("User or password is incorrect");
      return;
    } else {
      router.push("/");
    }
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
          Sign In To{" "}
          <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text font-bold text-transparent">
            BudgetBuddy
          </span>
        </CardTitle>
      </CardHeader>
      <div className="mb-2 px-7">
        <DottedSeparator color={theme === "dark" ? "#fff" : undefined} />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
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
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button size="lg" className="w-full">
              Login
            </Button>
            {signInError && (
              <p className="text-center text-sm text-red-500">{signInError}</p>
            )}
          </form>
        </Form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator color={theme === "dark" ? "#fff" : undefined} />
      </div>
      <CardContent className="flex flex-col gap-4 p-7">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => signIn("google")}
        >
          <FcGoogle className="mr-2 size-5" />
          Login with Google
        </Button>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => signIn("discord")}
        >
          <FaDiscord className="mr-2 size-5" />
          Login with Discord
        </Button>
      </CardContent>
      <div className="px-7">
        <DottedSeparator color={theme === "dark" ? "#fff" : undefined} />
      </div>
      <CardContent className="flex items-center justify-center p-7">
        <p className={cn(theme !== "dark" ? "text-background" : "")}>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-blue-500">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default SignInCard;

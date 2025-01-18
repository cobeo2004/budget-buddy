import SignInCard from "@/features/auth/components/SignInCard";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

async function SignInPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInCard />
    </Suspense>
  );
}

export default SignInPage;

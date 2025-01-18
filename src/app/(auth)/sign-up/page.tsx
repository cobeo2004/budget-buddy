import SignUpCard from "@/features/auth/components/SignUpCard";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

async function SignUpPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpCard />
    </Suspense>
  );
}

export default SignUpPage;

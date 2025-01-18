import { Separator } from "@/components/ui/separator";
import CardWithCombobox from "@/features/wizard/components/CardWithCombobox";
import { auth } from "@/server/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

async function WizardPage() {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user && !session.user.isNewUser) {
    redirect("/");
  }
  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
      <div>
        <h1 className="text-center text-3xl">
          Welcome,<span className="ml-2 font-bold">{session.user.name} 👋</span>
        </h1>
        <h2 className="mt-4 text-center text-base text-muted-foreground">
          Let&apos;s get started by setting up your currency
        </h2>
        <h3 className="mt-2 text-center text-sm text-muted-foreground">
          You can change these settings later in the settings page
        </h3>
      </div>
      <Separator />
      <CardWithCombobox />
      <div className="mt-8">
        <Image
          src="/logo.svg"
          alt="wizard"
          width={300}
          height={300}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}

export default WizardPage;

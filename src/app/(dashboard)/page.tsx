import { Button } from "@/components/ui/button";
import { CreateTransactionDialog } from "@/features/dashboard/components/CreateTransactionDialog";
import Overview from "@/features/dashboard/components/Overview";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import History from "@/features/dashboard/components/History";
import React from "react";

async function MainPage() {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user && session.user.isNewUser) {
    redirect("/wizard");
  }

  const userSettings = await api.user.getUserSettings();
  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-6 py-8 md:justify-between">
          <p className="px-2 text-3xl font-bold">
            Hello, {session.user.name}! 👋
          </p>
          <div className="flex items-center gap-3">
            <CreateTransactionDialog
              triggerer={
                <Button
                  variant="outline"
                  className="border-emerald-500 bg-emerald-950 text-white hover:text-white"
                >
                  New income 💸
                </Button>
              }
              type="income"
            />
            <CreateTransactionDialog
              triggerer={
                <Button
                  variant="outline"
                  className="border-rose-500 bg-rose-950 text-white hover:text-white"
                >
                  New expense 💰
                </Button>
              }
              type="expense"
            />
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings} />
      <History userSettings={userSettings} />
    </div>
  );
}

export default MainPage;

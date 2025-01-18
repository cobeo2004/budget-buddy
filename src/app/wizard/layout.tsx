import { type Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "BudgetBuddy",
  description: "BudgetBuddy is a simple and easy-to-use budget tracker.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}

export default WizardLayout;

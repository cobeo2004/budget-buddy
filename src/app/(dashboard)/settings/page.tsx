import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CategoryList from "@/features/settings/components/CategoryList";
import { CurrencyComboBox } from "@/features/wizard/components/CurrencyComboBox";
import React from "react";

function SettingsPage() {
  return (
    <>
      <div className="border-b bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-6 py-8 md:justify-between">
          <div className="flex flex-col text-center md:text-left">
            <p className="text-3xl font-bold">Settings</p>
            <p className="text-muted-foreground">
              Manage your account settings
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Manage the currency you want to use for your transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  );
}

export default SettingsPage;

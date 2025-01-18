"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CurrencyComboBox } from "./CurrencyComboBox";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

function CardWithCombobox() {
  const utils = api.useUtils();
  const router = useRouter();
  const setUserSettingsDone = api.user.setUserSettingsDone.useMutation({
    onSuccess: async () => {
      await utils.user.getUserSettings.invalidate();
      router.refresh();
      router.push("/");
    },
  });

  const handleDoneWithWizard = () => {
    setUserSettingsDone.mutate();
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Set your default currency for transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>
      <Separator />
      <Button className="w-full" asChild onClick={handleDoneWithWizard}>
        <p>I&apos;m done! Get me to the dashboard</p>
      </Button>
    </>
  );
}

export default CardWithCombobox;

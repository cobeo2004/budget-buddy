"use client";

import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { currencies, type Currency } from "../utils/currencies";
import { api } from "@/trpc/react";
import { SkeletonWrapper } from "@/features/ui-extensions/components/SkeletonWrapper";
import { toast } from "sonner";

export function CurrencyComboBox() {
  const utils = api.useUtils();
  const { data: userSettings, isLoading: isUserSettingsLoading } =
    api.user.getUserSettings.useQuery();

  const updateUserSettings = api.user.updateUserSettings.useMutation({
    onMutate: () => {
      toast.loading("Updating currency...");
    },
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Currency updated");
      await utils.user.getUserSettings.invalidate();
    },
    onError: () => {
      toast.dismiss();
      toast.error("Failed to update currency");
    },
    onSettled: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.dismiss();
    },
  });

  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedCurrency, setSelectedCurrency] =
    React.useState<Currency | null>(null);

  React.useEffect(() => {
    if (!userSettings) return;
    const currency = currencies.find(
      (currency) => currency.value === userSettings.currency,
    );
    if (currency) {
      setSelectedCurrency(currency);
    }
  }, [userSettings]);

  const handleUpdateCurrency = (currency: Currency | null) => {
    if (!userSettings || !currency) {
      toast.error("Failed to update currency");
      return;
    }

    updateUserSettings.mutate({
      id: userSettings?.id,
      currency: currency.value,
    });
  };

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={isUserSettingsLoading}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] justify-start"
              disabled={updateUserSettings.isPending}
            >
              {selectedCurrency ? (
                <>{selectedCurrency.label}</>
              ) : (
                <>+ Set currency</>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <CurrencyList
              setOpen={setOpen}
              setSelectedCurrency={handleUpdateCurrency}
            />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    );
  }

  return (
    <SkeletonWrapper isLoading={isUserSettingsLoading}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-[150px] justify-start"
            disabled={updateUserSettings.isPending}
          >
            {selectedCurrency ? (
              <>{selectedCurrency.label}</>
            ) : (
              <>+ Set currency</>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <CurrencyList
              setOpen={setOpen}
              setSelectedCurrency={handleUpdateCurrency}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

function CurrencyList({
  setOpen,
  setSelectedCurrency,
}: {
  setOpen: (open: boolean) => void;
  setSelectedCurrency: (currency: Currency | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {currencies.map((currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedCurrency(
                  currencies.find((currency) => currency.value === value) ??
                    null,
                );
                setOpen(false);
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

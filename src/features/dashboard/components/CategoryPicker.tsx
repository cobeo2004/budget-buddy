/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { api } from "@/trpc/react";
import { type TransactionType } from "../utils/types";
import { useEffect, useState } from "react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CategoryRow } from "./CategoryRow";
import { PopoverContent } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Category } from "@prisma/client";

interface CategoryPickerProps {
  type: TransactionType;
  onChange: (value: string) => void;
}
export const CategoryPicker = ({ type, onChange }: CategoryPickerProps) => {
  const { data: categories } = api.categories.getCategories.useQuery({ type });
  const [value, setValue] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value) return;
    onChange(value);
  }, [value, onChange]);

  const selectedCategory = categories?.find(
    (category) => category.name === value,
  );

  const onSuccess = (data: Category) => {
    setValue(data.name);
    setOpen((prev) => !prev);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCategory ? (
            <CategoryRow category={selectedCategory} />
          ) : (
            "Select a category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command onSubmit={(e) => e.preventDefault()}>
          <CommandInput placeholder="Search category..." />
          <CreateCategoryDialog type={type} onSuccess={onSuccess} />
          <CommandEmpty>
            <p>No categories found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Click the create button to create a new category
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {categories &&
                categories?.map((category: Category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      setValue(category.name);
                      setOpen((prev) => !prev);
                    }}
                  >
                    <CategoryRow category={category} />
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 opacity-0",
                        value === category.name && "opacity-100",
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreateCategoryDialog } from "@/features/dashboard/components/CreateCategoryDialog";
import { type TransactionType } from "@/features/dashboard/utils/types";
import { SkeletonWrapper } from "@/features/ui-extensions/components/SkeletonWrapper";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { PlusSquare, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import CategoryCard from "./CategoryCard";

type CategoryListProps = {
  type: TransactionType;
};

function CategoryList({ type }: CategoryListProps) {
  const { isLoading, data, refetch } = api.categories.getCategories.useQuery({
    type,
  });
  const isDataAvailable = data && data.length > 0;

  return (
    <SkeletonWrapper isLoading={isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {type === "expense" ? (
                <TrendingDown className="h-12 w-12 rounded-lg bg-rose-400/10 p-2 text-rose-500" />
              ) : (
                <TrendingUp className="h-12 w-12 rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
              )}
              <div>
                {type === "expense" ? "Expenses" : "Incomes"} categories
                <div className="text-sm text-muted-foreground">
                  Sorted by name
                </div>
              </div>
            </div>
            <CreateCategoryDialog
              type={type}
              onSuccess={() => refetch()}
              trigger={
                <Button className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4" />
                  Create category
                </Button>
              }
            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {!isDataAvailable && (
          <div className="flex h-40 w-full flex-col items-center justify-center">
            <p>
              No{" "}
              <span
                className={cn(
                  "m-1",
                  type === "expense" ? "text-rose-500" : "text-emerald-500",
                )}
              >
                {type}
              </span>{" "}
              categories found yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create your first category to get started
            </p>
          </div>
        )}
        {isDataAvailable && (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((category) => (
              <CategoryCard category={category} key={category.name} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

export default CategoryList;

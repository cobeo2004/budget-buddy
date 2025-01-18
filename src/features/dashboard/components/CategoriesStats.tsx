"use client";

import React, { useMemo } from "react";
import { type UserSettings } from "@prisma/client";
import { api, type RouterOutputs } from "@/trpc/react";
import { DateToUTCDate, GetFormatterForCurrency } from "../utils/helpers";
import { SkeletonWrapper } from "@/features/ui-extensions/components/SkeletonWrapper";
import { type TransactionType } from "../utils/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface CategoriesStatsProps {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

export default function CategoriesStats({
  userSettings,
  from,
  to,
}: CategoriesStatsProps) {
  const { isFetching, data } = api.stats.getCategoriesStats.useQuery({
    from: DateToUTCDate(from),
    to: DateToUTCDate(to),
  });
  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={isFetching}>
        <CategoriesCard formatter={formatter} type="income" data={data ?? []} />
        <CategoriesCard
          formatter={formatter}
          type="expense"
          data={data ?? []}
        />
      </SkeletonWrapper>
    </div>
  );
}

function CategoriesCard({
  formatter,
  type,
  data,
}: {
  formatter: Intl.NumberFormat;
  type: TransactionType;
  data: RouterOutputs["stats"]["getCategoriesStats"];
}) {
  const filteredData = data.filter((item) => item.type === type);
  const total = filteredData.reduce(
    (acc, el) => acc + (el._sum.amount ?? 0),
    0,
  );
  return (
    <Card className="h-80 w-full">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
          <p className="text-xl text-muted-foreground">
            {type === "income" ? "Incomes" : "Expenses"} by category
          </p>
        </CardTitle>
      </CardHeader>
      <div className="flex items-center justify-between gap-2">
        {filteredData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for the selected period
            <p className="text-sm text-muted-foreground">
              Try selecting a different period or try adding new{" "}
              {type === "income" ? "incomes" : "expenses"}
            </p>
          </div>
        )}
        {filteredData.length > 0 && (
          <ScrollArea className="h-60 w-full p-4">
            <div className="flex w-full flex-col gap-4 p-4">
              {filteredData.map((item) => {
                const amount = item._sum.amount ?? 0;
                const percentage = (amount * 100) / (total ?? amount);
                return (
                  <div key={item.category} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-muted-foreground">
                        {item.categoryIcon} {item.category}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatter.format(amount)}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      indicator={
                        type === "income" ? "bg-emerald-600" : "bg-red-600"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}

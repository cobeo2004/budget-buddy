"use client";

import { type UserSettings } from "@prisma/client";
import React, { useMemo, useState } from "react";
import { type Period, type TimeFrame } from "../utils/types";
import { GetFormatterForCurrency } from "../utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { api, RouterOutputs } from "@/trpc/react";
import { SkeletonWrapper } from "@/features/ui-extensions/components/SkeletonWrapper";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";
import { InfoIcon } from "lucide-react";
interface HistoryProps {
  userSettings: UserSettings;
}

function History({ userSettings }: HistoryProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [period, setPeriod] = useState<Period>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const formatter = useMemo(
    () => GetFormatterForCurrency(userSettings.currency),
    [userSettings.currency],
  );

  const { data: historyData, isFetching } = api.stats.getHistoryData.useQuery({
    year: period.year,
    month: period.month,
    timeFrame,
  });

  const isDataExists = historyData && historyData.length > 0;

  return (
    <div className="container mx-auto">
      <h2 className="ml-4 mt-12 text-3xl font-bold">History</h2>
      <Card className="col-span-12 mt-2 w-full">
        <CardHeader className="gap-2">
          <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
            <HistoryPeriodSelector
              period={period}
              setPeriod={setPeriod}
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
            />
            <div className="flex h-10 gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                Income
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-4 w-4 rounded-full bg-rose-500"></div>
                Expense
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonWrapper isLoading={isFetching}>
            {isDataExists && (
              <ResponsiveContainer width={"100%"} height={300}>
                <BarChart data={historyData} barCategoryGap={5} height={300}>
                  <defs>
                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ef4444" stopOpacity="1" />
                      <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="5 5"
                    strokeOpacity="0.2"
                    vertical={false}
                  />
                  <XAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 5, right: 5 }}
                    dataKey={(data) => {
                      const { year, month, day } =
                        data as (typeof historyData)[0];
                      const date = new Date(year, month, day ?? 1);
                      if (timeFrame === "year")
                        return date.toLocaleDateString("default", {
                          month: "long",
                        });
                      return date.toLocaleDateString("default", {
                        day: "2-digit",
                      });
                    }}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey="income"
                    fill="url(#incomeBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                  <Bar
                    dataKey="expense"
                    fill="url(#expenseBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    content={(props) => (
                      <CustomTooltips
                        // @ts-expect-error recharts types are not up to date
                        formatter={formatter}
                        timeFrame={timeFrame}
                        {...props}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            {!isDataExists && (
              <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                <InfoIcon className="h-18 w-18 text-muted-foreground" />
                No data for the selected period
                <p className="text-center text-sm text-muted-foreground">
                  Try selecting a different period or creating a new transaction
                </p>
              </Card>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomTooltips<T extends number, S extends string>({
  active,
  payload,
  formatter,
  timeFrame,
}: TooltipProps<T, S> & {
  formatter: Intl.NumberFormat;
  timeFrame: TimeFrame;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload as { expense: number; income: number };
  const { expense, income } = data;
  return (
    <div className="min-w-[330px] rounded border bg-background p-4">
      <TooltipRow
        label="Expense"
        value={expense}
        bgColor="bg-rose-500"
        textColor="text-rose-500"
        formatter={formatter}
      />
      <TooltipRow
        label="Income"
        value={income}
        bgColor="bg-emerald-500"
        textColor="text-emerald-500"
        formatter={formatter}
      />
      {timeFrame === "year" && (
        <TooltipRow
          label="Balance"
          value={income - expense}
          bgColor="bg-blue-500"
          textColor="text-blue-500"
          formatter={formatter}
        />
      )}
    </div>
  );
}

function TooltipRow({
  label,
  value,
  bgColor,
  textColor,
  formatter,
}: {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
  formatter: Intl.NumberFormat;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-full", bgColor)}></div>
      <div className="flex w-full justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-bold", textColor)}>
          <CountUp
            duration={0.5}
            end={value}
            preserveValue
            decimals={0}
            formattingFn={(v) => formatter.format(v)}
            className="text-sm"
          />
        </p>
      </div>
    </div>
  );
}
export default History;

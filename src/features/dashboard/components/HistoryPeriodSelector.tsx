"use client";

import React from "react";
import { type TimeFrame } from "../utils/types";
import { type Period } from "../utils/types";
import { api, type RouterOutputs } from "@/trpc/react";
import { SkeletonWrapper } from "@/features/ui-extensions/components/SkeletonWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryPeriodSelectorProps {
  period: Period;
  setPeriod: (period: Period) => void;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

function HistoryPeriodSelector({
  period,
  setPeriod,
  timeFrame,
  setTimeFrame,
}: HistoryPeriodSelectorProps) {
  const { data: years, isFetching } = api.stats.getHistoryPeriods.useQuery();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={isFetching} fullWidth={false}>
        <Tabs
          value={timeFrame}
          onValueChange={(e) => setTimeFrame(e as TimeFrame)}
        >
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>

      <div className="flex flex-wrap items-center gap-2">
        <SkeletonWrapper isLoading={isFetching} fullWidth={false}>
          <YearSelector
            period={period}
            setPeriod={setPeriod}
            years={years ?? []}
          />
        </SkeletonWrapper>
        {timeFrame === "month" && (
          <SkeletonWrapper isLoading={isFetching} fullWidth={false}>
            <MonthSelector period={period} setPeriod={setPeriod} />
          </SkeletonWrapper>
        )}
      </div>
    </div>
  );
}

export default HistoryPeriodSelector;

interface YearSelectorProps {
  period: Period;
  setPeriod: (period: Period) => void;
  years: RouterOutputs["stats"]["getHistoryPeriods"];
}

function YearSelector({ period, setPeriod, years }: YearSelectorProps) {
  return (
    <Select
      value={period.year.toString()}
      onValueChange={(value) =>
        setPeriod({ month: period.month, year: parseInt(value) })
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface MonthSelectorProps {
  period: Period;
  setPeriod: (period: Period) => void;
}

function MonthSelector({ period, setPeriod }: MonthSelectorProps) {
  return (
    <Select
      value={period.month.toString()}
      onValueChange={(value) =>
        setPeriod({ month: parseInt(value), year: period.year })
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
          const monthStr = new Date(period.year, month, 1).toLocaleString(
            "default",
            { month: "long" },
          );
          return (
            <SelectItem key={month} value={month.toString()}>
              {monthStr}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

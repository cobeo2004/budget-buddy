import { api } from "@/trpc/react";
import { type UserSettings } from "@prisma/client";
import React, { useMemo } from "react";
import { DateToUTCDate, GetFormatterForCurrency } from "../utils/helpers";
import { SkeletonWrapper } from "@/features/ui-extensions/components/SkeletonWrapper";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import CountUp from "react-countup";

interface StatsCardsProps {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

function StatsCards({ userSettings, from, to }: StatsCardsProps) {
  const { data: statsQuery, isLoading } = api.stats.getOverview.useQuery({
    from: DateToUTCDate(from),
    to: DateToUTCDate(to),
  });
  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const income = statsQuery?.income ?? 0;
  const expense = statsQuery?.expenses ?? 0;

  const balance = income - expense;

  return (
    <div className="relative flex w-full flex-wrap gap-4 md:flex-nowrap">
      <SkeletonWrapper isLoading={isLoading}>
        <StatCard
          formatter={formatter}
          value={income}
          title="Income"
          icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
          }
        />
        <StatCard
          formatter={formatter}
          value={expense}
          title="Expenses"
          icon={
            <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
          }
        />
        <StatCard
          formatter={formatter}
          value={balance}
          title="Balance"
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg bg-blue-400/10 p-2 text-blue-500" />
          }
        />
      </SkeletonWrapper>
    </div>
  );
}

const StatCard = ({
  formatter,
  value,
  title,
  icon,
}: {
  formatter: Intl.NumberFormat;
  value: number;
  title: string;
  icon: React.ReactNode;
}) => {
  const formatFn = (value: number) => {
    return formatter.format(value);
  };

  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      {icon}
      <div className="flex flex-col items-start gap-0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl"
        />
      </div>
    </Card>
  );
};

export default StatsCards;

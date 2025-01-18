"use client";

import { MAX_DATE_RANGE_DAYS } from "@/features/dashboard/utils/constants";
import { DateRangePicker } from "@/features/ui-extensions/components/DateRangePicker";
import { differenceInDays } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import { startOfMonth } from "date-fns";
import TranasctionTable from "@/features/transactions/components/TranasctionTable";
function TransactionsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <>
      <div className="border-b bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-6 py-8 md:justify-between">
          <div>
            <p className="text-3xl font-bold">Transactions history</p>
          </div>
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values) => {
              const { from, to } = values.range;
              if (!from || !to) return;
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                toast.error(
                  `Day range is too long, the max allowed date range is ${MAX_DATE_RANGE_DAYS} days`,
                );
                return;
              }
              setDateRange({ from, to });
            }}
          />
        </div>
      </div>

      <div className="container mx-auto">
        <TranasctionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </>
  );
}

export default TransactionsPage;

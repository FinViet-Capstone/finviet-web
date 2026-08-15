"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { edgeAwareTick } from "./edge-aware-tick";
import { toChartPoints } from "./chart-data";
import type { DailyMetric } from "@/types/overview";

interface TransactionsChartProps {
  data: DailyMetric[];
}

export function TransactionsChart({ data }: TransactionsChartProps) {
  const points = toChartPoints(data);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={edgeAwareTick(points.length)}
          interval={0}
        />
        <Tooltip
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ""}
          formatter={(value) => [String(value), "Giao dịch"] as [string, string]}
          contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
        />
        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

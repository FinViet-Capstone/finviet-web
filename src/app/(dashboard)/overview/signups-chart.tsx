"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { edgeAwareTick } from "./edge-aware-tick";
import { toChartPoints } from "./chart-data";
import type { DailyMetric } from "@/types/overview";

interface SignupsChartProps {
  data: DailyMetric[];
}

export function SignupsChart({ data }: SignupsChartProps) {
  const points = toChartPoints(data);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={edgeAwareTick(points.length)}
          interval={0}
        />
        <Tooltip
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ""}
          formatter={(value) => [String(value), "Người dùng mới"] as [string, string]}
          contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#signupsFill)"
          dot={{ r: 3, stroke: "#2563eb", strokeWidth: 2, fill: "#ffffff" }}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

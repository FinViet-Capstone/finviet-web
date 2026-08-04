"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const data = [
  { week: "9 tuần trước", value: 410 },
  { week: "", value: 540 },
  { week: "", value: 500 },
  { week: "", value: 620 },
  { week: "", value: 640 },
  { week: "", value: 690 },
  { week: "", value: 660 },
  { week: "", value: 760 },
  { week: "", value: 790 },
  { week: "Tuần này", value: 842 },
];

export function SignupsChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          interval={0}
        />
        <Tooltip
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

"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const data = [
  { week: "16 tuần trước", value: 90 },
  { week: "", value: 140 },
  { week: "", value: 110 },
  { week: "", value: 190 },
  { week: "", value: 160 },
  { week: "", value: 210 },
  { week: "", value: 175 },
  { week: "", value: 260 },
  { week: "", value: 230 },
  { week: "", value: 300 },
  { week: "", value: 250 },
  { week: "", value: 340 },
  { week: "", value: 300 },
  { week: "", value: 380 },
  { week: "", value: 350 },
  { week: "", value: 400 },
  { week: "Tuần này", value: 430 },
];

export function TransactionsChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          interval={0}
        />
        <Tooltip
          formatter={(value) => [String(value), "Giao dịch"] as [string, string]}
          contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
        />
        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

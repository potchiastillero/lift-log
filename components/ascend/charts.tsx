"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { useAscendStore } from "@/lib/ascend/store";

export function ExperienceChart() {
  const progress = useAscendStore((state) => state.progress);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={progress}>
          <defs>
            <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#83c3ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#83c3ff" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(151,168,197,0.12)" vertical={false} />
          <XAxis dataKey="date" stroke="#93a4bf" tickLine={false} axisLine={false} />
          <YAxis stroke="#93a4bf" tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: "rgba(12,18,36,0.96)",
              border: "1px solid rgba(151,168,197,0.12)",
              borderRadius: "16px"
            }}
          />
          <Area type="monotone" dataKey="experience" stroke="#83c3ff" fill="url(#xpFill)" strokeWidth={2.4} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompletionChart() {
  const progress = useAscendStore((state) => state.progress);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={progress}>
          <CartesianGrid stroke="rgba(151,168,197,0.12)" vertical={false} />
          <XAxis dataKey="date" stroke="#93a4bf" tickLine={false} axisLine={false} />
          <YAxis stroke="#93a4bf" tickLine={false} axisLine={false} width={34} />
          <Tooltip
            contentStyle={{
              background: "rgba(12,18,36,0.96)",
              border: "1px solid rgba(151,168,197,0.12)",
              borderRadius: "16px"
            }}
          />
          <Bar dataKey="completions" fill="#f0b77f" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const NAVY = "#0f2a47";
const GOLD = "#c9a961";
const PIE_COLORS = [NAVY, GOLD, "#547ba6", "#c45a3f", "#a88639", "#1a385d"];

type DayPoint = { day: string; count: number };
type AgePoint = { name: string; count: number };
type MinistryPoint = { name: string; count: number };

const TOOLTIP_STYLE = {
  backgroundColor: "white",
  border: "1px solid #e9e1d0",
  borderRadius: "8px",
  fontSize: "11px",
  boxShadow: "0 6px 20px -8px rgba(15,42,71,0.18)",
  padding: "6px 10px",
};

export function RegistrationsTrend({ data }: { data: DayPoint[] }) {
  if (!data.some((d) => d.count > 0)) return <Empty label="No registrations yet" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={NAVY} stopOpacity={0.28} />
            <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9e1d0" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: "#547ba6", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: "#547ba6", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: NAVY, fontWeight: 600 }} />
        <Area type="monotone" dataKey="count" stroke={NAVY} strokeWidth={2} fill="url(#navyGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AgeDistribution({ data }: { data: AgePoint[] }) {
  if (data.length === 0) return <Empty label="No data yet" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9e1d0" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#547ba6", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#547ba6", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
        <Tooltip cursor={{ fill: "rgba(15,42,71,0.04)" }} contentStyle={TOOLTIP_STYLE} labelStyle={{ color: NAVY, fontWeight: 600 }} />
        <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MinistryPie({ data }: { data: MinistryPoint[] }) {
  if (data.length === 0) return <Empty label="No data yet" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={2} stroke="#fafaf2" strokeWidth={2}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RatingsComparison({ vibrancy, influence }: { vibrancy: number; influence: number }) {
  const data = [
    { name: "Vibrancy", value: vibrancy, color: NAVY },
    { name: "Influence", value: influence, color: GOLD },
  ];
  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-medium text-navy-700">{d.name}</span>
            <span className="font-display text-lg font-semibold text-navy-900 tabular-nums">
              {d.value.toFixed(1)}
              <span className="text-xs text-navy-400 font-normal">/10</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / 10) * 100}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="h-full grid place-items-center text-[11px] text-slate-400">{label}</div>;
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

interface IncidentChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export default function IncidentChart({ data }: IncidentChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"bar" | "area">("area");

  // Custom Tooltip for premium look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 min-w-[130px]">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Bulan {label}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
              {payload[0].value}{" "}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Insiden
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalIncidentsInChart = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Control Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Total Tahun Berjalan:{" "}
            <strong className="text-red-600 dark:text-red-400 font-black">
              {totalIncidentsInChart} Laporan
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setChartType("area")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
              chartType === "area"
                ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp size={12} />
            <span>Kurva</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
              chartType === "bar"
                ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 size={12} />
            <span>Batang</span>
          </button>
        </div>
      </div>

      <div className="flex-grow w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncidentArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                dx={-10}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#ef4444"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIncidentArea)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              onMouseMove={(state) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  setActiveIndex(Number(state.activeTooltipIndex));
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id="colorTotalHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={1} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="colorTotalZero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                dx={-10}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="total"
                radius={[6, 6, 6, 6]}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.total === 0
                        ? "url(#colorTotalZero)"
                        : index === activeIndex
                        ? "url(#colorTotalHover)"
                        : "url(#colorTotal)"
                    }
                    className="transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

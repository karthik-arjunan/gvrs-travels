import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  XAxis,
  Tooltip,
} from "recharts";
import { BOOKING_API } from "../config/api";

const colors = [
  "#818cf8",
  "#6366f1",
  "#4f46e5",
];

const KpiMiniBar = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(BOOKING_API)
      .then((res) => res.json())
      .then((bookings) => {
        if (!Array.isArray(bookings)) return;

        const now = new Date();

        // ⭐ Build last 3 months bucket
        const months = [];

        // ⭐ Last 2 months + Current
        for (let i = -2; i <= 0; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);

          months.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: d.toLocaleString("default", { month: "short" }),
            v: 0,
          });
        }

        // ⭐ Count bookings per month
        bookings.forEach((b) => {
          const dt = new Date(b.pickup_datetime);
          const key = `${dt.getFullYear()}-${dt.getMonth()}`;

          const bucket = months.find((m) => m.key === key);
          if (bucket) bucket.v += 1;
        });

        setData(months);
      });
  }, []);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 10,
          padding: "6px 10px", // ⭐ smaller padding
          minWidth: 90, // ⭐ compact width
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          border: "1px solid #e2e8f0",
          fontSize: 11, // ⭐ smaller text
          lineHeight: 1.2,
        }}
      >
        {/* Month */}
        <div
          style={{
            color: "#64748b",
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          {label}
        </div>

        {/* Count */}
        <div
          style={{
            color: "#4f46e5",
            fontWeight: 700,
          }}
        >
          Count: {payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};


  return (
    <ResponsiveContainer width={130} height={55}>
      <BarChart data={data} barCategoryGap={20}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        <Bar dataKey="v" radius={[4, 4, 0, 0]} barSize={12} minPointSize={3}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={index === data.length - 1 ? "#4f46e5" : colors[index]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default KpiMiniBar;

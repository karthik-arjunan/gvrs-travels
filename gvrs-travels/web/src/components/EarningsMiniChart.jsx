import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Cell,
  Tooltip,
} from "recharts";
import { BOOKING_API } from "../config/api";

const colors = ["#fde68a", "#fbbf24", "#f59e0b"];

// ⭐ PREMIUM TOOLTIP
const PremiumTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        padding: "10px 14px",
        borderRadius: 12,
        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
        border: "1px solid #e5e7eb",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <div style={{ color: "#6b7280", marginBottom: 4 }}>{label}</div>

      <div style={{ color: "#fbbf24" }}>
        Total: ₹{payload[0].value.toLocaleString()}
      </div>
    </div>
  );
};

const EarningsMiniChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(BOOKING_API)
      .then((r) => r.json())
      .then((bookings) => {
        if (!Array.isArray(bookings)) return;

        const now = new Date();
        const months = [];

        // ⭐ last 2 months + current
        for (let i = -2; i <= 0; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);

          months.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: d.toLocaleString("default", { month: "short" }),
            value: 0,
          });
        }

        bookings.forEach((b) => {
          const dt = new Date(b.created_at);
          const key = `${dt.getFullYear()}-${dt.getMonth()}`;

          const bucket = months.find((m) => m.key === key);
          if (!bucket) return;

          if (["confirmed", "completed", "cancelled"].includes(b.status)) {
            bucket.value += parseFloat(b.amount || 0);
          }
        });

        setData(months);
      });
  }, []);

  return (
    <ResponsiveContainer width={130} height={55}>
      <BarChart data={data}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10 }}
        />

        {/* ⭐ TOOLTIP */}
        <Tooltip content={<PremiumTooltip />} cursor={false} />

        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={10}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EarningsMiniChart;

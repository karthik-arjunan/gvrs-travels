import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BOOKING_API, TRIP_FINANCE_API } from "../config/api";

const RevenueChart = ({ onMonthHover }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadRevenue = async () => {
      const res = await fetch(TRIP_FINANCE_API);
      const finance = await res.json();

      const currentYear = new Date().getFullYear();

      // 12 months structure
      const monthly = Array(12)
        .fill(null)
        .map(() => ({
          revenue: 0,
          totalAmount: 0,
        }));

      finance.forEach((f) => {
        const date = new Date(f.created_at);

        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();

          monthly[month].revenue += Number(f.balance || 0);
          monthly[month].totalAmount += Number(f.trip_amount || 0);
        }
      });

      const formatted = monthly.map((value, i) => ({
        name: new Date(0, i).toLocaleString("en-US", { month: "short" }),
        revenue: value.revenue,
        totalAmount: value.totalAmount,
        monthIndex: i,
      }));

      setData(formatted);
    };

    loadRevenue();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={data}
        onMouseMove={(state) => {
          if (state?.activePayload?.length) {
            const monthIndex = state.activePayload[0].payload.monthIndex;
            onMonthHover?.(monthIndex);
          }
        }}
        onMouseLeave={() => onMonthHover?.(null)}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />

        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;

              return (
                <div
                  style={{
                    background: "#fff",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {data.name}
                  </div>

                  <div style={{ marginTop: 6, color: "#6b7280" }}>
                    Total Amount: ₹ {data.totalAmount.toLocaleString("en-IN")}
                  </div>

                  <div style={{ marginTop: 4, color: "#2563eb" }}>
                    Earnings: ₹ {data.revenue.toLocaleString("en-IN")}
                  </div>
                </div>
              );
            }

            return null;
          }}
        />

        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;

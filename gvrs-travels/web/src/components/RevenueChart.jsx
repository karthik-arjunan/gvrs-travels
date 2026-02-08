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
import { BOOKING_API } from "../config/api";

const RevenueChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadRevenue = async () => {
      const res = await fetch(BOOKING_API);
      const bookings = await res.json();

      // Only count real revenue
      const valid = bookings.filter((b) =>
        ["confirmed", "completed", "cancelled"].includes(b.status),
      );

      // Prepare 12 months bucket
      const monthly = Array(12).fill(0);

      valid.forEach((b) => {
        const date = new Date(b.pickup_datetime);
        const month = date.getMonth();
        monthly[month] += Number(b.amount || 0);
      });

      const formatted = monthly.map((value, i) => ({
        name: new Date(0, i).toLocaleString("en-US", { month: "short" }),
        revenue: value,
      }));

      setData(formatted);
    };

    loadRevenue();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
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

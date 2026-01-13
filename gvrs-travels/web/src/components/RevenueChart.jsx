import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { name: "Mon", revenue: 400 },
  { name: "Tue", revenue: 300 },
  { name: "Wed", revenue: 600 },
  { name: "Thu", revenue: 500 },
  { name: "Fri", revenue: 700 },
  { name: "Sat", revenue: 650 },
  { name: "Sun", revenue: 800 },
];

const RevenueChart = () => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#2196f3"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;

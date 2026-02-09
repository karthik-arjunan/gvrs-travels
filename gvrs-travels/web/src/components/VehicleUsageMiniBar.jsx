import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";

import { BOOKING_API } from "../config/api";

const colors = {
  Car: "#5B5FEF", // Royal Indigo
  Van: "#14B8A6", // Teal Emerald
  Bus: "#F59E0B", // Rich Amber Gold
};

const VehicleUsageMiniBar = () => {
  const [chartData, setChartData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    fetch(BOOKING_API)
      .then((res) => res.json())
      .then((bookings) => {
        if (!Array.isArray(bookings)) return;

        const now = new Date();
        let car = 0,
          van = 0,
          bus = 0;

        bookings.forEach((b) => {
          const d = new Date(b.created_at);

          // Only current month
          if (
            d.getMonth() !== now.getMonth() ||
            d.getFullYear() !== now.getFullYear()
          )
            return;

          const type = b.vehicle_type || b.vehicle?.vehicle_type;

          if (type === "car") car++;
          if (type === "van") van++;
          if (type === "bus") bus++;
        });

        // ⭐ IMPORTANT LOGIC
        // If only CAR exists -> Full Pie
        if (car > 0 && van === 0 && bus === 0) {
          setChartData([{ name: "Car", value: car }]);
        } else {
          setChartData([
            { name: "Car", value: car },
            { name: "Van", value: van },
            { name: "Bus", value: bus },
          ]);
        }
      });
  }, []);

  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      value,
    } = props;

    const RADIAN = Math.PI / 180;

    // ⭐ Position label INSIDE slice
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        {/* ⭐ Pop-out slice */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />

        {/* ⭐ Count INSIDE slice */}
        <text
          x={x}
          y={y}
          fill="#fff"
          fontWeight="700"
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div style={{ width: 120, height: 80 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="45%"
            cy="50%"
            outerRadius={28}
            innerRadius={14}
            paddingAngle={2}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={colors[entry.name]} />
            ))}
          </Pie>

          {/* ⭐ Smaller legend */}
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconSize={8}
            wrapperStyle={{
              fontSize: 11,
              paddingLeft: 6,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VehicleUsageMiniBar;

import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimeRangeSelector from "./TimeRangeSelector";

interface StockChartProps {
  data: Array<{
    date: string;
    price: number;
    volume?: number;
  }>;
  title?: string;
  symbol?: string;
}

// Define the proper type for the custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
  }>;
  label?: string;
}

const StockChart: React.FC<StockChartProps> = ({
  data,
  title = "Stock Price",
  symbol = "AAPL",
}) => {
  const [timeRange, setTimeRange] = useState("1M");

  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let pastDate = new Date();

    switch (timeRange) {
      case "1M":
        pastDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        pastDate.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        pastDate.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        pastDate.setFullYear(now.getFullYear() - 1);
        break;
      case "5Y":
        pastDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        pastDate.setMonth(now.getMonth() - 1);
    }

    return data.filter((item) => new Date(item.date) >= pastDate);
  };

  const filteredData = getFilteredData();

  // Calculate min and max values for Y-axis
  const minPrice = Math.min(...filteredData.map((item) => item.price)) * 0.95;
  const maxPrice = Math.max(...filteredData.map((item) => item.price)) * 1.05;

  // Custom formatter for X-axis tick labels to return string only
  const formatXAxis = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Custom tooltip component with proper type
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label || "");
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return (
        <div className="bg-background p-3 border rounded-lg shadow-md">
          <p className="font-semibold">{formattedDate}</p>
          <p className="text-primary">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {title} ({symbol})
          </CardTitle>
        </div>
        <TimeRangeSelector selectedRange={timeRange} onSelectRange={setTimeRange} />
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                tick={{ fontSize: 12 }}
                width={60}
              />
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;

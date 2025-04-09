import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card } from "@/components/ui/card";
import { PredictionResult } from "@/utils/forecasting";

interface PredictionChartProps {
  predictions: PredictionResult[];
  isLoading?: boolean;
}

const PredictionChart: React.FC<PredictionChartProps> = ({
  predictions,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 border-4 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Generating predictions...</p>
        </div>
      </Card>
    );
  }

  // Find the index where actual data ends and only predictions exist
  const predictionStartIndex = predictions.findIndex(p => p.actual === null);
  
  // Create a reference date where predictions start
  const predictionStartDate = predictionStartIndex >= 0 ? 
    predictions[predictionStartIndex].date : null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip">
          <div className="font-semibold">{label}</div>
          {payload[0].value !== null && (
            <div>Actual: ${payload[0].value}</div>
          )}
          <div>Predicted: ${payload[1].value}</div>
          {payload[0].value !== null && (
            <div>Error: ${Math.abs(payload[0].value - payload[1].value).toFixed(2)}</div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full p-4 overflow-hidden">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={predictions}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              minTickGap={30} 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fill: 'hsl(var(--muted-foreground))' }} 
              tickFormatter={(value) => `$${value}`} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Show a reference area where predictions start */}
            {predictionStartDate && (
              <ReferenceArea 
                x1={predictionStartDate} 
                x2={predictions[predictions.length - 1].date} 
                fill="hsl(var(--secondary))" 
                opacity={0.1}
                label={{
                  value: "Predictions",
                  position: "insideRight",
                  fill: "hsl(var(--muted-foreground))",
                }} 
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Actual Price" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              name="Predicted Price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={1.5} 
              strokeDasharray={predictionStartDate ? "0" : "0"} 
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PredictionChart;

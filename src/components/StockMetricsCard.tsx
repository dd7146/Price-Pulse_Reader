import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockMetrics } from "@/services/stockService";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StockMetricsCardProps {
  metrics: StockMetrics | null;
  isLoading?: boolean;
}

const StockMetricsCard: React.FC<StockMetricsCardProps> = ({
  metrics,
  isLoading = false,
}) => {
  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">
          {metrics.name} ({metrics.symbol})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end space-x-2 mb-4">
          <span className="text-3xl font-bold">${metrics.currentPrice.toFixed(2)}</span>
          <div className={`flex items-center ${metrics.change >= 0 ? "text-chartGreen" : "text-chartRed"}`}>
            {metrics.change >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            <span className="font-semibold">
              {metrics.change.toFixed(2)} ({metrics.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="font-medium">{formatLargeNumber(metrics.marketCap)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Day Range</p>
            <p className="font-medium">
              ${metrics.dayLow.toFixed(2)} - ${metrics.dayHigh.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Year Range</p>
            <p className="font-medium">
              ${metrics.yearLow.toFixed(2)} - ${metrics.yearHigh.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="font-medium">
              {formatVolume(metrics.volume)} / {formatVolume(metrics.avgVolume)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockMetricsCard;

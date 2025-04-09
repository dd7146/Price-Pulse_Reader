import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStockData,
  fetchStockMetrics,
  StockDataPoint,
} from "@/services/stockService";
import {
  ForecastingModel,
  generateAllPredictions,
  determineBestModel,
  PredictionResult,
} from "@/utils/forecasting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockChart from "@/components/StockChart";
import PredictionChart from "@/components/PredictionChart";
import StockMetricsCard from "@/components/StockMetricsCard";
import ModelSelectionCard from "@/components/ModelSelectionCard";
import StockSearch from "@/components/StockSearch";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import PredictionSettings from "@/components/PredictionSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MoonIcon, SunIcon, RefreshCwIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  // State
  const [symbol, setSymbol] = useState<string>("AAPL");
  const [timeRange, setTimeRange] = useState<string>("1M");
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [selectedModel, setSelectedModel] = useState<ForecastingModel>(
    ForecastingModel.EXPONENTIAL_SMOOTHING
  );
  const [forecastDays, setForecastDays] = useState<number>(7);
  const [trainingWindow, setTrainingWindow] = useState<number>(90);

  const { toast } = useToast();

  // Convert time range to days for API
  const timeRangeToDays = (range: string): number => {
    switch (range) {
      case "1M":
        return 30;
      case "3M":
        return 90;
      case "6M":
        return 180;
      case "1Y":
        return 365;
      case "5Y":
        return 365 * 5;
      default:
        return 30;
    }
  };

  // Fetch stock data
  const {
    data: stockData,
    isLoading: isStockDataLoading,
    refetch: refetchStockData,
  } = useQuery({
    queryKey: ["stockData", symbol, timeRange],
    queryFn: () => fetchStockData(symbol, timeRangeToDays(timeRange)),
  });

  // Fetch stock metrics
  const {
    data: stockMetrics,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["stockMetrics", symbol],
    queryFn: () => fetchStockMetrics(symbol),
  });

  // Fetch training data for predictions
  const { data: trainingData, isLoading: isTrainingDataLoading } = useQuery({
    queryKey: ["trainingData", symbol, trainingWindow],
    queryFn: () => fetchStockData(symbol, trainingWindow),
  });

  // Generate predictions
  const [predictions, setPredictions] = useState<Record<
    ForecastingModel,
    PredictionResult[]
  > | null>(null);
  const [bestModelInfo, setBestModelInfo] = useState<{
    bestModel: ForecastingModel;
    metrics: Record<ForecastingModel, { mae: number; mpe: number }>;
  } | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // Generate predictions when training data changes
  useEffect(() => {
    if (!trainingData || isTrainingDataLoading) return;

    const generatePredictions = async () => {
      setIsPredicting(true);
      try {
        // Add a slight delay to simulate computation
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Generate predictions
        const allPredictions = generateAllPredictions(trainingData, forecastDays);
        setPredictions(allPredictions);
        
        // Determine best model
        const bestModel = determineBestModel(allPredictions);
        setBestModelInfo(bestModel);
        
        // If no model is selected yet, select the best one
        if (!selectedModel) {
          setSelectedModel(bestModel.bestModel);
        }
      } catch (error) {
        console.error("Error generating predictions:", error);
        toast({
          title: "Prediction Error",
          description: "Failed to generate predictions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsPredicting(false);
      }
    };

    generatePredictions();
  }, [trainingData, forecastDays, toast]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle refresh data
  const handleRefreshData = () => {
    refetchStockData();
    refetchMetrics();
    toast({
      title: "Data Refreshed",
      description: "Stock data has been updated.",
    });
  };

  // Map StockDataPoint[] to the format expected by PredictionChart
  const mapStockDataForChart = (data: StockDataPoint[] = []) => {
    return data.map(point => ({
      date: point.date,
      value: point.value, // Changed from price to value
    }));
  };

  // Map PredictionResult[] to the format expected by PredictionChart
  const mapPredictionsForChart = (preds: PredictionResult[] = []) => {
    return preds.map(pred => ({
      date: pred.date,
      value: pred.value, // Changed from price to value
      predicted: pred.predicted,
    }));
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <h1 className="font-bold text-2xl flex items-center">
            <span className="text-primary mr-1">Stock</span>
            <span>Pulse Predictor</span>
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="h-9 w-9"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshData}
              className="h-9 w-9"
            >
              <RefreshCwIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-3">
            <StockSearch selectedSymbol={symbol} onSelectSymbol={setSymbol} />
          </div>
          <div className="md:col-span-1">
            <TimeRangeSelector
              selectedRange={timeRange}
              onSelectRange={setTimeRange}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <StockMetricsCard
              metrics={stockMetrics}
              isLoading={isMetricsLoading}
            />
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Generating predictions",
                      description: `Analyzing ${symbol} with ${selectedModel}...`,
                    });
                    // This would trigger a re-fetch of training data if we had a real API
                    // For now, we'll just simulate by setting isPredicting
                    setIsPredicting(true);
                    setTimeout(() => {
                      setIsPredicting(false);
                      toast({
                        title: "Predictions Ready",
                        description: `${forecastDays} day forecast generated for ${symbol}`,
                      });
                    }, 1500);
                  }}
                >
                  Generate Predictions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="chart" className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Price Chart</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="w-full">
            <StockChart
              data={stockData || []}
              timeRange={timeRange}
              isLoading={isStockDataLoading}
            />
          </TabsContent>
          <TabsContent value="predictions" className="w-full">
            <PredictionChart
              historicalData={mapStockDataForChart(stockData)}
              predictions={
                predictions && selectedModel 
                  ? mapPredictionsForChart(predictions[selectedModel]) 
                  : []
              }
              model={selectedModel}
              isLoading={isPredicting}
            />
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-6">
          <PredictionSettings
            forecastDays={forecastDays}
            setForecastDays={setForecastDays}
            trainingWindow={trainingWindow}
            setTrainingWindow={setTrainingWindow}
          />
          <ModelSelectionCard
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            metrics={bestModelInfo?.metrics}
            isLoading={isPredicting}
            bestModel={bestModelInfo?.bestModel}
          />
        </div>

        <Separator className="my-8" />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Moving Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This model predicts future prices by calculating the average of previous values
                  over a specified window. It's simple but effective for stocks with low volatility.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Best used for: stable stocks, long-term trends, and situations where recent price changes
                  aren't significant indicators.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Exponential Smoothing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This model gives more weight to recent observations, making it responsive to new trends.
                  It balances between recent activity and longer-term patterns.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Best used for: stocks with moderate volatility, medium-term forecasting, and when recent
                  price movements are meaningful.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>ARIMA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Autoregressive Integrated Moving Average combines time series analysis techniques.
                  It's sophisticated and accounts for various factors including seasonality.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Best used for: complex price movements, highly volatile stocks, and when you need to
                  account for multiple dimensions of historical data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t mt-8">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>
            Stock Pulse Predictor &copy; {new Date().getFullYear()} | Educational purposes only.
            Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

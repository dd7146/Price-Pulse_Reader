import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ForecastingModel } from "@/utils/forecasting";
import { Skeleton } from "@/components/ui/skeleton";

interface ModelSelectionCardProps {
  selectedModel: ForecastingModel;
  onSelectModel: (model: ForecastingModel) => void;
  metrics?: Record<ForecastingModel, { mae: number; mpe: number }>;
  isLoading?: boolean;
  bestModel?: ForecastingModel;
}

const ModelSelectionCard: React.FC<ModelSelectionCardProps> = ({
  selectedModel,
  onSelectModel,
  metrics,
  isLoading = false,
  bestModel,
}) => {
  const handleModelChange = (value: string) => {
    onSelectModel(value as ForecastingModel);
  };

  const getModelDescription = (model: ForecastingModel) => {
    switch (model) {
      case ForecastingModel.MOVING_AVERAGE:
        return "Predicts based on the average of previous values.";
      case ForecastingModel.EXPONENTIAL_SMOOTHING:
        return "Gives more weight to recent observations in predictions.";
      case ForecastingModel.ARIMA:
        return "Autoregressive Integrated Moving Average combines multiple techniques.";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forecasting Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecasting Model</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedModel}
          onValueChange={handleModelChange}
          className="space-y-4"
        >
          {Object.values(ForecastingModel).map((model) => (
            <div
              key={model}
              className={`flex items-center space-x-2 p-3 rounded-md border ${
                selectedModel === model
                  ? "border-primary bg-primary/5"
                  : "border-border"
              } ${bestModel === model ? "ring-1 ring-accent" : ""}`}
            >
              <RadioGroupItem value={model} id={model} />
              <div className="flex-1">
                <Label htmlFor={model} className="font-medium cursor-pointer">
                  {model}
                  {bestModel === model && (
                    <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {getModelDescription(model)}
                </p>
                {metrics && (
                  <div className="mt-1 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <span>MAE: {metrics[model].mae}</span>
                    <span>MPE: {metrics[model].mpe}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ModelSelectionCard;

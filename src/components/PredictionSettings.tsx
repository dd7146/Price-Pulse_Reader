import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface PredictionSettingsProps {
  forecastDays: number;
  setForecastDays: (days: number) => void;
  trainingWindow: number;
  setTrainingWindow: (days: number) => void;
}

const PredictionSettings: React.FC<PredictionSettingsProps> = ({
  forecastDays,
  setForecastDays,
  trainingWindow,
  setTrainingWindow,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="forecast-days">Forecast Days</Label>
              <span className="text-sm text-muted-foreground">{forecastDays} days</span>
            </div>
            <Slider
              id="forecast-days"
              min={1}
              max={30}
              step={1}
              value={[forecastDays]}
              onValueChange={(value) => setForecastDays(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Number of future trading days to predict
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="training-window">Training Window</Label>
              <span className="text-sm text-muted-foreground">{trainingWindow} days</span>
            </div>
            <Slider
              id="training-window"
              min={30}
              max={365}
              step={30}
              value={[trainingWindow]}
              onValueChange={(value) => setTrainingWindow(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Amount of historical data to use for training
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionSettings;

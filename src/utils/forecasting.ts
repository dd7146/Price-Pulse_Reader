import { StockDataPoint } from "../services/stockService";

// Interface for prediction results
export interface PredictionResult {
  date: string;
  actual: number | null;
  predicted: number;
  modelName: ForecastingModel;
}

// Available forecasting models
export enum ForecastingModel {
  MOVING_AVERAGE = 'Moving Average',
  EXPONENTIAL_SMOOTHING = 'Exponential Smoothing',
  ARIMA = 'ARIMA'
}

/**
 * Moving Average forecasting model
 * Predicts based on the average of n previous values
 */
export const movingAveragePredict = (
  data: StockDataPoint[],
  windowSize: number = 5,
  forecastDays: number = 7
): PredictionResult[] => {
  if (data.length < windowSize) {
    throw new Error(`Not enough data points. Need at least ${windowSize} points.`);
  }

  const closePrices = data.map(d => d.close);
  const dates = data.map(d => d.date);
  const results: PredictionResult[] = [];
  
  // First, calculate predictions for historical data where we have actual values
  for (let i = windowSize; i < data.length; i++) {
    const window = closePrices.slice(i - windowSize, i);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    
    results.push({
      date: dates[i],
      actual: closePrices[i],
      predicted: parseFloat(avg.toFixed(2)),
      modelName: ForecastingModel.MOVING_AVERAGE
    });
  }
  
  // Now predict future values
  let lastPredictions = closePrices.slice(-windowSize);
  
  for (let i = 0; i < forecastDays; i++) {
    const nextDate = getNextBusinessDay(dates[dates.length - 1], i + 1);
    const avg = lastPredictions.reduce((sum, val) => sum + val, 0) / lastPredictions.length;
    const prediction = parseFloat(avg.toFixed(2));
    
    results.push({
      date: nextDate,
      actual: null, // No actual data for future dates
      predicted: prediction,
      modelName: ForecastingModel.MOVING_AVERAGE
    });
    
    // Update the window for the next prediction
    lastPredictions.shift();
    lastPredictions.push(prediction);
  }
  
  return results;
};

/**
 * Exponential Smoothing forecasting model
 * Gives more weight to recent observations
 */
export const exponentialSmoothingPredict = (
  data: StockDataPoint[],
  alpha: number = 0.3, // smoothing factor
  forecastDays: number = 7
): PredictionResult[] => {
  if (data.length < 2) {
    throw new Error('Not enough data points. Need at least 2 points.');
  }

  const closePrices = data.map(d => d.close);
  const dates = data.map(d => d.date);
  const results: PredictionResult[] = [];
  
  // Initialize with the first actual value
  let forecast = closePrices[0];
  
  // First, calculate predictions for historical data
  for (let i = 1; i < data.length; i++) {
    // Update the forecast: new_forecast = alpha * actual + (1 - alpha) * previous_forecast
    forecast = alpha * closePrices[i - 1] + (1 - alpha) * forecast;
    
    results.push({
      date: dates[i],
      actual: closePrices[i],
      predicted: parseFloat(forecast.toFixed(2)),
      modelName: ForecastingModel.EXPONENTIAL_SMOOTHING
    });
  }
  
  // Now predict future values
  let lastActual = closePrices[closePrices.length - 1];
  
  for (let i = 0; i < forecastDays; i++) {
    const nextDate = getNextBusinessDay(dates[dates.length - 1], i + 1);
    
    // Update forecast using last available actual or predicted value
    forecast = alpha * lastActual + (1 - alpha) * forecast;
    const prediction = parseFloat(forecast.toFixed(2));
    
    results.push({
      date: nextDate,
      actual: null, // No actual data for future dates
      predicted: prediction,
      modelName: ForecastingModel.EXPONENTIAL_SMOOTHING
    });
    
    // For future predictions, use the previous prediction as the "actual"
    lastActual = prediction;
  }
  
  return results;
};

/**
 * ARIMA model (simplified)
 * Autoregressive Integrated Moving Average
 * This is a simplified implementation - in a real application, you'd use a proper ARIMA library
 */
export const arimaPredict = (
  data: StockDataPoint[],
  p: number = 3, // AR order
  d: number = 1, // Differencing
  q: number = 1, // MA order
  forecastDays: number = 7
): PredictionResult[] => {
  if (data.length < Math.max(p, q) + d + 1) {
    throw new Error('Not enough data points for ARIMA model.');
  }

  const closePrices = data.map(d => d.close);
  const dates = data.map(d => d.date);
  const results: PredictionResult[] = [];
  
  // Perform differencing
  let diffPrices = closePrices;
  for (let i = 0; i < d; i++) {
    diffPrices = diffPrices.slice(1).map((val, idx) => val - diffPrices[idx]);
  }
  
  // The following is a simplified ARIMA implementation
  // In a real application, you would use proper ARIMA coefficients estimation
  const arCoefficients = Array(p).fill(1/p); // Simplified AR coefficients
  const maCoefficients = Array(q).fill(1/q); // Simplified MA coefficients
  
  const errors: number[] = [];
  const predictions: number[] = [];
  
  // Calculate predictions for historical data
  for (let i = Math.max(p, q); i < diffPrices.length; i++) {
    // AR component: weighted sum of past values
    let arComponent = 0;
    for (let j = 0; j < p; j++) {
      arComponent += arCoefficients[j] * diffPrices[i - j - 1];
    }
    
    // MA component: weighted sum of past errors
    let maComponent = 0;
    for (let j = 0; j < q && j < errors.length; j++) {
      maComponent += maCoefficients[j] * (errors[errors.length - j - 1] || 0);
    }
    
    const prediction = arComponent + maComponent;
    predictions.push(prediction);
    
    // Calculate error
    const error = diffPrices[i] - prediction;
    errors.push(error);
  }
  
  // Convert differenced predictions back to original scale
  let undiffPredictions: number[] = [];
  
  // Handle historical data first
  for (let i = 0; i < predictions.length; i++) {
    const actualIndex = i + Math.max(p, q) + d;
    let undiffValue = predictions[i];
    
    // "Undo" differencing
    for (let j = 0; j < d; j++) {
      undiffValue += closePrices[actualIndex - j - 1];
    }
    
    undiffPredictions.push(undiffValue);
    
    // Add to results
    results.push({
      date: dates[actualIndex],
      actual: closePrices[actualIndex],
      predicted: parseFloat(undiffValue.toFixed(2)),
      modelName: ForecastingModel.ARIMA
    });
  }
  
  // Now predict future values
  const lastPredictions = predictions.slice(-p);
  const lastErrors = errors.slice(-q);
  const lastActuals = closePrices.slice(-d);
  
  for (let i = 0; i < forecastDays; i++) {
    const nextDate = getNextBusinessDay(dates[dates.length - 1], i + 1);
    
    // AR component
    let arComponent = 0;
    for (let j = 0; j < p && j < lastPredictions.length; j++) {
      arComponent += arCoefficients[j] * lastPredictions[lastPredictions.length - j - 1];
    }
    
    // MA component
    let maComponent = 0;
    for (let j = 0; j < q && j < lastErrors.length; j++) {
      maComponent += maCoefficients[j] * lastErrors[lastErrors.length - j - 1];
    }
    
    // Combined prediction (differenced)
    const diffPrediction = arComponent + maComponent;
    
    // Convert back to original scale
    let undiffValue = diffPrediction;
    for (let j = 0; j < d; j++) {
      if (i - j >= 0) {
        // Use previously predicted value
        undiffValue += undiffPredictions[undiffPredictions.length - j - 1];
      } else {
        // Use last actual values
        undiffValue += lastActuals[lastActuals.length - (j - i) - 1];
      }
    }
    
    const finalPrediction = parseFloat(undiffValue.toFixed(2));
    undiffPredictions.push(finalPrediction);
    
    results.push({
      date: nextDate,
      actual: null,
      predicted: finalPrediction,
      modelName: ForecastingModel.ARIMA
    });
    
    // Update for next iteration
    lastPredictions.shift();
    lastPredictions.push(diffPrediction);
    lastErrors.shift(); 
    lastErrors.push(0); // Assume error is zero for future predictions
  }
  
  return results;
};

// Helper function to get the next business day
function getNextBusinessDay(lastDateStr: string, daysToAdd: number): string {
  const lastDate = new Date(lastDateStr);
  let date = new Date(lastDate);
  
  let businessDaysAdded = 0;
  while (businessDaysAdded < daysToAdd) {
    date.setDate(date.getDate() + 1);
    
    // Skip weekends (0 is Sunday, 6 is Saturday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysAdded++;
    }
  }
  
  return date.toISOString().split('T')[0];
}

// Calculate prediction accuracy metrics (Mean Absolute Error)
export const calculateMAE = (predictions: PredictionResult[]): number => {
  const validPairs = predictions.filter(p => p.actual !== null);
  
  if (validPairs.length === 0) return 0;
  
  const sum = validPairs.reduce((acc, p) => {
    return acc + Math.abs((p.actual as number) - p.predicted);
  }, 0);
  
  return parseFloat((sum / validPairs.length).toFixed(2));
};

// Calculate Mean Percentage Error
export const calculateMPE = (predictions: PredictionResult[]): number => {
  const validPairs = predictions.filter(p => p.actual !== null);
  
  if (validPairs.length === 0) return 0;
  
  const sum = validPairs.reduce((acc, p) => {
    const actual = p.actual as number;
    return acc + (p.predicted - actual) / actual * 100;
  }, 0);
  
  return parseFloat((sum / validPairs.length).toFixed(2));
};

// Generate predictions using all models
export const generateAllPredictions = (
  data: StockDataPoint[],
  forecastDays: number = 7
): Record<ForecastingModel, PredictionResult[]> => {
  return {
    [ForecastingModel.MOVING_AVERAGE]: movingAveragePredict(data, 7, forecastDays),
    [ForecastingModel.EXPONENTIAL_SMOOTHING]: exponentialSmoothingPredict(data, 0.3, forecastDays),
    [ForecastingModel.ARIMA]: arimaPredict(data, 3, 1, 1, forecastDays)
  };
};

// Evaluate all models and return the best one based on MAE
export const determineBestModel = (
  predictions: Record<ForecastingModel, PredictionResult[]>
): { bestModel: ForecastingModel, metrics: Record<ForecastingModel, { mae: number, mpe: number }> } => {
  const metrics: Record<ForecastingModel, { mae: number, mpe: number }> = {
    [ForecastingModel.MOVING_AVERAGE]: {
      mae: calculateMAE(predictions[ForecastingModel.MOVING_AVERAGE]),
      mpe: calculateMPE(predictions[ForecastingModel.MOVING_AVERAGE])
    },
    [ForecastingModel.EXPONENTIAL_SMOOTHING]: {
      mae: calculateMAE(predictions[ForecastingModel.EXPONENTIAL_SMOOTHING]),
      mpe: calculateMPE(predictions[ForecastingModel.EXPONENTIAL_SMOOTHING])
    },
    [ForecastingModel.ARIMA]: {
      mae: calculateMAE(predictions[ForecastingModel.ARIMA]),
      mpe: calculateMPE(predictions[ForecastingModel.ARIMA])
    }
  };
  
  let bestModel = ForecastingModel.MOVING_AVERAGE;
  let lowestMAE = metrics[ForecastingModel.MOVING_AVERAGE].mae;
  
  Object.entries(metrics).forEach(([model, { mae }]) => {
    if (mae < lowestMAE) {
      bestModel = model as ForecastingModel;
      lowestMAE = mae;
    }
  });
  
  return { bestModel: bestModel as ForecastingModel, metrics };
};

import React from "react";
import { Button } from "@/components/ui/button";

interface TimeRangeSelectorProps {
  selectedRange: string;
  onSelectRange: (range: string) => void;
  availableRanges?: string[];
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onSelectRange,
  availableRanges = ["1M", "3M", "6M", "1Y", "5Y"],
}) => {
  return (
    <div className="flex space-x-2">
      {availableRanges.map((range) => (
        <Button
          key={range}
          variant={selectedRange === range ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectRange(range)}
          className="py-1 h-auto"
        >
          {range}
        </Button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;

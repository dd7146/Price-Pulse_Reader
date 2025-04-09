import React, { useState, useEffect } from "react";
import { Command, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { fetchAvailableSymbols } from "@/services/stockService";
import { cn } from "@/lib/utils";

interface StockSearchProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

interface StockOption {
  symbol: string;
  name: string;
}

const StockSearch: React.FC<StockSearchProps> = ({ selectedSymbol, onSelectSymbol }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<StockOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load available stock symbols
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        setIsLoading(true);
        const symbols = await fetchAvailableSymbols();
        setOptions(symbols);
      } catch (error) {
        console.error("Failed to load stock symbols:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSymbols();
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      option.symbol.toLowerCase().includes(lowerSearchTerm) ||
      option.name.toLowerCase().includes(lowerSearchTerm)
    );
  });

  const selectedOption = options.find(option => option.symbol === selectedSymbol);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal"
        >
          {selectedOption ? `${selectedOption.symbol} - ${selectedOption.name}` : "Select stock..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search stocks..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9"
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">Loading stocks...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm">No stocks found.</div>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.symbol}
                    value={option.symbol}
                    onSelect={() => {
                      onSelectSymbol(option.symbol);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{option.symbol}</span>{" "}
                      <span className="text-muted-foreground">{option.name}</span>
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedSymbol === option.symbol
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StockSearch;

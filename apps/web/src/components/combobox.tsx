import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

type Item = {
  value: string;
  label: string;
};

type ComboboxProps = {
  items: Item[];
  currentLanguage: string;
  onSelect: (value: string) => void;
};

export function Combobox({ items, onSelect, currentLanguage }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (currentLanguage) {
      setValue(currentLanguage);
    }
  }, [currentLanguage]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between md:max-w-[200px]"
          role="combobox"
          variant="noShadow"
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : "Select language..."}
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) border-0 p-0">
        <Command className="**:data-[slot=command-input-wrapper]:h-11">
          <CommandInput placeholder="Search framework..." />
          <CommandList className="p-1">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  defaultValue={"typescript"}
                  key={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    onSelect(currentValue);
                  }}
                  value={item.value}
                >
                  {item.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

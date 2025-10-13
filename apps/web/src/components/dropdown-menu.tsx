import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DropdownMenu<T extends string>({
  items = [],
  onSelect,
  placeholder,
}: {
  items?: T[] | readonly T[];
  onSelect?: (value: T) => void;
  placeholder: string;
}) {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="">
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

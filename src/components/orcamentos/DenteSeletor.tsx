import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Numeração FDI (vista do paciente)
const QUADRANTES = [
  {
    label: "Superior Dir. (11–18)",
    dentes: ["11", "12", "13", "14", "15", "16", "17", "18"],
  },
  {
    label: "Superior Esq. (21–28)",
    dentes: ["21", "22", "23", "24", "25", "26", "27", "28"],
  },
  {
    label: "Inferior Dir. (31–38)",
    dentes: ["31", "32", "33", "34", "35", "36", "37", "38"],
  },
  {
    label: "Inferior Esq. (41–48)",
    dentes: ["41", "42", "43", "44", "45", "46", "47", "48"],
  },
];

interface DenteSeletorProps {
  value?: string | null;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export function DenteSeletor({ value, onChange, className }: DenteSeletorProps) {
  return (
    <Select
      value={value ?? "_none"}
      onValueChange={(v) => onChange(v === "_none" ? undefined : v)}
    >
      <SelectTrigger className={className ?? "h-8 w-24 text-xs"}>
        <SelectValue placeholder="Dente" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_none">—</SelectItem>
        {QUADRANTES.map((q) => (
          <SelectGroup key={q.label}>
            <SelectLabel className="text-xs">{q.label}</SelectLabel>
            {q.dentes.map((d) => (
              <SelectItem key={d} value={d} className="text-xs">
                {d}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

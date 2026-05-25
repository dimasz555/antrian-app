import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  aktif: boolean;
  labelAktif?: string;
  labelNonaktif?: string;
};

export default function StatusBadge({
  aktif,
  labelAktif = "Aktif",
  labelNonaktif = "Nonaktif",
}: Props) {
  return (
    <Badge variant={aktif ? "success" : "destructive"}>
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
          aktif ? "bg-green-500" : "bg-red-500",
        )}
      />
      {aktif ? labelAktif : labelNonaktif}
    </Badge>
  );
}

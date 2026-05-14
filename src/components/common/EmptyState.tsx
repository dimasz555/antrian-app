import { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
};

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Tidak ada data",
  description = "Belum ada data yang tersedia.",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Variant = "default" | "success" | "danger" | "warning" | "secondary";

type Props = {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: Variant;
};

const variantStyles: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-yellow-500/10 text-yellow-600",
  secondary: "bg-secondary/10 text-secondary",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-primary">{value}</span>
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              variantStyles[variant],
            )}
          >
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

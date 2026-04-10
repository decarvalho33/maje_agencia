import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
}

export function MetricCard({ title, value, subtitle, trend, trendValue, icon }: MetricCardProps) {
  return (
    <div className="glass-panel p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">{title}</span>
        {icon && <span className="text-primary/60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-heading font-bold text-foreground">{value}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
            trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {trendValue}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

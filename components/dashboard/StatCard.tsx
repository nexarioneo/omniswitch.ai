import { Card } from "../ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
}

export function StatCard({ label, value, trend, trendDirection }: StatCardProps) {
  return (
    <Card elevation={1}>
      <p className="text-sm text-on-surface-variant mb-1">{label}</p>
      <p className="text-2xl font-mono font-normal text-on-surface">{value}</p>
      {trend && (
        <p className={`text-sm mt-1 ${trendDirection === "up" ? "text-primary" : "text-error"}`}>
          {trend}
        </p>
      )}
    </Card>
  );
}

import Link from "next/link";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface ProviderCardProps {
  name: string;
  status: "active" | "inactive";
  keyCount: number;
  modelCount: number;
  baseUrl?: string;
  href?: string;
}

export function ProviderCard({
  name,
  status,
  keyCount,
  modelCount,
  baseUrl,
  href,
}: ProviderCardProps) {
  const card = (
    <Card elevation={1} className={href ? "h-full transition-colors hover:bg-surface-container" : ""}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-sm font-medium text-on-primary-container"
        >
          {name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-medium text-on-surface">{name}</h3>
            <Badge variant={status === "active" ? "success" : "error"}>{status}</Badge>
          </div>
          {baseUrl && (
            <p className="mt-0.5 break-all text-sm text-on-surface-variant">{baseUrl}</p>
          )}
          <div className="mt-2 flex gap-4 text-sm text-on-surface-variant">
            <span>
              <span className="font-mono">{keyCount}</span> keys
            </span>
            <span>
              <span className="font-mono">{modelCount}</span> models
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block rounded-xl">
      {card}
    </Link>
  );
}

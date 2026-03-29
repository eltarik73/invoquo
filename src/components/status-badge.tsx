import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  draft: { label: "Brouillon", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" },
  pending: { label: "En attente", className: "bg-amber-50 text-amber-700 hover:bg-amber-50" },
  sent: { label: "Envoyee", className: "bg-blue-50 text-blue-700 hover:bg-blue-50" },
  transmitted: { label: "Transmise", className: "bg-blue-50 text-blue-700 hover:bg-blue-50" },
  accepted: { label: "Acceptee", className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" },
  paid: { label: "Payee", className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" },
  overdue: { label: "En retard", className: "bg-red-50 text-red-700 hover:bg-red-50" },
  rejected: { label: "Rejetee", className: "bg-red-50 text-red-700 hover:bg-red-50" },
  validated: { label: "Validee", className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" },
  expired: { label: "Expire", className: "bg-amber-50 text-amber-700 hover:bg-amber-50" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";

interface StatusBadgeProps {
  status: "Pending" | "Approved" | "Rejected" | "Present" | "Absent" | "Completed";
  size?: "default" | "sm" | "lg";
}

export default function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = {
    Pending: {
      icon: Clock,
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    Approved: {
      icon: CheckCircle2,
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    Rejected: {
      icon: XCircle,
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-200",
    },
    Present: {
      icon: CheckCircle2,
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    Absent: {
      icon: XCircle,
      variant: "secondary" as const,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    Completed: {
      icon: CheckCircle2,
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
  };

  const { icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={`${className} gap-1 rounded-full px-3 py-1`} data-testid={`badge-${status.toLowerCase()}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium uppercase tracking-wide">{status}</span>
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { Crown, Shield, User, Eye, Loader2 } from "lucide-react";

export function UserRoleBadge() {
  const { userRole, isLoading } = usePermissions();

  const roleConfig = {
    admin: {
      label: "Administrador",
      variant: "default" as const,
      icon: Crown,
      className: "bg-red-500 hover:bg-red-600 text-white"
    },
    manager: {
      label: "Gerente",
      variant: "default" as const,
      icon: Shield,
      className: "bg-blue-500 hover:bg-blue-600 text-white"
    },
    agent: {
      label: "Atendente",
      variant: "secondary" as const,
      icon: User,
      className: "bg-green-500 hover:bg-green-600 text-white"
    },
    viewer: {
      label: "Visualizador",
      variant: "outline" as const,
      icon: Eye,
      className: "border-gray-300 text-gray-600"
    }
  };

  // 🔄 Mostrar loading enquanto carrega organização
  if (isLoading) {
    return (
      <Badge
        variant="outline"
        className="border-gray-300 text-gray-600 flex items-center gap-1"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando...
      </Badge>
    );
  }

  const config = roleConfig[userRole];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}






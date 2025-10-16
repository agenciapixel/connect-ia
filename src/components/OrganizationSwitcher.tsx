import { Check, ChevronsUpDown, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false);
  const { currentOrg, organizations, isLoading, switchOrganization } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!currentOrg) {
    return null;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "member":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "member":
        return "Membro";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
        >
          <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate text-left">{currentOrg.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar organização..." />
          <CommandList>
            <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
            <CommandGroup heading="Organizações">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => {
                    if (org.id !== currentOrg.id) {
                      switchOrganization(org.id);
                    }
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentOrg.id === org.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{org.name}</span>
                      {org.plan && (
                        <span className="text-xs text-muted-foreground">
                          Plano: {org.plan}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(org.role)} className="text-xs">
                    {getRoleLabel(org.role)}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // TODO: Abrir modal de criação de organização
                  window.location.href = "/settings?tab=organizations";
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Criar Organização</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

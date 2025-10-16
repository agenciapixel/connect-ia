import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Loader2, Building2, DollarSign, Percent, FileText, Tag } from "lucide-react";

const opportunitySchema = z.object({
  place_name: z.string().min(1, "Nome é obrigatório"),
  place_address: z.string().optional(),
  place_phone: z.string().optional(),
  place_website: z.string().optional(),
  pipeline_stage: z.enum([
    "lead",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
  ]),
  expected_revenue: z.string().optional(),
  probability: z.number().min(0).max(100),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface Prospect {
  id: string;
  pipeline_stage: string;
  expected_revenue?: number;
  probability?: number;
  notes?: string;
  places?: {
    id?: string;
    name: string;
    formatted_address?: string;
    phone_number?: string;
    website?: string;
    types?: string[];
  };
}

interface OpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect?: Prospect | null;
  onSuccess: () => void;
}

const PIPELINE_STAGES = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contactado" },
  { value: "qualified", label: "Qualificado" },
  { value: "proposal", label: "Proposta" },
  { value: "negotiation", label: "Negociação" },
  { value: "won", label: "Ganho" },
];

export function OpportunityModal({
  open,
  onOpenChange,
  prospect,
  onSuccess,
}: OpportunityModalProps) {
  const { currentOrg } = useOrganization();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      place_name: "",
      place_address: "",
      place_phone: "",
      place_website: "",
      pipeline_stage: "lead",
      expected_revenue: "",
      probability: 50,
      notes: "",
      tags: "",
    },
  });

  // Atualizar form quando prospect mudar
  useEffect(() => {
    if (prospect) {
      form.reset({
        place_name: prospect.places?.name || "",
        place_address: prospect.places?.formatted_address || "",
        place_phone: prospect.places?.phone_number || "",
        place_website: prospect.places?.website || "",
        pipeline_stage: (prospect.pipeline_stage as any) || "lead",
        expected_revenue: prospect.expected_revenue?.toString() || "",
        probability: prospect.probability || 50,
        notes: prospect.notes || "",
        tags: prospect.places?.types?.join(", ") || "",
      });
    } else {
      form.reset({
        place_name: "",
        place_address: "",
        place_phone: "",
        place_website: "",
        pipeline_stage: "lead",
        expected_revenue: "",
        probability: 50,
        notes: "",
        tags: "",
      });
    }
  }, [prospect, form]);

  const onSubmit = async (data: OpportunityFormData) => {
    if (!currentOrg) {
      toast.error("Nenhuma organização selecionada");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Se estamos editando um prospect existente
      if (prospect) {
        // Atualizar place se existir
        if (prospect.places?.id) {
          const { error: placeError } = await supabase
            .from("places")
            .update({
              name: data.place_name,
              formatted_address: data.place_address || null,
              phone_number: data.place_phone || null,
              website: data.place_website || null,
              types: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
            })
            .eq("id", prospect.places.id);

          if (placeError) throw placeError;
        }

        // Atualizar prospect
        const { error: prospectError } = await supabase
          .from("prospects")
          .update({
            pipeline_stage: data.pipeline_stage,
            expected_revenue: data.expected_revenue ? parseFloat(data.expected_revenue) : null,
            probability: data.probability,
            notes: data.notes || null,
            last_activity: new Date().toISOString(),
          })
          .eq("id", prospect.id);

        if (prospectError) throw prospectError;

        toast.success("Oportunidade atualizada com sucesso!");
      } else {
        // Criar novo place
        const { data: newPlace, error: placeError } = await supabase
          .from("places")
          .insert({
            name: data.place_name,
            formatted_address: data.place_address || null,
            phone_number: data.place_phone || null,
            website: data.place_website || null,
            types: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
            google_place_id: `manual_${Date.now()}`, // ID único para lugares criados manualmente
          })
          .select()
          .single();

        if (placeError) throw placeError;

        // Criar novo prospect
        const { error: prospectError } = await supabase
          .from("prospects")
          .insert({
            org_id: currentOrg.id,
            place_id: newPlace.id,
            pipeline_stage: data.pipeline_stage,
            expected_revenue: data.expected_revenue ? parseFloat(data.expected_revenue) : null,
            probability: data.probability,
            notes: data.notes || null,
            status: "new",
            source: "manual",
          });

        if (prospectError) throw prospectError;

        toast.success("Oportunidade criada com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error saving opportunity:", error);
      toast.error(error.message || "Erro ao salvar oportunidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="h-6 w-6 text-primary" />
            {prospect ? "Editar Oportunidade" : "Nova Oportunidade"}
          </DialogTitle>
          <DialogDescription>
            {prospect
              ? "Atualize as informações desta oportunidade no pipeline"
              : "Adicione uma nova oportunidade ao pipeline de vendas"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações do Cliente
              </h3>

              <FormField
                control={form.control}
                name="place_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Empresa ABC Ltda"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="place_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="place_website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="www.exemplo.com.br"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="place_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, número, bairro, cidade"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags / Categorias</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="restaurante, comércio, serviços (separadas por vírgula)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Categorias ou tags para classificar este cliente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informações do Negócio */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Detalhes da Oportunidade
              </h3>

              <FormField
                control={form.control}
                name="pipeline_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estágio do Pipeline *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estágio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PIPELINE_STAGES.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Estágio atual desta oportunidade no pipeline
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receita Esperada (R$)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valor estimado desta oportunidade
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Probabilidade de Fechamento</span>
                      <span className="text-primary font-semibold">
                        {field.value}%
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Chance estimada de fechar esta oportunidade (0-100%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações, histórico de contatos, próximos passos..."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Informações adicionais sobre esta oportunidade
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    {prospect ? "Atualizar" : "Criar"} Oportunidade
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

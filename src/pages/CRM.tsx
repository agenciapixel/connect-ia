import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building2, TrendingUp, DollarSign, BarChart3, Download, Plus, Calendar, Users, Target, Zap, Brain, Settings, Eye, MousePointer, MessageSquare, CheckCircle2, Clock, AlertCircle, ArrowUp, ArrowDown, Filter, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useDynamicMetrics, useContactMetrics } from "@/hooks/useDynamicMetrics";
import { MetricCard, MetricGrid } from "@/components/MetricCard";
import { CRMPipeline } from "@/components/CRMPipeline";
import { OpportunityModal } from "@/components/OpportunityModal";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Prospect {
  id: string;
  pipeline_stage: string;
  places: {
    name: string;
    formatted_address: string;
    phone_number?: string;
    website?: string;
    types?: string[];
  };
  expected_revenue?: number;
  probability?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function CRM() {
  const { currentOrg } = useOrganization();
  const [activeTab, setActiveTab] = useState("pipeline");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [analyticsFilters, setAnalyticsFilters] = useState({
    period: "30d" as "7d" | "30d" | "90d" | "1y",
    source: "all" as "all" | "google" | "referral" | "organic" | "paid",
    stage: "all" as "all" | "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "won",
    assignee: "all" as "all" | "unassigned" | "assigned"
  });

  // Hooks de métricas dinâmicas
  const { data: mainMetrics, isLoading: mainMetricsLoading } = useDynamicMetrics(analyticsFilters.period);
  const { data: contactMetrics, isLoading: contactMetricsLoading } = useContactMetrics(analyticsFilters.period);

  // Buscar prospects para CRM
  const { data: prospects = [], isLoading, refetch } = useQuery({
    queryKey: ["prospects-crm", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      const { data, error } = await supabase
        .from("prospects")
        .select(`
          *,
          places (
            name,
            formatted_address,
            phone_number,
            website,
            types
          )
        `)
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prospects:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!currentOrg?.id,
  });

  // Buscar dados de analytics avançados
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["crm-analytics", currentOrg?.id, analyticsFilters],
    queryFn: async () => {
      if (!currentOrg) return null;

      const now = new Date();
      const periodDays = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365
      };
      
      const startDate = subDays(now, periodDays[analyticsFilters.period]);
      const endDate = now;

      // Buscar prospects com filtros aplicados
      let query = supabase
        .from("prospects")
        .select(`
          *,
          places (
            name,
            formatted_address,
            phone_number,
            website,
            types
          )
        `)
        .eq("org_id", currentOrg.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (analyticsFilters.stage !== "all") {
        query = query.eq("pipeline_stage", analyticsFilters.stage);
      }

      const { data: filteredProspects, error } = await query;

      if (error) {
        console.error("Error fetching analytics data:", error);
        return null;
      }

      const prospectsData = filteredProspects || [];

      // Calcular métricas de conversão
      const conversionMetrics = {
        leadToContacted: prospectsData.filter(p => p.pipeline_stage === "contacted").length / Math.max(prospectsData.filter(p => p.pipeline_stage === "lead").length, 1),
        contactedToQualified: prospectsData.filter(p => p.pipeline_stage === "qualified").length / Math.max(prospectsData.filter(p => p.pipeline_stage === "contacted").length, 1),
        qualifiedToProposal: prospectsData.filter(p => p.pipeline_stage === "proposal").length / Math.max(prospectsData.filter(p => p.pipeline_stage === "qualified").length, 1),
        proposalToWon: prospectsData.filter(p => p.pipeline_stage === "won").length / Math.max(prospectsData.filter(p => p.pipeline_stage === "proposal").length, 1),
      };

      // Calcular tendências temporais (últimos 7 dias)
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayProspects = prospectsData.filter(p => {
          const prospectDate = new Date(p.created_at);
          return prospectDate >= dayStart && prospectDate <= dayEnd;
        });

        dailyStats.push({
          date: format(date, 'yyyy-MM-dd'),
          leads: dayProspects.filter(p => p.pipeline_stage === "lead").length,
          contacted: dayProspects.filter(p => p.pipeline_stage === "contacted").length,
          qualified: dayProspects.filter(p => p.pipeline_stage === "qualified").length,
          proposal: dayProspects.filter(p => p.pipeline_stage === "proposal").length,
          negotiation: dayProspects.filter(p => p.pipeline_stage === "negotiation").length,
          won: dayProspects.filter(p => p.pipeline_stage === "won").length,
          revenue: dayProspects.filter(p => p.pipeline_stage === "won").reduce((sum, p) => sum + (p.expected_revenue || 0), 0)
        });
      }

      // Calcular métricas de performance
      const performanceMetrics = {
        avgDealSize: prospectsData.length > 0 ? prospectsData.reduce((sum, p) => sum + (p.expected_revenue || 0), 0) / prospectsData.length : 0,
        totalPipelineValue: prospectsData.reduce((sum, p) => sum + (p.expected_revenue || 0), 0),
        closedWonValue: prospectsData.filter(p => p.pipeline_stage === "won").reduce((sum, p) => sum + (p.expected_revenue || 0), 0),
        avgSalesCycle: calculateAvgSalesCycle(prospectsData),
        winRate: prospectsData.length > 0 ? (prospectsData.filter(p => p.pipeline_stage === "won").length / prospectsData.length) * 100 : 0
      };

      return {
        prospects: prospectsData,
        conversionMetrics,
        dailyStats,
        performanceMetrics
      };
    },
    enabled: !!currentOrg?.id,
  });

  // Função auxiliar para calcular ciclo médio de vendas
  const calculateAvgSalesCycle = (prospects: Prospect[]) => {
    const wonProspects = prospects.filter(p => p.pipeline_stage === "won");
    if (wonProspects.length === 0) return 0;
    
    const totalDays = wonProspects.reduce((sum, p) => {
      const created = new Date(p.created_at);
      const updated = new Date(p.updated_at);
      return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / wonProspects.length);
  };


  // Estatísticas do pipeline
  const stats = {
    total: prospects.length,
    leads: prospects.filter(p => p.pipeline_stage === 'lead').length,
    contacted: prospects.filter(p => p.pipeline_stage === 'contacted').length,
    qualified: prospects.filter(p => p.pipeline_stage === 'qualified').length,
    proposal: prospects.filter(p => p.pipeline_stage === 'proposal').length,
    negotiation: prospects.filter(p => p.pipeline_stage === 'negotiation').length,
    won: prospects.filter(p => p.pipeline_stage === 'won').length,
    totalRevenue: prospects
      .filter(p => p.expected_revenue)
      .reduce((sum, p) => sum + (p.expected_revenue || 0), 0),
    avgProbability: prospects.length > 0 
      ? Math.round(prospects.reduce((sum, p) => sum + (p.probability || 0), 0) / prospects.length)
      : 0
  };


  const handleCreateOpportunity = () => {
    setEditingProspect(null);
    setIsModalOpen(true);
  };

  const handleEditOpportunity = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Gestão</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">CRM</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">CRM - Pipeline de Vendas</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seu pipeline de vendas e acompanhe oportunidades
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleCreateOpportunity}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Oportunidade
              </Button>
            </div>
          </div>

          {/* Estatísticas do Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total === 1 ? 'prospect no pipeline' : 'prospects no pipeline'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oportunidades Ganhas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.won}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.won === 1 ? 'oportunidade ganha' : 'oportunidades ganhas'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  valor total estimado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Probabilidade Média</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.avgProbability}%</div>
                <p className="text-xs text-muted-foreground">
                  taxa de conversão média
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pipeline" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Pipeline Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Pipeline */}
            <TabsContent value="pipeline" className="space-y-4">
              <CRMPipeline
                prospects={prospects}
                onRefresh={refetch}
              />
            </TabsContent>


            {/* Tab Analytics */}
            <TabsContent value="analytics" className="space-y-4">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando analytics...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filtros de Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros de Analytics
                      </CardTitle>
                      <CardDescription>Configure os filtros para análise específica</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Período</Label>
                          <Select 
                            value={analyticsFilters.period} 
                            onValueChange={(value: any) => setAnalyticsFilters({...analyticsFilters, period: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7d">Últimos 7 dias</SelectItem>
                              <SelectItem value="30d">Últimos 30 dias</SelectItem>
                              <SelectItem value="90d">Últimos 90 dias</SelectItem>
                              <SelectItem value="1y">Último ano</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Fonte</Label>
                          <Select 
                            value={analyticsFilters.source} 
                            onValueChange={(value: any) => setAnalyticsFilters({...analyticsFilters, source: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas as fontes</SelectItem>
                              <SelectItem value="google">Google Places</SelectItem>
                              <SelectItem value="referral">Indicação</SelectItem>
                              <SelectItem value="organic">Orgânico</SelectItem>
                              <SelectItem value="paid">Pago</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Estágio</Label>
                          <Select 
                            value={analyticsFilters.stage} 
                            onValueChange={(value: any) => setAnalyticsFilters({...analyticsFilters, stage: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os estágios</SelectItem>
                              <SelectItem value="lead">Leads</SelectItem>
                              <SelectItem value="contacted">Contactados</SelectItem>
                              <SelectItem value="qualified">Qualificados</SelectItem>
                              <SelectItem value="proposal">Proposta</SelectItem>
                              <SelectItem value="negotiation">Negociação</SelectItem>
                              <SelectItem value="won">Ganhos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Atribuição</Label>
                          <Select 
                            value={analyticsFilters.assignee} 
                            onValueChange={(value: any) => setAnalyticsFilters({...analyticsFilters, assignee: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="unassigned">Não atribuídos</SelectItem>
                              <SelectItem value="assigned">Atribuídos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métricas Principais */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData?.prospects?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">no período selecionado</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">
                            {mainMetrics?.prospectsChange ? 
                              `${mainMetrics.prospectsChange > 0 ? '+' : ''}${mainMetrics.prospectsChange}% vs período anterior` : 
                              '+0% vs período anterior'
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                        <Target className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {analyticsData?.performanceMetrics?.winRate?.toFixed(1) || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">leads para ganhos</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">
                            {mainMetrics?.conversionRateChange ? 
                              `${mainMetrics.conversionRateChange > 0 ? '+' : ''}${mainMetrics.conversionRateChange}% vs período anterior` : 
                              '+0% vs período anterior'
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor do Pipeline</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          R$ {analyticsData?.performanceMetrics?.totalPipelineValue?.toLocaleString('pt-BR') || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">valor total estimado</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">
                            {mainMetrics?.revenueChange ? 
                              `${mainMetrics.revenueChange > 0 ? '+' : ''}${mainMetrics.revenueChange}% vs período anterior` : 
                              '+0% vs período anterior'
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          R$ {analyticsData?.performanceMetrics?.avgDealSize?.toLocaleString('pt-BR') || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">valor médio por deal</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">
                            {contactMetrics?.totalContactsChange ? 
                              `${contactMetrics.totalContactsChange > 0 ? '+' : ''}${contactMetrics.totalContactsChange}% vs período anterior` : 
                              '+0% vs período anterior'
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ciclo de Vendas</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {analyticsData?.performanceMetrics?.avgSalesCycle || 0} dias
                        </div>
                        <p className="text-xs text-muted-foreground">tempo médio para fechar</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">-2 dias vs período anterior</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Funil de Conversão */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Funil de Conversão
                      </CardTitle>
                      <CardDescription>Taxa de conversão entre cada estágio do pipeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                            <div className="text-2xl font-bold text-gray-600">
                              {analyticsData?.prospects?.filter(p => p.pipeline_stage === "lead").length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Leads</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div className="bg-gray-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">
                              {analyticsData?.prospects?.filter(p => p.pipeline_stage === "contacted").length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Contactados</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analyticsData?.conversionMetrics?.leadToContacted || 0) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {((analyticsData?.conversionMetrics?.leadToContacted || 0) * 100).toFixed(1)}% conversão
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border">
                            <div className="text-2xl font-bold text-purple-600">
                              {analyticsData?.prospects?.filter(p => p.pipeline_stage === "qualified").length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Qualificados</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analyticsData?.conversionMetrics?.contactedToQualified || 0) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-purple-600 mt-1">
                              {((analyticsData?.conversionMetrics?.contactedToQualified || 0) * 100).toFixed(1)}% conversão
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">
                              {analyticsData?.prospects?.filter(p => p.pipeline_stage === "won").length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Ganhos</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analyticsData?.conversionMetrics?.proposalToWon || 0) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {((analyticsData?.conversionMetrics?.proposalToWon || 0) * 100).toFixed(1)}% conversão
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tendência Temporal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Tendência dos Últimos 7 Dias
                      </CardTitle>
                      <CardDescription>Evolução do pipeline nos últimos dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                        {analyticsData?.dailyStats?.map((day, index) => {
                          const total = day.leads + day.contacted + day.qualified + day.proposal + day.negotiation + day.won;
                          const wonRate = total > 0 ? (day.won / total) * 100 : 0;
                          
                          return (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-md transition-all">
                              <div className="text-center mb-3">
                                <div className="text-sm font-semibold text-gray-900">
                                  {format(new Date(day.date), 'EEE', { locale: ptBR })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(day.date), 'dd/MM')}
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {/* Total de Prospects */}
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900">{total}</div>
                                  <div className="text-xs text-muted-foreground">prospects</div>
                                </div>
                                
                                {/* Taxa de Ganho */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-green-600 font-medium">Ganhos</span>
                                    <span className="font-semibold">{day.won}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${Math.min(wonRate * 2, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Receita do Dia */}
                                <div className="text-center">
                                  <div className="text-sm font-bold text-green-600">
                                    R$ {day.revenue.toLocaleString('pt-BR')}
                                  </div>
                                  <div className="text-xs text-muted-foreground">receita</div>
                                </div>
                              </div>
                              
                              {/* Indicador de Performance */}
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-center">
                                  <div className={`w-2 h-2 rounded-full ${
                                    wonRate >= 20 ? 'bg-green-500' : 
                                    wonRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></div>
                                </div>
                                <div className="text-xs text-center mt-1 text-muted-foreground">
                                  {wonRate >= 20 ? 'Excelente' : 
                                   wonRate >= 10 ? 'Bom' : 'Melhorar'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Resumo da Semana */}
                      <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {analyticsData?.dailyStats?.reduce((acc, day) => acc + day.leads + day.contacted + day.qualified + day.proposal + day.negotiation + day.won, 0) || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Prospects</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {analyticsData?.dailyStats?.reduce((acc, day) => acc + day.won, 0) || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Ganhos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              R$ {analyticsData?.dailyStats?.reduce((acc, day) => acc + day.revenue, 0).toLocaleString('pt-BR') || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Receita Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {analyticsData?.dailyStats?.length ? 
                                (analyticsData.dailyStats.reduce((acc, day) => {
                                  const total = day.leads + day.contacted + day.qualified + day.proposal + day.negotiation + day.won;
                                  return acc + (total > 0 ? (day.won / total) * 100 : 0);
                                }, 0) / analyticsData.dailyStats.length).toFixed(1) : 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Taxa Média</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insights Inteligentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Insights Inteligentes
                      </CardTitle>
                      <CardDescription>Análise automatizada do seu pipeline de vendas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Pontos Fortes</span>
                          </div>
                          <ul className="space-y-2 text-sm text-green-700">
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>Taxa de conversão de {analyticsData?.performanceMetrics?.winRate?.toFixed(1) || 0}% está acima da média</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>Ciclo de vendas de {analyticsData?.performanceMetrics?.avgSalesCycle || 0} dias é eficiente</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>Pipeline saudável com R$ {analyticsData?.performanceMetrics?.totalPipelineValue?.toLocaleString('pt-BR') || 0} em oportunidades</span>
                            </li>
                          </ul>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <Target className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-800">Oportunidades</span>
                          </div>
                          <ul className="space-y-2 text-sm text-orange-700">
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>Melhore conversão de leads para contatados: {((analyticsData?.conversionMetrics?.leadToContacted || 0) * 100).toFixed(1)}%</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>Acelere qualificação de prospects contactados</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>Foque em oportunidades de maior valor para aumentar ticket médio</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações Rápidas */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar Relatório
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar Alertas
                      </Button>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-primary-glow">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Relatório Completo
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      <OpportunityModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        prospect={editingProspect}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

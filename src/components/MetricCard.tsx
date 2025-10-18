import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
  showChange?: boolean;
  formatValue?: (value: number) => string;
}

export function MetricCard({
  title,
  value,
  change,
  description,
  icon,
  className,
  valueClassName,
  showChange = true,
  formatValue
}: MetricCardProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20';
    if (change < 0) return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
    return 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3" />;
    if (change < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const formattedValue = formatValue ? formatValue(Number(value)) : value;

  return (
    <Card className={cn("relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground whitespace-nowrap">{title}</CardTitle>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={cn("text-2xl font-bold tracking-tight mb-1", valueClassName)}>
          {formattedValue}
        </div>
        {showChange && change !== undefined && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="default" className={cn("flex items-center gap-1 text-xs", getChangeColor(change))}>
              {getChangeIcon(change)}
              {Math.abs(change)}%
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">vs. período anterior</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MetricGrid({ children, className }: MetricGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

// Componente específico para métricas de performance
interface PerformanceMetricProps {
  label: string;
  value: number;
  max: number;
  change?: number;
  unit?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function PerformanceMetric({
  label,
  value,
  max,
  change,
  unit = '%',
  color = 'blue'
}: PerformanceMetricProps) {
  const percentage = Math.round((value / max) * 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value}{unit} {change !== undefined && (
            <span className={cn(
              "text-xs ml-1",
              change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-gray-600"
            )}>
              ({change > 0 ? '+' : ''}{change}%)
            </span>
          )}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all duration-300", colorClasses[color])}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Componente para estatísticas de tempo real
interface RealtimeStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export function RealtimeStat({ icon, label, value, trend, className }: RealtimeStatProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn("flex items-center space-x-3 p-3 rounded-lg bg-card border", className)}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
      {trend && (
        <div className={cn("flex-shrink-0", getTrendColor(trend))}>
          {trend === 'up' && <ArrowUp className="h-4 w-4" />}
          {trend === 'down' && <ArrowDown className="h-4 w-4" />}
          {trend === 'stable' && <Minus className="h-4 w-4" />}
        </div>
      )}
    </div>
  );
}

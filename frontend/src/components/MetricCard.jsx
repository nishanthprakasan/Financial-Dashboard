import { Card, CardContent } from './ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from "../lib/utils";

export function MetricCard({ title, value, change, trend, icon }) {
  const isPositive = trend === 'up';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
            <div className="flex items-center gap-1 mt-3">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
                {change}
              </span>
              <span className="text-xs text-slate-500 ml-1">vs last month</span>
            </div>
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              isPositive ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
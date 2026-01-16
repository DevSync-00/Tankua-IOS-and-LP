"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, change, changeLabel, icon, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-card",
      primary: "bg-gradient-gold text-primary-foreground",
      success: "bg-emerald-500 text-white",
      warning: "bg-amber-500 text-white",
    };

    const getTrendIcon = () => {
      if (!change || change === 0) return <Minus className="h-3 w-3" />;
      if (change > 0) return <TrendingUp className="h-3 w-3" />;
      return <TrendingDown className="h-3 w-3" />;
    };

    const getTrendColor = () => {
      if (variant !== "default") return "opacity-80";
      if (!change || change === 0) return "text-muted-foreground";
      if (change > 0) return "text-emerald-600";
      return "text-red-600";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(change !== undefined || changeLabel) && (
              <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor())}>
                {change !== undefined && (
                  <>
                    {getTrendIcon()}
                    <span>{change > 0 ? "+" : ""}{change}%</span>
                  </>
                )}
                {changeLabel && <span className="opacity-70">{changeLabel}</span>}
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "rounded-xl p-3",
              variant === "default" ? "bg-primary/10 text-primary" : "bg-white/20"
            )}>
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };


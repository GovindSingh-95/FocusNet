
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, children, className = "" }: DashboardCardProps) {
  return (
    <Card className={`dashboard-card ${className}`}>
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">{title}</h2>
      </div>
      <div className="h-full">
        {children}
      </div>
    </Card>
  );
}

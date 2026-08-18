import React from "react";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div className="text-center py-16 bg-card rounded-2xl shadow-sm border border-border">
    <Icon className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
    <p className="text-foreground text-lg font-semibold">{title}</p>
    {description && (
      <p className="text-muted-foreground text-sm mt-2">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;

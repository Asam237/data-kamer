import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  active,
  className = "",
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border transition-colors ${
      active
        ? "bg-blue-500 text-white border-blue-500"
        : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default IconButton;

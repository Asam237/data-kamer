import React from "react";
import { motion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  delay = 0,
  ...rest
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={hover ? { y: -4 } : undefined}
    className={`bg-card text-card-foreground rounded-2xl shadow-sm border border-border transition-shadow duration-300 ${
      hover ? "hover:shadow-lg" : ""
    } ${className}`}
    {...(rest as any)}
  >
    {children}
  </motion.div>
);

export default Card;

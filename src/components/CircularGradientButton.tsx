
import React from "react";
import { motion } from "framer-motion";
import { Play, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CircularGradientButtonProps {
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  size?: number;
  disabled?: boolean;
  ariaLabel?: string;
  color?: "primary" | "secondary" | "accent"; // Added color option
}

export const CircularGradientButton: React.FC<CircularGradientButtonProps> = ({
  onClick,
  className,
  icon = <Play size={28} className="text-white" />,
  children,
  size = 72,
  disabled = false,
  ariaLabel,
  color = "primary",
}) => {
  // Define gradient based on color prop
  const gradientClasses = {
    primary: "from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400",
    secondary: "from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400", 
    accent: "from-green-500 to-teal-400 hover:from-green-400 hover:to-teal-300"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "relative flex flex-col items-center justify-center group transition-all duration-300",
        `bg-gradient-to-r ${gradientClasses[color]} shadow-lg hover:shadow-purple-500/30 text-white font-semibold`,
        "rounded-full border border-purple-500/30 overflow-hidden",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      {/* Subtle pulse overlay */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.18, 0.29, 0.18],
        }}
        transition={{
          duration: 2.1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.16) 40%, rgba(236,72,153,0.14) 85%, transparent 100%)",
          zIndex: 1,
        }}
      />
      {/* Icon */}
      <span className="z-10 mb-0.5">{icon}</span>
      {/* Text */}
      <span className="z-10 text-xs font-bold mt-0.5">
        {children}
      </span>
    </motion.button>
  );
};

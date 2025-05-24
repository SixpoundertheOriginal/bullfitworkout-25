
import React from "react";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";
import {
  PopoverTrigger,
  PopoverContent,
} from "./popover";
import {
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible";
import { Button } from "./button";

// Safe Dialog Trigger that never uses asChild
interface SafeDialogTriggerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onClick?: () => void;
}

export const SafeDialogTrigger: React.FC<SafeDialogTriggerProps> = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  onClick,
}) => {
  return (
    <DialogTrigger asChild={false} className={className} disabled={disabled} onClick={onClick}>
      <Button variant={variant} size={size} className="w-full h-full">
        {children}
      </Button>
    </DialogTrigger>
  );
};

// Safe Dropdown Menu Trigger that never uses asChild
interface SafeDropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export const SafeDropdownTrigger: React.FC<SafeDropdownTriggerProps> = ({
  children,
  className = "",
  variant = "outline",
  size = "default",
  disabled = false,
}) => {
  return (
    <DropdownMenuTrigger asChild={false} className={className} disabled={disabled}>
      <Button variant={variant} size={size} className="w-full h-full">
        {children}
      </Button>
    </DropdownMenuTrigger>
  );
};

// Safe Popover Trigger that never uses asChild
interface SafePopoverTriggerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export const SafePopoverTrigger: React.FC<SafePopoverTriggerProps> = ({
  children,
  className = "",
  variant = "outline",
  size = "default",
  disabled = false,
}) => {
  return (
    <PopoverTrigger asChild={false} className={className} disabled={disabled}>
      <Button variant={variant} size={size} className="w-full h-full">
        {children}
      </Button>
    </PopoverTrigger>
  );
};

// Safe Collapsible Trigger that never uses asChild
interface SafeCollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export const SafeCollapsibleTrigger: React.FC<SafeCollapsibleTriggerProps> = ({
  children,
  className = "",
  variant = "ghost",
  size = "default",
  disabled = false,
}) => {
  return (
    <CollapsibleTrigger asChild={false} className={className} disabled={disabled}>
      <Button variant={variant} size={size} className="w-full h-full">
        {children}
      </Button>
    </CollapsibleTrigger>
  );
};

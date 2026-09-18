import React from "react";
import { Loader2Icon, BoxIcon } from "lucide-react";
import { cn } from "../../utils/cn";
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'xl';
const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white border border-primary hover:bg-primary-dark active:bg-primary-deep disabled:bg-primary/50 disabled:border-primary/50',
  secondary: 'bg-surface text-ink border border-line hover:bg-subtle active:bg-subtle disabled:text-muted',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-subtle hover:text-ink',
  danger: 'bg-surface text-primary border border-primary/40 hover:bg-primary-light active:bg-primary-light',
  success: 'bg-success text-white border border-success hover:brightness-95 active:brightness-90'
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-[10px]',
  xl: 'h-14 px-6 text-base gap-2.5 rounded-xl'
};
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: BoxIcon;
  iconRight?: BoxIcon;
  loading?: boolean;
  block?: boolean;
}
export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  block = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return <button type="button" disabled={disabled || loading} className={cn('inline-flex items-center justify-center font-semibold transition-colors duration-150 ease-out', 'disabled:cursor-not-allowed disabled:opacity-70', variants[variant], sizes[size], block && 'w-full', className)} {...rest}>
      {loading ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : Icon && <Icon className={cn(size === 'xl' ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4" aria-hidden />}
    </button>;
}
export function IconButton({
  icon: Icon,
  label,
  className,
  ...rest



}: {icon: BoxIcon;label: string;} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" aria-label={label} title={label} className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-muted', 'transition-colors duration-150 ease-out hover:bg-subtle hover:text-ink', className)} {...rest}>
      <Icon className="h-4 w-4" aria-hidden />
    </button>;
}
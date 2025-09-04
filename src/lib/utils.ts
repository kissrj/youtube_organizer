import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility for combining design system classes
export function combineClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Utility for conditional classes
export function conditionalClass(condition: boolean, trueClass: string, falseClass?: string): string {
  return condition ? trueClass : (falseClass || '')
}

// Utility for variant classes
export function variantClass(base: string, variants: Record<string, string>, variant?: string): string {
  if (!variant || !variants[variant]) return base
  return `${base} ${variants[variant]}`
}

// Utility for responsive classes
export function responsiveClass(classes: {
  default?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
}): string {
  const responsiveClasses = []

  if (classes.default) responsiveClasses.push(classes.default)
  if (classes.sm) responsiveClasses.push(`sm:${classes.sm}`)
  if (classes.md) responsiveClasses.push(`md:${classes.md}`)
  if (classes.lg) responsiveClasses.push(`lg:${classes.lg}`)
  if (classes.xl) responsiveClasses.push(`xl:${classes.xl}`)
  if (classes['2xl']) responsiveClasses.push(`2xl:${classes['2xl']}`)

  return responsiveClasses.join(' ')
}

// Utility for spacing classes
export function spacingClass(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl', type: 'p' | 'm' | 'px' | 'py' | 'mx' | 'my' = 'p'): string {
  const sizes = {
    xs: '2',
    sm: '3',
    md: '4',
    lg: '6',
    xl: '8',
    '2xl': '12',
    '3xl': '16'
  }

  return `${type}-${sizes[size]}`
}

// Utility for color classes
export function colorClass(color: 'primary' | 'success' | 'warning' | 'error' | 'info', shade: '50' | '100' | '500' | '600' | '700' = '600'): string {
  return `text-${color}-${shade}`
}

// Utility for shadow classes
export function shadowClass(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  return `shadow-${size}`
}

// Utility for border radius classes
export function radiusClass(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): string {
  return `rounded-${size}`
}

// Utility for transition classes
export function transitionClass(speed: 'fast' | 'normal' | 'slow' = 'normal'): string {
  return `transition-${speed}`
}

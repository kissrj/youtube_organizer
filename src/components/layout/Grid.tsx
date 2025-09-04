import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gridVariants = cva(
  "grid",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        6: "grid-cols-6",
        12: "grid-cols-12",
      },
      gap: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
        "2xl": "gap-12",
      },
      responsive: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      cols: 1,
      gap: "md",
      responsive: true,
    },
  }
)

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, responsive = true, ...props }, ref) => {
    let responsiveClasses = ""

    if (responsive && cols) {
      if (cols >= 2) responsiveClasses += " sm:grid-cols-2"
      if (cols >= 3) responsiveClasses += " md:grid-cols-3"
      if (cols >= 4) responsiveClasses += " lg:grid-cols-4"
      if (cols >= 6) responsiveClasses += " xl:grid-cols-6"
    }

    return (
      <div
        ref={ref}
        className={cn(
          gridVariants({ cols, gap, responsive }),
          responsiveClasses.trim(),
          className
        )}
        {...props}
      />
    )
  }
)

Grid.displayName = "Grid"

export { Grid, gridVariants }
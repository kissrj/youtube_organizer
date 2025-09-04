import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const modalVariants = cva(
  "fixed inset-0 z-modal flex items-center justify-center p-4",
  {
    variants: {
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
        full: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const modalBackdropVariants = cva(
  "absolute inset-0 bg-overlay transition-opacity",
  {
    variants: {
      blur: {
        true: "backdrop-blur-sm",
        false: "",
      },
    },
    defaultVariants: {
      blur: true,
    },
  }
)

const modalContentVariants = cva(
  "relative bg-surface rounded-lg shadow-xl border border-border max-h-[90vh] overflow-hidden",
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        md: "w-full max-w-md",
        lg: "w-full max-w-lg",
        xl: "w-full max-w-xl",
        full: "w-full max-w-4xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: VariantProps<typeof modalContentVariants>["size"]
  blur?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  children: React.ReactNode
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  blur = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
}: ModalProps) => {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus()
      }

      // Prevent body scroll
      document.body.style.overflow = "hidden"
    } else {
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }

      // Restore body scroll
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={modalVariants({ size })}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div
        className={modalBackdropVariants({ blur })}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={modalContentVariants({ size })}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-0">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-text"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fechar modal"
                className="ml-auto"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="px-6 pb-0">
            <p
              id="modal-description"
              className="text-sm text-muted"
            >
              {description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export { Modal, modalVariants, modalContentVariants }
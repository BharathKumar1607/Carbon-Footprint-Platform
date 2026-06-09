import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Manage focus on open/close
  useEffect(() => {
    if (isOpen) {
      // Save previously focused element to restore it on close
      triggerRef.current = document.activeElement as HTMLElement;

      // Put focus inside the modal
      if (modalRef.current) {
        // Find first focusable element inside modal
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          modalRef.current.focus();
        }
      }

      // Add no-scroll to body to prevent double scrollbars
      document.body.style.overflow = "hidden";
    } else {
      // Restore focus
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }

      // Trapping focus
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        tabIndex={-1}
        className="w-full max-w-lg glass-card shadow-2xl p-6 relative overflow-hidden border border-white/15 animate-in zoom-in-95 duration-200 outline-none focus:ring-1 focus:ring-emerald-400"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      >
        {/* Absolute Background Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-1">
            <h3
              id="modal-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              {title}
            </h3>
            {description && (
              <p
                id="modal-description"
                className="text-xs text-slate-400 font-sans"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal dialog"
            className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}

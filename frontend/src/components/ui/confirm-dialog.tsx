"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import {
  Ban,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ConfirmTone = "danger" | "warning" | "success" | "info";

const TONES: Record<
  ConfirmTone,
  { icon: LucideIcon; iconWrap: string; confirm: string }
> = {
  danger: {
    icon: Trash2,
    iconWrap: "bg-red-50 text-red-600 ring-red-100",
    confirm: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-600/30 text-white",
  },
  warning: {
    icon: Ban,
    iconWrap: "bg-orange-50 text-orange-600 ring-orange-100",
    confirm:
      "bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-600/30 text-white",
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-green-50 text-[#22A146] ring-green-100",
    confirm:
      "bg-[#22A146] hover:bg-[#1B8A3A] focus-visible:ring-[#22A146]/30 text-white",
  },
  info: {
    icon: Info,
    iconWrap: "bg-[#0D2B45]/5 text-[#0D2B45] ring-[#0D2B45]/10",
    confirm:
      "bg-[#0D2B45] hover:bg-[#0C1F33] focus-visible:ring-[#0D2B45]/30 text-white",
  },
};

export interface ConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  icon?: LucideIcon;
  /**
   * Optional action to run on confirm. While it is pending the dialog stays
   * open with a spinner; it closes on success and stays open on failure so
   * the user can retry or cancel.
   */
  onConfirm?: () => unknown | Promise<unknown>;
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shows the spinner; use when the pending state is tracked by the caller. */
  loading?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  icon,
  onConfirm,
  loading = false,
  children,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const busy = loading || pending;
  const style = TONES[tone];
  const Icon = icon ?? style.icon;

  const handleConfirm = async (event: React.MouseEvent) => {
    // Keep the dialog open until the action settles.
    event.preventDefault();
    if (busy) return;
    if (!onConfirm) {
      onOpenChange(false);
      return;
    }
    try {
      setPending(true);
      await onConfirm();
      onOpenChange(false);
    } catch {
      // The action reports its own error (e.g. a toast); leave the dialog open.
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0C1F33]/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <AlertDialogPrimitive.Content
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-[#E3E8EF] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-8",
                style.iconWrap,
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogPrimitive.Title
                className="text-lg text-[#0C1F33]"
                style={{ fontFamily: "'Marcellus', serif" }}
              >
                {title}
              </AlertDialogPrimitive.Title>
              {description ? (
                <AlertDialogPrimitive.Description className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
                  {description}
                </AlertDialogPrimitive.Description>
              ) : (
                <AlertDialogPrimitive.Description className="sr-only">
                  Please confirm this action.
                </AlertDialogPrimitive.Description>
              )}
              {children}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel
              disabled={busy}
              className="h-10 rounded-lg border border-[#E3E8EF] bg-white px-4 text-sm font-semibold text-[#334155] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelLabel}
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              onClick={handleConfirm}
              disabled={busy}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-4 disabled:opacity-70",
                style.confirm,
              )}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {confirmLabel}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

// ──────────────────────────────────
// Imperative API: `const confirm = useConfirm(); if (await confirm({...}))`
// ──────────────────────────────────

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const confirmed = useRef(false);

  const confirm = useCallback<ConfirmFn>((next) => {
    // Settle any dialog that is still waiting before opening a new one.
    resolver.current?.(false);
    confirmed.current = false;
    setOptions(next);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resolver.current?.(confirmed.current);
      resolver.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          {...options}
          open={open}
          onOpenChange={handleOpenChange}
          onConfirm={async () => {
            await options.onConfirm?.();
            confirmed.current = true;
          }}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return confirm;
}

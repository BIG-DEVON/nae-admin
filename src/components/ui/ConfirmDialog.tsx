import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onClose,
  onConfirm,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // Sync <dialog> open state with prop
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // Close on ESC or clicking backdrop
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;

    const handleCancel = (e: Event) => {
      e.preventDefault(); // prevent default close to funnel through onClose
      onClose();
    };

    // click outside = backdrop
    const handleClick = (e: MouseEvent) => {
      if (!dlg.open) return;
      const rect = dlg.getBoundingClientRect();
      const inDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inDialog) onClose();
    };

    dlg.addEventListener("cancel", handleCancel);
    dlg.addEventListener("click", handleClick);
    return () => {
      dlg.removeEventListener("cancel", handleCancel);
      dlg.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className="rounded-2xl p-0 w-[min(96vw,480px)] backdrop:bg-black/30"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
      >
        <div className="p-5 space-y-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {message && <p className="text-sm text-neutral-600">{message}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border text-sm"
            >
              {cancelText}
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-black text-white text-sm">
              {confirmText}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

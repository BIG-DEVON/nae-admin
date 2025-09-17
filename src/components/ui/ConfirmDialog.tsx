import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="rounded-2xl p-0 w-[min(92vw,420px)] backdrop:bg-black/40"
      onClose={onClose}
    >
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-neutral-600">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border text-sm hover:bg-neutral-50">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-black text-white text-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}

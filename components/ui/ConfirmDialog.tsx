"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busyLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  busyLabel = "Deleting...",
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} label={title} className="max-w-sm">
      <h2 className="text-lg font-medium text-on-surface mb-2">{title}</h2>
      <p className="text-sm text-on-surface-variant mb-6">{description}</p>
      <div className="flex justify-end gap-2">
        <Button variant="text" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? busyLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

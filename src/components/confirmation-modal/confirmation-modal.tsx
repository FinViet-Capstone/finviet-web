"use client";

import styles from "./confirmation-modal.module.css";

export type ConfirmationModalVariant = "primary" | "destructive" | "warning";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  variant?: ConfirmationModalVariant;
  onCancel: () => void;
  onConfirm: () => void;
}

const confirmButtonStyleByVariant: Record<ConfirmationModalVariant, string> = {
  primary: styles.confirmPrimary,
  destructive: styles.confirmDestructive,
  warning: styles.confirmWarning,
};

export function ConfirmationModal({
  isOpen,
  title,
  description,
  cancelLabel = "Hủy",
  confirmLabel,
  variant = "primary",
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirmation-modal-title">
        <h2 id="confirmation-modal-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmButtonStyleByVariant[variant]} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

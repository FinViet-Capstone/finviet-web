"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./form-modal.module.css";

interface FormModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}

export function FormModal({ title, onClose, children, footer }: FormModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
        <div className={styles.header}>
          <h2 id="form-modal-title" className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.closeButton} aria-label="Đóng" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        <div className={styles.footer}>{footer}</div>
      </div>
    </div>
  );
}

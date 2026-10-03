"use client";

import { useState } from "react";
import { ExternalLink, FileText, FileX2 } from "lucide-react";
import { FormModal } from "@/components/form-modal/form-modal";
import type { AdminDocument } from "@/types/knowledge-base";
import styles from "./knowledge-base.module.css";

interface DocumentPreviewModalProps {
  document: AdminDocument;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const fileUrl = `/api/knowledge-base/documents/${encodeURIComponent(document.id)}/file`;

  return (
    <FormModal
      title="Xem trước tài liệu"
      size={document.hasFile ? "wide" : "default"}
      onClose={onClose}
      footer={
        <>
          {document.hasFile ? (
            <a className={styles.openInTabLink} href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} strokeWidth={2} />
              Mở trong tab mới
            </a>
          ) : null}
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Đóng
          </button>
        </>
      }
    >
      <div className={styles.previewCard}>
        <span className={styles.previewIcon}>
          <FileText size={24} strokeWidth={2} />
        </span>
        <div className={styles.previewMeta}>
          <span className={styles.previewTitle}>{document.title}</span>
          <span className={styles.previewDetail}>
            {document.chunkCount ?? "—"} đoạn nội dung · Tải lên: {document.uploadedAtLabel}
          </span>
        </div>
      </div>

      {document.hasFile ? (
        <div className={styles.pdfFrameWrapper}>
          {isLoaded ? null : <div className={styles.pdfFrameLoading}>Đang tải tài liệu…</div>}
          <iframe
            className={styles.pdfFrame}
            src={fileUrl}
            title={`Nội dung tài liệu ${document.title}`}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      ) : (
        <div className={styles.missingFile} role="status">
          <FileX2 size={20} strokeWidth={2} className={styles.missingFileIcon} />
          <p>
            File gốc của tài liệu này không còn được lưu trữ, nên không thể xem trước. AI vẫn đang sử
            dụng nội dung đã nạp. Để xem trước, hãy tải lên lại tài liệu này.
          </p>
        </div>
      )}
    </FormModal>
  );
}

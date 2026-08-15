"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Eye, FileText, Plus, Trash2, Upload } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal/confirmation-modal";
import { FormModal } from "@/components/form-modal/form-modal";
import { useDeleteDocument, useDocuments, useUploadDocument } from "@/hooks/useDocuments";
import type { AdminDocument } from "@/types/knowledge-base";
import styles from "./knowledge-base.module.css";

type UploadStep = "idle" | "progress" | "success";

const PROGRESS_INTERVAL_MS = 150;
const PROGRESS_STEP = 12;

export default function KnowledgeBasePage() {
  const { data: documents = [], isLoading, isError } = useDocuments();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const [uploadStep, setUploadStep] = useState<UploadStep | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDocument | null>(null);
  const [previewTarget, setPreviewTarget] = useState<AdminDocument | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const progressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function openUploadModal() {
    setUploadStep("idle");
    setFile(null);
    setTitle("");
    setIsDragActive(false);
    setProgress(0);
    setUploadError(null);
  }

  function closeUploadModal() {
    setUploadStep(null);
  }

  function pickFile(selectedFile: File) {
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, ""));
    }
  }

  function handleStartUpload() {
    if (!file || !title.trim()) return;
    setUploadStep("progress");
    setProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("file", file);
    uploadDocument.mutate(formData, {
      onError: (err) => {
        if (progressTimerRef.current !== null) {
          window.clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        setUploadStep("idle");
        setUploadError(err instanceof Error ? err.message : "Không thể tải lên tài liệu.");
      },
    });

    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + PROGRESS_STEP);
        if (next >= 100) {
          if (progressTimerRef.current !== null) {
            window.clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }
          setUploadStep("success");
        }
        return next;
      });
    }, PROGRESS_INTERVAL_MS);
  }

  function handleUploadDone() {
    closeUploadModal();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteDocument.mutate(deleteTarget.id, {
      onSuccess: () => showToast(`Đã xóa tài liệu ${deleteTarget.title}`),
    });
    setDeleteTarget(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Kho tri thức AI</h1>
          <p className={styles.subtitle}>Tài liệu dùng để AI chatbot trả lời khách hàng</p>
        </div>
        <button type="button" className={styles.addButton} onClick={openUploadModal}>
          <Plus size={16} strokeWidth={2} />
          Tải lên tài liệu
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Số đoạn</th>
              <th>Ngày tải lên</th>
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Đang tải…
                </td>
              </tr>
            ) : null}
            {isError ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Không thể tải danh sách tài liệu.
                </td>
              </tr>
            ) : null}
            {documents.map((document) => (
              <tr key={document.id} className={styles.row}>
                <td>
                  <div className={styles.titleCell}>
                    <FileText size={16} strokeWidth={2} className={styles.titleIcon} />
                    {document.title}
                  </div>
                </td>
                <td>
                  <span
                    className={
                      document.status === "ready"
                        ? `${styles.badge} ${styles.badgeReady}`
                        : `${styles.badge} ${styles.badgeProcessing}`
                    }
                  >
                    <span className={styles.statusDot} />
                    {document.status === "ready" ? "Sẵn sàng" : "Đang xử lý"}
                  </span>
                </td>
                <td className={styles.mutedCell}>{document.chunkCount ?? "—"}</td>
                <td className={styles.mutedCell}>{document.uploadedAtLabel}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.previewButton}
                      aria-label={`Xem trước tài liệu ${document.title}`}
                      disabled={document.status !== "ready"}
                      onClick={() => setPreviewTarget(document)}
                    >
                      <Eye size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      aria-label={`Xóa tài liệu ${document.title}`}
                      onClick={() => setDeleteTarget(document)}
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && documents.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Chưa có tài liệu nào trong kho tri thức.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {uploadStep === "idle" ? (
        <FormModal
          title="Tải lên tài liệu"
          onClose={closeUploadModal}
          footer={
            <>
              <button type="button" className={styles.cancelButton} onClick={closeUploadModal}>
                Hủy
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                disabled={!file || !title.trim()}
                onClick={handleStartUpload}
              >
                Tải lên
              </button>
            </>
          }
        >
          {uploadError ? <p className={styles.dropzoneHint}>{uploadError}</p> : null}
          <label
            className={isDragActive ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragActive(false);
              const droppedFile = event.dataTransfer.files[0];
              if (droppedFile) pickFile(droppedFile);
            }}
          >
            <span className={styles.dropzoneIcon}>
              <Upload size={20} strokeWidth={2} />
            </span>
            {file ? (
              <span className={styles.dropzoneFile}>{file.name}</span>
            ) : (
              <>
                <span className={styles.dropzoneLabel}>Kéo thả file PDF vào đây hoặc chọn file</span>
                <span className={styles.dropzoneHint}>Chỉ hỗ trợ định dạng PDF</span>
              </>
            )}
            <input
              type="file"
              accept="application/pdf"
              className={styles.hiddenFileInput}
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];
                if (selectedFile) pickFile(selectedFile);
              }}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Tiêu đề</span>
            <input
              type="text"
              className={styles.input}
              placeholder="VD: Chính sách bảo mật 2026"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
        </FormModal>
      ) : null}

      {uploadStep === "progress" ? (
        <div className={styles.stateOverlay}>
          <div className={styles.stateModal} role="dialog" aria-modal="true" aria-labelledby="upload-progress-title">
            <div className={styles.progressTitle} id="upload-progress-title">
              Đang tải lên...
            </div>
            <div className={styles.progressFile}>
              <FileText size={16} strokeWidth={2} />
              {file?.name}
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progressMeta}>
              <span>Đang xử lý tài liệu...</span>
              <span>{progress}%</span>
            </div>
            <p className={styles.progressWarning}>Vui lòng không đóng cửa sổ này trong khi tải lên.</p>
          </div>
        </div>
      ) : null}

      {uploadStep === "success" ? (
        <div className={styles.stateOverlay}>
          <div
            className={`${styles.stateModal} ${styles.successModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-success-title"
          >
            <span className={styles.successIcon}>
              <CheckCircle2 size={28} strokeWidth={2} />
            </span>
            <h2 className={styles.successTitle} id="upload-success-title">
              Tải lên thành công
            </h2>
            <p className={styles.successDescription}>
              {file?.name} đang được xử lý và sẽ sẵn sàng sau ít phút.
            </p>
            <div className={styles.successFooter}>
              <button type="button" className={styles.confirmButton} onClick={handleUploadDone}>
                Xong
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewTarget ? (
        <FormModal
          title="Xem trước tài liệu"
          onClose={() => setPreviewTarget(null)}
          footer={
            <button type="button" className={styles.cancelButton} onClick={() => setPreviewTarget(null)}>
              Đóng
            </button>
          }
        >
          <div className={styles.previewCard}>
            <span className={styles.previewIcon}>
              <FileText size={24} strokeWidth={2} />
            </span>
            <div className={styles.previewMeta}>
              <span className={styles.previewTitle}>{previewTarget.title}</span>
              <span className={styles.previewDetail}>{previewTarget.chunkCount ?? "—"} đoạn nội dung</span>
              <span className={styles.previewDetail}>Tải lên: {previewTarget.uploadedAtLabel}</span>
            </div>
          </div>
          <p className={styles.previewNote}>
            Chưa có nội dung file thực tế để xem trước — bản demo này chỉ hiển thị metadata. Xem trước PDF thật cần
            backend cung cấp <code>RagDocument.Uri</code>.
          </p>
        </FormModal>
      ) : null}

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Xóa tài liệu?"
        description={`Xóa ${deleteTarget?.title}? Tài liệu sẽ không còn được AI sử dụng khi trả lời người dùng.`}
        confirmLabel="Xóa"
        variant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

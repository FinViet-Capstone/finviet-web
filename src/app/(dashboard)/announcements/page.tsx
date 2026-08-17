"use client";

import { useMemo, useState } from "react";
import { Bell, Eye, Send, Users } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal/confirmation-modal";
import { FormModal } from "@/components/form-modal/form-modal";
import { useAnnouncements, useSendAnnouncement } from "@/hooks/useAnnouncements";
import styles from "./announcements.module.css";

const BODY_MAX_LENGTH = 500;
const BODY_WARNING_THRESHOLD = 450;

const DEFAULT_TITLE = "Cập nhật tính năng mới";
const DEFAULT_BODY =
  "FinViet vừa cập nhật tính năng Điểm chi tiêu AI — theo dõi ngân sách của bạn thông minh hơn mỗi tuần!";

function formatCount(count: number): string {
  return count.toLocaleString("vi-VN");
}

export default function AnnouncementsPage() {
  const { data, isLoading, isError } = useAnnouncements();
  const sendAnnouncement = useSendAnnouncement();

  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const announcements = data?.items ?? [];
  const targetAudienceCount = data?.targetAudienceCount ?? 0;
  const canSend = title.trim().length > 0 && body.trim().length > 0 && body.length <= BODY_MAX_LENGTH;

  const counterClassName = useMemo(() => {
    if (body.length > BODY_MAX_LENGTH) return `${styles.charCount} ${styles.charCountDanger}`;
    if (body.length >= BODY_WARNING_THRESHOLD) return `${styles.charCount} ${styles.charCountWarning}`;
    return styles.charCount;
  }, [body.length]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function handleConfirmSend() {
    setSendError(null);
    sendAnnouncement.mutate(
      { title: title.trim(), body: body.trim(), targetSegment: "all" },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          showToast(`Đã gửi thông báo đến ${formatCount(targetAudienceCount)} người dùng`);
          setTitle("");
          setBody("");
        },
        onError: (err) => {
          setIsConfirmOpen(false);
          setSendError(err instanceof Error ? err.message : "Không thể gửi thông báo.");
        },
      }
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thông báo</h1>
      </div>

      <div className={styles.composeCard}>
        <div className={styles.formRow}>
          <label className={styles.formLabel} htmlFor="announcement-title">
            Tiêu đề
          </label>
          <input
            id="announcement-title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="VD: Cập nhật tính năng mới"
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.formLabel} htmlFor="announcement-body">
            Nội dung
          </label>
          <div className={styles.formField}>
            <textarea
              id="announcement-body"
              className={styles.textarea}
              rows={4}
              maxLength={BODY_MAX_LENGTH}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Nội dung thông báo gửi đến người dùng..."
            />
            <div className={counterClassName}>
              {body.length}/{BODY_MAX_LENGTH} ký tự
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <span className={styles.formLabel}>Đối tượng</span>
          <div className={styles.targetGroup}>
            <span className={`${styles.targetOption} ${styles.targetOptionActive}`}>
              <Users size={16} strokeWidth={2} />
              Tất cả người dùng
            </span>
          </div>
        </div>

        {sendError ? <p className={styles.fieldError}>{sendError}</p> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.previewButton}
            disabled={!title.trim() && !body.trim()}
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye size={16} strokeWidth={2} />
            Xem trước
          </button>
          <button type="button" className={styles.sendButton} disabled={!canSend} onClick={() => setIsConfirmOpen(true)}>
            <Send size={16} strokeWidth={2} />
            Gửi
          </button>
        </div>
      </div>

      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>Lịch sử thông báo</h2>
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Đối tượng</th>
                <th>Số người nhận</th>
                <th>Thời gian gửi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Đang tải…
                  </td>
                </tr>
              ) : null}
              {isError ? (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Không thể tải lịch sử thông báo.
                  </td>
                </tr>
              ) : null}
              {announcements.map((announcement) => (
                <tr key={announcement.id} className={styles.row}>
                  <td className={styles.nameCell}>{announcement.title}</td>
                  <td className={styles.mutedCell}>{announcement.targetLabel}</td>
                  <td className={styles.mutedCell}>{formatCount(announcement.recipientCount)}</td>
                  <td className={styles.mutedCell}>{announcement.sentAtLabel}</td>
                </tr>
              ))}
              {!isLoading && !isError && announcements.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Chưa có thông báo nào được gửi.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {isPreviewOpen ? (
        <FormModal
          title="Xem trước thông báo"
          onClose={() => setIsPreviewOpen(false)}
          footer={
            <button type="button" className={styles.closeButton} onClick={() => setIsPreviewOpen(false)}>
              Đóng
            </button>
          }
        >
          <div className={styles.phoneFrame}>
            <div className={styles.phoneStatusBar}>
              <span>9:41</span>
            </div>
            <div className={styles.phoneHeading}>Thông báo</div>
            <div className={styles.notificationCard}>
              <span className={styles.notificationIcon}>
                <Bell size={18} strokeWidth={2} />
              </span>
              <div className={styles.notificationBody}>
                <span className={styles.notificationTitle}>{title || "Tiêu đề thông báo"}</span>
                <span className={styles.notificationText}>{body || "Nội dung thông báo"}</span>
                <span className={styles.notificationTime}>Vừa xong</span>
              </div>
            </div>
            <div className={styles.notificationPlaceholder} />
            <div className={styles.notificationPlaceholder} />
          </div>
        </FormModal>
      ) : null}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Gửi thông báo?"
        description={`Gửi thông báo này đến ${formatCount(targetAudienceCount)} người dùng? Hành động này không thể hoàn tác.`}
        confirmLabel="Gửi"
        variant="destructive"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSend}
      />

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

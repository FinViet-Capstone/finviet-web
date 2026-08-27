"use client";

import { useState } from "react";
import { History, RotateCcw, ShieldCheck } from "lucide-react";
import { TabBar, type TabBarItem } from "@/components/tab-bar/tab-bar";
import { useAiPromptConfigs, useAiPromptHistory, useUpdateAiPromptConfig } from "@/hooks/useAiPrompts";
import {
  MAX_OUTPUT_TOKENS_MAX,
  MAX_OUTPUT_TOKENS_MIN,
  PERSONA_MAX_LENGTH,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
  TEMPERATURE_STEP,
} from "@/lib/ai-prompt-features";
import type { AdminAiPromptConfig } from "@/types/ai-prompts";
import styles from "./ai-prompts.module.css";

// What each feature key actually drives on the customer side — the backend only sends a short
// display_name, and an admin editing a persona needs to know where that persona will show up.
const featureDescriptions: Record<string, string> = {
  chat: "Trợ lý chat trả lời câu hỏi tài chính của khách hàng trong ứng dụng.",
  weekly_report: "Báo cáo AI tổng kết thu chi gửi cho khách hàng hằng tuần.",
  score_comment: "Nhận xét ngắn đi kèm điểm chi tiêu của khách hàng.",
  classification: "Tự động gán danh mục cho giao dịch mới nhập.",
};

// maxOutputTokens is held as a string so the field can be cleared while typing; it gets parsed and
// validated on save. temperature stays a number — its slider can only ever produce a valid one.
interface PromptDraft {
  personaInstruction: string;
  temperature: number;
  maxOutputTokens: string;
}

function toDraft(config: AdminAiPromptConfig): PromptDraft {
  return {
    personaInstruction: config.personaInstruction,
    temperature: config.temperature,
    maxOutputTokens: String(config.maxOutputTokens),
  };
}

function signatureOf(config: AdminAiPromptConfig): string {
  return JSON.stringify([
    config.featureKey,
    config.personaInstruction,
    config.temperature,
    config.maxOutputTokens,
    config.updatedAtLabel,
  ]);
}

export default function AiPromptsPage() {
  const { data: configs = [], isLoading, isError, error } = useAiPromptConfigs();
  const updateConfig = useUpdateAiPromptConfig();

  // No feature picked yet (first render / a key that no longer exists) falls back to the first
  // config, so this deliberately isn't kept in sync with activeKey — it's derived every render.
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeConfig = configs.find((config) => config.featureKey === activeKey) ?? configs[0] ?? null;
  const history = useAiPromptHistory(activeConfig ? activeConfig.featureKey : null);

  // The draft is stored alongside the server state it was seeded from, and derived (not synced via
  // an effect) at render time. When that server state changes — a save, or a genuine background
  // refetch — the stored draft stops matching and the form falls back to the fresh server values;
  // an identical refetch (React Query refetches on window focus) leaves an in-progress edit alone.
  const [editState, setEditState] = useState<{ signature: string; draft: PromptDraft } | null>(null);
  const signature = activeConfig ? signatureOf(activeConfig) : null;
  const draft =
    editState !== null && editState.signature === signature
      ? editState.draft
      : activeConfig
        ? toDraft(activeConfig)
        : null;

  function setDraft(next: PromptDraft) {
    if (signature === null) return;
    setEditState({ signature, draft: next });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function selectFeature(key: string) {
    if (activeConfig && key === activeConfig.featureKey) return;
    setActiveKey(key);
    setFormError(null);
  }

  function handleReset() {
    setEditState(null);
    setFormError(null);
  }

  function handleRestore(entry: { personaInstruction: string; temperature: number; maxOutputTokens: number }) {
    setDraft({
      personaInstruction: entry.personaInstruction,
      temperature: entry.temperature,
      maxOutputTokens: String(entry.maxOutputTokens),
    });
    setFormError(null);
    showToast("Đã nạp phiên bản cũ vào biểu mẫu — bấm Lưu thay đổi để áp dụng");
  }

  function handleSave() {
    if (!activeConfig || !draft) return;

    // Mirrors UpdateAiPromptConfigCommandValidator so an invalid edit is caught before the
    // round-trip; the backend still re-validates and remains the source of truth.
    const persona = draft.personaInstruction.trim();
    if (persona.length === 0) {
      setFormError("Vui lòng nhập nội dung persona.");
      return;
    }
    if (persona.length > PERSONA_MAX_LENGTH) {
      setFormError(`Persona tối đa ${PERSONA_MAX_LENGTH} ký tự.`);
      return;
    }
    const maxOutputTokens = Number(draft.maxOutputTokens);
    if (
      !Number.isInteger(maxOutputTokens) ||
      maxOutputTokens < MAX_OUTPUT_TOKENS_MIN ||
      maxOutputTokens > MAX_OUTPUT_TOKENS_MAX
    ) {
      setFormError(
        `Giới hạn token phải là số nguyên từ ${MAX_OUTPUT_TOKENS_MIN} đến ${MAX_OUTPUT_TOKENS_MAX}.`
      );
      return;
    }

    setFormError(null);
    updateConfig.mutate(
      {
        featureKey: activeConfig.featureKey,
        input: { personaInstruction: persona, temperature: draft.temperature, maxOutputTokens },
      },
      {
        onSuccess: () => showToast(`Đã lưu cấu hình ${activeConfig.displayName}`),
        onError: (err) => setFormError(err instanceof Error ? err.message : "Không thể lưu cấu hình AI."),
      }
    );
  }

  const isDirty =
    activeConfig !== null &&
    draft !== null &&
    (draft.personaInstruction !== activeConfig.personaInstruction ||
      draft.temperature !== activeConfig.temperature ||
      draft.maxOutputTokens !== String(activeConfig.maxOutputTokens));

  const tabs: TabBarItem[] = configs.map((config) => ({ key: config.featureKey, label: config.displayName }));
  const historyEntries = history.data ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cấu hình AI</h1>
        <p className={styles.subtitle}>
          Tùy chỉnh persona, độ sáng tạo và giới hạn độ dài câu trả lời cho từng tính năng AI
        </p>
      </div>

      {isLoading ? <div className={styles.stateCard}>Đang tải cấu hình AI…</div> : null}

      {isError ? (
        <div className={styles.stateCard}>
          Không thể tải cấu hình AI. {error instanceof Error ? error.message : ""}
        </div>
      ) : null}

      {!isLoading && !isError && configs.length === 0 ? (
        <div className={styles.stateCard}>Chưa có cấu hình AI nào.</div>
      ) : null}

      {activeConfig && draft ? (
        <>
          <TabBar tabs={tabs} activeKey={activeConfig.featureKey} onSelect={selectFeature} />

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderText}>
                <h2 className={styles.cardTitle}>{activeConfig.displayName}</h2>
                <p className={styles.cardSubtitle}>
                  {featureDescriptions[activeConfig.featureKey] ?? "Tính năng AI của FinViet."}
                </p>
              </div>
              <code className={styles.featureKey}>{activeConfig.featureKey}</code>
            </div>

            <label className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.label}>Persona / chỉ dẫn cho AI</span>
                <span
                  className={draft.personaInstruction.length > PERSONA_MAX_LENGTH ? styles.counterOver : styles.counter}
                >
                  {draft.personaInstruction.length}/{PERSONA_MAX_LENGTH}
                </span>
              </span>
              <textarea
                className={styles.textarea}
                rows={10}
                value={draft.personaInstruction}
                onChange={(event) => setDraft({ ...draft, personaInstruction: event.target.value })}
              />
            </label>

            <div className={styles.safetyNote}>
              <ShieldCheck size={16} strokeWidth={2} className={styles.safetyIcon} />
              <span>
                Bộ quy tắc an toàn bắt buộc (không bịa số liệu, không hỏi mật khẩu/OTP, chỉ đọc dữ liệu, chống
                prompt injection) luôn được hệ thống tự động nối vào sau persona và không thể chỉnh sửa tại đây.
              </span>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <span className={styles.labelRow}>
                  <span className={styles.label}>Temperature (độ sáng tạo)</span>
                  <span className={styles.counter}>{draft.temperature.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  className={styles.slider}
                  min={TEMPERATURE_MIN}
                  max={TEMPERATURE_MAX}
                  step={TEMPERATURE_STEP}
                  value={draft.temperature}
                  onChange={(event) => setDraft({ ...draft, temperature: Number(event.target.value) })}
                />
                <span className={styles.hint}>
                  Càng thấp càng bám sát dữ liệu, càng cao càng đa dạng cách diễn đạt ({TEMPERATURE_MIN}–
                  {TEMPERATURE_MAX}).
                </span>
              </div>

              <label className={styles.field}>
                <span className={styles.labelRow}>
                  <span className={styles.label}>Giới hạn token đầu ra</span>
                </span>
                <input
                  type="number"
                  className={styles.input}
                  min={MAX_OUTPUT_TOKENS_MIN}
                  max={MAX_OUTPUT_TOKENS_MAX}
                  step={1}
                  value={draft.maxOutputTokens}
                  onChange={(event) => setDraft({ ...draft, maxOutputTokens: event.target.value })}
                />
                <span className={styles.hint}>
                  Độ dài tối đa của một câu trả lời ({MAX_OUTPUT_TOKENS_MIN}–{MAX_OUTPUT_TOKENS_MAX}).
                </span>
              </label>
            </div>

            {formError ? <p className={styles.error}>{formError}</p> : null}

            <div className={styles.cardFooter}>
              <span className={styles.meta}>
                Cập nhật lần cuối: {activeConfig.updatedAtLabel}
                {activeConfig.updatedByUsername ? ` • bởi ${activeConfig.updatedByUsername}` : ""}
              </span>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleReset}
                  disabled={!isDirty || updateConfig.isPending}
                >
                  Hoàn tác
                </button>
                <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={handleSave}
                  disabled={!isDirty || updateConfig.isPending}
                >
                  {updateConfig.isPending ? "Đang lưu…" : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeaderText}>
              <h2 className={styles.cardTitle}>
                <History size={16} strokeWidth={2} className={styles.historyIcon} />
                Lịch sử thay đổi
              </h2>
              <p className={styles.cardSubtitle}>
                Chọn Khôi phục để nạp lại một phiên bản cũ vào biểu mẫu, xem lại rồi bấm Lưu thay đổi để áp dụng.
              </p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Thời điểm</th>
                    <th>Người thay đổi</th>
                    <th>Persona</th>
                    <th>Temp.</th>
                    <th>Token</th>
                    <th aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {history.isLoading ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        Đang tải lịch sử…
                      </td>
                    </tr>
                  ) : null}
                  {history.isError ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        Không thể tải lịch sử thay đổi.
                      </td>
                    </tr>
                  ) : null}
                  {historyEntries.map((entry) => (
                    <tr key={entry.id} className={styles.row}>
                      <td>{entry.changedAtLabel}</td>
                      <td className={styles.mutedCell}>{entry.changedByUsername ?? "Hệ thống"}</td>
                      <td className={styles.personaCell} title={entry.personaInstruction}>
                        {entry.personaInstruction}
                      </td>
                      <td className={styles.mutedCell}>{entry.temperature.toFixed(2)}</td>
                      <td className={styles.mutedCell}>{entry.maxOutputTokens}</td>
                      <td>
                        <button type="button" className={styles.restoreButton} onClick={() => handleRestore(entry)}>
                          <RotateCcw size={14} strokeWidth={2} />
                          Khôi phục
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!history.isLoading && !history.isError && historyEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        Chưa có thay đổi nào được ghi nhận.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Save, TriangleAlert } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal/confirmation-modal";
import { useSaveScoringCriteria, useScoringCriteria } from "@/hooks/useScoringCriteria";
import type { AdminScoringCriterion } from "@/types/scoring";
import styles from "./system-config.module.css";

type WeightField = "weightWeekly" | "weightMonthly";

function sumWeights(criteria: AdminScoringCriterion[], field: WeightField): number {
  return criteria.reduce((total, criterion) => total + (criterion[field] ?? 0), 0);
}

function buildFormula(criteria: AdminScoringCriterion[], field: WeightField, label: string): string {
  const terms = criteria
    .filter((criterion) => criterion[field] !== null)
    .map((criterion) => `${criterion[field]}% × ${criterion.name}`);
  return `Điểm chi tiêu (${label}) = ${terms.join(" + ")}`;
}

export function ScoringTab() {
  const { data: savedCriteria = [], isLoading, isError } = useScoringCriteria();
  const saveScoringCriteria = useSaveScoringCriteria();

  const [draftCriteria, setDraftCriteria] = useState<AdminScoringCriterion[]>([]);
  const [isSyncedFromServer, setIsSyncedFromServer] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seed the local edit buffer once the server data first arrives — state update during
  // render instead of an effect, per https://react.dev/learn/you-might-not-need-an-effect.
  if (!isSyncedFromServer && savedCriteria.length > 0) {
    setIsSyncedFromServer(true);
    setDraftCriteria(savedCriteria);
  }

  const isDirty = draftCriteria.some((criterion) => {
    const saved = savedCriteria.find((item) => item.code === criterion.code);
    return saved && (criterion.weightWeekly !== saved.weightWeekly || criterion.weightMonthly !== saved.weightMonthly);
  });

  const weeklyTotal = useMemo(() => sumWeights(draftCriteria, "weightWeekly"), [draftCriteria]);
  const monthlyTotal = useMemo(() => sumWeights(draftCriteria, "weightMonthly"), [draftCriteria]);
  const isWeeklyValid = weeklyTotal === 100;
  const isMonthlyValid = monthlyTotal === 100;
  const canSave = isDirty && isWeeklyValid && isMonthlyValid;

  function updateWeight(code: string, field: WeightField, value: number) {
    setDraftCriteria((prev) =>
      prev.map((criterion) => (criterion.code === code ? { ...criterion, [field]: value } : criterion))
    );
  }

  function isModified(criterion: AdminScoringCriterion, field: WeightField) {
    const saved = savedCriteria.find((item) => item.code === criterion.code);
    return saved ? saved[field] !== criterion[field] : false;
  }

  function handleSave() {
    setSaveError(null);
    saveScoringCriteria.mutate(
      draftCriteria.map(({ code, weightWeekly, weightMonthly }) => ({ code, weightWeekly, weightMonthly })),
      {
        onSuccess: (data) => {
          setDraftCriteria(data);
          setIsSaveModalOpen(false);
          setToast("Đã lưu trọng số mới");
          window.setTimeout(() => setToast(null), 3000);
        },
        onError: (err) => {
          setIsSaveModalOpen(false);
          setSaveError(err instanceof Error ? err.message : "Không thể lưu trọng số.");
        },
      }
    );
  }

  return (
    <div className={styles.tabPanel}>
      <div className={styles.scoringNotice}>
        <TriangleAlert size={16} strokeWidth={2} />
        Trọng số ở đây phản ánh công thức thực tế trong <code>SpendingScoreService.cs</code>, nhưng chưa được đọc từ
        bảng <code>ScoringCriterion</code> — chỉnh sửa ở đây sẽ không ảnh hưởng đến điểm chi tiêu thật cho đến khi
        backend được kết nối lại. Xem <code>context/backend-gaps.md</code>.
      </div>

      {isLoading ? <p className={styles.hint}>Đang tải…</p> : null}
      {isError ? <p className={styles.fieldError}>Không thể tải trọng số điểm.</p> : null}
      {saveError ? <p className={styles.fieldError}>{saveError}</p> : null}

      <div className={styles.toolbar} style={{ justifyContent: "space-between", alignItems: "center" }}>
        <p className={styles.hint}>Điều chỉnh trọng số ảnh hưởng đến điểm chi tiêu AI của toàn bộ người dùng.</p>
        {isDirty ? (
          <button
            type="button"
            className={styles.saveButton}
            disabled={!canSave}
            onClick={() => setIsSaveModalOpen(true)}
          >
            <Save size={16} strokeWidth={2} />
            Lưu thay đổi
          </button>
        ) : null}
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã tiêu chí</th>
              <th>Tên tiêu chí</th>
              <th>Trọng số tuần</th>
              <th>Trọng số tháng</th>
              <th>Phiên bản</th>
            </tr>
          </thead>
          <tbody>
            {draftCriteria.map((criterion) => (
              <tr key={criterion.code} className={styles.row}>
                <td className={styles.mutedCell}>{criterion.code}</td>
                <td className={styles.nameCell}>{criterion.name}</td>
                <td>
                  {criterion.weightWeekly === null ? (
                    <span className={styles.mutedCell}>Không áp dụng</span>
                  ) : (
                    <span className={styles.weightCell}>
                      <input
                        type="number"
                        step={5}
                        min={0}
                        max={100}
                        className={styles.weightInput}
                        value={criterion.weightWeekly}
                        onChange={(event) =>
                          updateWeight(criterion.code, "weightWeekly", Number(event.target.value))
                        }
                      />
                      %{isModified(criterion, "weightWeekly") ? <span className={styles.modifiedDot} /> : null}
                    </span>
                  )}
                </td>
                <td>
                  {criterion.weightMonthly === null ? (
                    <span className={styles.mutedCell}>Không áp dụng</span>
                  ) : (
                    <span className={styles.weightCell}>
                      <input
                        type="number"
                        step={5}
                        min={0}
                        max={100}
                        className={styles.weightInput}
                        value={criterion.weightMonthly}
                        onChange={(event) =>
                          updateWeight(criterion.code, "weightMonthly", Number(event.target.value))
                        }
                      />
                      %{isModified(criterion, "weightMonthly") ? <span className={styles.modifiedDot} /> : null}
                    </span>
                  )}
                </td>
                <td className={styles.mutedCell}>{criterion.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.scoringTotals}>
        <span className={isWeeklyValid ? styles.totalOk : styles.totalError}>
          Tổng trọng số tuần: {weeklyTotal}% {isWeeklyValid ? "" : "(phải bằng 100%)"}
        </span>
        <span className={isMonthlyValid ? styles.totalOk : styles.totalError}>
          Tổng trọng số tháng: {monthlyTotal}% {isMonthlyValid ? "" : "(phải bằng 100%)"}
        </span>
      </div>

      <div className={styles.formulaBox}>
        <p className={styles.formulaLine}>{buildFormula(draftCriteria, "weightWeekly", "tuần")}</p>
        <p className={styles.formulaLine}>{buildFormula(draftCriteria, "weightMonthly", "tháng")}</p>
      </div>

      <ConfirmationModal
        isOpen={isSaveModalOpen}
        title="Lưu trọng số mới?"
        description="Thay đổi này ảnh hưởng đến điểm chi tiêu AI của tất cả người dùng và sẽ tạo phiên bản mới."
        confirmLabel="Lưu"
        variant="warning"
        onCancel={() => setIsSaveModalOpen(false)}
        onConfirm={handleSave}
      />

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

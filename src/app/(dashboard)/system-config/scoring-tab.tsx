"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal/confirmation-modal";
import { initialScoringCriteria, type MockScoringCriterion } from "./mock-scoring";
import styles from "./system-config.module.css";

export function ScoringTab() {
  const [savedCriteria, setSavedCriteria] = useState(initialScoringCriteria);
  const [draftCriteria, setDraftCriteria] = useState(initialScoringCriteria);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isDirty = draftCriteria.some((criterion, index) => {
    const saved = savedCriteria[index];
    return criterion.weightWeekly !== saved.weightWeekly || criterion.weightMonthly !== saved.weightMonthly;
  });

  function updateWeight(code: string, field: "weightWeekly" | "weightMonthly", value: number) {
    setDraftCriteria((prev) =>
      prev.map((criterion) => (criterion.code === code ? { ...criterion, [field]: value } : criterion))
    );
  }

  function isModified(criterion: MockScoringCriterion, field: "weightWeekly" | "weightMonthly") {
    const saved = savedCriteria.find((item) => item.code === criterion.code);
    return saved ? saved[field] !== criterion[field] : false;
  }

  function handleSave() {
    setSavedCriteria(draftCriteria);
    setIsSaveModalOpen(false);
    setToast("Đã lưu trọng số mới");
    window.setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className={styles.tabPanel}>
      <div className={styles.toolbar} style={{ justifyContent: "space-between", alignItems: "center" }}>
        <p className={styles.hint}>Điều chỉnh trọng số ảnh hưởng đến điểm chi tiêu AI của toàn bộ người dùng.</p>
        {isDirty ? (
          <button type="button" className={styles.saveButton} onClick={() => setIsSaveModalOpen(true)}>
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
              <th>Cập nhật lần cuối</th>
            </tr>
          </thead>
          <tbody>
            {draftCriteria.map((criterion) => (
              <tr key={criterion.code} className={styles.row}>
                <td className={styles.mutedCell}>{criterion.code}</td>
                <td className={styles.nameCell}>{criterion.name}</td>
                <td>
                  <span className={styles.weightCell}>
                    <input
                      type="number"
                      step={0.05}
                      min={0}
                      max={1}
                      className={styles.weightInput}
                      value={criterion.weightWeekly}
                      onChange={(event) =>
                        updateWeight(criterion.code, "weightWeekly", Number(event.target.value))
                      }
                    />
                    {isModified(criterion, "weightWeekly") ? <span className={styles.modifiedDot} /> : null}
                  </span>
                </td>
                <td>
                  <span className={styles.weightCell}>
                    <input
                      type="number"
                      step={0.05}
                      min={0}
                      max={1}
                      className={styles.weightInput}
                      value={criterion.weightMonthly}
                      onChange={(event) =>
                        updateWeight(criterion.code, "weightMonthly", Number(event.target.value))
                      }
                    />
                    {isModified(criterion, "weightMonthly") ? <span className={styles.modifiedDot} /> : null}
                  </span>
                </td>
                <td className={styles.mutedCell}>{criterion.version}</td>
                <td className={styles.mutedCell}>{criterion.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

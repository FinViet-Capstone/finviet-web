"use client";

import { useState } from "react";
import { Pencil, Save } from "lucide-react";
import { FormModal } from "@/components/form-modal/form-modal";
import { useBuckets, useSaveBucketRatios, useUpdateBucket } from "@/hooks/useBuckets";
import type { AdminBucket, BucketInput } from "@/types/buckets";
import { bucketIconOptions, iconForBucket } from "./bucket-ui-options";
import styles from "./system-config.module.css";

type BucketFormState = BucketInput;

function toFormState(bucket: AdminBucket): BucketFormState {
  const { nameVi, nameEn, color, icon, sortOrder, defaultPct } = bucket;
  return { nameVi, nameEn, color, icon, sortOrder, defaultPct };
}

// Redistributes `100 - changedValue` across the other buckets proportionally to their current
// draft shares (not their original saved values, so repeated drags on the same slider keep
// rebalancing sensibly) — same "one slider moves, the rest absorb the difference" UX as the
// mobile app's Phân bổ ngân sách screen, so the total is always 100% by construction and there's
// nothing for the admin to hand-balance across 3 separate edits.
function rebalance(
  draft: Record<string, number>,
  orderedIds: string[],
  changedId: string,
  changedValue: number
): Record<string, number> {
  const value = Math.min(100, Math.max(0, Math.round(changedValue)));
  const otherIds = orderedIds.filter((id) => id !== changedId);
  const next: Record<string, number> = { ...draft, [changedId]: value };
  const remaining = 100 - value;

  if (otherIds.length === 0) return next;

  const otherSum = otherIds.reduce((sum, id) => sum + draft[id], 0);
  let allocated = 0;
  otherIds.forEach((id, index) => {
    const isLast = index === otherIds.length - 1;
    if (isLast) {
      next[id] = Math.max(0, remaining - allocated);
      return;
    }
    const share = otherSum > 0 ? Math.round((remaining * draft[id]) / otherSum) : Math.round(remaining / otherIds.length);
    next[id] = Math.max(0, share);
    allocated += next[id];
  });

  return next;
}

export function BucketsTab() {
  const { data: buckets = [], isLoading, isError } = useBuckets();
  const updateBucket = useUpdateBucket();
  const saveBucketRatios = useSaveBucketRatios();

  const [editingBucket, setEditingBucket] = useState<AdminBucket | null>(null);
  const [form, setForm] = useState<BucketFormState | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Ratio editor: a local draft synced once from the server, independent of the per-bucket
  // name/icon/color/order modal above — state update during render instead of an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect.
  const [draftPct, setDraftPct] = useState<Record<string, number>>({});
  const [isRatioSynced, setIsRatioSynced] = useState(false);
  const [ratioError, setRatioError] = useState<string | null>(null);
  if (!isRatioSynced && buckets.length > 0) {
    setIsRatioSynced(true);
    setDraftPct(Object.fromEntries(buckets.map((bucket) => [bucket.id, bucket.defaultPct])));
  }

  const bucketIds = buckets.map((bucket) => bucket.id);
  const isRatioDirty = buckets.some((bucket) => draftPct[bucket.id] !== bucket.defaultPct);
  const ratioTotal = buckets.reduce((sum, bucket) => sum + (draftPct[bucket.id] ?? 0), 0);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function handleSliderChange(id: string, value: number) {
    setRatioError(null);
    setDraftPct((prev) => rebalance(prev, bucketIds, id, value));
  }

  function handleSaveRatios() {
    setRatioError(null);
    saveBucketRatios.mutate(
      buckets.map((bucket) => ({ id: bucket.id, defaultPct: draftPct[bucket.id] })),
      {
        onSuccess: () => showToast("Đã lưu tỷ lệ ngân sách mặc định"),
        onError: (err) => setRatioError(err instanceof Error ? err.message : "Không thể lưu tỷ lệ ngân sách."),
      }
    );
  }

  function openEditForm(bucket: AdminBucket) {
    setEditingBucket(bucket);
    setForm(toFormState(bucket));
    setOrderError(null);
  }

  function handleSave() {
    if (!editingBucket || !form) return;

    const isDuplicateOrder = buckets.some(
      (item) => item.id !== editingBucket.id && item.sortOrder === form.sortOrder
    );
    if (isDuplicateOrder) {
      setOrderError(`Thứ tự ${form.sortOrder} đã được dùng bởi nhóm khác.`);
      return;
    }

    updateBucket.mutate(
      { id: editingBucket.id, input: form },
      {
        onSuccess: () => {
          showToast("Đã lưu nhóm ngân sách");
          setEditingBucket(null);
          setForm(null);
        },
        onError: (err) => setOrderError(err instanceof Error ? err.message : "Không thể lưu nhóm ngân sách."),
      }
    );
  }

  return (
    <div className={styles.tabPanel}>
      {buckets.length > 0 ? (
        <div className={styles.ratioCard}>
          <div className={styles.ratioHeader}>
            <div>
              <p className={styles.ratioTitle}>Tỷ lệ ngân sách mặc định</p>
              <p className={styles.hint}>
                Áp dụng cho khách hàng đăng ký mới — không ảnh hưởng tỷ lệ của khách hàng hiện tại.
              </p>
            </div>
            <span className={ratioTotal === 100 ? styles.totalOk : styles.totalError}>Tổng: {ratioTotal}%</span>
          </div>

          {buckets.map((bucket) => (
            <div key={bucket.id} className={styles.ratioRow}>
              <span className={styles.ratioLabel} style={{ color: bucket.color }}>
                {bucket.nameVi}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={draftPct[bucket.id] ?? 0}
                onChange={(event) => handleSliderChange(bucket.id, Number(event.target.value))}
                className={styles.ratioSlider}
                style={{
                  accentColor: bucket.color,
                  background: `linear-gradient(to right, ${bucket.color} ${draftPct[bucket.id] ?? 0}%, var(--color-border) ${draftPct[bucket.id] ?? 0}%)`,
                }}
                aria-label={`Tỷ lệ ${bucket.nameVi}`}
              />
              <span className={styles.ratioValue}>{draftPct[bucket.id] ?? 0}%</span>
            </div>
          ))}

          {ratioError ? <p className={styles.fieldError}>{ratioError}</p> : null}

          {isRatioDirty ? (
            <button type="button" className={styles.saveButton} onClick={handleSaveRatios}>
              <Save size={16} strokeWidth={2} />
              Lưu tỷ lệ
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.bucketList}>
        {isLoading ? <p className={styles.bucketOrder}>Đang tải…</p> : null}
        {isError ? <p className={styles.bucketOrder}>Không thể tải nhóm ngân sách.</p> : null}
        {buckets.map((bucket) => {
          const Icon = iconForBucket(bucket.icon);
          return (
            <div key={bucket.id} className={styles.bucketRow}>
              <span className={styles.bucketDot} style={{ background: bucket.color }} />
              <span className={styles.bucketIcon}>
                <Icon size={16} strokeWidth={2} />
              </span>
              <div className={styles.bucketInfo}>
                <span className={styles.bucketName}>
                  {bucket.nameVi} – {bucket.nameEn}
                </span>
                <span className={styles.bucketOrder}>Thứ tự {bucket.sortOrder}</span>
              </div>
              <button
                type="button"
                className={styles.actionButton}
                aria-label={`Sửa nhóm ${bucket.nameVi}`}
                onClick={() => openEditForm(bucket)}
              >
                <Pencil size={16} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>

      {editingBucket && form ? (
        <FormModal
          title="Sửa nhóm ngân sách"
          onClose={() => {
            setEditingBucket(null);
            setForm(null);
            setOrderError(null);
          }}
          footer={
            <>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setEditingBucket(null);
                  setForm(null);
                  setOrderError(null);
                }}
              >
                Hủy
              </button>
              <button type="button" className={styles.confirmButton} onClick={handleSave}>
                Lưu
              </button>
            </>
          }
        >
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Tên VI</span>
              <input
                type="text"
                className={styles.input}
                value={form.nameVi}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, nameVi: event.target.value } : prev))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Tên EN</span>
              <input
                type="text"
                className={styles.input}
                value={form.nameEn}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, nameEn: event.target.value } : prev))}
              />
            </label>
          </div>
          <div className={styles.iconColorRow}>
            <div className={styles.field}>
              <span className={styles.label}>Màu</span>
              <span className={styles.colorSwatch} style={{ background: form.color }} />
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Icon</span>
              <select
                className={styles.select}
                value={form.icon}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, icon: event.target.value } : prev))}
              >
                {bucketIconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>Thứ tự</span>
            <input
              type="number"
              min={1}
              className={styles.input}
              value={form.sortOrder}
              onChange={(event) => {
                setOrderError(null);
                setForm((prev) => (prev ? { ...prev, sortOrder: Number(event.target.value) } : prev));
              }}
            />
            {orderError ? <span className={styles.fieldError}>{orderError}</span> : null}
          </label>
        </FormModal>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

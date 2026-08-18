"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { FormModal } from "@/components/form-modal/form-modal";
import { useBuckets, useUpdateBucket } from "@/hooks/useBuckets";
import type { AdminBucket, BucketInput } from "@/types/buckets";
import { bucketIconOptions, iconForBucket } from "./bucket-ui-options";
import styles from "./system-config.module.css";

type BucketFormState = BucketInput;

function toFormState(bucket: AdminBucket): BucketFormState {
  const { nameVi, nameEn, color, icon, sortOrder, defaultPct } = bucket;
  return { nameVi, nameEn, color, icon, sortOrder, defaultPct };
}

export function BucketsTab() {
  const { data: buckets = [], isLoading, isError } = useBuckets();
  const updateBucket = useUpdateBucket();

  const [editingBucket, setEditingBucket] = useState<AdminBucket | null>(null);
  const [form, setForm] = useState<BucketFormState | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Tổng 3 nhóm (2 nhóm còn lại theo giá trị đã lưu + nhóm đang sửa theo form) phải = 100%,
  // giống cách validate tổng trọng số ở tab Trọng số điểm — backend không tự kiểm tra tổng vì
  // mỗi PATCH chỉ sửa 1 dòng độc lập, không có chỗ nào ở server để cộng dồn.
  const totalDefaultPct = editingBucket && form
    ? buckets.reduce(
        (sum, item) => sum + (item.id === editingBucket.id ? form.defaultPct : item.defaultPct),
        0
      )
    : 0;
  const isTotalValid = totalDefaultPct === 100;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
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

    if (!isTotalValid) return;

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
              <button
                type="button"
                className={styles.confirmButton}
                disabled={!isTotalValid}
                onClick={handleSave}
              >
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
          <label className={styles.field}>
            <span className={styles.label}>Tỷ lệ mặc định</span>
            <span className={styles.weightCell}>
              <input
                type="number"
                step={5}
                min={0}
                max={100}
                className={styles.weightInput}
                value={form.defaultPct}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, defaultPct: Number(event.target.value) } : prev))
                }
              />
              %
            </span>
          </label>
          <p className={styles.hint}>
            Áp dụng cho khách hàng đăng ký mới — không ảnh hưởng tỷ lệ của khách hàng hiện tại.
          </p>
          <span className={isTotalValid ? styles.totalOk : styles.totalError}>
            Tổng tỷ lệ 3 nhóm: {totalDefaultPct}% {isTotalValid ? "" : "(phải bằng 100%)"}
          </span>
        </FormModal>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

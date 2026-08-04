"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal/confirmation-modal";
import { FormModal } from "@/components/form-modal/form-modal";
import {
  bucketLabels,
  categoryColorOptions,
  categoryIconOptions,
  iconForCategory,
  initialCategories,
  type CategoryType,
  type DefaultBucket,
  type MockCategory,
} from "./mock-categories";
import styles from "./system-config.module.css";

interface CategoryFormState {
  name: string;
  nameVi: string;
  nameEn: string;
  type: CategoryType;
  defaultBucket: DefaultBucket;
  isMandatory: boolean;
  icon: string;
  customIconDataUrl: string | null;
  color: string;
  sortOrder: number;
}

function toFormState(category: MockCategory | null): CategoryFormState {
  if (category) {
    const { name, nameVi, nameEn, type, defaultBucket, isMandatory, icon, customIconDataUrl, color, sortOrder } =
      category;
    return {
      name,
      nameVi,
      nameEn,
      type,
      defaultBucket,
      isMandatory,
      icon,
      customIconDataUrl: customIconDataUrl ?? null,
      color,
      sortOrder,
    };
  }
  return {
    name: "",
    nameVi: "",
    nameEn: "",
    type: "expense",
    defaultBucket: "wants",
    isMandatory: false,
    icon: categoryIconOptions[0].value,
    customIconDataUrl: null,
    color: categoryColorOptions[0],
    sortOrder: 1,
  };
}

export function CategoriesTab() {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<MockCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(() => toFormState(null));
  const [deleteTarget, setDeleteTarget] = useState<MockCategory | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function openAddForm() {
    setEditingCategory(null);
    setForm(toFormState(null));
    setIsFormOpen(true);
  }

  function openEditForm(category: MockCategory) {
    setEditingCategory(category);
    setForm(toFormState(category));
    setIsFormOpen(true);
  }

  function readIconFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, customIconDataUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((item) => (item.id === editingCategory.id ? { ...item, ...form } : item))
      );
      showToast("Đã lưu danh mục");
    } else {
      const newCategory: MockCategory = { id: crypto.randomUUID(), ...form };
      setCategories((prev) => [...prev, newCategory]);
      showToast("Đã thêm danh mục");
    }
    setIsFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCategories((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    showToast(`Đã xóa danh mục ${deleteTarget.name}`);
    setDeleteTarget(null);
  }

  return (
    <div className={styles.tabPanel}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.addButton} onClick={openAddForm}>
          <Plus size={16} strokeWidth={2} />
          Thêm danh mục
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Tên danh mục</th>
              <th>Tên (VI/EN)</th>
              <th>Loại</th>
              <th>Bucket mặc định</th>
              <th>Mặc định</th>
              <th>Thứ tự</th>
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const Icon = iconForCategory(category.icon);
              return (
                <tr key={category.id} className={styles.row}>
                  <td>
                    <span className={styles.iconCell} style={{ color: category.color }}>
                      {category.customIconDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={category.customIconDataUrl} alt="" width={16} height={16} />
                      ) : (
                        <Icon size={16} strokeWidth={2} />
                      )}
                    </span>
                  </td>
                  <td className={styles.nameCell}>{category.name}</td>
                  <td className={styles.mutedCell}>
                    {category.nameVi} – {category.nameEn}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${category.type === "expense" ? styles.badgeExpense : styles.badgeIncome}`}
                    >
                      {category.type === "expense" ? "Chi tiêu" : "Thu nhập"}
                    </span>
                  </td>
                  <td>
                    {category.defaultBucket ? (
                      <span className={styles.badgeBucket}>{bucketLabels[category.defaultBucket]}</span>
                    ) : (
                      <span className={styles.mutedCell}>—</span>
                    )}
                  </td>
                  <td className={styles.mutedCell}>{category.isMandatory ? "Có" : "Không"}</td>
                  <td className={styles.mutedCell}>{category.sortOrder}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        aria-label={`Sửa danh mục ${category.name}`}
                        onClick={() => openEditForm(category)}
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={styles.actionButtonDanger}
                        aria-label={`Xóa danh mục ${category.name}`}
                        onClick={() => setDeleteTarget(category)}
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isFormOpen ? (
        <FormModal
          title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
          onClose={() => setIsFormOpen(false)}
          footer={
            <>
              <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)}>
                Hủy
              </button>
              <button type="button" className={styles.confirmButton} onClick={handleSave}>
                Lưu
              </button>
            </>
          }
        >
          <label className={styles.field}>
            <span className={styles.label}>Tên danh mục</span>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Tên VI</span>
              <input
                type="text"
                className={styles.input}
                value={form.nameVi}
                onChange={(event) => setForm((prev) => ({ ...prev, nameVi: event.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Tên EN</span>
              <input
                type="text"
                className={styles.input}
                value={form.nameEn}
                onChange={(event) => setForm((prev) => ({ ...prev, nameEn: event.target.value }))}
              />
            </label>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Loại</span>
              <select
                className={styles.select}
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as CategoryType,
                    defaultBucket: event.target.value === "income" ? null : prev.defaultBucket ?? "wants",
                  }))
                }
              >
                <option value="expense">Chi tiêu</option>
                <option value="income">Thu nhập</option>
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Bucket mặc định</span>
              <select
                className={styles.select}
                value={form.defaultBucket ?? ""}
                disabled={form.type === "income"}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, defaultBucket: event.target.value as DefaultBucket }))
                }
              >
                <option value="needs">Needs</option>
                <option value="wants">Wants</option>
                <option value="savings">Savings</option>
              </select>
            </label>
          </div>
          <div className={styles.toggleRow}>
            <span className={styles.label}>Mặc định</span>
            <button
              type="button"
              className={form.isMandatory ? `${styles.toggle} ${styles.toggleOn}` : styles.toggle}
              role="switch"
              aria-checked={form.isMandatory}
              onClick={() => setForm((prev) => ({ ...prev, isMandatory: !prev.isMandatory }))}
            >
              <span className={form.isMandatory ? `${styles.toggleKnob} ${styles.toggleOnKnob}` : styles.toggleKnob} />
            </button>
          </div>
          <p className={styles.helperText}>
            Danh mục mặc định sẽ được seed vào thư viện danh mục của khách hàng và hiển thị; các danh mục còn lại sẽ
            ẩn.
          </p>

          <div className={styles.field}>
            <span className={styles.label}>Icon</span>
            <label
              className={styles.iconDropzone}
              onDrop={(event) => {
                event.preventDefault();
                const droppedFile = event.dataTransfer.files[0];
                if (droppedFile) readIconFile(droppedFile);
              }}
              onDragOver={(event) => event.preventDefault()}
            >
              {form.customIconDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.customIconDataUrl} alt="" className={styles.iconDropzonePreview} />
              ) : (
                <Upload size={18} strokeWidth={2} />
              )}
              <span className={styles.dropzoneLabel}>Kéo thả hoặc chọn file .svg</span>
              <input
                type="file"
                accept="image/svg+xml"
                className={styles.hiddenFileInput}
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];
                  if (selectedFile) readIconFile(selectedFile);
                }}
              />
            </label>
            {form.customIconDataUrl ? (
              <button
                type="button"
                className={styles.clearIconButton}
                onClick={() => setForm((prev) => ({ ...prev, customIconDataUrl: null }))}
              >
                <X size={14} strokeWidth={2} />
                Xóa icon đã tải lên
              </button>
            ) : (
              <div className={styles.iconChipRow}>
                {categoryIconOptions.map((option) => {
                  const ChipIcon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={option.label}
                      title={option.label}
                      className={
                        option.value === form.icon ? `${styles.iconChip} ${styles.iconChipSelected}` : styles.iconChip
                      }
                      onClick={() => setForm((prev) => ({ ...prev, icon: option.value }))}
                    >
                      <ChipIcon size={16} strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Màu</span>
            <div className={styles.colorSwatchRow}>
              {categoryColorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Chọn màu ${color}`}
                  className={color === form.color ? `${styles.colorSwatch} ${styles.colorSwatchSelected}` : styles.colorSwatch}
                  style={{ background: color }}
                  onClick={() => setForm((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>Thứ tự</span>
            <input
              type="number"
              min={1}
              className={styles.input}
              value={form.sortOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
            />
          </label>
        </FormModal>
      ) : null}

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Xóa danh mục?"
        description={`Xóa danh mục ${deleteTarget?.name}? Giao dịch hiện có sẽ giữ nguyên nhưng không thể chọn danh mục này cho giao dịch mới.`}
        confirmLabel="Xóa"
        variant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

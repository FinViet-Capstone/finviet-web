"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal/confirmation-modal";
import { FormModal } from "@/components/form-modal/form-modal";
import { initialPlans, type MockPlan } from "./mock-plans";
import styles from "./system-config.module.css";

interface PlanFormState {
  code: string;
  name: string;
  price: string;
  features: string[];
}

function toFormState(plan: MockPlan | null): PlanFormState {
  if (plan) {
    const price = plan.priceUnit ? `${plan.priceValue} ${plan.priceUnit}` : plan.priceValue;
    return { code: plan.code, name: plan.name, price, features: [...plan.features] };
  }
  return { code: "", name: "", price: "", features: [""] };
}

function parsePrice(price: string): { priceValue: string; priceUnit: string } {
  const [priceValue, ...rest] = price.trim().split(/\s+/);
  return { priceValue: priceValue ?? "", priceUnit: rest.join(" ") };
}

export function PlansTab() {
  const [plans, setPlans] = useState(initialPlans);
  const [editingPlan, setEditingPlan] = useState<MockPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<PlanFormState>(() => toFormState(null));
  const [deleteTarget, setDeleteTarget] = useState<MockPlan | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function openAddForm() {
    setEditingPlan(null);
    setForm(toFormState(null));
    setIsFormOpen(true);
  }

  function openEditForm(plan: MockPlan) {
    setEditingPlan(plan);
    setForm(toFormState(plan));
    setIsFormOpen(true);
  }

  function updateFeature(index: number, value: string) {
    setForm((prev) => ({ ...prev, features: prev.features.map((item, i) => (i === index ? value : item)) }));
  }

  function removeFeature(index: number) {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  }

  function addFeature() {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  }

  function handleSave() {
    const { priceValue, priceUnit } = parsePrice(form.price);
    const features = form.features.map((feature) => feature.trim()).filter((feature) => feature.length > 0);

    if (editingPlan) {
      setPlans((prev) =>
        prev.map((item) =>
          item.id === editingPlan.id
            ? { ...item, code: form.code, name: form.name, priceValue, priceUnit, features }
            : item
        )
      );
      showToast("Đã lưu gói dịch vụ");
    } else {
      const newPlan: MockPlan = {
        id: crypto.randomUUID(),
        code: form.code,
        name: form.name,
        priceValue,
        priceUnit,
        features,
      };
      setPlans((prev) => [...prev, newPlan]);
      showToast("Đã thêm gói dịch vụ");
    }
    setIsFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setPlans((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    showToast(`Đã xóa gói ${deleteTarget.name}`);
    setDeleteTarget(null);
  }

  return (
    <div className={styles.tabPanel}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.addButton} onClick={openAddForm}>
          <Plus size={16} strokeWidth={2} />
          Thêm gói
        </button>
      </div>

      <div className={styles.planGrid}>
        {plans.map((plan) => (
          <div key={plan.id} className={plan.highlighted ? `${styles.planCard} ${styles.planCardHighlighted}` : styles.planCard}>
            <div className={styles.planCardHeader}>
              <div className={styles.planNameRow}>
                <span className={styles.planName}>{plan.name}</span>
                {plan.savingsBadge ? <span className={styles.planSavingsBadge}>{plan.savingsBadge}</span> : null}
              </div>
              <div className={styles.planCardActions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  aria-label={`Sửa gói ${plan.name}`}
                  onClick={() => openEditForm(plan)}
                >
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className={styles.actionButtonDanger}
                  aria-label={`Xóa gói ${plan.name}`}
                  onClick={() => setDeleteTarget(plan)}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className={styles.planPrice}>
              <span className={styles.planPriceValue}>{plan.priceValue}</span>
              {plan.priceUnit ? <span className={styles.planPriceUnit}>{plan.priceUnit}</span> : null}
            </div>

            <div className={styles.planFeatureList}>
              {plan.features.map((feature) => (
                <div key={feature} className={styles.planFeature}>
                  <Check size={16} strokeWidth={2} className={styles.planFeatureIcon} />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen ? (
        <FormModal
          title={editingPlan ? "Sửa gói" : "Thêm gói"}
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
            <span className={styles.label}>Mã gói</span>
            <input
              type="text"
              className={styles.input}
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Tên gói</span>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Giá</span>
            <input
              type="text"
              className={styles.input}
              value={form.price}
              placeholder="490.000đ / năm"
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            />
          </label>
          <div className={styles.field}>
            <span className={styles.label}>Tính năng</span>
            {form.features.map((feature, index) => (
              <div key={index} className={styles.featureEditorRow}>
                <input
                  type="text"
                  className={styles.featureEditorInput}
                  value={feature}
                  onChange={(event) => updateFeature(index, event.target.value)}
                />
                <button
                  type="button"
                  className={styles.featureRemoveButton}
                  aria-label="Xóa tính năng"
                  onClick={() => removeFeature(index)}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            ))}
            <button type="button" className={styles.addFeatureButton} onClick={addFeature}>
              <Plus size={14} strokeWidth={2} />
              Thêm tính năng
            </button>
          </div>
        </FormModal>
      ) : null}

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Xóa gói?"
        description={`Xóa gói ${deleteTarget?.name}? Người dùng đang đăng ký gói này sẽ không bị ảnh hưởng, nhưng gói sẽ không còn hiển thị cho người dùng mới.`}
        confirmLabel="Xóa"
        variant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}

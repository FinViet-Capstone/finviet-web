"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, QrCode, ShieldCheck } from "lucide-react";
import { isVNPayUrl, type CheckoutAttempt, type CurrentSubscription, type SubscriptionCheckout, type SubscriptionPayment, type SubscriptionPlan } from "@/types/subscription";
import styles from "./subscription.module.css";

class CheckoutError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
async function request<T>(action: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/subscription?action=${action}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new CheckoutError(result.error || "Không thể thực hiện yêu cầu.", response.status);
  return result.data;
}
const money = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function SubscriptionPage() {
  const client = useQueryClient();
  const session = useQuery({ queryKey: ["checkout-session"], queryFn: () => request<{ customerId: string; fullName: string }>("session"), retry: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await request("login", { email: form.get("email"), password: form.get("password") });
      await client.invalidateQueries({ queryKey: ["checkout-session"] });
    } catch (e) { setError(e instanceof Error ? e.message : "Đăng nhập thất bại."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError("");
    try {
      await request("logout", {});
      client.removeQueries({ queryKey: ["subscription"] });
      client.setQueryData(["checkout-session"], null);
    } catch { setError("Chưa thể đăng xuất. Vui lòng thử lại."); }
    finally { setBusy(false); }
  }
  const signedIn = session.data && !(session.error instanceof CheckoutError && session.error.status === 401);
  return <main className={styles.page}>
    <header className={styles.header}><a href="/subscription" className={styles.brand}>FinViet<span>PREMIUM</span></a>
      {signedIn && <button className={styles.secondary} disabled={busy} onClick={logout}>Đăng xuất</button>}</header>
    <section className={styles.hero}><span className={styles.eyebrow}>ĐẦU TƯ CHO THÓI QUEN TÀI CHÍNH</span>
      <h1>Chọn gói phù hợp.<br />Quản lý tài chính tốt hơn.</h1>
      <p>Xem quyền lợi, chọn gói và thanh toán an toàn bằng mã QR trên cổng VNPay.</p>
      <div className={styles.trust}><ShieldCheck size={18} /> Xác nhận thanh toán trực tiếp từ VNPay</div>
    </section>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {session.isPending ? <p role="status">Đang tải tài khoản…</p> : signedIn ?
      <Checkout key={session.data.customerId} customerId={session.data.customerId} name={session.data.fullName} onExpired={() => client.invalidateQueries({ queryKey: ["checkout-session"] })} /> :
      <form onSubmit={login} className={styles.login}>
        <h2>Đăng nhập tài khoản FinViet</h2><p>Dùng tài khoản khách hàng đang sử dụng trên ứng dụng.</p>
        {session.isError && !(session.error instanceof CheckoutError && session.error.status === 401) && <p role="alert" className={styles.error}>{session.error.message}</p>}
        <label>Email<input name="email" type="email" autoComplete="username" required placeholder="ban@example.com" /></label>
        <label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className={styles.primary} disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập để chọn gói"}</button>
      </form>}
    <footer className={styles.footer}>Thanh toán qua VNPay · Giá niêm yết bằng Việt Nam đồng</footer>
  </main>;
}

function Checkout({ customerId, name, onExpired }: { customerId: string; name: string; onExpired: () => void }) {
  const client = useQueryClient();
  const storageKey = `finviet-checkout-${customerId}`;
  const [attempt, setAttempt] = useState<CheckoutAttempt | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(storageKey) || "null"); } catch { return null; }
  });
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now);
  const checkout = attempt?.checkout;
  const plans = useQuery({ queryKey: ["subscription", customerId, "plans"], queryFn: () => request<SubscriptionPlan[]>("plans"), retry: false });
  const current = useQuery({ queryKey: ["subscription", customerId, "current"], queryFn: () => request<CurrentSubscription | null>("current"), retry: false });
  const expired = !!checkout && Date.parse(checkout.expiresAt) <= now;
  const payment = useQuery({
    queryKey: ["subscription", customerId, "payment", checkout?.paymentId],
    queryFn: () => request<SubscriptionPayment>(`payment&id=${encodeURIComponent(checkout!.paymentId)}`),
    enabled: !!checkout, retry: false,
    refetchInterval: query => !expired && (!query.state.data || query.state.data.status === "pending") && !(query.state.error instanceof CheckoutError && query.state.error.status === 401) ? 3000 : false,
  });
  const status = payment.data?.status;
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (status === "succeeded") void client.invalidateQueries({ queryKey: ["subscription", customerId, "current"] });
  }, [status, client, customerId]);
  useEffect(() => {
    if ([plans.error, current.error, payment.error].some(e => e instanceof CheckoutError && e.status === 401)) onExpired();
  }, [plans.error, current.error, payment.error, onExpired]);
  function save(value: CheckoutAttempt | null) {
    if (value) sessionStorage.setItem(storageKey, JSON.stringify(value));
    else sessionStorage.removeItem(storageKey);
    setAttempt(value);
  }
  async function purchase(planId: string) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const next = attempt && attempt.planId === planId ? attempt : { planId, key: crypto.randomUUID() };
      save(next); // Persist the key before sending; a timeout must retry the same purchase.
      const result = await request<SubscriptionCheckout>("subscribe", { planId, key: next.key });
      save({ ...next, checkout: result });
    } catch (e) {
      if (e instanceof CheckoutError && [400, 404, 422].includes(e.status)) {
        save(null);
        void current.refetch();
      }
      setError(e instanceof Error ? e.message : "Chưa thể tạo thanh toán.");
    }
    finally { lock.current = false; setBusy(false); }
  }
  async function startAgain() {
    const result = await payment.refetch();
    if (result.error || !result.data) { setError("Chưa thể kiểm tra giao dịch. Vui lòng thử lại."); return; }
    if (result.data.status === "succeeded") return;
    if (window.confirm("Chỉ tạo giao dịch mới nếu bạn chưa thanh toán giao dịch này. Nếu tài khoản ngân hàng đã bị trừ tiền, hãy chờ xác nhận hoặc liên hệ hỗ trợ. Bạn xác nhận chưa thanh toán?")) save(null);
  }
  const remaining = checkout ? Math.max(0, Math.ceil((Date.parse(checkout.expiresAt) - now) / 1000)) : 0;
  const blocked = busy || !!attempt || current.isPending || current.isError || !!current.data || status === "succeeded";
  return <section className={styles.content}>
    <p>Xin chào, <strong>{name}</strong></p>
    {current.data && <div className={styles.notice}><ShieldCheck size={24} /><div><strong>{current.data.planName}</strong><p>{current.data.status === "active" ? "Gói đang hoạt động" : "Gói đang chờ xử lý gia hạn"} · {money(current.data.lockedPrice)}</p>{current.data.nextBillingDate && <p>Kỳ thanh toán tiếp theo: {new Date(`${current.data.nextBillingDate}T00:00:00`).toLocaleDateString("vi-VN")}</p>}</div></div>}
    {(plans.isError || current.isError) && <div role="alert" className={styles.error}>Không thể tải thông tin gói. <button onClick={() => { void plans.refetch(); void current.refetch(); }}>Thử lại</button></div>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {attempt && !checkout && <div className={styles.notice}><div><strong>Giao dịch chưa được xác nhận</strong><p>Thử lại để tiếp tục cùng giao dịch khi kết nối bị gián đoạn.</p><button className={styles.primary} disabled={busy} onClick={() => purchase(attempt.planId)}>{busy ? "Đang xử lý…" : "Tiếp tục giao dịch"}</button></div></div>}
    {checkout && <section className={styles.checkout} aria-label="Thanh toán VNPay" aria-live="polite">
      <QrCode size={34} /><h2>{status === "succeeded" ? "Thanh toán thành công" : status === "failed" || status === "canceled" ? "Thanh toán chưa thành công" : "Thanh toán bằng VNPay QR"}</h2>
      <p className={styles.amount}>{money(checkout.amount)}</p>
      {status === "succeeded" ? <p>Gói đăng ký của bạn đã được kích hoạt.</p> : status === "failed" || status === "canceled" ? <><p>Giao dịch đã được xác nhận {status === "canceled" ? "hủy" : "không thành công"}. Bạn có thể chọn lại gói.</p><button className={styles.secondary} onClick={() => save(null)}>Chọn lại gói</button></> : <>
        <p>{expired ? "Liên kết thanh toán đã hết hạn. Nếu đã trả tiền, vui lòng kiểm tra kết quả trước khi tạo giao dịch khác." : `Còn ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} để thanh toán.`}</p>
        {!expired && isVNPayUrl(checkout.redirectUrl) && <a className={styles.primary} href={checkout.redirectUrl} target="_blank" rel="noopener noreferrer">Mở mã QR trên VNPay ↗</a>}
        {!expired && !isVNPayUrl(checkout.redirectUrl) && <p role="alert" className={styles.error}>Địa chỉ thanh toán không hợp lệ. Vui lòng liên hệ hỗ trợ.</p>}
        <p>Mở ứng dụng ngân hàng để quét mã trên trang VNPay. Quay lại đây để xem kết quả.</p>
        <button className={styles.secondary} disabled={payment.isFetching} onClick={() => void payment.refetch()}>{payment.isFetching ? "Đang kiểm tra…" : "Tôi đã thanh toán · Kiểm tra kết quả"}</button>
        <p>{payment.isError ? "Chưa thể kiểm tra kết quả. Vui lòng thử lại, không thanh toán lần nữa." : "Đang chờ xác nhận từ VNPay. Đóng trang thanh toán không đồng nghĩa với hủy giao dịch."}</p>
        {expired && <button className={styles.secondary} disabled={payment.isFetching} onClick={() => void startAgain()}>Chưa thanh toán · Chọn lại gói</button>}
      </>}
      <small>Mã giao dịch: {checkout.paymentId}</small>
    </section>}
    {plans.isPending && <p role="status">Đang tải các gói…</p>}
    {plans.data?.length === 0 && <div className={styles.notice}>Chưa có gói nào được mở bán. Vui lòng quay lại sau.</div>}
    <div className={styles.grid}>{plans.data?.map(plan => <article className={styles.card} key={plan.planId}>
      <CreditCard size={26} /><h2>{plan.name}</h2><p className={styles.price}>{money(plan.price)}</p><p className={styles.muted}>/ {plan.billingIntervalMonths} tháng</p>
      <ul>{plan.features.map((feature, i) => <li key={i}><Check size={18} />{feature}</li>)}</ul>
      <button className={styles.primary} disabled={blocked || plan.price <= 0} onClick={() => purchase(plan.planId)}>{current.data?.planId === plan.planId ? "Gói hiện tại" : plan.price <= 0 ? "Gói miễn phí" : "Chọn gói · VNPay QR"}</button>
    </article>)}</div>
  </section>;
}

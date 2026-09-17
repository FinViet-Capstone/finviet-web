/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS test harness for the server route. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Load the actual route with isolated upstream/cookie adapters; no merchant or database calls.
function route(token) {
  const calls = [];
  const cookieWrites = [];
  class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
  const upstream = {
    async get(url, config) { calls.push({ url, config }); return { data: { data: { status: 'pending' } } }; },
    async post(url, body, config) {
      calls.push({ url, body, config });
      return { data: { data: url.includes('/auth/') ? { accessToken: 'private-jwt', accessTokenExpiry: new Date(Date.now() + 600000).toISOString() } : { paymentId: 'payment', redirectUrl: 'https://sandbox.vnpayment.vn/pay' } } };
    },
  };
  const imports = {
    'next/headers': { cookies: async () => ({ get: () => token ? { value: token } : undefined, set: (...args) => cookieWrites.push(args) }) },
    'next/server': { NextResponse: { json: (body, options) => Response.json(body, options) } },
    zod: require('zod'),
    '@/lib/finviet-api': { finvietApi: upstream, unwrap: result => result.data.data },
    '@/lib/http-error': { HttpError },
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/app/api/subscription/route.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: name => { if (!(name in imports)) throw new Error(name); return imports[name]; }, URL, process, Date });
  return { ...exports, calls, cookieWrites };
}
const base = 'https://finviet.example';
function post(action, body, origin = base) {
  return new Request(`${base}/api/subscription?action=${action}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

test('anonymous payment reads cannot reach the backend', async () => {
  const api = route();
  const result = await api.GET(new Request(`${base}/api/subscription?action=payment&id=00000000-0000-4000-8000-000000000001`));
  assert.equal(result.status, 401);
  assert.equal(api.calls.length, 0);
});
test('cross-origin checkout is rejected before an upstream request', async () => {
  const api = route('customer-token');
  assert.equal((await api.POST(post('subscribe', {}, 'https://other.example'))).status, 403);
  assert.equal(api.calls.length, 0);
});
test('customer login keeps the bearer token in a scoped HttpOnly cookie', async () => {
  const api = route();
  const result = await api.POST(post('login', { email: 'customer@example.com', password: 'test-password' }));
  assert.equal(result.status, 200);
  assert.equal(await result.text(), '{"data":true}');
  const [name, token, options] = api.cookieWrites[0];
  assert.equal(name, 'finviet_customer_checkout');
  assert.equal(token, 'private-jwt');
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.path, '/api/subscription');
});
test('checkout fixes QR and return destination, forwards the customer key, and ignores client price', async () => {
  const api = route('customer-token');
  const key = '00000000-0000-4000-8000-000000000002';
  const planId = '00000000-0000-4000-8000-000000000001';
  assert.equal((await api.POST(post('subscribe', { planId, key, price: 1, returnUrl: 'https://other.example' }))).status, 200);
  assert.equal(api.calls[0].config.headers.Authorization, 'Bearer customer-token');
  assert.equal(api.calls[0].config.headers['Idempotency-Key'], key);
  assert.deepEqual(JSON.parse(JSON.stringify(api.calls[0].body)), { planId, bankCode: 'VNPAYQR', returnUrl: `${base}/subscription` });
});
test('unknown actions and malformed payment IDs never reach upstream', async () => {
  const api = route('customer-token');
  for (const action of ['payment&id=../../admin', 'admin']) {
    assert.equal((await api.GET(new Request(`${base}/api/subscription?action=${action}`))).status, 400);
  }
  assert.equal(api.calls.length, 0);
});

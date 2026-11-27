export const runtimeQaMessage = (time: string, hash: string) => `calculus-ninja-runtime-qa-v1\nPOST\n/api/runtime-qa\n${time}\n${hash}`;
export async function authorizeRuntimeQa(request: Request, publicKey?: string, expiresAt?: string, expectedBody = '{}') {
  const now = Date.now();
  if (!publicKey || !Number.isFinite(Number(expiresAt)) || Number(expiresAt) <= now) return 404;
  if (request.method !== 'POST' || request.headers.has('origin')) return 403;
  try {
    const time = request.headers.get('x-qa-time') || '', hash = request.headers.get('x-qa-hash') || '', signature = request.headers.get('x-qa-signature') || '';
    if (!/^\d{13}$/.test(time) || Math.abs(now - Number(time)) > 60000 || !/^[a-f0-9]{64}$/.test(hash) || !/^[A-Za-z0-9+/]{86}==$/.test(signature)) return 403;
    const key = await crypto.subtle.importKey('spki', Uint8Array.from(atob(publicKey), c => c.charCodeAt(0)), 'Ed25519', false, ['verify']);
    if (!await crypto.subtle.verify('Ed25519', key, Uint8Array.from(atob(signature), c => c.charCodeAt(0)), new TextEncoder().encode(runtimeQaMessage(time, hash)))) return 403;
    const expected = new TextEncoder().encode(expectedBody);
    if (expected.byteLength > 100 || !request.body) return 403;
    const actualHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', expected)), b => b.toString(16).padStart(2, '0')).join('');
    if (actualHash !== hash) return 403;
    const reader = request.body.getReader();
    let offset = 0;
    try {
      for (;;) {
        const {done, value} = await reader.read();
        if (done) break;
        if (offset + value.byteLength > expected.byteLength || value.some((byte, i) => byte !== expected[offset + i])) {
          await reader.cancel();
          return 403;
        }
        offset += value.byteLength;
      }
    } finally {
      reader.releaseLock();
    }
    return offset === expected.byteLength && Date.now() < Number(expiresAt) && Math.abs(Date.now() - Number(time)) <= 60000 ? 200 : 403;
  } catch { return 403; }
}

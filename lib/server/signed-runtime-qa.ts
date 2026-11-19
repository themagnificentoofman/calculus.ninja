export const runtimeQaMessage = (time: string, hash: string) => `calculus-ninja-runtime-qa-v1\nPOST\n/api/runtime-qa\n${time}\n${hash}`;
export async function authorizeRuntimeQa(request: Request, publicKey?: string, expiresAt?: string) {
  const now = Date.now();
  if (!publicKey || !Number.isFinite(Number(expiresAt)) || Number(expiresAt) <= now) return 404;
  if (request.method !== 'POST' || request.headers.has('origin')) return 403;
  try {
    const time = request.headers.get('x-qa-time') || '', hash = request.headers.get('x-qa-hash') || '', signature = request.headers.get('x-qa-signature') || '';
    if (!/^\d{13}$/.test(time) || Math.abs(now - Number(time)) > 60000 || !/^[a-f0-9]{64}$/.test(hash) || !/^[A-Za-z0-9+/]{86}==$/.test(signature)) return 403;
    const key = await crypto.subtle.importKey('spki', Uint8Array.from(atob(publicKey), c => c.charCodeAt(0)), 'Ed25519', false, ['verify']);
    if (!await crypto.subtle.verify('Ed25519', key, Uint8Array.from(atob(signature), c => c.charCodeAt(0)), new TextEncoder().encode(runtimeQaMessage(time, hash)))) return 403;
    const body = await request.text(); if (body.length > 100 || body !== '{}') return 403;
    const actual = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))), b => b.toString(16).padStart(2, '0')).join('');
    return actual === hash ? 200 : 403;
  } catch { return 403; }
}

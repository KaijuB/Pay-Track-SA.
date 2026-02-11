export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('paytrack_token');
}

export async function apiFetch(path, { method = 'GET', body, token, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  const t = token || getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(path, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error ? (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) : 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

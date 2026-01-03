const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, { method = 'GET', token, body } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const msg = errorBody.error || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return res.json().catch(() => ({}));
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  me: (token) => request('/users/me', { token }),
  checkIn: (token) => request('/attendance/check-in', { method: 'POST', token }),
  checkOut: (token) => request('/attendance/check-out', { method: 'POST', token }),
  attendanceMine: (token) => request('/attendance/me', { token }),
  attendanceAll: (token) => request('/attendance/all', { token }),
  leavesAll: (token) => request('/leaves', { token }),
  leavesMine: (token) => request('/leaves/mine', { token }),
  leaveCreate: (token, data) => request('/leaves', { method: 'POST', token, body: data }),
  leaveApprove: (token, id) => request(`/leaves/${id}/approve`, { method: 'POST', token }),
  leaveReject: (token, id) => request(`/leaves/${id}/reject`, { method: 'POST', token }),
  adminCreateUser: (token, data) => request('/admin/users', { method: 'POST', token, body: data }),
};

export { API_BASE };

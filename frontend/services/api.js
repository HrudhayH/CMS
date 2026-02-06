const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get admin token from localStorage
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

// Get staff token from localStorage
function getStaffToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('staffToken');
}

// Get client token from localStorage
function getClientToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('clientToken');
}

// Generic fetch wrapper with admin auth
async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// Fetch wrapper for staff portal (uses staffToken)
async function fetchWithStaffAuth(endpoint, options = {}) {
  const token = getStaffToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration for staff
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('staffToken');
        window.location.href = '/staff/login';
      }
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// Fetch wrapper for client portal (uses clientToken)
async function fetchWithClientAuth(endpoint, options = {}) {
  const token = getClientToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiration for client
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('clientToken');
        window.location.href = '/client/login';
      }
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ============================================
// Auth APIs
// ============================================
export async function adminLogin(email, password) {
  const response = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

export async function staffLogin(email, password) {
  const response = await fetch(`${API_URL}/auth/staff/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

export async function clientLogin(email, password) {
  const response = await fetch(`${API_URL}/auth/client/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

// ============================================
// Dashboard APIs
// ============================================
export async function getDashboardStats() {
  return fetchWithAuth('/admin/dashboard/stats');
}

// ============================================
// Project APIs
// ============================================
export async function getProjects(page = 1, limit = 10) {
  return fetchWithAuth(`/admin/projects?page=${page}&limit=${limit}`);
}

export async function getProject(id) {
  return fetchWithAuth(`/admin/projects/${id}`);
}

export async function createProject(projectData) {
  return fetchWithAuth('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

export async function updateProject(id, projectData) {
  return fetchWithAuth(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
}

export async function deleteProject(id) {
  return fetchWithAuth(`/admin/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function updateProjectStatus(id, status) {
  return fetchWithAuth(`/admin/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============================================
// Client APIs
// ============================================
export async function getClients(page = 1, limit = 10) {
  return fetchWithAuth(`/admin/clients?page=${page}&limit=${limit}`);
}

export async function getAllClients() {
  return fetchWithAuth('/admin/clients/all');
}

export async function getClient(id) {
  return fetchWithAuth(`/admin/clients/${id}`);
}

export async function createClient(clientData) {
  return fetchWithAuth('/admin/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
}

export async function updateClient(id, clientData) {
  return fetchWithAuth(`/admin/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  });
}

export async function deleteClient(id) {
  return fetchWithAuth(`/admin/clients/${id}`, {
    method: 'DELETE',
  });
}

export async function updateClientStatus(id, status) {
  return fetchWithAuth(`/admin/clients/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============================================
// Staff APIs
// ============================================
export async function getStaff(page = 1, limit = 10) {
  return fetchWithAuth(`/admin/staff?page=${page}&limit=${limit}`);
}

export async function getAllStaff() {
  return fetchWithAuth('/admin/staff/all');
}

export async function getStaffMember(id) {
  return fetchWithAuth(`/admin/staff/${id}`);
}

export async function createStaff(staffData) {
  return fetchWithAuth('/admin/staff', {
    method: 'POST',
    body: JSON.stringify(staffData),
  });
}

export async function updateStaff(id, staffData) {
  return fetchWithAuth(`/admin/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(staffData),
  });
}

export async function deleteStaff(id) {
  return fetchWithAuth(`/admin/staff/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// Staff Portal APIs (uses staffToken)
// ============================================
export async function getStaffDashboardStats() {
  return fetchWithStaffAuth('/staff/dashboard/stats');
}

export async function getStaffRecentProjects() {
  return fetchWithStaffAuth('/staff/dashboard/recent-projects');
}

export async function getStaffProjects(page = 1, limit = 10) {
  return fetchWithStaffAuth(`/staff/projects?page=${page}&limit=${limit}`);
}

export async function getStaffProject(id) {
  return fetchWithStaffAuth(`/staff/projects/${id}`);
}

export async function addStaffProjectUpdate(projectId, updateData) {
  return fetchWithStaffAuth(`/staff/projects/${projectId}/update`, {
    method: 'POST',
    body: JSON.stringify(updateData),
  });
}

export async function getStaffProjectUpdates(projectId, page = 1, limit = 5) {
  return fetchWithStaffAuth(`/staff/projects/${projectId}/updates?page=${page}&limit=${limit}`);
}

export async function updateStaffStatus(id, status) {
  return fetchWithAuth(`/admin/staff/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============================================
// Client Portal APIs (uses clientToken)
// ============================================
export async function getClientDashboardStats() {
  return fetchWithClientAuth('/client/dashboard/stats');
}

export async function getClientProjects(page = 1, limit = 10) {
  return fetchWithClientAuth(`/client/projects?page=${page}&limit=${limit}`);
}

export async function getClientProject(id) {
  return fetchWithClientAuth(`/client/projects/${id}`);
}

export async function getClientProjectUpdates(projectId, page = 1, limit = 5) {
  return fetchWithClientAuth(`/client/projects/${projectId}/updates?page=${page}&limit=${limit}`);
}

export async function getClientAllUpdates() {
  return fetchWithClientAuth('/client/updates/all');
}

export async function addClientUpdateReply(projectId, updateId, message) {
  return fetchWithClientAuth(`/client/projects/${projectId}/updates/${updateId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function addStaffUpdateReply(projectId, updateId, message) {
  return fetchWithStaffAuth(`/staff/projects/${projectId}/updates/${updateId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// ============================================
// Admin Payment APIs
// ============================================
export async function getPaymentPlans(page = 1, limit = 10) {
  return fetchWithAuth(`/admin/payments?page=${page}&limit=${limit}`);
}

export async function getPaymentPlan(id) {
  return fetchWithAuth(`/admin/payments/${id}`);
}

export async function createPaymentPlan(data) {
  return fetchWithAuth('/admin/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addPaymentPhases(planId, phases) {
  return fetchWithAuth(`/admin/payments/${planId}/phases`, {
    method: 'POST',
    body: JSON.stringify({ phases }),
  });
}

export async function markPhaseAsPaid(planId, phaseId, paymentMode) {
  return fetchWithAuth(`/admin/payments/${planId}/phases/${phaseId}/pay`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentMode }),
  });
}

export async function markFullPayment(planId, paymentMode) {
  return fetchWithAuth(`/admin/payments/${planId}/pay`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentMode }),
  });
}

export async function getPaymentsByClient(clientId) {
  return fetchWithAuth(`/admin/payments/client/${clientId}`);
}

export async function getPaymentByProject(projectId) {
  return fetchWithAuth(`/admin/payments/project/${projectId}`);
}

export async function getPaymentHistory(page = 1, limit = 10) {
  return fetchWithAuth(`/admin/payments/history?page=${page}&limit=${limit}`);
}

export async function updatePaymentPlan(planId, data) {
  return fetchWithAuth(`/admin/payments/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updatePaymentPhase(planId, phaseId, data) {
  return fetchWithAuth(`/admin/payments/${planId}/phases/${phaseId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePaymentPhase(planId, phaseId) {
  return fetchWithAuth(`/admin/payments/${planId}/phases/${phaseId}`, {
    method: 'DELETE',
  });
}

// ============================================
// Client Payment APIs
// ============================================
export async function getClientPaymentSummary() {
  return fetchWithClientAuth('/client/payments/summary');
}

export async function getClientPaymentHistory(page = 1, limit = 10) {
  return fetchWithClientAuth(`/client/payments/history?page=${page}&limit=${limit}`);
}

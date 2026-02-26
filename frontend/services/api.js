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
// Forgot Password APIs
// ============================================
export async function requestForgotOtp(email, role) {
  const response = await fetch(`${API_URL}/auth/forgot/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
  return data;
}

export async function verifyForgotOtp(email, code, role) {
  const response = await fetch(`${API_URL}/auth/forgot/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'OTP verification failed');
  return data;
}

export async function resetForgotPassword(email, newPassword, role) {
  const response = await fetch(`${API_URL}/auth/forgot/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword, role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Password reset failed');
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
export async function getProjects(page = 1, limit = 10, search = '', status = '', filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (filters.techStack) params.append('techStack', filters.techStack);
  if (filters.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
  if (filters.startDateTo) params.append('startDateTo', filters.startDateTo);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  return fetchWithAuth(`/admin/projects?${params.toString()}`);
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
export async function getClients(page = 1, limit = 10, search = '', status = '', filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (filters.company) params.append('company', filters.company);
  return fetchWithAuth(`/admin/clients?${params.toString()}`);
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

export async function getClientWithProjects(id) {
  return fetchWithAuth(`/admin/clients/${id}/projects`);
}

// ============================================
// Staff APIs
// ============================================
export async function getStaff(page = 1, limit = 10, search = '', status = '', filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (filters.role) params.append('role', filters.role);
  if (filters.department) params.append('department', filters.department);
  return fetchWithAuth(`/admin/staff?${params.toString()}`);
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

export async function getStaffProfile() {
  return fetchWithStaffAuth('/staff/profile');
}

export async function updateStaffProfile(data) {
  return fetchWithStaffAuth('/staff/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
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

export async function updateStaffDeploymentLinks(projectId, links) {
  return fetchWithStaffAuth(`/staff/projects/${projectId}/deployment-links`, {
    method: 'PUT',
    body: JSON.stringify(links),
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

export async function getClientProfile() {
  return fetchWithClientAuth('/client/profile');
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
export async function getPaymentPlans(page = 1, limit = 10, search = '', paymentType = '', status = '') {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (paymentType) params.append('paymentType', paymentType);
  if (status) params.append('status', status);
  return fetchWithAuth(`/admin/payments?${params.toString()}`);
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

export async function getPaymentHistory(page = 1, limit = 10, search = '', paymentMode = '') {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (paymentMode) params.append('paymentMode', paymentMode);
  return fetchWithAuth(`/admin/payments/history?${params.toString()}`);
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

// ============================================
// Project Comment APIs (Shared by Client & Staff)
// ============================================
export async function getProjectComments(projectId, page = 1, limit = 20) {
  const token = typeof window !== 'undefined' ?
    localStorage.getItem('clientToken') || localStorage.getItem('staffToken') : null;

  const response = await fetch(
    `${API_URL}/projects/${projectId}/comments?page=${page}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch comments');
  return data;
}

export async function addProjectComment(projectId, message) {
  const token = typeof window !== 'undefined' ?
    localStorage.getItem('clientToken') || localStorage.getItem('staffToken') : null;

  const response = await fetch(`${API_URL}/projects/${projectId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add comment');
  return data;
}

export async function updateCommentStatus(commentId, status) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('staffToken') : null;

  const response = await fetch(`${API_URL}/comments/${commentId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update status');
  return data;
}

export async function deleteProjectComment(commentId) {
  const token = typeof window !== 'undefined' ?
    localStorage.getItem('clientToken') || localStorage.getItem('staffToken') : null;

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete comment');
  return data;
}

// ============================================
// Admin Management APIs (super_admin only)
// ============================================
export async function getAdmins() {
  return fetchWithAuth('/admin/admins');
}

export async function getAdminById(id) {
  return fetchWithAuth(`/admin/admins/${id}`);
}

export async function createAdminUser(adminData) {
  return fetchWithAuth('/admin/admins', {
    method: 'POST',
    body: JSON.stringify(adminData),
  });
}

export async function updateAdminUser(id, adminData) {
  return fetchWithAuth(`/admin/admins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(adminData),
  });
}

export async function deleteAdminUser(id) {
  return fetchWithAuth(`/admin/admins/${id}`, {
    method: 'DELETE',
  });
}



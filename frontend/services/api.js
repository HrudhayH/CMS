const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get token from localStorage
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

// Generic fetch wrapper with auth
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

export async function updateStaffStatus(id, status) {
  return fetchWithAuth(`/admin/staff/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

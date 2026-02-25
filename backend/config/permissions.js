/**
 * Permission constants for the Admin permission system.
 * Super Admins bypass all permission checks.
 * Regular Admins require specific permissions in their permissions array.
 */

const PERMISSIONS = {
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_PAYMENTS: 'manage_payments',
  VIEW_DASHBOARD: 'view_dashboard'
};

// All available permissions (for validation and UI)
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

module.exports = { PERMISSIONS, ALL_PERMISSIONS };

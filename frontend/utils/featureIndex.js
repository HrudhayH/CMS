/**
 * featureIndex.js
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED FEATURE INDEX for the Global Feature Search system.
 *
 * Each entry describes one navigable destination (page / action) in the CMS.
 *
 * Schema per entry
 * ─────────────────
 * id          {string}   Unique identifier (kebab-case)
 * title       {string}   Human-readable name shown in the suggestion list
 * route       {string}   Next.js route path to navigate to
 * portal      {string}   'admin' | 'staff' | 'client'
 * roles       {string[]} JWT roles that may access this item.
 *                         'super_admin' | 'admin' | 'staff' | 'client'
 *                         Empty array = no role restriction within the portal.
 * permissions {string[]} Admin permission keys (from config/permissions.js).
 *                         If non-empty, the user must hold at least one of them
 *                         OR be super_admin.  Ignored for staff/client portals.
 * keywords    {string[]} Synonyms / alternative search terms (lower-case)
 * category    {string}   Grouping label shown in the suggestion list
 * description {string}   Optional one-liner shown below the title
 * action      {string}   Optional URL query-param value appended on navigation.
 *                         e.g. action:'add' → router.push({ pathname, query: { action:'add' } })
 *                         The target page reads router.query.action and reacts (e.g. opens modal).
 *
 * HOW TO EXTEND
 * ─────────────
 * 1. Add a new object to the FEATURE_INDEX array below.
 * 2. Fill in the required fields.
 * 3. Add synonyms to `keywords` so users can find it by natural language.
 * 4. That's it — the search hook and UI pick it up automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FEATURE_INDEX = [
  // ─────────────────────────────────────────────────────────────────
  // ADMIN PORTAL
  // ─────────────────────────────────────────────────────────────────

  // Dashboard
  {
    id: 'admin-dashboard',
    title: 'Dashboard',
    route: '/admin/dashboard',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['view_dashboard'],
    keywords: ['dashboard', 'home', 'overview', 'stats', 'summary', 'analytics', 'kpi', 'metrics'],
    category: 'Dashboard',
    description: 'View KPI stats and system overview',
  },

  // Clients
  {
    id: 'admin-clients',
    title: 'Clients',
    route: '/admin/clients',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_clients'],
    keywords: ['clients', 'client list', 'all clients', 'view clients', 'customers'],
    category: 'Client Management',
    description: 'Browse and manage all clients',
  },
  {
    id: 'admin-clients-add',
    title: 'Add Client',
    route: '/admin/clients',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_clients'],
    keywords: ['add client', 'new client', 'create client', 'register client', 'onboard client'],
    category: 'Client Management',
    description: 'Create a new client account',
    action: 'add',
  },

  // Projects
  {
    id: 'admin-projects',
    title: 'Projects',
    route: '/admin/projects',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_projects'],
    keywords: ['projects', 'all projects', 'project list', 'work', 'tasks'],
    category: 'Project Management',
    description: 'Browse and manage all projects',
  },
  {
    id: 'admin-projects-add',
    title: 'Add Project',
    route: '/admin/projects',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_projects'],
    keywords: ['add project', 'new project', 'create project', 'start project'],
    category: 'Project Management',
    description: 'Create a new project',
    action: 'add',
  },

  // Staff
  {
    id: 'admin-staff',
    title: 'Staff',
    route: '/admin/staff',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_staff'],
    keywords: ['staff', 'employees', 'team', 'all staff', 'members', 'workforce'],
    category: 'Staff Management',
    description: 'Browse and manage all staff members',
  },
  {
    id: 'admin-staff-add',
    title: 'Add Staff Member',
    route: '/admin/staff',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_staff'],
    keywords: ['add staff', 'new staff', 'create staff', 'hire', 'onboard staff', 'add employee'],
    category: 'Staff Management',
    description: 'Create a new staff account',
    action: 'add',
  },

  // Payments
  {
    id: 'admin-payments',
    title: 'Payments',
    route: '/admin/payments',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_payments'],
    keywords: ['payments', 'invoices', 'billing', 'payment plans', 'finance', 'money', 'fees'],
    category: 'Payments',
    description: 'Manage payment plans and billing',
  },
  {
    id: 'admin-payments-history',
    title: 'Payment History',
    route: '/admin/payments/history',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['manage_payments'],
    keywords: ['payment history', 'transactions', 'past payments', 'paid', 'receipts'],
    category: 'Payments',
    description: 'View full payment transaction history',
  },

  // MOM (Minutes of Meeting)
  {
    id: 'admin-mom',
    title: 'Meeting Minutes (MOM)',
    route: '/admin/mom',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: ['view_dashboard'],
    keywords: ['mom', 'meeting minutes', 'minutes of meeting', 'meetings', 'notes', 'minutes'],
    category: 'Meetings',
    description: 'View all meeting minutes records',
  },

  // Manage Admins (super_admin only)
  {
    id: 'admin-manage-admins',
    title: 'Manage Admins',
    route: '/admin/manage-admins',
    portal: 'admin',
    roles: ['super_admin'],
    permissions: [],
    keywords: ['manage admins', 'admin users', 'administrators', 'add admin', 'user management', 'roles', 'permissions'],
    category: 'Administration',
    description: 'Create and manage admin accounts and permissions',
  },
  {
    id: 'admin-manage-admins-add',
    title: 'Add Admin',
    route: '/admin/manage-admins',
    portal: 'admin',
    roles: ['super_admin'],
    permissions: [],
    keywords: ['add admin', 'new admin', 'create admin', 'invite admin', 'new administrator'],
    category: 'Administration',
    description: 'Create a new admin account',
    action: 'add',
  },

  // Admin Profile
  {
    id: 'admin-profile',
    title: 'My Profile',
    route: '/admin/profile',
    portal: 'admin',
    roles: ['super_admin', 'admin'],
    permissions: [],
    keywords: ['profile', 'my profile', 'account', 'settings', 'avatar', 'photo', 'personal info'],
    category: 'Account',
    description: 'View and update your admin profile',
  },

  // ─────────────────────────────────────────────────────────────────
  // STAFF PORTAL
  // ─────────────────────────────────────────────────────────────────

  {
    id: 'staff-dashboard',
    title: 'Dashboard',
    route: '/staff/dashboard',
    portal: 'staff',
    roles: ['staff'],
    permissions: [],
    keywords: ['dashboard', 'home', 'overview', 'summary', 'stats', 'my work'],
    category: 'Dashboard',
    description: 'Your staff dashboard overview',
  },
  {
    id: 'staff-projects',
    title: 'My Projects',
    route: '/staff/projects',
    portal: 'staff',
    roles: ['staff'],
    permissions: [],
    keywords: ['projects', 'my projects', 'assigned projects', 'work', 'tasks', 'current projects'],
    category: 'Projects',
    description: 'Browse your assigned projects',
  },
  {
    id: 'staff-mom',
    title: 'Meeting Minutes (MOM)',
    route: '/staff/mom',
    portal: 'staff',
    roles: ['staff'],
    permissions: [],
    keywords: ['mom', 'meeting minutes', 'meetings', 'minutes of meeting', 'notes', 'meeting notes'],
    category: 'Meetings',
    description: 'View and create meeting minutes',
  },
  {
    id: 'staff-mom-create',
    title: 'Create MOM',
    route: '/staff/mom/create',
    portal: 'staff',
    roles: ['staff'],
    permissions: [],
    keywords: ['create mom', 'new mom', 'add meeting minutes', 'write minutes', 'new meeting note'],
    category: 'Meetings',
    description: 'Create a new meeting minutes record',
  },
  {
    id: 'staff-profile',
    title: 'My Profile',
    route: '/staff/profile',
    portal: 'staff',
    roles: ['staff'],
    permissions: [],
    keywords: ['profile', 'my profile', 'account', 'settings', 'personal info', 'photo'],
    category: 'Account',
    description: 'View and update your staff profile',
  },

  // ─────────────────────────────────────────────────────────────────
  // CLIENT PORTAL
  // ─────────────────────────────────────────────────────────────────

  {
    id: 'client-dashboard',
    title: 'Dashboard',
    route: '/client/dashboard',
    portal: 'client',
    roles: ['client'],
    permissions: [],
    keywords: ['dashboard', 'home', 'overview', 'summary', 'my account'],
    category: 'Dashboard',
    description: 'Your client portal overview',
  },
  {
    id: 'client-projects',
    title: 'Projects',
    route: '/client/projects',
    portal: 'client',
    roles: ['client'],
    permissions: [],
    keywords: ['projects', 'my projects', 'work', 'progress', 'status', 'development'],
    category: 'Projects',
    description: 'View your active and past projects',
  },
  {
    id: 'client-updates',
    title: 'Daily Updates',
    route: '/client/updates',
    portal: 'client',
    roles: ['client'],
    permissions: [],
    keywords: ['updates', 'daily updates', 'progress updates', 'reports', 'activity', 'news', 'feed'],
    category: 'Updates',
    description: 'View daily development updates from your team',
  },
  {
    id: 'client-payments',
    title: 'Payments',
    route: '/client/payments',
    portal: 'client',
    roles: ['client'],
    permissions: [],
    keywords: ['payments', 'invoices', 'billing', 'fees', 'money', 'dues', 'pay'],
    category: 'Payments',
    description: 'View your payment plans and status',
  },
  {
    id: 'client-payments-history',
    title: 'Payment History',
    route: '/client/payments/history',
    portal: 'client',
    roles: ['client'],
    permissions: [],
    keywords: ['payment history', 'transactions', 'past payments', 'receipts', 'paid'],
    category: 'Payments',
    description: 'View your full payment transaction history',
  },
  {
    id: 'client-mom',
    title: 'Meeting Minutes',
    route: '/client/mom',
    portal: 'client',
    roles: ['client'],
    permissions: [],
    keywords: ['mom', 'meeting minutes', 'meetings', 'notes', 'meeting notes', 'minutes'],
    category: 'Meetings',
    description: 'View your project meeting records',
  },
  {
    id: 'client-profile',
    title: 'Profile',
    route: '/client/profile',
    portal: 'client',
    roles: ['client'],
    permissions: [],
    keywords: ['profile', 'my profile', 'account', 'settings', 'personal info'],
    category: 'Account',
    description: 'View and update your profile',
  },
];

/**
 * Returns only the items accessible to the given user in the current portal.
 *
 * @param {string} portal       - 'admin' | 'staff' | 'client'
 * @param {object} user         - Decoded JWT payload  { role, permissions[] }
 * @returns {Array}             Filtered subset of FEATURE_INDEX
 */
export function getAccessibleFeatures(portal, user) {
  if (!portal || !user) return [];

  return FEATURE_INDEX.filter((item) => {
    // Must belong to the current portal
    if (item.portal !== portal) return false;

    // Role check
    if (item.roles.length > 0 && !item.roles.includes(user.role)) return false;

    // Admin permission check (only relevant for admin portal)
    if (portal === 'admin' && item.permissions.length > 0) {
      // super_admin bypasses all permission checks
      if (user.role === 'super_admin') return true;
      // regular admin must hold at least one required permission
      const userPerms = user.permissions || [];
      return item.permissions.some((p) => userPerms.includes(p));
    }

    return true;
  });
}

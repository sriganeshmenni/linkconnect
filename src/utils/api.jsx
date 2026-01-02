// // API utility functions for MongoDB backend integration
// // MongoDB Connection: mongodb+srv://mennisri2005_db_user:Sriganesh.2005@cluster0.zepiyum.mongodb.net/?appName=Cluster0

// // Configure your MongoDB backend API URL here
// const API_BASE_URL = 'http://localhost:5000/api';

// // Helper to get auth token
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('linkconnect_token');
//   return {
//     'Content-Type': 'application/json',
//     ...(token && { 'Authorization': `Bearer ${token}` })
//   };
// };

// // Helper function for API calls
// const apiCall = async (endpoint, options = {}) => {
//   const config = {
//     ...options,
//     headers: {
//       ...getAuthHeaders(),
//       ...options.headers,
//     },
//   };

//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.message || 'API call failed');
//     }
    
//     return data;
//   } catch (error) {
//     console.error('API Error:', error);
//     throw error;
//   }
// };

// // Links API
// export const linksAPI = {
//   create: async (linkData) => {
//     try {
//       const response = await apiCall('/links', {
//         method: 'POST',
//         body: JSON.stringify(linkData),
//       });
//       // Handle both response formats: { success: true, link: {...} } or direct link object
//       return response.link || response;
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const newLink = {
//         id: Date.now(),
//         ...linkData,
//         createdAt: new Date().toISOString(),
//         registrations: 0
//       };
//       // Store in localStorage for persistence during demo
//       const links = JSON.parse(localStorage.getItem('demo_links') || '[]');
//       links.push(newLink);
//       localStorage.setItem('demo_links', JSON.stringify(links));
//       return newLink;
//     }
//   },

//   // getAll: async () => {
//   //   try {
//   //     const response = await apiCall('/links');
//   //     // Handle both response formats: { success: true, links: [...] } or direct array
//   //     return response.links || response;
//   //   } catch (error) {
//   //     console.warn('Using mock data - Backend not connected');
//   //     // Try to get from localStorage first
//   //     const storedLinks = localStorage.getItem('demo_links');
//   //     if (storedLinks) {
//   //       return JSON.parse(storedLinks);
//   //     }
//   //     // Return default mock data
//   //     const mockLinks = [
//   //       {
//   //         id: 1,
//   //         title: 'Amazon SDE Internship 2025',
//   //         url: 'https://amazon.jobs/en/jobs/123456',
//   //         shortUrl: 'lc.io/amz25',
//   //         deadline: '2025-12-01',
//   //         description: 'Summer internship for SDE role',
//   //         createdBy: 'faculty@college.edu',
//   //         createdAt: '2025-10-15T10:30:00Z',
//   //         registrations: 45,
//   //         active: true
//   //       },
//   //       {
//   //         id: 2,
//   //         title: 'Google STEP Program',
//   //         url: 'https://google.com/careers/step',
//   //         shortUrl: 'lc.io/gstep',
//   //         deadline: '2025-11-15',
//   //         description: 'First and second-year students program',
//   //         createdBy: 'faculty@college.edu',
//   //         createdAt: '2025-10-20T14:20:00Z',
//   //         registrations: 32,
//   //         active: true
//   //       }
//   //     ];
//   //     localStorage.setItem('demo_links', JSON.stringify(mockLinks));
//   //     return mockLinks;
//   //   }
//   // },

// getAll: async () => {
//   try {
//     const response = await apiCall('/links');

//     // ALWAYS return only array of links
//     if (response && Array.isArray(response.links)) {
//       return response.links; // backend format
//     }

//     if (Array.isArray(response)) {
//       return response; // direct array fallback
//     }

//     return []; // safe fallback
//   } catch (error) {
//     console.warn('Using mock data - Backend not connected');
    
//     const storedLinks = localStorage.getItem('demo_links');
//     if (storedLinks) {
//       return JSON.parse(storedLinks);
//     }

//     return [];
//   }
// },


//   getStudentLinks: async () => {
//     try {
//       const response = await apiCall('/links/student/my-links');
//       return response.links || response;
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       // Fallback to all links for students when backend is unavailable
//       return linksAPI.getAll();
//     }
//   },

//   update: async (id, data) => {
//     try {
//       const response = await apiCall(`/links/${id}`, {
//         method: 'PUT',
//         body: JSON.stringify(data),
//       });
//       return response.link || response;
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const links = JSON.parse(localStorage.getItem('demo_links') || '[]');
//       const index = links.findIndex(link => link.id === id);
//       if (index !== -1) {
//         links[index] = { ...links[index], ...data, updatedAt: new Date().toISOString() };
//         localStorage.setItem('demo_links', JSON.stringify(links));
//       }
//       return { success: true };
//     }
//   },

//   delete: async (id) => {
//     try {
//       return await apiCall(`/links/${id}`, { method: 'DELETE' });
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const links = JSON.parse(localStorage.getItem('demo_links') || '[]');
//       const filtered = links.filter(link => link.id !== id);
//       localStorage.setItem('demo_links', JSON.stringify(filtered));
//       return { success: true };
//     }
//   }
// };

// // Submissions API
// export const submissionsAPI = {
//   create: async (submissionData) => {
//     try {
//       return await apiCall('/submissions', {
//         method: 'POST',
//         body: JSON.stringify(submissionData),
//       });
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const newSubmission = {
//         id: Date.now(),
//         ...submissionData,
//         submittedAt: new Date().toISOString()
//       };
//       const submissions = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
//       submissions.push(newSubmission);
//       localStorage.setItem('demo_submissions', JSON.stringify(submissions));
      
//       // Update link registration count
//       const links = JSON.parse(localStorage.getItem('demo_links') || '[]');
//       const linkIndex = links.findIndex(link => link.id === submissionData.linkId);
//       if (linkIndex !== -1) {
//         links[linkIndex].registrations = (links[linkIndex].registrations || 0) + 1;
//         localStorage.setItem('demo_links', JSON.stringify(links));
//       }
      
//       return newSubmission;
//     }
//   },

//   getByLink: async (linkId) => {
//     try {
//       return await apiCall(`/submissions/link/${linkId}`);
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const submissions = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
//       return submissions.filter(sub => sub.linkId === linkId);
//     }
//   },

//   getByStudent: async (studentId) => {
//     try {
//       const response = await apiCall(`/submissions/student/${studentId}`);
//       return Array.isArray(response) ? response : (response.submissions || []);
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const submissions = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
//       const user = JSON.parse(localStorage.getItem('linkconnect_user') || '{}');
//       return submissions.filter(sub => sub.studentEmail === user.email);
//     }
//   }
// };

// // Users API (Admin only)
// export const usersAPI = {
//   getAll: async () => {
//     try {
//       return await apiCall('/users');
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const mockUsers = [
//         {
//           id: 1,
//           name: 'Admin User',
//           email: 'admin@college.edu',
//           role: 'admin',
//           active: true,
//           createdAt: '2025-01-01T00:00:00Z',
//           lastLogin: '2025-11-01T08:30:00Z'
//         },
//         {
//           id: 2,
//           name: 'Faculty Member',
//           email: 'faculty@college.edu',
//           role: 'faculty',
//           active: true,
//           createdAt: '2025-01-15T00:00:00Z',
//           lastLogin: '2025-10-31T14:20:00Z'
//         },
//         {
//           id: 3,
//           name: 'John Doe',
//           email: 'john@college.edu',
//           role: 'student',
//           rollNumber: 'CS2023001',
//           active: true,
//           createdAt: '2025-02-01T00:00:00Z',
//           lastLogin: '2025-11-01T09:15:00Z'
//         }
//       ];
//       return mockUsers;
//     }
//   },

//   update: async (id, data) => {
//     try {
//       return await apiCall(`/users/${id}`, {
//         method: 'PUT',
//         body: JSON.stringify(data),
//       });
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       return { success: true };
//     }
//   },

//   delete: async (id) => {
//     try {
//       return await apiCall(`/users/${id}`, { method: 'DELETE' });
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       return { success: true };
//     }
//   }
// };

// // Analytics API
// export const analyticsAPI = {
//   getStats: async () => {
//     try {
//       return await apiCall('/analytics/stats');
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       const links = JSON.parse(localStorage.getItem('demo_links') || '[]');
//       const submissions = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
      
//       return {
//         totalUsers: 150,
//         totalLinks: links.length,
//         totalSubmissions: submissions.length,
//         activeLinks: links.filter(link => link.active).length,
//         todayLogins: 45,
//         weekLogins: 280
//       };
//     }
//   },

//   getLoginStats: async () => {
//     try {
//       return await apiCall('/analytics/logins');
//     } catch (error) {
//       console.warn('Using mock data - Backend not connected');
//       return [
//         { date: '2025-10-25', logins: 42 },
//         { date: '2025-10-26', logins: 38 },
//         { date: '2025-10-27', logins: 51 },
//         { date: '2025-10-28', logins: 45 },
//         { date: '2025-10-29', logins: 48 },
//         { date: '2025-10-30', logins: 52 },
//         { date: '2025-10-31', logins: 44 }
//       ];
//     }
//   }
// };

// // Export utilities (Admin only)
// export const exportAPI = {
//   exportUsers: async (role = null) => {
//     try {
//       const endpoint = role ? `/export/users/role/${role}` : '/export/users';
//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         method: 'GET',
//         headers: getAuthHeaders()
//       });
//       return await response.blob();
//     } catch (error) {
//       console.warn('Export not available - Backend not connected');
//       return null;
//     }
//   },

//   exportLinks: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/export/links`, {
//         method: 'GET',
//         headers: getAuthHeaders()
//       });
//       return await response.blob();
//     } catch (error) {
//       console.warn('Export not available - Backend not connected');
//       return null;
//     }
//   },

//   exportSubmissions: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/export/submissions`, {
//         method: 'GET',
//         headers: getAuthHeaders()
//       });
//       return await response.blob();
//     } catch (error) {
//       console.warn('Export not available - Backend not connected');
//       return null;
//     }
//   },

//   exportLogins: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/export/logins`, {
//         method: 'GET',
//         headers: getAuthHeaders()
//       });
//       return await response.blob();
//     } catch (error) {
//       console.warn('Export not available - Backend not connected');
//       return null;
//     }
//   }
// };


// API utility functions for MongoDB backend integration
// Configure your MongoDB backend API URL here
const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('linkconnect_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'API call failed');
  }

  return data;
};

/* ===================== LINKS API ===================== */
export const linksAPI = {
  create: async (linkData) => {
    const res = await apiCall('/links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
    return res.link; // ALWAYS return link object
  },

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.sort) params.set('sort', filters.sort);
    const query = params.toString();

    const res = await apiCall(`/links${query ? `?${query}` : ''}`);
    return Array.isArray(res?.links) ? res.links : [];
  },

  getStudentLinks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.sort) params.set('sort', filters.sort);

    const query = params.toString();
    const res = await apiCall(`/links/student/my-links${query ? `?${query}` : ''}`);
    return Array.isArray(res?.links) ? res.links : [];
  },

  getDivisionCatalog: async () => {
    try {
      const response = await apiCall('/links/divisions');
      return response.catalog || response;
    } catch (error) {
      console.warn('Using fallback divisions - backend not connected');
      return {
        colleges: [
          {
            code: 'AEC',
            name: 'Aditya Engineering College',
            branches: [
              { code: 'CSE', name: 'Computer Science and Engineering', years: [1, 2, 3, 4], sections: ['A', 'B', 'C'] },
              { code: 'ECE', name: 'Electronics and Communication Engineering', years: [1, 2, 3, 4], sections: ['A', 'B'] },
              { code: 'EEE', name: 'Electrical and Electronics Engineering', years: [1, 2, 3, 4], sections: ['A'] },
            ],
          },
        ],
      };
    }
  },

  update: async (id, data) => {
    const res = await apiCall(`/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.link;
  },

  delete: async (id) => {
    return await apiCall(`/links/${id}`, { method: 'DELETE' });
  },
};

/* ===================== SUBMISSIONS API ===================== */
export const submissionsAPI = {
  create: async (submissionData) => {
    const res = await apiCall('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
    return res.submission;
  },

  getByLink: async (linkId) => {
    const res = await apiCall(`/submissions/link/${linkId}`);
    return Array.isArray(res?.submissions) ? res.submissions : [];
  },

  getByStudent: async (studentId) => {
    const res = await apiCall(`/submissions/student/${studentId}`);
    return Array.isArray(res?.submissions) ? res.submissions : [];
  },

  verify: async (id, status) => {
    const res = await apiCall(`/submissions/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.submission;
  },
};

/* ===================== USERS API ===================== */
export const usersAPI = {
  getAll: async () => {
    const res = await apiCall('/users');
    return Array.isArray(res?.users) ? res.users : [];
  },

  update: async (id, data) => {
    return await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return await apiCall(`/users/${id}`, { method: 'DELETE' });
  },
};

/* ===================== PROFILE (SELF) API ===================== */
export const profileAPI = {
  getProfile: async () => {
    const res = await apiCall('/users/me');
    return res?.user;
  },
  updateProfile: async (data) => {
    const res = await apiCall('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res?.user;
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    return await apiCall('/users/me/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  getRecentLogins: async () => {
    const res = await apiCall('/users/me/logins');
    return Array.isArray(res?.logins) ? res.logins : [];
  },
};

/* ===================== ANALYTICS API ===================== */
export const analyticsAPI = {
  getStats: async () => {
    return await apiCall('/analytics/stats');
  },

  getLoginStats: async () => {
    return await apiCall('/analytics/logins');
  },

  getVisits: async () => {
    return await apiCall('/analytics/visits');
  },

  trackVisit: async (role = 'guest') => {
    try {
      await fetch(`${API_BASE_URL}/analytics/visits/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      // best-effort; ignore errors
    }
  },
};

/* ===================== ADMIN API ===================== */
export const adminAPI = {
  toggleUserStatus: async (userId) => {
    return await apiCall(`/admin/users/${userId}/status`, { method: 'PATCH' });
  },
  resetUserPassword: async (userId, newPassword) => {
    return await apiCall(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },
  forceLogoutUser: async (userId) => {
    return await apiCall(`/admin/users/${userId}/force-logout`, { method: 'POST' });
  },
  getUserActivity: async (userId) => {
    return await apiCall(`/admin/users/${userId}/activity`);
  },
  searchUserActivity: async (query) => {
    const params = new URLSearchParams();
    params.set('query', query);
    return await apiCall(`/admin/users/activity/search?${params.toString()}`);
  },
  toggleLinkActive: async (linkId) => {
    return await apiCall(`/admin/links/${linkId}/active`, { method: 'PATCH' });
  },
  getRateLimit: async () => {
    return await apiCall('/admin/rate-limit');
  },
  setRateLimit: async ({ windowMs, max }) => {
    return await apiCall('/admin/rate-limit', {
      method: 'POST',
      body: JSON.stringify({ windowMs, max }),
    });
  },
  getDivisions: async () => {
    return await apiCall('/admin/divisions');
  },
  saveDivisions: async (colleges) => {
    return await apiCall('/admin/divisions', {
      method: 'POST',
      body: JSON.stringify({ colleges }),
    });
  },
  createUser: async (user) => {
    return await apiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },
  bulkCreateUsers: async ({ users, sharedPassword }) => {
    return await apiCall('/admin/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users, sharedPassword }),
    });
  },
};

/* ===================== AUDIT API ===================== */
export const auditAPI = {
  getLogs: async ({ skip = 0, limit = 50, action, actor, targetUser, targetLink, from, to } = {}) => {
    const params = new URLSearchParams();
    params.set('skip', String(skip));
    params.set('limit', String(limit));
    if (action) params.set('action', action);
    if (actor) params.set('actor', actor);
    if (targetUser) params.set('targetUser', targetUser);
    if (targetLink) params.set('targetLink', targetLink);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    return await apiCall(`/audit?${params.toString()}`);
  },
  exportCsv: async () => {
    const res = await fetch(`${API_BASE_URL}/audit/export`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to export audit logs');
    }
    return await res.blob();
  },
};

/* ===================== EXPORT API ===================== */
export const exportAPI = {
  exportUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/export/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await res.blob();
  },

  exportLinks: async () => {
    const res = await fetch(`${API_BASE_URL}/export/links`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await res.blob();
  },

  exportSubmissions: async () => {
    const res = await fetch(`${API_BASE_URL}/export/submissions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await res.blob();
  },

  exportLogins: async () => {
    const res = await fetch(`${API_BASE_URL}/export/logins`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await res.blob();
  },
};

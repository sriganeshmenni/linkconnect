import React, { useState, useEffect } from 'react';
import { usersAPI, analyticsAPI, exportAPI, adminAPI, linksAPI, auditAPI } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, Users, Link2, FileCheck, TrendingUp, Search, Download, UserX, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loginStats, setLoginStats] = useState([]);
  const [links, setLinks] = useState([]);
  const [rateLimit, setRateLimit] = useState({ windowMs: 15 * 60 * 1000, max: 100 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(0);
  const [auditAction, setAuditAction] = useState('');
  const [auditActor, setAuditActor] = useState('');
  const [auditTargetUser, setAuditTargetUser] = useState('');
  const [auditTargetLink, setAuditTargetLink] = useState('');
  const [auditFrom, setAuditFrom] = useState('');
  const [auditTo, setAuditTo] = useState('');
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [visitStats, setVisitStats] = useState(null);
  const [userActivityQuery, setUserActivityQuery] = useState('');
  const [userActivityResults, setUserActivityResults] = useState([]);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [userActivityLoading, setUserActivityLoading] = useState(false);
  const [divisionCatalog, setDivisionCatalog] = useState({ colleges: [] });
  const [divisionText, setDivisionText] = useState('');
  const [divisionSaving, setDivisionSaving] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    rollNumber: '',
    password: '',
    collegeCode: '',
    branchCode: '',
    year: '',
    section: '',
  });
  const [bulkCsv, setBulkCsv] = useState('name,email,role,rollNumber,collegeCode,branchCode,year,section');
  const [bulkPassword, setBulkPassword] = useState('Welcome@123');
  const [provisioningBusy, setProvisioningBusy] = useState(false);
  const navigate = useNavigate();

  const fallbackCatalog = {
    colleges: [
      {
        code: 'AUS',
        name: 'Aditya University',
        branches: [
          {
            code: 'CSE',
            name: 'Computer Science and Engineering',
            years: [1, 2, 3, 4],
            sections: ['A', 'B', 'C', 'D'],
          },
        ],
      },
    ],
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const visitsPromise = analyticsAPI.getVisits().catch(() => null);

      const [usersData, statsData, loginData, linksData, rateLimitData, auditData, visitsData, divisionData] = await Promise.all([
        usersAPI.getAll(),
        analyticsAPI.getStats(),
        analyticsAPI.getLoginStats(),
        linksAPI.getAll(),
        adminAPI.getRateLimit(),
        auditAPI.getLogs({
          skip: auditPage * pageSize,
          limit: pageSize,
          action: auditAction || undefined,
          actor: auditActor || undefined,
          targetUser: auditTargetUser || undefined,
          targetLink: auditTargetLink || undefined,
          from: auditFrom || undefined,
          to: auditTo || undefined,
        }),
        visitsPromise,
        adminAPI.getDivisions().catch(() => null),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : usersData?.users || []);
      setStats(statsData?.stats || statsData?.data || statsData || {});
      setLoginStats(Array.isArray(loginData?.logins) ? loginData.logins : Array.isArray(loginData) ? loginData : []);
      setLinks(Array.isArray(linksData?.links) ? linksData.links : Array.isArray(linksData) ? linksData : []);
      setRateLimit(rateLimitData?.config || rateLimitData || { windowMs: 15 * 60 * 1000, max: 100 });
      setAuditLogs(Array.isArray(auditData?.rows) ? auditData.rows : []);
      setAuditTotal(auditData?.total || 0);
      setVisitStats(visitsData?.visits || null);
      if (divisionData?.catalog) {
        setDivisionCatalog(divisionData.catalog);
        setDivisionText(JSON.stringify(divisionData.catalog.colleges || [], null, 2));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast.success('User status updated');
      await loadData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleForceLogout = async (userId) => {
    try {
      await adminAPI.forceLogoutUser(userId);
      toast.success('User sessions revoked');
    } catch (error) {
      toast.error('Failed to force logout');
    }
  };

  const handleResetPassword = async (userId) => {
    const pwd = prompt('Enter new password (min 8 chars)');
    if (!pwd) return;
    try {
      await adminAPI.resetUserPassword(userId, pwd);
      toast.success('Password reset and sessions revoked');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersAPI.delete(userId);
      toast.success('User deleted successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportUsers = async () => {
    try {
      const blob = await exportAPI.exportUsers();
      downloadBlob(blob, 'users.csv');
      toast.success('Users exported');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  const handleExportLinks = async () => {
    try {
      const blob = await exportAPI.exportLinks();
      downloadBlob(blob, 'links.csv');
      toast.success('Links exported');
    } catch (error) {
      toast.error('Failed to export links');
    }
  };

  const handleExportSubmissions = async () => {
    try {
      const blob = await exportAPI.exportSubmissions();
      downloadBlob(blob, 'submissions.csv');
      toast.success('Submissions exported');
    } catch (error) {
      toast.error('Failed to export submissions');
    }
  };

  const handleExportLogins = async () => {
    try {
      const blob = await exportAPI.exportLogins();
      downloadBlob(blob, 'logins.csv');
      toast.success('Logins exported');
    } catch (error) {
      toast.error('Failed to export logins');
    }
  };

  const handleSearchUserActivity = async () => {
    if (!userActivityQuery.trim()) {
      setUserActivityResults([]);
      setUserActivityLogs([]);
      return;
    }
    setUserActivityLoading(true);
    try {
      const res = await adminAPI.searchUserActivity(userActivityQuery.trim());
      setUserActivityResults(res?.users || []);
      setUserActivityLogs([]);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setUserActivityLoading(false);
    }
  };

  const handleFetchUserLogs = async (userId) => {
    setUserActivityLoading(true);
    try {
      const res = await adminAPI.getUserActivity(userId);
      setUserActivityLogs(res?.activity || []);
    } catch (error) {
      toast.error('Failed to load user activity');
    } finally {
      setUserActivityLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const usersByRole = {
    admin: users.filter(u => u.role === 'admin').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    student: users.filter(u => u.role === 'student').length
  };

  const handleToggleLinkActive = async (linkId) => {
    try {
      await adminAPI.toggleLinkActive(linkId);
      toast.success('Link status updated');
      await loadData();
    } catch (error) {
      toast.error('Failed to update link');
    }
  };

  const handleSaveRateLimit = async () => {
    const windowMinutes = rateLimit.windowMs / 60000;
    const max = rateLimit.max;
    if (!windowMinutes || windowMinutes <= 0 || !max || max <= 0) {
      toast.error('Enter valid rate limit values');
      return;
    }
    try {
      const res = await adminAPI.setRateLimit({ windowMs: windowMinutes * 60000, max });
      setRateLimit(res?.config || res);
      toast.success('Rate limit updated');
    } catch (error) {
      toast.error('Failed to update rate limit');
    }
  };

  const handleAuditPageChange = async (page) => {
    setAuditPage(page);
    const auditData = await auditAPI.getLogs({
      skip: page * pageSize,
      limit: pageSize,
      action: auditAction || undefined,
      actor: auditActor || undefined,
      targetUser: auditTargetUser || undefined,
      targetLink: auditTargetLink || undefined,
      from: auditFrom || undefined,
      to: auditTo || undefined,
    });
    setAuditLogs(Array.isArray(auditData?.rows) ? auditData.rows : []);
    setAuditTotal(auditData?.total || 0);
  };

  const handleAuditFilter = async () => {
    await handleAuditPageChange(0);
  };

  const handleExportAudit = async () => {
    try {
      const blob = await auditAPI.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Audit exported');
    } catch (error) {
      toast.error('Failed to export audit');
    }
  };

  const handleSaveDivisions = async () => {
    setDivisionSaving(true);
    try {
      const parsed = JSON.parse(divisionText || '[]');
      const payload = Array.isArray(parsed) ? parsed : parsed.colleges || [];
      const res = await adminAPI.saveDivisions(payload);
      const colleges = res?.catalog?.colleges || payload;
      setDivisionCatalog({ colleges });
      toast.success('Divisions updated');
    } catch (error) {
      toast.error('Invalid JSON or save failed');
    } finally {
      setDivisionSaving(false);
    }
  };

  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const cells = line.split(',');
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cells[idx] ? cells[idx].trim() : '';
      });
      if (obj.year) obj.year = Number(obj.year);
      return obj;
    });
  };

  const semesterToYear = (val) => {
    if (!val) return '';
    const s = String(val).toUpperCase();
    if (/\b(IV|4)\b/.test(s)) return 4;
    if (/\b(III|3)\b/.test(s)) return 3;
    if (/\b(II|2)\b/.test(s)) return 2;
    if (/\b(I|1)\b/.test(s)) return 1;
    return '';
  };

  const validateDivision = (user) => {
    const colleges = divisionCatalog?.colleges?.length ? divisionCatalog.colleges : [];
    const findCollege = (code) => colleges.find((c) => c.code === code) || fallbackCatalog.colleges.find((c) => c.code === code);
    const college = findCollege(user.collegeCode);
    if (!college) return false;

    if (user.branchCode) {
      const findBranch = (code) => {
        const primary = college.branches?.find((b) => b.code === code);
        if (primary) return primary;
        const fallbackCollege = fallbackCatalog.colleges.find((c) => c.code === college.code);
        return fallbackCollege?.branches?.find((b) => b.code === code);
      };

      const branch = findBranch(user.branchCode);
      if (!branch) return false;
      if (user.year && branch.years && !branch.years.includes(Number(user.year))) return false;
      if (user.section && branch.sections && !branch.sections.includes(String(user.section))) return false;
    }

    return true;
  };

  const handleExcelUpload = async (file) => {
    setProvisioningBusy(true);
    try {
      toast.message('Processing Excel...', { description: file.name });
      const ExcelJS = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await wb.xlsx.load(buffer);
      const sheet = wb.worksheets[0];
      if (!sheet) throw new Error('No sheet');

      const headerRow = sheet.getRow(1);
      const headerCells = [];
      headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const name = String(cell.value || '').trim();
        if (name) headerCells.push({ name, index: colNumber });
      });
      const headers = headerCells.map((h) => h.name.toLowerCase());
      toast.message('Headers detected', { description: headers.join(', ') || 'none' });
      const colIndex = (aliases) => {
        const list = Array.isArray(aliases) ? aliases.map((a) => a.toLowerCase()) : [String(aliases).toLowerCase()];
        const hit = headerCells.find((h) => list.includes(h.name.toLowerCase()));
        return hit ? hit.index : -1;
      };

      const idx = {
        roll: colIndex(['roll.no', 'roll no', 'roll number', 'rollno', 'roll']),
        name: colIndex(['student name', 'name', 'student']),
        college: colIndex(['college', 'college code', 'college name', 'clg']),
        branch: colIndex(['branch', 'branch code', 'br', 'dept', 'department']),
        email: colIndex(['college email id', 'email', 'college email', 'mail']),
        semester: colIndex(['semester', 'sem', 'year']),
        section: colIndex(['section', 'sec']),
        gender: colIndex(['gender', 'g']),
      };

      if (idx.name < 0 || idx.email < 0) {
        toast.error(`Missing required headers (found: ${headers.join(', ') || 'none'})`);
        setProvisioningBusy(false);
        return;
      }

      const users = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const get = (i) => (i > 0 ? String(row.getCell(i).value || '').trim() : '');
        const user = {
          name: get(idx.name),
          email: get(idx.email),
          role: 'student',
          rollNumber: get(idx.roll),
          collegeCode: get(idx.college),
          branchCode: get(idx.branch),
          section: get(idx.section),
          year: semesterToYear(get(idx.semester)) || undefined,
          gender: get(idx.gender),
        };
        if (!user.name || !user.email || !user.role) return;
        // Fallback: derive section from roll number if section cell empty and roll looks like 23A91A0501 => last char
        if (!user.section && user.rollNumber && user.rollNumber.length >= 1) {
          const last = user.rollNumber[user.rollNumber.length - 1];
          if (/^[A-Za-z]$/.test(last)) user.section = last.toUpperCase();
        }
        users.push(user);
      });

      const divisionResults = users.map((u) => ({ user: u, ok: validateDivision(u) }));
      const valid = divisionResults.filter((r) => r.ok).map((r) => r.user);
      const invalidCount = divisionResults.length - valid.length;

      const toSend = valid.length ? valid : users; // fallback: send all even if division mismatch, but warn
      const resp = await adminAPI.bulkCreateUsers({ users: toSend, sharedPassword: bulkPassword });

      const skipped = resp?.skippedExisting || 0;
      toast.success(
        `Imported ${resp?.inserted ?? toSend.length} users` +
          (skipped ? ` (${skipped} already existed)` : '') +
          (invalidCount ? ` (${invalidCount} with division mismatch; validated with fallback)` : '')
      );
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Excel import failed: ${msg}`);
      console.error('Excel import failed', err);
    } finally {
      setProvisioningBusy(false);
    }
  };

  const handleCreateUser = async () => {
    setProvisioningBusy(true);
    try {
      const payload = { ...userForm };
      if (payload.role !== 'student') {
        delete payload.rollNumber;
        delete payload.year;
        delete payload.section;
      }
      if (payload.role === 'admin') {
        delete payload.collegeCode;
        delete payload.branchCode;
      }
      if (!payload.password) delete payload.password;
      await adminAPI.createUser(payload);
      toast.success('User created');
      setUserForm({ name: '', email: '', role: 'student', rollNumber: '', password: '', collegeCode: '', branchCode: '', year: '', section: '' });
      await loadData();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setProvisioningBusy(false);
    }
  };

  const handleBulkCreate = async () => {
    setProvisioningBusy(true);
    try {
      const users = parseCsv(bulkCsv).filter((u) => u.email && u.name && u.role);
      if (!users.length) {
        toast.error('No valid rows');
        setProvisioningBusy(false);
        return;
      }
      await adminAPI.bulkCreateUsers({ users, sharedPassword: bulkPassword });
      toast.success('Bulk users processed');
      await loadData();
    } catch (error) {
      toast.error('Bulk upload failed');
    } finally {
      setProvisioningBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the LinkConnect platform</p>
        </div>

        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Links</CardTitle>
              <Link2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.totalLinks || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{stats?.activeLinks || 0} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Submissions</CardTitle>
              <FileCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.totalSubmissions || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Today's Logins</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.todayLogins || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{stats?.weekLogins || 0} this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Visits</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{visitStats?.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All roles</p>
            </CardContent>
          </Card>
        </div>

        {/* User Role Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{usersByRole.student}</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(usersByRole.student / users.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{usersByRole.faculty}</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500"
                  style={{ width: `${(usersByRole.faculty / users.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{usersByRole.admin}</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500"
                  style={{ width: `${(usersByRole.admin / users.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Visits by Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between"><span>Admins</span><span>{visitStats?.byRole?.admin || 0}</span></div>
              <div className="flex justify-between"><span>Faculty</span><span>{visitStats?.byRole?.faculty || 0}</span></div>
              <div className="flex justify-between"><span>Students</span><span>{visitStats?.byRole?.student || 0}</span></div>
              <div className="flex justify-between"><span>Guests</span><span>{visitStats?.byRole?.guest || 0}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          {/* Flex + wrap to avoid hidden tabs in narrower views */}
          <TabsList className="flex flex-wrap gap-2 w-full">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="links">Link Controls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="userActivity">User Activity</TabsTrigger>
            <TabsTrigger value="divisions">Divisions</TabsTrigger>
            <TabsTrigger value="provisioning">Provisioning</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportUsers}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user._id || user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {user.active ? (
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.lastLogin 
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(user._id || user.id)}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user._id || user.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleForceLogout(user._id || user.id)}
                              >
                                Force Logout
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResetPassword(user._id || user.id)}
                              >
                                Reset Password
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Login Activity (Last 7 Days)</CardTitle>
                <CardDescription>Track user engagement and login patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loginStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="logins" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        dot={{ fill: '#f97316' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>All Links</CardTitle>
                <CardDescription>Toggle active/inactive across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {links.map(link => (
                        <TableRow key={link._id}>
                          <TableCell>{link.title}</TableCell>
                          <TableCell>{link.createdByEmail || link.createdBy}</TableCell>
                          <TableCell>
                            {link.active ? (
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>{link.deadline ? new Date(link.deadline).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleToggleLinkActive(link._id)}>
                              {link.active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>Adjust API rate limits (global, in-memory)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Window (minutes)</p>
                    <Input
                      type="number"
                      min={1}
                      value={Math.round(rateLimit.windowMs / 60000)}
                      onChange={(e) => setRateLimit((prev) => ({ ...prev, windowMs: Number(e.target.value) * 60000 }))}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Max requests per window</p>
                    <Input
                      type="number"
                      min={1}
                      value={rateLimit.max}
                      onChange={(e) => setRateLimit((prev) => ({ ...prev, max: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveRateLimit}>Save Rate Limit</Button>
                <p className="text-xs text-gray-500">Changes apply immediately in-memory. Set env RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX for defaults on restart.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Admin Audit Logs</CardTitle>
                    <CardDescription>Recent admin actions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportAudit}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Action</p>
                    <Input
                      placeholder="e.g. user_toggle"
                      value={auditAction}
                      onChange={(e) => setAuditAction(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Actor ID</p>
                    <Input
                      placeholder="User ID"
                      value={auditActor}
                      onChange={(e) => setAuditActor(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target User ID</p>
                    <Input
                      placeholder="User ID"
                      value={auditTargetUser}
                      onChange={(e) => setAuditTargetUser(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target Link ID</p>
                    <Input
                      placeholder="Link ID"
                      value={auditTargetLink}
                      onChange={(e) => setAuditTargetLink(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">From</p>
                    <Input
                      type="date"
                      value={auditFrom}
                      onChange={(e) => setAuditFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">To</p>
                    <Input
                      type="date"
                      value={auditTo}
                      onChange={(e) => setAuditTo(e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleAuditFilter}>Apply Filters</Button>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target User</TableHead>
                        <TableHead>Target Link</TableHead>
                        <TableHead>Meta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</TableCell>
                          <TableCell>{log.actor ? `${log.actor.name || ''} (${log.actor.email || ''})` : '-'}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.targetUser ? `${log.targetUser.name || ''} (${log.targetUser.email || ''})` : '-'}</TableCell>
                          <TableCell>{log.targetLink ? `${log.targetLink.title || ''}` : '-'}</TableCell>
                          <TableCell className="max-w-xs truncate text-xs">{log.meta ? JSON.stringify(log.meta) : ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing {auditPage * pageSize + 1}-{Math.min((auditPage + 1) * pageSize, auditTotal)} of {auditTotal}
                  </span>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={auditPage === 0}
                      onClick={() => handleAuditPageChange(Math.max(0, auditPage - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(auditPage + 1) * pageSize >= auditTotal}
                      onClick={() => handleAuditPageChange(auditPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="userActivity">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Search users (name/email/roll) and view their activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <Input
                    placeholder="Search by name, email, or roll number"
                    value={userActivityQuery}
                    onChange={(e) => setUserActivityQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchUserActivity();
                    }}
                  />
                  <Button onClick={handleSearchUserActivity} disabled={userActivityLoading}>Search</Button>
                </div>

                {userActivityResults.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {userActivityResults.map((u) => (
                      <Card key={u._id} className="border">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{u.name || 'Unnamed'}</CardTitle>
                            <Badge variant="outline">{u.role}</Badge>
                          </div>
                          <CardDescription>{u.email}</CardDescription>
                          {u.rollNumber && <p className="text-xs text-gray-600">Roll: {u.rollNumber}</p>}
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-gray-700">
                          <div className="flex justify-between"><span>Total logins</span><span>{u.totalLogins || 0}</span></div>
                          <div className="flex justify-between"><span>Last login</span><span>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</span></div>
                          <div className="flex justify-between"><span>Links created</span><span>{u.linksCreated || 0}</span></div>
                          <div className="flex justify-between"><span>Submissions</span><span>{u.submissions || 0}</span></div>
                          <div className="flex justify-between"><span>Joined</span><span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</span></div>
                          <Button size="sm" variant="outline" onClick={() => handleFetchUserLogs(u._id)} disabled={userActivityLoading}>
                            View recent logins
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No users yet. Search to see activity.</p>
                )}

                {userActivityLogs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Recent Logins</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>When</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>User Agent</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userActivityLogs.map((log) => (
                            <TableRow key={log._id}>
                              <TableCell>{log.loginTime ? new Date(log.loginTime).toLocaleString() : '-'}</TableCell>
                              <TableCell>{log.ipAddress || '-'}</TableCell>
                              <TableCell className="max-w-xs truncate text-xs">{log.userAgent || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {userActivityLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exports">
            <Card>
              <CardHeader>
                <CardTitle>Data Exports</CardTitle>
                <CardDescription>Download system data in Excel format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={handleExportUsers}
                  >
                    <Users className="w-8 h-8" />
                    <span>Export Users</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={handleExportLinks}
                  >
                    <Link2 className="w-8 h-8" />
                    <span>Export Links</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={handleExportSubmissions}
                  >
                    <FileCheck className="w-8 h-8" />
                    <span>Export Submissions</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={handleExportLogins}
                  >
                    <Download className="w-8 h-8" />
                    <span>Export Logins</span>
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> All exports are in CSV format and include timestamps. Keep this data secure and follow your institution's data protection policies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        <TabsContent value="divisions">
          <Card>
            <CardHeader>
              <CardTitle>Division Catalog</CardTitle>
              <CardDescription>Manage colleges, branches, years, and sections (JSON)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Edit the JSON array of colleges and branches. Each college should include code, name, and branches with code/name/years/sections.</p>
              <Textarea
                value={divisionText}
                onChange={(e) => setDivisionText(e.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
              <div className="flex gap-3">
                <Button onClick={handleSaveDivisions} disabled={divisionSaving}>
                  {divisionSaving ? 'Saving...' : 'Save Catalog'}
                </Button>
                <Button variant="outline" onClick={() => setDivisionText(JSON.stringify(divisionCatalog.colleges || [], null, 2))}>
                  Reset to Current
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provisioning">
          <Card>
            <CardHeader>
              <CardTitle>User Provisioning</CardTitle>
              <CardDescription>Create single users or bulk import via CSV text. Shared password applies when per-user password omitted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold">Single User</h4>
                  <Input placeholder="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                  <Input placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                  <select className="w-full border rounded px-3 py-2 text-sm" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                  {userForm.role === 'student' && (
                    <Input placeholder="Roll Number" value={userForm.rollNumber} onChange={(e) => setUserForm({ ...userForm, rollNumber: e.target.value })} />
                  )}
                  {userForm.role !== 'admin' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="College" value={userForm.collegeCode} onChange={(e) => setUserForm({ ...userForm, collegeCode: e.target.value })} />
                      <Input placeholder="Branch" value={userForm.branchCode} onChange={(e) => setUserForm({ ...userForm, branchCode: e.target.value })} />
                      {userForm.role === 'student' && (
                        <>
                          <Input placeholder="Year" value={userForm.year} onChange={(e) => setUserForm({ ...userForm, year: e.target.value })} />
                          <Input placeholder="Section" value={userForm.section} onChange={(e) => setUserForm({ ...userForm, section: e.target.value })} />
                        </>
                      )}
                    </div>
                  )}
                  <Input placeholder="Password (optional)" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                  <Button onClick={handleCreateUser} disabled={provisioningBusy}>Create User</Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Bulk Upload</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={handleBulkCreate} disabled={provisioningBusy}>
                      Create from CSV Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('excel-upload-input')?.click()} disabled={provisioningBusy}>
                      Create from Excel (.xlsx)
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Headers for CSV: name,email,role,rollNumber,collegeCode,branchCode,year,section</p>
                    <Textarea rows={10} value={bulkCsv} onChange={(e) => setBulkCsv(e.target.value)} className="font-mono text-xs" />
                  </div>

                  <div className="space-y-2">
                    <Label>Shared Password</Label>
                    <Input value={bulkPassword} onChange={(e) => setBulkPassword(e.target.value)} />
                    <p className="text-xs text-gray-600">Applied when a row has no password column/value.</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <Label>Excel Upload (.xlsx)</Label>
                    <input
                      id="excel-upload-input"
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleExcelUpload(file);
                      }}
                    />
                    <p className="text-xs text-gray-600">Expected columns: Roll.No, Student Name, COLLEGE, Branch, College Email Id, Semester, Section. Role is assumed student.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};



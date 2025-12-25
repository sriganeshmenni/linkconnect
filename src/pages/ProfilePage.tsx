
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner@2.0.3';
import { profileAPI } from '../utils/api';
import {
  Mail,
  User,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Settings,
  Lock,
  CheckCircle,
  AlertTriangle,
  History,
  ArrowLeft,
} from 'lucide-react';

type UserType = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: 'student' | 'faculty' | 'admin' | string;
  createdAt?: string;
  rollNumber?: string;
  branchCode?: string;
  collegeCode?: string;
  year?: number | string;
  section?: string;
};

type CompletionResult = {
  percent: number;
  missing: string[];
};

const roleFieldMap: Record<string, string[]> = {
  student: ['name', 'email', 'rollNumber', 'collegeCode', 'branchCode', 'year', 'section'],
  faculty: ['name', 'email', 'collegeCode', 'branchCode'],
  admin: ['name', 'email'],
};

const computeCompletion = (user: UserType): CompletionResult => {
  const role = (user.role || 'student').toLowerCase();
  const fields = roleFieldMap[role] || roleFieldMap.student;
  const filled = fields.filter((key) => {
    const val = (user as any)[key];
    return val !== undefined && val !== null && String(val).trim() !== '';
  }).length;
  const percent = Math.round((filled / fields.length) * 100);
  const missing = fields.filter((key) => {
    const val = (user as any)[key];
    return val === undefined || val === null || String(val).trim() === '';
  });
  return { percent, missing };
};

const FieldRow = ({ label, value }: { label: string; value?: string | number }) => {
  const isMissing = value === undefined || value === null || String(value).trim() === '';
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={isMissing ? 'text-sm text-orange-600' : 'text-sm font-medium text-gray-900'}>
        {isMissing ? `Add ${label}` : value}
      </span>
    </div>
  );
};

const SectionShell: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const StudentProfile = ({ profile }: { profile: UserType }) => (
  <SectionShell title="Academic Details" description="Program information tied to your profile">
    <FieldRow label="Roll Number" value={profile.rollNumber} />
    <FieldRow label="College" value={profile.collegeCode} />
    <FieldRow label="Branch" value={profile.branchCode} />
    <FieldRow label="Year" value={profile.year} />
    <FieldRow label="Section" value={profile.section} />
  </SectionShell>
);

const FacultyProfile = ({ profile }: { profile: UserType }) => (
  <SectionShell title="Faculty Details" description="Department affiliation and scope">
    <FieldRow label="College" value={profile.collegeCode} />
    <FieldRow label="Branch" value={profile.branchCode} />
    <FieldRow label="Advisory Sections" value={profile.section} />
  </SectionShell>
);

const AdminProfile = ({ profile }: { profile: UserType }) => (
  <SectionShell title="Admin Profile" description="Core identity and organization context">
    <FieldRow label="Organization" value={profile.collegeCode || 'LinkConnect'} />
    <FieldRow label="Primary Domain" value={profile.email?.split('@')[1]} />
  </SectionShell>
);

const ProfilePage: React.FC = () => {
  const { user } = useAuth() as { user: UserType };
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserType>({});
  const [profileForm, setProfileForm] = useState<UserType>({});
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [recentLogins, setRecentLogins] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false); // placeholder until backend provides
  const [activeSessions, setActiveSessions] = useState<number | null>(null); // placeholder
  const completion = useMemo(() => computeCompletion(profile), [profile]);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, logins] = await Promise.all([
          profileAPI.getProfile().catch(() => null),
          profileAPI.getRecentLogins().catch(() => []),
        ]);
        const base = me || user || {};
        const normalized: UserType = { ...base, email: base.email?.toLowerCase() };
        setProfile(normalized);
        setProfileForm(normalized);
        setRecentLogins(logins || []);
        // placeholders: wire these once backend exposes MFA/sessions
        setMfaEnabled(Boolean((base as any)?.mfaEnabled));
        setActiveSessions((base as any)?.activeSessions ?? null);
      } catch (err) {
        // fallback to auth user if API fails
        if (user) {
          const normalized: UserType = { ...user, email: user.email?.toLowerCase() };
          setProfile(normalized);
          setProfileForm(normalized);
        }
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!profile || !profile.role) return;
    if (completion.percent >= 70) return;
    if (toastShownRef.current) return;
    toastShownRef.current = true;
    toast.warning(`Complete your profile (${completion.percent}% done)`, {
      description: 'Tap to finish the missing fields',
      action: {
        label: 'Go to profile',
        onClick: () => {
          const el = document.getElementById('profile-editor');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
      },
    });
  }, [completion, profile]);

  const role = (profile.role || 'student').toLowerCase();
  const RoleSpecific = role === 'faculty' ? FacultyProfile : role === 'admin' ? AdminProfile : StudentProfile;

  // GitHub-like heatmap over the last 12 weeks
  const heatmap = useMemo(() => {
    const weeks = 12;
    const today = new Date();
    const counts = new Map<string, number>();
    recentLogins.forEach((log) => {
      const key = log.loginTime ? new Date(log.loginTime).toISOString().slice(0, 10) : '';
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const end = new Date(today);
    const start = new Date(end);
    start.setDate(end.getDate() - weeks * 7 + 1);
    const startAligned = new Date(start);
    startAligned.setDate(start.getDate() - start.getDay()); // back to Sunday

    const days: { key: string; date: Date; count: number }[] = [];
    for (let d = new Date(startAligned); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      days.push({ key, date: new Date(d), count: counts.get(key) || 0 });
    }

    const weeksArr: { days: typeof days; monthLabel?: string }[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const slice = days.slice(i, i + 7);
      const firstDay = slice[0]?.date;
      const label = firstDay && firstDay.getDate() <= 7 ? firstDay.toLocaleString('default', { month: 'short' }) : undefined;
      weeksArr.push({ days: slice, monthLabel: label });
    }

    return weeksArr;
  }, [recentLogins]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await profileAPI.updateProfile(profileForm);
      if (updated) {
        setProfile(updated);
        setProfileForm(updated);
      }
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handlePwdSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdForm.next || pwdForm.next !== pwdForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await profileAPI.changePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.next });
      setPwdForm({ current: '', next: '', confirm: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error('Failed to update password');
    }
  };

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="flex-1">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-7 w-7 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{profile.name || 'Add your name'}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="capitalize">{role}</Badge>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Mail className="h-4 w-4" /> {profile.email || 'Add email'}
                    </span>
                  </CardDescription>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                  <span>Profile completeness</span>
                  <span className="font-semibold text-slate-900">{completion.percent}%</span>
                </div>
                <Progress value={completion.percent} />
                {completion.missing.length > 0 && (
                  <p className="mt-2 text-xs text-orange-700 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Missing: {completion.missing.join(', ')}
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card className="w-full lg:w-72">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start mb-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to dashboard
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => document.getElementById('profile-editor')?.scrollIntoView({ behavior: 'smooth' })}>
                Update profile
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById('password-editor')?.scrollIntoView({ behavior: 'smooth' })}>
                Change password
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Notifications coming soon')}>Notification settings</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <SectionShell title="Overview" description="Current account snapshot">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <User className="h-4 w-4" /> <span>{profile.name || 'Add your name'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="h-4 w-4" /> <span>{profile.email || 'Add email'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <GraduationCap className="h-4 w-4" /> <span className="capitalize">{role}</span>
              </div>
              {profile.rollNumber && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Briefcase className="h-4 w-4" /> <span>Roll: {profile.rollNumber}</span>
                </div>
              )}
            </div>
          </SectionShell>

          <RoleSpecific profile={profile} />

          <SectionShell title="Security" description="Password & session hygiene">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> Last password change: Not tracked</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> MFA: {mfaEnabled ? 'Enabled' : 'Not configured'}</div>
              <div className="flex items-center gap-2"><Settings className="h-4 w-4" /> Active sessions: {activeSessions ?? 'Not tracked'}</div>
            </div>
          </SectionShell>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Login Activity</CardTitle>
            <CardDescription>Heatmap of recent logins (last 12 weeks)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-4 text-[11px] text-slate-600">
              <div className="mt-1 space-y-1.5 text-[10px] text-slate-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2">
                  {heatmap.map((week, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      {week.monthLabel && <div className="text-[10px] text-slate-500 mb-1">{week.monthLabel}</div>}
                      <div className="grid grid-rows-7 gap-1">
                        {week.days.map((day) => {
                          const c = day.count;
                          const color = c === 0 ? 'bg-slate-100 border-slate-200' : c <= 1 ? 'bg-emerald-50 border-emerald-100' : c <= 3 ? 'bg-emerald-200 border-emerald-300' : c <= 6 ? 'bg-emerald-400 border-emerald-500' : 'bg-emerald-600 border-emerald-600';
                          return (
                            <div
                              key={day.key}
                              title={`${day.count} login${day.count === 1 ? '' : 's'} on ${day.date.toLocaleDateString()}`}
                              className={`h-4 w-4 rounded-sm border ${color}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Less</span>
              <div className="h-4 w-4 rounded-sm border bg-slate-100 border-slate-200" />
              <div className="h-4 w-4 rounded-sm border bg-emerald-50 border-emerald-100" />
              <div className="h-4 w-4 rounded-sm border bg-emerald-200 border-emerald-300" />
              <div className="h-4 w-4 rounded-sm border bg-emerald-400 border-emerald-500" />
              <div className="h-4 w-4 rounded-sm border bg-emerald-600 border-emerald-600" />
              <span>More</span>
            </div>
            <div className="text-xs text-slate-500">Hover squares to see exact counts and dates.</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Recent Logins</CardTitle>
            <CardDescription>Last 10 successful logins from this account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentLogins.length === 0 && <p className="text-sm text-slate-600">No logins recorded yet.</p>}
            {recentLogins.map((log) => (
              <div key={log._id || log.id} className="flex items-center justify-between text-sm border-b last:border-b-0 py-2">
                <span className="text-slate-700">{log.loginTime ? new Date(log.loginTime).toLocaleString() : '-'}</span>
                <span className="text-slate-500">{log.ipAddress || 'unknown'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card id="profile-editor">
          <CardHeader>
            <CardTitle className="text-lg">Update Profile</CardTitle>
            <CardDescription>Keep your details current. Fields vary by role.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleProfileSave}>
              <div className="space-y-1">
                <label className="text-sm text-slate-600">Name</label>
                <Input value={profileForm.name || ''} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-600">Email</label>
                <Input type="email" value={profileForm.email || ''} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value.toLowerCase() })} required />
              </div>

              {role === 'student' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-600">Roll Number</label>
                    <Input value={profileForm.rollNumber || ''} onChange={(e) => setProfileForm({ ...profileForm, rollNumber: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-600">Section</label>
                    <Input value={profileForm.section || ''} onChange={(e) => setProfileForm({ ...profileForm, section: e.target.value })} />
                  </div>
                </>
              )}

              {role !== 'admin' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-600">College</label>
                    <Input value={profileForm.collegeCode || ''} onChange={(e) => setProfileForm({ ...profileForm, collegeCode: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-600">Branch</label>
                    <Input value={profileForm.branchCode || ''} onChange={(e) => setProfileForm({ ...profileForm, branchCode: e.target.value })} />
                  </div>
                </>
              )}

              {role === 'student' && (
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Year</label>
                  <Input value={profileForm.year || ''} onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })} />
                </div>
              )}

              <div className="md:col-span-2 flex gap-3 pt-2">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="outline" onClick={() => setProfileForm(profile)}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card id="password-editor">
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>Use a strong password you haven’t used elsewhere.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid md:grid-cols-3 gap-4" onSubmit={handlePwdSave}>
              <div className="space-y-1">
                <label className="text-sm text-slate-600">Current password</label>
                <Input type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-600">New password</label>
                <Input type="password" value={pwdForm.next} onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-600">Confirm new password</label>
                <Input type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
              </div>
              <div className="md:col-span-3 flex gap-3 pt-2">
                <Button type="submit">Update password</Button>
                <Button type="button" variant="outline" onClick={() => setPwdForm({ current: '', next: '', confirm: '' })}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" /> Profile Checklist</CardTitle>
            <CardDescription>Finish these to reach 100%.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completion.missing.length === 0 ? (
              <p className="text-sm text-emerald-700">All set! Your profile is complete.</p>
            ) : (
              completion.missing.map((item) => (
                <div key={item} className="flex items-center justify-between bg-slate-50 border rounded px-3 py-2 text-sm">
                  <span className="capitalize">Add {item}</span>
                  <Button size="sm" variant="ghost" onClick={() => document.getElementById('profile-editor')?.scrollIntoView({ behavior: 'smooth' })}>
                    Update
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Separator />
      </div>
    </div>
  );
};

export default ProfilePage;


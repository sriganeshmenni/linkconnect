// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { LinkCard } from '../components/LinkCard';
// import { StudentRegistrationDialog } from '../components/StudentRegistrationDialog';
// import { linksAPI, submissionsAPI } from '../utils/api';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
// import { Badge } from '../components/ui/badge';
// import { Loader2, CheckCircle, Clock, Link2 } from 'lucide-react';
// import { toast } from 'sonner';
// export const StudentDashboard = () => {
//   type UserType = { id?: string | number; name?: string; email?: string; role?: string; };
//   type LinkType = { id: string | number; title: string; active: boolean; deadline: string; };
//   type SubmissionType = { id: string | number; linkId: string | number; status: string; submittedAt: string; };
//   const { user } = useAuth() as { user: UserType };
//   const [links, setLinks] = useState<LinkType[]>([]);
//   const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [linksData, submissionsData] = await Promise.all([
//         linksAPI.getStudentLinks(),
//         submissionsAPI.getByStudent(user.id)
//       ]);
//       setLinks(Array.isArray(linksData) ? linksData : []);
//       setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
//     } catch (error) {
//       toast.error('Failed to load data');
//       setLinks([]);
//       setSubmissions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = (link: LinkType) => {
//     setSelectedLink(link);
//     setDialogOpen(true);
//   };

// const handleSubmitRegistration = async (submissionData) => {
//   try {
//     if (!selectedLink?._id) {
//       toast.error('Invalid link selected');
//       return;
//     }

//     await submissionsAPI.create({
//       linkId: selectedLink._id,        // ✅ ObjectId
//       studentId: user._id,             // ✅ ObjectId
//       studentName: user.name,
//       studentEmail: user.email,
//       rollNumber: submissionData.rollNumber,
//       screenshot: submissionData.screenshot,
//     });

//     toast.success('Registration submitted successfully');
//     setDialogOpen(false);
//     await loadData();

//   } catch (error) {
//     console.error(error);

//     if (error?.response?.data?.message?.includes('duplicate')) {
//       toast.error('You already registered for this link');
//     } else {
//       toast.error('Failed to submit registration');
//     }
//   }
// };



//   const activeLinks = Array.isArray(links) ? links.filter(link => 
//     link && link.active && new Date(link.deadline) >= new Date()
//   ) : [];

//   const completedSubmissions = Array.isArray(submissions) ? submissions.filter(s => s && s.status === 'completed') : [];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Welcome Section */}
//         <div className="mb-8">
//           <h1 className="text-gray-900 mb-2">Welcome, {user?.name}!</h1>
//           <p className="text-gray-600">Track and register for placement opportunities</p>
//         </div>
        

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Available Links</CardTitle>
//               <Link2 className="h-4 w-4 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">{activeLinks.length}</div>
//               <p className="text-xs text-gray-500 mt-1">Active opportunities</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Registrations</CardTitle>
//               <CheckCircle className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">{completedSubmissions.length}</div>
//               <p className="text-xs text-gray-500 mt-1">Completed</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Pending</CardTitle>
//               <Clock className="h-4 w-4 text-yellow-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">{activeLinks.length - completedSubmissions.length}</div>
//               <p className="text-xs text-gray-500 mt-1">To register</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tabs */}
//         <Tabs defaultValue="available" className="space-y-6">
//           <TabsList className="grid w-full md:w-[400px] grid-cols-2">
//             <TabsTrigger value="available">Available Links</TabsTrigger>
//             <TabsTrigger value="history">My History</TabsTrigger>
//           </TabsList>

//           <TabsContent value="available" className="space-y-6">
//             {activeLinks.length === 0 ? (
//               <Card>
//                 <CardContent className="py-12 text-center">
//                   <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600">No active links available</p>
//                   <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities</p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {activeLinks.map(link => (
//                   <LinkCard
//                     key={link._id || link.id}
//                     link={link}
//                     onRegister={handleRegister}
//                   />
//                 ))}
//               </div>
//             )}
//           </TabsContent>

          

//           <TabsContent value="history">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Registration History</CardTitle>
//                 <CardDescription>View all your past registrations</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {submissions.length === 0 ? (
//                   <div className="py-12 text-center">
//                     <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-600">No registrations yet</p>
//                     <p className="text-sm text-gray-400 mt-1">Start registering for opportunities</p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Link Title</TableHead>
//                           <TableHead>Status</TableHead>
//                           <TableHead>Submitted</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {submissions.map(submission => {
//                              const link = links.find(l => (l._id || l.id) === submission.linkId);

//                           return (
//                             <TableRow key={submission.id}>
//                               <TableCell>{link?.title || 'Unknown'}</TableCell>
//                               <TableCell>
//                                 <Badge className="bg-green-100 text-green-700">
//                                   {submission.status}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell>
//                                 {new Date(submission.submittedAt).toLocaleDateString()}
//                               </TableCell>
//                             </TableRow>
//                           );
//                         })}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       <StudentRegistrationDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         link={selectedLink}
//         onSubmit={handleSubmitRegistration}
//       />

//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LinkCard } from '../components/LinkCard';
import { StudentRegistrationDialog } from '../components/StudentRegistrationDialog';
import { linksAPI, submissionsAPI } from '../utils/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Loader2, CheckCircle, Clock, Link2 } from 'lucide-react';
import { toast } from 'sonner';

/* ================= TYPES ================= */

type UserType = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
};

type LinkType = {
  _id?: string;
  id?: string;
  title?: string;
  active?: boolean;
  deadline?: string;
};

type SubmissionType = {
  _id?: string;
  id?: string;
  linkId?: any; // can be string OR populated object
  status?: string;
  submittedAt?: string;
};

/* ================= HELPERS ================= */

// Always return string ID
const getId = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val._id) return val._id;
  return null;
};

/* ================= COMPONENT ================= */

export const StudentDashboard = () => {
  const { user } = useAuth() as { user: UserType };

  const [links, setLinks] = useState<LinkType[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /* ========== LOAD DATA ========== */
  const loadData = async () => {
    setLoading(true);
    try {
      const [linksData, submissionsData] = await Promise.all([
        linksAPI.getStudentLinks(),
        submissionsAPI.getByStudent(user?._id || user?.id)
      ]);

      setLinks(Array.isArray(linksData) ? linksData.filter(Boolean) : []);

      // Normalize submissions to always expose linkId and submittedAt
      const normalizedSubs = Array.isArray(submissionsData)
        ? submissionsData
            .filter(Boolean)
            .map((s: any) => ({
              ...s,
              linkId: getId(s.link || s.linkId),
              submittedAt: s.submittedAt || s.createdAt || s.created_at,
            }))
        : [];

      setSubmissions(normalizedSubs);
    } catch (err) {
      toast.error('Failed to load data');
      setLinks([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  /* ========== REGISTER ========== */
  const handleRegister = (link: LinkType) => {
    setSelectedLink(link);
    setDialogOpen(true);
  };

  const handleSubmitRegistration = async (formData: any) => {
    try {
      console.log('DEBUG selectedLink:', selectedLink);
      console.log('DEBUG user:', user);
      const linkId = selectedLink?._id || selectedLink?.id;
      const studentId = user?._id || user?.id;
      console.log('DEBUG registration:', { linkId, studentId, selectedLink, user });

      if (!linkId || !studentId) {
        toast.error('Invalid registration data. Please refresh and try again.');
        return;
      }

      await submissionsAPI.create({
        linkId,
        studentId,
        studentName: user?.name,
        studentEmail: user?.email,
        rollNumber: formData.rollNumber,
        screenshot: formData.screenshotPreview || formData.screenshot
      });

      toast.success('Registration successful');
      setDialogOpen(false);
      setSelectedLink(null);
      await loadData();
    } catch (e) {
      toast.error('Failed to submit registration');
      console.error('Registration error:', e);
    }
  };

  /* ========== DERIVED DATA ========== */


  // Only count as registered if status is 'completed' or 'verified'
  const registeredLinkIds = new Set(
    submissions
      .filter(s => s.status === 'completed' || s.status === 'verified')
      .map(s => getId(s.linkId))
      .filter(Boolean)
  );


  // For each link, determine registration status for the current student
  const linksWithStatus = links.map(link => {
    const linkId = getId(link);
    const isExpired = link.deadline && new Date(link.deadline) < new Date();
    let registrationStatus: 'not-registered' | 'registered' | 'expired' = 'not-registered';
    if (registeredLinkIds.has(linkId)) {
      registrationStatus = 'registered';
    } else if (isExpired) {
      registrationStatus = 'expired';
    }
    return { ...link, registrationStatus };
  });


  // Only show links that are not expired and not registered in Available
  const availableLinks = linksWithStatus.filter(l => {
    const isExpired = l.deadline && new Date(l.deadline) < new Date();
    return l.registrationStatus === 'not-registered' && !isExpired;
  });


  // Only show links that are registered in Registered/History, fallback to submission if link missing
  const registeredSubmissions = submissions.filter(
    s => s.status === 'completed' || s.status === 'verified'
  );

  const registeredLinks = linksWithStatus.filter(
    l => l.registrationStatus === 'registered'
  );

  const completedSubmissions = submissions.filter(
    s => s && s.status === 'completed'
  );

  /* ========== LOADER ========== */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  /* ========== UI ========== */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">
            Track and register for placement opportunities
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Available Links</CardTitle>
              <Link2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{availableLinks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Registrations</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{registeredLinks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{availableLinks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* TABS */}
        <Tabs defaultValue="available">
          <TabsList className="grid w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="available">Available Links</TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>

          {/* AVAILABLE */}
          <TabsContent value="available">
            {availableLinks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active links available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableLinks.map(link => (
                  <LinkCard
                    key={getId(link)!}
                    link={link}
                    onSubmit={handleRegister}
                    registrationStatus={link.registrationStatus}
                    isStudent={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Registration History</CardTitle>
                <CardDescription>Your submitted registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {registeredSubmissions.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No registrations yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Link</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registeredSubmissions.map(sub => {
                        // Find the link for this submission
                        const linkId = getId(sub.linkId);
                        const link = links.find(l => getId(l) === linkId);
                        return (
                          <TableRow key={sub._id || sub.id}>
                            <TableCell>{link?.title || 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700">
                                Registered
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {sub.submittedAt
                                ? new Date(sub.submittedAt).toLocaleDateString()
                                : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <StudentRegistrationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={selectedLink}
        onSubmit={handleSubmitRegistration}
      />
    </div>
  );
};
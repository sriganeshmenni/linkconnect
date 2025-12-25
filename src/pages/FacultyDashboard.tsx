// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { LinkCard } from '../components/LinkCard';
// import { CreateLinkDialog } from '../components/CreateLinkDialog';
// import { linksAPI, submissionsAPI, analyticsAPI } from '../utils/api';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
// import { Badge } from '../components/ui/badge';
// import { Input } from '../components/ui/input';
// import { Plus, Loader2, Link2, Users, TrendingUp, Search, Download, Eye } from 'lucide-react';
// import { toast } from 'sonner@2.0.3';

// export const FacultyDashboard = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [links, setLinks] = useState([]);
//   const [submissions, setSubmissions] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editLink, setEditLink] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedLinkId, setSelectedLinkId] = useState(null);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [linksData, statsData] = await Promise.all([
//         linksAPI.getAll(),
//         analyticsAPI.getStats()
//       ]);
//       setLinks(linksData);
//       setStats(statsData);
//     } catch (error) {
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadSubmissions = async (linkId) => {
//     try {
//       const data = await submissionsAPI.getByLink(linkId);
//       setSubmissions(data);
//       setSelectedLinkId(linkId);
//     } catch (error) {
//       toast.error('Failed to load submissions');
//     }
//   };

//   const handleCreateLink = async (linkData) => {
//     try {
//       await linksAPI.create(linkData);
//       await loadData();
//     } catch (error) {
//       throw error;
//     }
//   };

//   const handleUpdateLink = async (linkData, linkId) => {
//     try {
//       await linksAPI.update(linkId, linkData);
//       await loadData();
//     } catch (error) {
//       throw error;
//     }
//   };

//   const handleEditLink = (link) => {
//     setEditLink(link);
//     setDialogOpen(true);
//   };

//   const handleDeleteLink = async (linkId) => {
//     if (!confirm('Are you sure you want to delete this link?')) return;
    
//     try {
//       await linksAPI.delete(linkId);
//       toast.success('Link deleted successfully');
//       await loadData();
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Failed to delete link';
//       toast.error(message);
//     }
//   };

//   const handleExportSubmissions = () => {
//     const csv = [
//       ['Student Name', 'Email', 'Roll Number', 'Submitted At', 'Status'],
//       ...submissions.map(s => [
//         s.studentName,
//         s.studentEmail,
//         s.rollNumber,
//         new Date(s.submittedAt).toLocaleString(),
//         s.status
//       ])
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'submissions.csv';
//     a.click();
//     toast.success('Submissions exported!');
//   };

//   const filteredSubmissions = submissions.filter(s =>
//     s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
//   );

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
//         <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-gray-900 mb-2">Faculty Dashboard</h1>
//             <p className="text-gray-600">Manage placement links and track registrations</p>
//           </div>
//           <Button
//             onClick={() => {
//               setEditLink(null);
//               setDialogOpen(true);
//             }}
//             className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Create Link
//           </Button>
//         </div>

      
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Total Links</CardTitle>
//               <Link2 className="h-4 w-4 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">{stats?.totalLinks || 0}</div>
//               <p className="text-xs text-gray-500 mt-1">{stats?.activeLinks || 0} active</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Total Registrations</CardTitle>
//               <Users className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">{stats?.totalSubmissions || 0}</div>
//               <p className="text-xs text-gray-500 mt-1">Across all links</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Avg. Registrations</CardTitle>
//               <TrendingUp className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">
//                 {stats?.totalLinks ? Math.round(stats.totalSubmissions / stats.totalLinks) : 0}
//               </div>
//               <p className="text-xs text-gray-500 mt-1">Per link</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tabs */}
//         <Tabs defaultValue="links" className="space-y-6">
//           <TabsList className="grid w-full md:w-[400px] grid-cols-2">
//             <TabsTrigger value="links">My Links</TabsTrigger>
//             <TabsTrigger value="submissions">Submissions</TabsTrigger>
//           </TabsList>

//           <TabsContent value="links" className="space-y-6">
//             {links.length === 0 ? (
//               <Card>
//                 <CardContent className="py-12 text-center">
//                   <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600">No links created yet</p>
//                   <Button
//                     onClick={() => setDialogOpen(true)}
//                     className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
//                   >
//                     <Plus className="w-4 h-4 mr-2" />
//                     Create Your First Link
//                   </Button>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {links.map(link => (
//                   <LinkCard
//                     key={link._id || link.id}
//                     link={link}
//                     canManage={true}
//                     onEdit={handleEditLink}
//                     onDelete={handleDeleteLink}
//                   />
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           <TabsContent value="submissions">
//             <Card>
//               <CardHeader>
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                   <div>
//                     <CardTitle>Student Submissions</CardTitle>
//                     <CardDescription>View and manage student registrations</CardDescription>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={handleExportSubmissions}
//                       disabled={submissions.length === 0}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Export
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* Link Selector */}
//                 <div className="flex flex-wrap gap-2">
//                   {links.map(link => (
//                     <Button
//                       key={link._id || link.id}
//                       variant={selectedLinkId === (link._id || link.id) ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => loadSubmissions(link._id || link.id)}
//                       className={selectedLinkId === (link._id || link.id) ? "bg-orange-500 hover:bg-orange-600" : ""}
//                     >
//                       <Eye className="w-4 h-4 mr-2" />
//                       {link.title}
//                     </Button>
//                   ))}
//                 </div>

//                 {selectedLinkId && (
//                   <>
//                     {/* Search */}
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                       <Input
//                         placeholder="Search students..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="pl-10"
//                       />
//                     </div>

//                     {/* Table */}
//                     {filteredSubmissions.length === 0 ? (
//                       <div className="py-12 text-center">
//                         <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-600">No submissions yet</p>
//                       </div>
//                     ) : (
//                       <div className="overflow-x-auto">
//                         <Table>
//                           <TableHeader>
//                             <TableRow>
//                               <TableHead>Student Name</TableHead>
//                               <TableHead>Email</TableHead>
//                               <TableHead>Roll Number</TableHead>
//                               <TableHead>Status</TableHead>
//                               <TableHead>Submitted</TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {filteredSubmissions.map(submission => (
//                               <TableRow key={submission.id}>
//                                 <TableCell>{submission.studentName}</TableCell>
//                                 <TableCell>{submission.studentEmail}</TableCell>
//                                 <TableCell>{submission.rollNumber}</TableCell>
//                                 <TableCell>
//                                   <Badge className="bg-green-100 text-green-700">
//                                     {submission.status}
//                                   </Badge>
//                                 </TableCell>
//                                 <TableCell>
//                                   {new Date(submission.submittedAt).toLocaleDateString()}
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {!selectedLinkId && (
//                   <div className="py-12 text-center">
//                     <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-600">Select a link to view submissions</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       <CreateLinkDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         onSubmit={editLink ? handleUpdateLink : handleCreateLink}
//         editLink={editLink}
//       />
//     </div>
//   );
// };

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { LinkCard } from '../components/LinkCard';
// import { CreateLinkDialog } from '../components/CreateLinkDialog';
// import { linksAPI, submissionsAPI, analyticsAPI } from '../utils/api';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
// import { Badge } from '../components/ui/badge';
// import { Input } from '../components/ui/input';
// import { Plus, Loader2, Link2, Users, TrendingUp, Search, Download, Eye } from 'lucide-react';
// import { toast } from 'sonner@2.0.3';

// export const FacultyDashboard = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [links, setLinks] = useState([]);
//   const [submissions, setSubmissions] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editLink, setEditLink] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedLinkId, setSelectedLinkId] = useState(null);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [linksRes, statsRes] = await Promise.all([
//         linksAPI.getAll(),
//         analyticsAPI.getStats()
//       ]);

//       setLinks(linksRes?.links || []);   // FIXED ✔
//       setStats(statsRes);
//     } catch (error) {
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadSubmissions = async (linkId) => {
//     try {
//       const data = await submissionsAPI.getByLink(linkId);
//       setSubmissions(data?.submissions || []);  // FIXED ✔
//       setSelectedLinkId(linkId);
//     } catch (error) {
//       toast.error('Failed to load submissions');
//     }
//   };

//   const handleCreateLink = async (linkData) => {
//     try {
//       await linksAPI.create(linkData);
//       await loadData();
//     } catch (error) {
//       throw error;
//     }
//   };

//   const handleUpdateLink = async (linkData, linkId) => {
//     try {
//       await linksAPI.update(linkId, linkData);
//       await loadData();
//     } catch (error) {
//       throw error;
//     }
//   };

//   const handleEditLink = (link) => {
//     setEditLink(link);
//     setDialogOpen(true);
//   };

//   const handleDeleteLink = async (linkId) => {
//     if (!confirm('Are you sure you want to delete this link?')) return;

//     try {
//       await linksAPI.delete(linkId);
//       toast.success('Link deleted successfully');
//       await loadData();
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Failed to delete link';
//       toast.error(message);
//     }
//   };

//   const handleExportSubmissions = () => {
//     const csv = [
//       ['Student Name', 'Email', 'Roll Number', 'Submitted At', 'Status'],
//       ...submissions.map(s => [
//         s.student?.name,
//         s.student?.email,
//         s.student?.rollNumber,
//         new Date(s.createdAt).toLocaleString(),
//         s.status
//       ])
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'submissions.csv';
//     a.click();
//     toast.success('Submissions exported!');
//   };

//   const filteredSubmissions = submissions.filter(s =>
//     s.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.student?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

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
//         <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-gray-900 mb-2">Faculty Dashboard</h1>
//             <p className="text-gray-600">Manage placement links and track registrations</p>
//           </div>
//           <Button
//             onClick={() => {
//               setEditLink(null);
//               setDialogOpen(true);
//             }}
//             className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Create Link
//           </Button>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Total Links</CardTitle>
//               <Link2 className="h-4 w-4 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">{stats?.totalLinks || 0}</div>
//               <p className="text-xs text-gray-500 mt-1">
//                 {stats?.activeLinks || 0} active
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Total Registrations</CardTitle>
//               <Users className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">{stats?.totalSubmissions || 0}</div>
//               <p className="text-xs text-gray-500 mt-1">Across all links</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">Avg. Registrations</CardTitle>
//               <TrendingUp className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl">
//                 {stats?.totalLinks ? Math.round(stats.totalSubmissions / stats.totalLinks) : 0}
//               </div>
//               <p className="text-xs text-gray-500 mt-1">Per link</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tabs */}
//         <Tabs defaultValue="links" className="space-y-6">
//           <TabsList className="grid w-full md:w-[400px] grid-cols-2">
//             <TabsTrigger value="links">My Links</TabsTrigger>
//             <TabsTrigger value="submissions">Submissions</TabsTrigger>
//           </TabsList>

//           {/* Links Tab */}
//           <TabsContent value="links" className="space-y-6">
//             {links.length === 0 ? (
//               <Card>
//                 <CardContent className="py-12 text-center">
//                   <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600">No links created yet</p>
//                   <Button
//                     onClick={() => setDialogOpen(true)}
//                     className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
//                   >
//                     <Plus className="w-4 h-4 mr-2" />
//                     Create Your First Link
//                   </Button>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {links.map(link => (
//                   <LinkCard
//                     key={link._id}
//                     link={link}
//                     canManage={true}
//                     onEdit={handleEditLink}
//                     onDelete={handleDeleteLink}
//                   />
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           {/* Submissions Tab */}
//           <TabsContent value="submissions">
//             <Card>
//               <CardHeader>
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                   <div>
//                     <CardTitle>Student Submissions</CardTitle>
//                     <CardDescription>View and manage student registrations</CardDescription>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={handleExportSubmissions}
//                       disabled={submissions.length === 0}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Export
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 <div className="flex flex-wrap gap-2">
//                   {links.map(link => (
//                     <Button
//                       key={link._id}
//                       variant={selectedLinkId === link._id ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => loadSubmissions(link._id)}
//                       className={selectedLinkId === link._id ? "bg-orange-500 hover:bg-orange-600" : ""}
//                     >
//                       <Eye className="w-4 h-4 mr-2" />
//                       {link.title}
//                     </Button>
//                   ))}
//                 </div>

//                 {selectedLinkId && (
//                   <>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                       <Input
//                         placeholder="Search students..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="pl-10"
//                       />
//                     </div>

//                     {filteredSubmissions.length === 0 ? (
//                       <div className="py-12 text-center">
//                         <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-600">No submissions yet</p>
//                       </div>
//                     ) : (
//                       <div className="overflow-x-auto">
//                         <Table>
//                           <TableHeader>
//                             <TableRow>
//                               <TableHead>Student Name</TableHead>
//                               <TableHead>Email</TableHead>
//                               <TableHead>Roll Number</TableHead>
//                               <TableHead>Status</TableHead>
//                               <TableHead>Submitted</TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {filteredSubmissions.map(sub => (
//                               <TableRow key={sub._id}>
//                                 <TableCell>{sub.student?.name}</TableCell>
//                                 <TableCell>{sub.student?.email}</TableCell>
//                                 <TableCell>{sub.student?.rollNumber}</TableCell>
//                                 <TableCell>
//                                   <Badge className="bg-green-100 text-green-700">
//                                     {sub.status}
//                                   </Badge>
//                                 </TableCell>
//                                 <TableCell>
//                                   {new Date(sub.createdAt).toLocaleDateString()}
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {!selectedLinkId && (
//                   <div className="py-12 text-center">
//                     <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-600">Select a link to view submissions</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       <CreateLinkDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         onSubmit={editLink ? handleUpdateLink : handleCreateLink}
//         editLink={editLink}
//       />
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LinkCard } from '../components/LinkCard';
import { CreateLinkDialog } from '../components/CreateLinkDialog';
import { linksAPI, submissionsAPI, analyticsAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Loader2, Link2, Users, Eye, TrendingUp, Search, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';

export const FacultyDashboard = () => {
  const { user } = useAuth();

  const [links, setLinks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalLinks: 0,
    activeLinks: 0,
    totalSubmissions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLink, setEditLink] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [studentHistory, setStudentHistory] = useState([]);
  const [studentHistoryLoading, setStudentHistoryLoading] = useState(false);
  const [divisionCatalog, setDivisionCatalog] = useState({ colleges: [] });

  useEffect(() => {
    loadLinks();
    loadStats();
    loadDivisions();
  }, []);

  /* ---------- LOAD LINKS (CRITICAL) ---------- */
  const loadLinks = async () => {
    try {
      const data = await linksAPI.getAll();
      setLinks(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOAD STATS (OPTIONAL) ---------- */
  const loadStats = async () => {
    try {
      const data = await analyticsAPI.getStats();
      // Accept either {stats:{...}} or direct object
      setStats(data?.stats || data?.data || data || {});
    } catch {
      console.warn('Stats not available');
    }
  };

  const loadDivisions = async () => {
    try {
      const catalog = await linksAPI.getDivisionCatalog();
      if (catalog?.colleges) {
        setDivisionCatalog(catalog);
      }
    } catch {
      console.warn('Division catalog not available');
    }
  };

  /* ---------- LOAD SUBMISSIONS ---------- */
  const loadSubmissions = async (linkId) => {
    try {
      const res = await submissionsAPI.getByLink(linkId);
      const list = Array.isArray(res?.submissions) ? res.submissions : Array.isArray(res) ? res : [];
      const normalized = list.map((s) => ({
        ...s,
        studentName: s.student?.name || s.studentName,
        studentEmail: s.student?.email || s.studentEmail,
        rollNumber: s.student?.rollNumber || s.rollNumber,
        submittedAt: s.submittedAt || s.createdAt,
      }));
      setSubmissions(normalized);
      setSelectedLinkId(linkId);
    } catch {
      toast.error('Failed to load submissions');
    }
  };

  // Export selected link submissions as Excel-friendly CSV
  const handleExportSubmissions = () => {
    if (!selectedLinkId) {
      toast.error('Select a link first');
      return;
    }
    if (!submissions.length) {
      toast.error('No submissions to export');
      return;
    }

    const header = ['Student Name', 'Email', 'Roll Number', 'Status', 'Submitted At'];
    const rows = submissions.map((s) => [
      s.studentName || '',
      s.studentEmail || '',
      s.rollNumber || '',
      s.status || '',
      s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '',
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((val) => `"${(val || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started');
  };

  const handleViewSubmission = (sub) => {
    setSelectedSubmission(sub);
    setDetailOpen(true);
  };

  const handleVerifySubmission = async (sub, status = 'verified') => {
    try {
      await submissionsAPI.verify(sub._id, status);
      toast.success(`Status updated to ${status}`);
      if (selectedLinkId) {
        loadSubmissions(selectedLinkId);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update status';
      toast.error(msg);
    }
  };

  const handleViewHistory = async (studentId) => {
    setStudentHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const hist = await submissionsAPI.getByStudent(studentId);
      setStudentHistory(Array.isArray(hist) ? hist : []);
    } catch {
      toast.error('Failed to load student history');
    } finally {
      setStudentHistoryLoading(false);
    }
  };

  /* ---------- CRUD ---------- */
  const handleCreateLink = async (data) => {
    await linksAPI.create(data);
    loadLinks();
  };

  const handleUpdateLink = async (data, id) => {
    await linksAPI.update(id, data);
    loadLinks();
  };

  const handleDeleteLink = async (id) => {
    if (!confirm('Delete link?')) return;
    await linksAPI.delete(id);
    loadLinks();
  };

  const filteredSubmissions = submissions.filter((s) =>
    (s.studentName || s.student?.name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const statsDisplay = {
    totalLinks: stats?.totalLinks ?? links.length,
    activeLinks: stats?.activeLinks ?? links.filter((l) => l.active).length,
    totalSubmissions: stats?.totalSubmissions ?? stats?.data?.totalSubmissions ?? 0,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="text-gray-600">Manage placement links</p>
        </div>
        <Button onClick={() => { setEditLink(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm">Total Links</CardTitle>
            <Link2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{statsDisplay.totalLinks}</div>
            <p className="text-xs text-gray-500 mt-1">{statsDisplay.activeLinks} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{statsDisplay.totalSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">Across all links</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm">Avg. Registrations</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {statsDisplay.totalLinks ? Math.round(statsDisplay.totalSubmissions / statsDisplay.totalLinks) : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per link</p>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">My Links</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        {/* LINKS TAB */}
        <TabsContent value="links">
          {links.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No links created yet</p>
                <Button
                  onClick={() => {
                    setEditLink(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Link
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {links.map(link => (
                <LinkCard
                  key={link._id}
                  link={link}
                  canManage
                  onEdit={setEditLink}
                  onDelete={() => handleDeleteLink(link._id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* SUBMISSIONS TAB */}
        <TabsContent value="submissions">
          <div className="flex flex-wrap gap-2 mb-4">
            {links.map(link => (
              <Button
                key={link._id}
                size="sm"
                variant={selectedLinkId === link._id ? 'default' : 'outline'}
                onClick={() => loadSubmissions(link._id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {link.title}
              </Button>
            ))}
          </div>

          {selectedLinkId ? (
            <>
              <div className="flex flex-wrap gap-3 items-center mb-3">
                <Input
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Button variant="outline" size="sm" onClick={handleExportSubmissions}>
                  <Download className="w-4 h-4 mr-2" /> Download Excel
                </Button>
                <span className="text-sm text-gray-500">{submissions.length} submissions</span>
              </div>

              {filteredSubmissions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No submissions yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roll</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map(s => (
                      <TableRow key={s._id}>
                        <TableCell>{s.studentName || s.student?.name}</TableCell>
                        <TableCell>{s.studentEmail || s.student?.email}</TableCell>
                        <TableCell>{s.rollNumber || s.student?.rollNumber || '-'}</TableCell>
                        <TableCell>
                          <Badge>{s.status}</Badge>
                        </TableCell>
                        <TableCell>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '-'}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewSubmission(s)}>View</Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewHistory(s.student?._id)}>History</Button>
                          {s.status !== 'verified' && (
                            <Button size="sm" onClick={() => handleVerifySubmission(s, 'verified')}>Verify</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">Select a link to view submissions</div>
          )}
        </TabsContent>
      </Tabs>

      {/* CREATE / EDIT DIALOG */}
      <CreateLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editLink ? handleUpdateLink : handleCreateLink}
        editLink={editLink}
        divisionCatalog={divisionCatalog}
      />

      {/* Submission Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Student:</span> {selectedSubmission.student?.name}</div>
                <div><span className="text-gray-500">Email:</span> {selectedSubmission.student?.email}</div>
                <div><span className="text-gray-500">Status:</span> {selectedSubmission.status}</div>
                <div><span className="text-gray-500">Submitted:</span> {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : '-'}</div>
              </div>
              {selectedSubmission.screenshot && (
                <img src={selectedSubmission.screenshot} alt="Screenshot" className="rounded border max-h-[60vh] object-contain" />
              )}
              {selectedSubmission.status !== 'verified' && (
                <div className="flex gap-2">
                  <Button onClick={() => handleVerifySubmission(selectedSubmission, 'verified')}>Mark Verified</Button>
                  <Button variant="outline" onClick={() => handleVerifySubmission(selectedSubmission, 'completed')}>Mark Completed</Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Student History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Student Submission History</DialogTitle>
          </DialogHeader>
          {studentHistoryLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : studentHistory.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No submissions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentHistory.map(h => (
                    <TableRow key={h._id}>
                      <TableCell>{h.link?.title || '-'}</TableCell>
                      <TableCell><Badge>{h.status}</Badge></TableCell>
                      <TableCell>{h.createdAt ? new Date(h.createdAt).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};


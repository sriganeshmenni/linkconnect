import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LinkCard } from '../components/LinkCard';
import { CreateLinkDialog } from '../components/CreateLinkDialog';
import { linksAPI, submissionsAPI, analyticsAPI } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Loader2, Link2, Users, TrendingUp, Search, Download, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLink, setEditLink] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkId, setSelectedLinkId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [linksData, statsData] = await Promise.all([
        linksAPI.getAll(),
        analyticsAPI.getStats()
      ]);
      setLinks(linksData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (linkId) => {
    try {
      const data = await submissionsAPI.getByLink(linkId);
      setSubmissions(data);
      setSelectedLinkId(linkId);
    } catch (error) {
      toast.error('Failed to load submissions');
    }
  };

  const handleCreateLink = async (linkData) => {
    try {
      await linksAPI.create(linkData);
      await loadData();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateLink = async (linkData, linkId) => {
    try {
      await linksAPI.update(linkId, linkData);
      await loadData();
    } catch (error) {
      throw error;
    }
  };

  const handleEditLink = (link) => {
    setEditLink(link);
    setDialogOpen(true);
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      await linksAPI.delete(linkId);
      toast.success('Link deleted successfully');
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete link';
      toast.error(message);
    }
  };

  const handleExportSubmissions = () => {
    const csv = [
      ['Student Name', 'Email', 'Roll Number', 'Submitted At', 'Status'],
      ...submissions.map(s => [
        s.studentName,
        s.studentEmail,
        s.rollNumber,
        new Date(s.submittedAt).toLocaleString(),
        s.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions.csv';
    a.click();
    toast.success('Submissions exported!');
  };

  const filteredSubmissions = submissions.filter(s =>
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-gray-900 mb-2">Faculty Dashboard</h1>
            <p className="text-gray-600">Manage placement links and track registrations</p>
          </div>
          <Button
            onClick={() => {
              setEditLink(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Link
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <CardTitle className="text-sm">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.totalSubmissions || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Across all links</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg. Registrations</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {stats?.totalLinks ? Math.round(stats.totalSubmissions / stats.totalLinks) : 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Per link</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="links">My Links</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-6">
            {links.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No links created yet</p>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map(link => (
                  <LinkCard
                    key={link._id || link.id}
                    link={link}
                    canManage={true}
                    onEdit={handleEditLink}
                    onDelete={handleDeleteLink}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Student Submissions</CardTitle>
                    <CardDescription>View and manage student registrations</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportSubmissions}
                      disabled={submissions.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Link Selector */}
                <div className="flex flex-wrap gap-2">
                  {links.map(link => (
                    <Button
                      key={link._id || link.id}
                      variant={selectedLinkId === (link._id || link.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => loadSubmissions(link._id || link.id)}
                      className={selectedLinkId === (link._id || link.id) ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {link.title}
                    </Button>
                  ))}
                </div>

                {selectedLinkId && (
                  <>
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Table */}
                    {filteredSubmissions.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No submissions yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Roll Number</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Submitted</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSubmissions.map(submission => (
                              <TableRow key={submission.id}>
                                <TableCell>{submission.studentName}</TableCell>
                                <TableCell>{submission.studentEmail}</TableCell>
                                <TableCell>{submission.rollNumber}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-700">
                                    {submission.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(submission.submittedAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}

                {!selectedLinkId && (
                  <div className="py-12 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a link to view submissions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editLink ? handleUpdateLink : handleCreateLink}
        editLink={editLink}
      />
    </div>
  );
};

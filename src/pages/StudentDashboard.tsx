import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LinkCard } from '../components/LinkCard';
import { StudentRegistrationDialog } from '../components/StudentRegistrationDialog';
import { linksAPI, submissionsAPI } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Loader2, CheckCircle, Clock, Link2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [linksData, submissionsData] = await Promise.all([
        linksAPI.getStudentLinks(),
        submissionsAPI.getByStudent(user.id)
      ]);
      setLinks(Array.isArray(linksData) ? linksData : []);
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
    } catch (error) {
      toast.error('Failed to load data');
      setLinks([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (link) => {
    setSelectedLink(link);
    setDialogOpen(true);
  };

  const handleSubmitRegistration = async (submissionData) => {
    try {
      await submissionsAPI.create(submissionData);
      await loadData();
    } catch (error) {
      throw error;
    }
  };

  const activeLinks = Array.isArray(links) ? links.filter(link => 
    link && link.active && new Date(link.deadline) >= new Date()
  ) : [];

  const completedSubmissions = Array.isArray(submissions) ? submissions.filter(s => s && s.status === 'completed') : [];

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
          <h1 className="text-gray-900 mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Track and register for placement opportunities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Available Links</CardTitle>
              <Link2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{activeLinks.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Registrations</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{completedSubmissions.length}</div>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{activeLinks.length - completedSubmissions.length}</div>
              <p className="text-xs text-gray-500 mt-1">To register</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="available">Available Links</TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            {activeLinks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active links available</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLinks.map(link => (
                  <LinkCard
                    key={link._id || link.id}
                    link={link}
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Registration History</CardTitle>
                <CardDescription>View all your past registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No registrations yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start registering for opportunities</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Link Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map(submission => {
                          const link = links.find(l => l.id === submission.linkId);
                          return (
                            <TableRow key={submission.id}>
                              <TableCell>{link?.title || 'Unknown'}</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-700">
                                  {submission.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
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

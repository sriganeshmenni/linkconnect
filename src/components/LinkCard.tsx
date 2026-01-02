import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ExternalLink, Calendar, Users, Copy, Edit, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';



type LinkCardProps = {
  link: any;
  onEdit?: (link: any) => void;
  onDelete?: (linkId: any) => void;
  canManage?: boolean;
  onSubmit?: (link: any) => void;
  registrationStatus?: 'not-registered' | 'registered' | 'expired';
  isStudent?: boolean;
};

export const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onDelete, canManage = false, onSubmit, registrationStatus, isStudent }) => {
  const [linkClicked, setLinkClicked] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleCopyShortUrl = () => {
    navigator.clipboard.writeText(link.shortUrl);
    toast.success('Short URL copied to clipboard!');
  };


  const isExpired = new Date(link.deadline) < new Date();
  const creatorName = link.createdBy?.name || link.createdByName || link.createdByEmail;

  // For student view, hide cards that are already registered or expired
  if (!canManage && (registrationStatus === 'registered' || registrationStatus === 'expired')) {
    return null;
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${!link.active && 'opacity-60'} h-full flex flex-col`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate" title={link.title}>{link.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2" title={link.description}>{link.description}</CardDescription>
            {(
              creatorName
            ) && (
              <div className="mt-2 text-xs text-gray-500">
                Created by: {creatorName}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {registrationStatus === 'registered' ? (
              <Badge className="bg-blue-100 text-blue-700">Already Registered</Badge>
            ) : link.active && !isExpired ? (
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {isExpired && registrationStatus !== 'registered' && (
              <Badge variant="destructive">Expired</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 min-h-0">
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <Calendar className="w-4 h-4" />
          <span>Deadline: {new Date(link.deadline).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <Users className="w-4 h-4" />
          <span>{link.registrations || 0} registrations</span>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm truncate">
            {link.shortUrl}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyShortUrl}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {isStudent ? (
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              onClick={() => setRegisterOpen(true)}
            >
              Register
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setGuidelinesOpen(true)}
            >
              <Info className="w-4 h-4 mr-2" />
              Guidelines
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-orange-600 hover:text-orange-700"
              onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open original URL
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setGuidelinesOpen(true)}
            >
              <Info className="w-4 h-4 mr-2" />
              Guidelines
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        {canManage ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(link)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(link._id || link.id)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        ) : !isStudent ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setGuidelinesOpen(true)}
          >
            <Info className="w-4 h-4 mr-2" />
            Guidelines
          </Button>
        ) : null}
      </CardFooter>

      {/* Guidelines Dialog */}
      <Dialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
        <DialogContent className="sm:max-w-[620px] w-full">
          <DialogHeader>
            <DialogTitle>Guidelines for {link.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-700 max-h-[60vh] overflow-auto">
            {link.guidelines ? (
              <p className="whitespace-pre-wrap leading-relaxed">{link.guidelines}</p>
            ) : (
              <p className="text-gray-500">No guidelines provided.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog (student) */}
      {isStudent && (
        <Dialog open={registerOpen} onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) setLinkClicked(false);
        }}>
          <DialogContent className="sm:max-w-[640px] w-full">
            <DialogHeader>
              <DialogTitle>Register for {link.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wide text-orange-700">Opportunity</p>
                  <p className="font-semibold text-gray-900 leading-tight">{link.title}</p>
                  {link.description && <p className="text-gray-700 text-sm leading-relaxed">{link.description}</p>}
                  <p className="text-xs text-gray-600">
                    Deadline: {link.deadline ? new Date(link.deadline).toLocaleString() : '—'}
                  </p>
                </div>

                <div className="space-y-2 bg-white border border-orange-100 rounded-lg p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-orange-700">Guidelines</p>
                  <div className="max-h-[180px] overflow-auto text-xs text-gray-700 leading-relaxed">
                    {link.guidelines ? (
                      <p className="whitespace-pre-wrap">{link.guidelines}</p>
                    ) : (
                      <p className="text-gray-500">No guidelines provided.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    window.open(link.url, '_blank', 'noopener,noreferrer');
                    setLinkClicked(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Link
                </Button>
                <Button
                  type="button"
                  disabled={!linkClicked}
                  onClick={() => {
                    if (!linkClicked) return;
                    onSubmit?.(link);
                    setRegisterOpen(false);
                  }}
                  className={!linkClicked ? 'bg-gray-200 text-gray-500' : ''}
                >
                  Submit
                </Button>
              </div>
              {!linkClicked && (
                <p className="text-xs text-gray-500">Submit will enable after you open the link.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};




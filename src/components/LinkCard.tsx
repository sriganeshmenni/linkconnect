import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Calendar, Users, Copy, Edit, Trash2 } from 'lucide-react';
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
  const handleCopyShortUrl = () => {
    navigator.clipboard.writeText(link.shortUrl);
    toast.success('Short URL copied to clipboard!');
  };


  const isExpired = new Date(link.deadline) < new Date();

  // For student view, hide cards that are already registered or expired
  if (!canManage && (registrationStatus === 'registered' || registrationStatus === 'expired')) {
    return null;
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${!link.active && 'opacity-60'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{link.title}</CardTitle>
            <CardDescription className="mt-1">{link.description}</CardDescription>
            {(
              link.createdBy?.name || link.createdByEmail
            ) && (
              <div className="mt-2 text-xs text-gray-500">
                Created by: {link.createdBy?.name || link.createdByEmail}
              </div>
            )}
          </div>
          <div className="flex gap-2">
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

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Deadline: {new Date(link.deadline).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
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

        {/* Student: Link and Submit buttons side by side */}
        {isStudent ? (
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              onClick={() => {
                window.open(link.url, '_blank', 'noopener,noreferrer');
                setLinkClicked(true);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Link
            </Button>
            <Button
              type="button"
              className={`flex-1 font-bold transition-all duration-200
                ${linkClicked && link.active && !isExpired
                  ? 'flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                  : 'bg-white text-black border border-gray-300 cursor-not-allowed'}
                !important`}
              style={{ display: 'block', visibility: 'visible' }}
              onClick={() => (linkClicked && link.active && !isExpired) ? onSubmit?.(link) : undefined}
              disabled={!linkClicked || !link.active || isExpired}
            >
              Submit
            </Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 focus:outline-none"
            onClick={() => {
              window.open(link.url, '_blank', 'noopener,noreferrer');
            }}
            type="button"
          >
            <ExternalLink className="w-4 h-4" />
            Open original URL
          </button>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
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
        ) : null}
      </CardFooter>
    </Card>
  );
};




import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Calendar, Users, Copy, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LinkCardProps {
  link: any;
  onEdit?: (link: any) => void;
  onDelete?: (linkId: any) => void;
  canManage?: boolean;
  onRegister?: (link: any) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onDelete, canManage = false, onRegister }) => {
  const handleCopyShortUrl = () => {
    navigator.clipboard.writeText(link.shortUrl);
    toast.success('Short URL copied to clipboard!');
  };

  const isExpired = new Date(link.deadline) < new Date();

  return (
    <Card className={`hover:shadow-lg transition-shadow ${!link.active && 'opacity-60'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{link.title}</CardTitle>
            <CardDescription className="mt-1">{link.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {link.active ? (
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {isExpired && (
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

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
        >
          <ExternalLink className="w-4 h-4" />
          Open original URL
        </a>
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
              onClick={() => onDelete(link._id || link.id)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            onClick={() => onRegister?.(link)}
            disabled={!link.active || isExpired}
          >
            Register Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

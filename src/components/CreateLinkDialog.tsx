import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

export const CreateLinkDialog = ({ open, onOpenChange, onSubmit, editLink = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    shortUrl: '',
    deadline: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editLink) {
      setFormData({
        title: editLink.title || '',
        url: editLink.url || '',
        shortUrl: editLink.shortUrl || '',
        deadline: editLink.deadline?.split('T')[0] || '',
        description: editLink.description || ''
      });
    } else {
      setFormData({
        title: '',
        url: '',
        shortUrl: '',
        deadline: '',
        description: ''
      });
    }
  }, [editLink, open]);

  const generateShortUrl = () => {
    const random = Math.random().toString(36).substring(2, 8);
    return `lc.io/${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.url || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        shortUrl: formData.shortUrl || generateShortUrl(),
        active: true
      };
      
      await onSubmit(dataToSubmit, editLink?.id);
      toast.success(editLink ? 'Link updated successfully!' : 'Link created successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        url: '',
        shortUrl: '',
        deadline: '',
        description: ''
      });
    } catch (error) {
      toast.error('Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editLink ? 'Edit Link' : 'Create New Link'}</DialogTitle>
          <DialogDescription>
            {editLink ? 'Update the registration link details' : 'Add a new registration link for students'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Amazon SDE Internship 2025"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Original URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://company.com/careers/job-id"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortUrl">Short URL (optional)</Label>
            <Input
              id="shortUrl"
              value={formData.shortUrl}
              onChange={(e) => setFormData({ ...formData, shortUrl: e.target.value })}
              placeholder="lc.io/custom-link"
            />
            <p className="text-xs text-gray-500">Leave empty to auto-generate</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summer internship opportunity for 2025..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editLink ? 'Update Link' : 'Create Link'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

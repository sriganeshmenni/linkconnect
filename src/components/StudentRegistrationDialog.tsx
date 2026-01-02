import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentRegistrationDialog = ({ open, onOpenChange, link, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    screenshot: null,
    screenshotPreview: null
  });
  const [loading, setLoading] = useState(false);
  const [linkVisited, setLinkVisited] = useState(false);

  useEffect(() => {
    if (open) {
      setLinkVisited(true); // already confirmed in card dialog
    } else {
      setLinkVisited(false);
      setFormData({ screenshot: null, screenshotPreview: null });
    }
  }, [open]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          screenshot: file,
          screenshotPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const submissionData = {
        linkId: link._id || link.id,
        studentName: user.name,
        studentEmail: user.email,
        rollNumber: user.rollNumber || 'N/A',
        screenshot: formData.screenshotPreview,
        status: 'completed'
      };

      await onSubmit(submissionData);
      toast.success('Registration submitted successfully!');
      onOpenChange(false);
      setFormData({ screenshot: null, screenshotPreview: null });
    } catch (error) {
      toast.error('Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Submit Registration</DialogTitle>
          <DialogDescription>
            Review the details and submit after visiting the registration link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold">{link?.title}</h4>
            {link?.description && <p className="text-sm text-gray-700">{link.description}</p>}
            <p className="text-xs text-gray-600">
              Deadline: {link?.deadline ? new Date(link.deadline).toLocaleString() : '—'}
            </p>
          </div>

          {link?.guidelines && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800">
              <p className="font-semibold mb-1 text-xs">Guidelines</p>
              <p className="whitespace-pre-wrap leading-relaxed text-xs">{link.guidelines}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              onClick={() => {
                if (link?.url) {
                  window.open(link.url, '_blank', 'noopener,noreferrer');
                  setLinkVisited(true);
                }
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Open Link
            </Button>
            <Button
              type="submit"
              disabled={!linkVisited || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
          {!linkVisited && (
            <p className="text-xs text-gray-500">Submit will enable after you open the link.</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="screenshot">Upload Screenshot (optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
              {formData.screenshotPreview ? (
                <div className="space-y-4">
                  <img
                    src={formData.screenshotPreview}
                    alt="Screenshot preview"
                    className="max-h-64 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ screenshot: null, screenshotPreview: null })}
                  >
                    Change Screenshot
                  </Button>
                </div>
              ) : (
                <label htmlFor="screenshot" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload screenshot</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
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
                  Submitting...
                </>
              ) : (
                'Submit Registration'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


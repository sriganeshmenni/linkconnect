import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const CreateLinkDialog = ({ open, onOpenChange, onSubmit, editLink = null, divisionCatalog = { colleges: [] } }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    shortUrl: '',
    deadline: '',
    description: '',
    collegeCode: '',
    branchCodes: [],
    years: [],
    sections: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editLink) {
      setFormData({
        title: editLink.title || '',
        url: editLink.url || '',
        shortUrl: editLink.shortUrl || '',
        deadline: editLink.deadline?.split('T')[0] || '',
        description: editLink.description || '',
        collegeCode: editLink.collegeCode || '',
        branchCodes: Array.isArray(editLink.branchCodes) ? editLink.branchCodes : [],
        years: Array.isArray(editLink.years) ? editLink.years : [],
        sections: Array.isArray(editLink.sections) ? editLink.sections : []
      });
    } else {
      setFormData({
        title: '',
        url: '',
        shortUrl: '',
        deadline: '',
        description: '',
        collegeCode: divisionCatalog?.colleges?.[0]?.code || '',
        branchCodes: [],
        years: [],
        sections: []
      });
    }
  }, [editLink, open, divisionCatalog]);

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
        title: formData.title,
        url: formData.url,
        shortUrl: formData.shortUrl || generateShortUrl(),
        deadline: formData.deadline,
        description: formData.description,
        active: true,
        collegeCode: formData.collegeCode?.trim() || undefined,
        branchCodes: Array.isArray(formData.branchCodes) ? formData.branchCodes : [],
        years: Array.isArray(formData.years) ? formData.years : [],
        sections: Array.isArray(formData.sections) ? formData.sections : [],
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
        description: '',
        collegeCode: divisionCatalog?.colleges?.[0]?.code || '',
        branchCodes: [],
        years: [],
        sections: []
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="collegeCode">College</Label>
              <Select
                value={formData.collegeCode || ''}
                onValueChange={(value) => {
                  const firstBranch = divisionCatalog?.colleges?.find((c) => c.code === value)?.branches?.[0]?.code;
                  setFormData({
                    ...formData,
                    collegeCode: value,
                    branchCodes: firstBranch ? [firstBranch] : [],
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose college" />
                </SelectTrigger>
                <SelectContent>
                  {divisionCatalog?.colleges?.map((college) => (
                    <SelectItem key={college.code} value={college.code}>
                      {college.name || college.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={formData.branchCodes[0] || 'ALL'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    branchCodes: val === 'ALL' ? [] : [val],
                  });
                }}
                title="Branch"
              >
                <option value="ALL">All branches</option>
                {divisionCatalog?.colleges
                  ?.find((c) => c.code === formData.collegeCode)?.branches
                  ?.map((branch) => (
                    <option key={branch.code} value={branch.code}>
                      {branch.name || branch.code}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Years</Label>
              <select
                multiple
                className="w-full border rounded px-3 py-2 text-sm h-24"
                value={formData.years.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
                  setFormData({ ...formData, years: values });
                }}
                title="Years"
              >
                {(divisionCatalog?.colleges
                  ?.find((c) => c.code === formData.collegeCode)?.branches
                  ?.find((b) => b.code === (formData.branchCodes[0] || ''))?.years || [1, 2, 3, 4]
                ).map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Select none for all years</p>
            </div>

            <div className="space-y-2">
              <Label>Sections</Label>
              <select
                multiple
                className="w-full border rounded px-3 py-2 text-sm h-24"
                value={formData.sections}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                  setFormData({ ...formData, sections: values });
                }}
                title="Sections"
              >
                {(divisionCatalog?.colleges
                  ?.find((c) => c.code === formData.collegeCode)?.branches
                  ?.find((b) => b.code === (formData.branchCodes[0] || ''))?.sections || ['A', 'B']
                ).map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Select none for all sections</p>
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

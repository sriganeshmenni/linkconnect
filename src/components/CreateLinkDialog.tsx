import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export const CreateLinkDialog = ({ open, onOpenChange, onSubmit, editLink = null, divisionCatalog = { colleges: [] } }) => {
  const [tab, setTab] = useState('basics');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    shortUrl: '',
    deadlineDate: '',
    deadlineHour: '09',
    deadlineMinute: '00',
    deadlinePeriod: 'AM',
    description: '',
    guidelines: '',
    collegeCode: '',
    branchCodes: [],
    years: [],
    sections: [],
    allowedGenders: [],
  });
  const [loading, setLoading] = useState(false);

  const parseDeadline = (value?: string) => {
    if (!value) {
      return { deadlineDate: '', deadlineHour: '09', deadlineMinute: '00', deadlinePeriod: 'AM' };
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return { deadlineDate: '', deadlineHour: '09', deadlineMinute: '00', deadlinePeriod: 'AM' };
    }
    const yyyy = date.getFullYear();
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const dd = `${date.getDate()}`.padStart(2, '0');
    const mins = `${date.getMinutes()}`.padStart(2, '0');
    const rawHour = date.getHours();
    const period = rawHour >= 12 ? 'PM' : 'AM';
    const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
    return {
      deadlineDate: `${yyyy}-${mm}-${dd}`,
      deadlineHour: `${hour12}`.padStart(2, '0'),
      deadlineMinute: mins,
      deadlinePeriod: period,
    };
  };

  useEffect(() => {
    if (!open) {
      setTab('basics');
    }

    if (editLink) {
      const parsed = parseDeadline(editLink.deadline);
      setFormData({
        title: editLink.title || '',
        url: editLink.url || '',
        shortUrl: editLink.shortUrl || '',
        ...parsed,
        description: editLink.description || '',
        guidelines: editLink.guidelines || '',
        collegeCode: editLink.collegeCode || '',
        branchCodes: Array.isArray(editLink.branchCodes) ? editLink.branchCodes : [],
        years: Array.isArray(editLink.years) ? editLink.years : [],
        sections: Array.isArray(editLink.sections) ? editLink.sections : [],
        allowedGenders: Array.isArray(editLink.allowedGenders) ? editLink.allowedGenders : [],
      });
    } else {
      setFormData({
        title: '',
        url: '',
        shortUrl: '',
        deadlineDate: '',
        deadlineHour: '09',
        deadlineMinute: '00',
        deadlinePeriod: 'AM',
        description: '',
        collegeCode: divisionCatalog?.colleges?.[0]?.code || '',
        branchCodes: [],
        years: [],
        sections: [],
        allowedGenders: [],
      });
    }
  }, [editLink, open, divisionCatalog]);

  const generateShortUrl = () => {
    const random = Math.random().toString(36).substring(2, 8);
    return `lc.io/${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.deadlineDate || !formData.deadlineHour || !formData.deadlineMinute) {
      toast.error('Please set both deadline date and time');
      return;
    }

    const hourNum = Number(formData.deadlineHour);
    const minuteNum = Number(formData.deadlineMinute);
    const hour24 = formData.deadlinePeriod === 'PM'
      ? (hourNum % 12) + 12
      : hourNum % 12;

    const paddedHour = `${hour24}`.padStart(2, '0');
    const paddedMinute = `${minuteNum}`.padStart(2, '0');
    const deadlineIso = new Date(`${formData.deadlineDate}T${paddedHour}:${paddedMinute}:00`).toISOString();

    setLoading(true);
    try {
      const dataToSubmit = {
        title: formData.title,
        url: formData.url,
        shortUrl: formData.shortUrl || generateShortUrl(),
        deadline: deadlineIso,
        description: formData.description,
        guidelines: formData.guidelines,
        active: true,
        collegeCode: formData.collegeCode?.trim() || undefined,
        branchCodes: Array.isArray(formData.branchCodes) ? formData.branchCodes : [],
        years: Array.isArray(formData.years) ? formData.years : [],
        sections: Array.isArray(formData.sections) ? formData.sections : [],
        allowedGenders: Array.isArray(formData.allowedGenders) ? formData.allowedGenders : [],
      };
      
      await onSubmit(dataToSubmit, editLink?._id || editLink?.id);
      toast.success(editLink ? 'Link updated successfully!' : 'Link created successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        url: '',
        shortUrl: '',
        deadlineDate: '',
        deadlineHour: '09',
        deadlineMinute: '00',
        deadlinePeriod: 'AM',
        description: '',
        collegeCode: divisionCatalog?.colleges?.[0]?.code || '',
        branchCodes: [],
        years: [],
        sections: [],
        allowedGenders: [],
      });
    } catch (error) {
      toast.error('Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] w-[760px] max-w-[92vw] h-[640px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editLink ? 'Edit Link' : 'Create New Link'}</DialogTitle>
          <DialogDescription>
            {editLink ? 'Update the registration link details' : 'Add a new registration link for students'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden space-y-4">
          <Tabs value={tab} onValueChange={setTab} className="flex gap-4 flex-1 min-h-0">
            <TabsList className="flex flex-col w-36 shrink-0 bg-orange-50 border border-orange-100 rounded-xl p-2 gap-2 h-full min-h-[500px]">
              <TabsTrigger value="basics" className="justify-start">Basics</TabsTrigger>
              <TabsTrigger value="guidelines" className="justify-start">Guidelines</TabsTrigger>
              <TabsTrigger value="audience" className="justify-start">Audience</TabsTrigger>
              <TabsTrigger value="deadline" className="justify-start">Deadline</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 space-y-4 overflow-auto pr-1">

            {/* TAB 1: BASICS */}
            <TabsContent value="basics" className="space-y-3 min-h-0">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of this opportunity"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* TAB 2: GUIDELINES */}
            <TabsContent value="guidelines" className="space-y-3 min-h-0">
              <div className="space-y-2">
                <Label htmlFor="guidelines">Guidelines (shown to students)</Label>
                <Textarea
                  id="guidelines"
                  value={formData.guidelines}
                  onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                  placeholder="Explain how to register, documents required, etc."
                  rows={6}
                />
                <p className="text-xs text-gray-500">Optional but recommended so students know the exact steps.</p>
              </div>
            </TabsContent>

            {/* TAB 3: AUDIENCE */}
            <TabsContent value="audience" className="space-y-3 min-h-0">
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
                    <SelectTrigger className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400">
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
                    className="w-full border rounded px-3 py-2 text-sm bg-white border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                  <Select
                    value={formData.years[0] !== undefined ? String(formData.years[0]) : 'ALL'}
                    onValueChange={(val) => {
                      if (val === 'ALL') {
                        setFormData({ ...formData, years: [] });
                      } else {
                        setFormData({ ...formData, years: [Number(val)] });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All years</SelectItem>
                      {(divisionCatalog?.colleges
                        ?.find((c) => c.code === formData.collegeCode)?.branches
                        ?.find((b) => b.code === (formData.branchCodes[0] || ''))?.years || [1, 2, 3, 4]
                      ).map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Choose a year or All.</p>
                </div>

                <div className="space-y-2">
                  <Label>Sections</Label>
                  <Select
                    value={formData.sections[0] || 'ALL'}
                    onValueChange={(val) => {
                      if (val === 'ALL') {
                        setFormData({ ...formData, sections: [] });
                      } else {
                        setFormData({ ...formData, sections: [val] });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All sections</SelectItem>
                      {(divisionCatalog?.colleges
                        ?.find((c) => c.code === formData.collegeCode)?.branches
                        ?.find((b) => b.code === (formData.branchCodes[0] || ''))?.sections || ['A', 'B']
                      ).map((section) => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Choose a section or All.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed Genders (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {['male', 'female', 'other'].map((g) => {
                    const checked = formData.allowedGenders.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? formData.allowedGenders.filter((x) => x !== g)
                            : [...formData.allowedGenders, g];
                          setFormData({ ...formData, allowedGenders: next });
                        }}
                        className={`px-3 py-2 rounded-full text-xs border transition ${checked ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-orange-200 text-gray-700 hover:border-orange-400'}`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, allowedGenders: [] })}
                    className={`px-3 py-2 rounded-full text-xs border transition ${formData.allowedGenders.length === 0 ? 'bg-orange-100 text-orange-700 border-orange-400' : 'bg-white border-orange-200 text-gray-700 hover:border-orange-400'}`}
                  >
                    Any
                  </button>
                </div>
                <p className="text-xs text-gray-500">Leave as “Any” to include everyone.</p>
              </div>
            </TabsContent>

            {/* TAB 4: DEADLINE */}
            <TabsContent value="deadline" className="space-y-3 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="deadlineDate">Deadline Date *</Label>
                  <Input
                    id="deadlineDate"
                    type="date"
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                    className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deadline Time *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={formData.deadlineHour}
                      onValueChange={(val) => setFormData({ ...formData, deadlineHour: val })}
                    >
                      <SelectTrigger className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent>
                        {['01','02','03','04','05','06','07','08','09','10','11','12'].map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.deadlineMinute}
                      onValueChange={(val) => setFormData({ ...formData, deadlineMinute: val })}
                    >
                      <SelectTrigger className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {['00','15','30','45'].map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.deadlinePeriod}
                      onValueChange={(val) => setFormData({ ...formData, deadlinePeriod: val })}
                    >
                      <SelectTrigger className="bg-white border-orange-200 focus:ring-2 focus:ring-orange-400">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        {['AM','PM'].map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">Students will see both date and time.</p>
                </div>
              </div>
            </TabsContent>

            </div>
          </Tabs>

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

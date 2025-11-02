import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProjectFormData, Project, RequiredSkill } from '../types/projects';
import { useAuth } from '@/hooks/useAuth';
import { projectService } from '../services/projectService';
import { toast } from 'sonner';
import StepOne from './create-steps/StepOne';
import StepTwo from './create-steps/StepTwo';
import StepThree from './create-steps/StepThree';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Edit, Check, X, Loader2, History } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProjectOverviewTab from './detail-tabs/ProjectOverviewTab';
import ProjectMembersTab from './detail-tabs/ProjectMembersTab';
import ProjectSkillsTab from './detail-tabs/ProjectSkillsTab';
import ProjectHistoryTab from './detail-tabs/ProjectHistoryTab';
interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  prefilledSubskills?: {
    skill_id: string;
    subskill_id: string;
  }[];
  prefilledUserIds?: string[];
  editMode?: Project;
  viewMode?: boolean;
  projectId?: string | null;
  userRole?: string;
}
export default function ProjectCreateDialog({
  open,
  onOpenChange,
  onSuccess,
  prefilledSubskills = [],
  prefilledUserIds = [],
  editMode,
  viewMode = false,
  projectId,
  userRole = ''
}: ProjectCreateDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [isEditingFromView, setIsEditingFromView] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const {
    profile
  } = useAuth();
  const stepTwoRef = useRef<HTMLDivElement>(null);
  const stepThreeRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    required_skills: [],
    members: []
  });

  // Load project data when in view mode
  useEffect(() => {
    if (open && viewMode && projectId) {
      loadProject();
    } else if (!open) {
      resetForm();
      setIsEditingFromView(false);
      setProject(null);
      setShowRejectForm(false);
      setRejectionReason('');
      setShowApprovalForm(false);
      setApprovalComment('');
    }
  }, [open, viewMode, projectId]);

  // Populate form data when in edit mode
  useEffect(() => {
    if (open && (editMode || isEditingFromView && project)) {
      const dataToEdit = editMode || project;
      if (dataToEdit) {
        setFormData({
          name: dataToEdit.name,
          description: dataToEdit.description || '',
          start_date: dataToEdit.start_date || '',
          end_date: dataToEdit.end_date || '',
          required_skills: dataToEdit.required_skills,
          members: dataToEdit.members.map(m => ({
            user_id: m.user_id,
            allocation_percentage: m.allocation_percentage
          }))
        });
      }
    } else if (!open) {
      resetForm();
    }
  }, [open, editMode, isEditingFromView, project]);

  // Update formData when prefilled data changes and dialog opens
  useEffect(() => {
    if (open && !editMode && (prefilledSubskills.length > 0 || prefilledUserIds.length > 0)) {
      // Load subskills data to map prefilled IDs to full skill data
      const loadPrefilledSkills = async () => {
        if (prefilledSubskills.length > 0) {
          const {
            data: subskillsData
          } = await supabase.from('subskills').select('id, name, skills!inner(id, name)').in('id', prefilledSubskills.map(ps => ps.subskill_id));
          const prefilledSkills: RequiredSkill[] = prefilledSubskills.map(ps => {
            const subskill = subskillsData?.find((s: any) => s.id === ps.subskill_id);
            if (!subskill) return null;
            return {
              skill_id: ps.skill_id,
              skill_name: (subskill as any).skills.name,
              subskill_id: ps.subskill_id,
              subskill_name: (subskill as any).name,
              required_rating: 'medium'
            } as RequiredSkill;
          }).filter((s): s is RequiredSkill => s !== null);
          setFormData(prev => ({
            ...prev,
            required_skills: prefilledSkills,
            members: prefilledUserIds.map(userId => ({
              user_id: userId,
              allocation_percentage: 25 as const
            }))
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            members: prefilledUserIds.map(userId => ({
              user_id: userId,
              allocation_percentage: 25 as const
            }))
          }));
        }
      };
      loadPrefilledSkills();
    }
  }, [open, prefilledSubskills, prefilledUserIds, editMode]);

  // Auto-scroll to next section when current section is complete
  useEffect(() => {
    if (formData.name && formData.description && formData.start_date && stepTwoRef.current) {
      setTimeout(() => {
        stepTwoRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [formData.name, formData.description, formData.start_date]);
  useEffect(() => {
    if (formData.required_skills.length > 0 && stepThreeRef.current) {
      setTimeout(() => {
        stepThreeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [formData.required_skills.length]);
  const loadProject = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async () => {
    if (!projectId || !project) return;
    try {
      setLoading(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      await projectService.updateProjectStatus(projectId, 'active', user.id, approvalComment.trim() || undefined);
      toast.success('Project approved');
      onSuccess();
      onOpenChange(false);
      setShowApprovalForm(false);
      setApprovalComment('');
    } catch (error) {
      console.error('Error approving project:', error);
      toast.error('Failed to approve project');
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async () => {
    if (!projectId || !project || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setLoading(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      await projectService.updateProjectStatus(projectId, 'rejected', user.id, rejectionReason);
      toast.success('Project rejected');
      onSuccess();
      onOpenChange(false);
      setShowRejectForm(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast.error('Failed to reject project');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    if (!profile) return;
    if (formData.members.length === 0) {
      toast.error('Please assign at least one team member');
      return;
    }
    try {
      setSubmitting(true);
      const projectToUpdate = editMode || isEditingFromView && project;
      if (projectToUpdate) {
        await projectService.updateProject(projectToUpdate.id, formData);
        toast.success('Project updated successfully');
        if (isEditingFromView) {
          setIsEditingFromView(false);
          await loadProject();
        }
      } else {
        await projectService.createProject(formData, profile.user_id);
        toast.success('Project created and sent for approval');
      }
      if (!isEditingFromView) {
        onOpenChange(false);
      }
      onSuccess();
      resetForm();
    } catch (error) {
      console.error(`Error ${editMode || isEditingFromView ? 'updating' : 'creating'} project:`, error);
      toast.error(`Failed to ${editMode || isEditingFromView ? 'update' : 'create'} project`);
    } finally {
      setSubmitting(false);
    }
  };
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      required_skills: [],
      members: []
    });
  };
  const canSubmit = formData.required_skills.length > 0 && formData.name && formData.description && formData.start_date && formData.members.length > 0;
  const canApprove = ['management', 'admin'].includes(userRole) && project?.status === 'awaiting_approval';
  const canEdit = ['tech_lead', 'management', 'admin'].includes(userRole) && project?.status === 'awaiting_approval' || ['tech_lead', 'management', 'admin'].includes(userRole) && project?.status === 'active';

  // View mode - 2-column layout like create mode
  if (viewMode && project && !isEditingFromView) {
    return <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-[min(1296px,90vw)] w-full h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <DialogTitle>{project.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(true)}>
                    <History className="mr-2 h-4 w-4" />
                    View History
                  </Button>
                  <Badge variant={project.status === 'active' ? 'default' : project.status === 'awaiting_approval' ? 'secondary' : project.status === 'rejected' ? 'destructive' : 'outline'}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0 py-4 px-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left Column: Overview & Skills */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Overview</h3>
                    <ProjectOverviewTab project={project} />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Required Skills</h3>
                    <ProjectSkillsTab project={project} />
                  </div>
                </div>

                {/* Right Column: Team Members */}
                <div className="space-y-3 overflow-y-auto h-full">
                  
                  <ProjectMembersTab project={project} />
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 pt-4 border-t">
              {canApprove && (
                <div className="space-y-3">
                  {showApprovalForm ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Approval Comment (Optional)</Label>
                        <Textarea value={approvalComment} onChange={e => setApprovalComment(e.target.value)} placeholder="Add any comments..." rows={3} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowApprovalForm(false)}>Cancel</Button>
                        <Button onClick={handleApprove}>
                          <Check className="mr-2 h-4 w-4" />
                          Confirm Approval
                        </Button>
                      </div>
                    </div>
                  ) : showRejectForm ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Rejection Reason</Label>
                        <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Explain why..." rows={3} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                          <X className="mr-2 h-4 w-4" />
                          Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setShowApprovalForm(true)}>
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="outline" onClick={() => setShowRejectForm(true)}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {canEdit && (
                <div className={`flex justify-end ${canApprove ? 'mt-3' : ''}`}>
                  <Button variant="outline" onClick={() => setIsEditingFromView(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* History Modal */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="max-w-[min(896px,90vw)] w-full max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Project History</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <ProjectHistoryTab projectId={project.id} />
            </div>
          </DialogContent>
        </Dialog>
      </>;
  }

  // Create/Edit mode
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(1296px,90vw)] w-full h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isEditingFromView ? 'Edit Project' : editMode ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-4 px-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column: Project Details & Skills */}
            <div className="space-y-6 min-h-0">
              {/* Section 1: Project Details */}
              <div className="space-y-3">
                
                <StepTwo formData={formData} setFormData={setFormData} />
              </div>

              <Separator />

              {/* Section 2: Skills Selection */}
              <div ref={stepTwoRef} className="space-y-3">
                <h3 className="text-base font-semibold">Required Skills</h3>
                <StepOne formData={formData} setFormData={setFormData} prefilledSubskills={prefilledSubskills} />
              </div>
            </div>

            {/* Right Column: Team Members */}
            <div ref={stepThreeRef} className="space-y-3 flex flex-col h-full min-h-[500px]">
              <h3 className="text-base font-semibold flex-shrink-0">Team Members</h3>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <StepThree formData={formData} setFormData={setFormData} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2 pt-3 border-t">
          {isEditingFromView && <Button variant="outline" onClick={() => setIsEditingFromView(false)}>
              Back to View
            </Button>}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
            {submitting ? editMode || isEditingFromView ? 'Updating...' : 'Creating...' : editMode || isEditingFromView ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}
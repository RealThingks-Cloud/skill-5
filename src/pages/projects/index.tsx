import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, CheckCircle, Target, XCircle, Users, Trash2, Briefcase, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProjects } from './hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProjectCreateDialog from './components/ProjectCreateDialog';
import ResourceInsightsModal from './components/ResourceInsightsModal';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
const Projects = () => {
  const [activeTab, setActiveTab] = useState<'awaiting' | 'active' | 'completed' | 'rejected'>('active');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [resourceInsightsOpen, setResourceInsightsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const {
    projects,
    loading,
    refreshProjects,
    deleteProject
  } = useProjects();
  const {
    profile
  } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const confirmDelete = async () => {
    if (projectToDelete) {
      const success = await deleteProject(projectToDelete);
      if (success) {
        setProjectToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>;
  }
  const awaitingProjects = projects.filter(p => p.status === 'awaiting_approval');
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const rejectedProjects = projects.filter(p => p.status === 'rejected');
  const stats = {
    awaiting: awaitingProjects.length,
    active: activeProjects.length,
    completed: completedProjects.length,
    rejected: rejectedProjects.length,
    total: projects.length
  };
  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewDialogOpen(true);
  };
  const getStatusConfig = (status: string) => {
    const configs = {
      awaiting_approval: {
        color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        label: 'Awaiting Approval'
      },
      active: {
        color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        label: 'Active'
      },
      completed: {
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        label: 'Completed'
      },
      rejected: {
        color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        label: 'Rejected'
      }
    };
    return configs[status as keyof typeof configs] || {
      color: 'bg-muted text-muted-foreground border-muted',
      label: status
    };
  };
  const getLoadColor = (percentage: number) => {
    if (percentage >= 75) return 'text-red-600 dark:text-red-400';
    if (percentage >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };
  const renderProjectCard = (project: any) => {
    const totalAllocation = project.members.reduce((sum: number, m: any) => sum + m.allocation_percentage, 0);
    const avgAllocation = project.members.length > 0 ? Math.round(totalAllocation / project.members.length) : 0;
    const statusConfig = getStatusConfig(project.status);
    return <Card key={project.id} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer relative group overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className="p-5 space-y-4" onClick={() => handleProjectClick(project.id)}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">{project.name}</h3>
              {project.description && <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={`${statusConfig.color} shrink-0 text-xs border font-medium`}>
                {statusConfig.label}
              </Badge>
              {isAdmin && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" onClick={e => {
              e.stopPropagation();
              setProjectToDelete(project.id);
              setDeleteDialogOpen(true);
            }}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Users className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Members</span>
                <span className="text-sm font-semibold">{project.members.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Briefcase className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Skills</span>
                <span className="text-sm font-semibold">{project.required_skills.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Avg Load</span>
                <span className={`text-sm font-semibold ${getLoadColor(avgAllocation)}`}>
                  {avgAllocation}%
                </span>
              </div>
            </div>
          </div>

          {/* Load Progress Bar */}
          {avgAllocation > 0 && <div className="space-y-1">
              <Progress value={avgAllocation} className="h-1.5" />
            </div>}

          {/* Timeline */}
          {(project.start_date || project.end_date) && <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {project.start_date || 'TBD'} → {project.end_date || 'Ongoing'}
              </span>
            </div>}
        </CardContent>
      </Card>;
  };
  const canCreateProject = ['tech_lead', 'management', 'admin'].includes(profile?.role || '');
  return <div className="h-full flex flex-col">
      <div className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
        </div>
        <div className="flex items-center gap-2">
          {canCreateProject && <>
              <Button variant="outline" size="sm" onClick={() => setResourceInsightsOpen(true)}>
                <Users className="mr-2 h-4 w-4" />
                Resource Insights
              </Button>
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </>}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 justify-start">
            <TabsTrigger value="awaiting">
              <Clock className="mr-2 h-4 w-4" />
              Pending ({stats.awaiting})
            </TabsTrigger>
            <TabsTrigger value="active">
              <Target className="mr-2 h-4 w-4" />
              Active ({stats.active})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed ({stats.completed})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="mr-2 h-4 w-4" />
              Rejected ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="awaiting" className="mt-0">
              {awaitingProjects.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {awaitingProjects.map(renderProjectCard)}
                </div> : <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No projects awaiting approval</p>
                </div>}
            </TabsContent>

            <TabsContent value="active" className="mt-0">
              {activeProjects.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeProjects.map(renderProjectCard)}
                </div> : <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">No active projects</p>
                  {canCreateProject && <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Project
                    </Button>}
                </div>}
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              {completedProjects.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedProjects.map(renderProjectCard)}
                </div> : <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No completed projects yet</p>
                </div>}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {rejectedProjects.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rejectedProjects.map(renderProjectCard)}
                </div> : <div className="text-center py-12">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No rejected projects</p>
                </div>}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ProjectCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={refreshProjects} />

      <ProjectCreateDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} onSuccess={refreshProjects} viewMode={true} projectId={selectedProjectId} userRole={profile?.role || ''} />

      <ResourceInsightsModal open={resourceInsightsOpen} onOpenChange={setResourceInsightsOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Projects;
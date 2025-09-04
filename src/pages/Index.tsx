import { useState } from "react";
import { TeamMember, Skill, SkillAssignment, SkillLevel } from "@/types";
import { Header } from "@/components/Header";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { SkillMatrix } from "@/components/SkillMatrix";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { AddSkillDialog } from "@/components/AddSkillDialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Alice Johnson', role: 'Frontend Developer' },
    { id: '2', name: 'Bob Smith', role: 'Backend Developer' },
    { id: '3', name: 'Carol Davis', role: 'UI/UX Designer' },
  ]);

  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'React', category: 'Frontend' },
    { id: '2', name: 'TypeScript', category: 'Frontend' },
    { id: '3', name: 'Node.js', category: 'Backend' },
    { id: '4', name: 'UI Design', category: 'Design' },
    { id: '5', name: 'Python', category: 'Backend' },
  ]);

  const [assignments, setAssignments] = useState<SkillAssignment[]>([
    { memberId: '1', skillId: '1', level: 'expert' },
    { memberId: '1', skillId: '2', level: 'advanced' },
    { memberId: '1', skillId: '4', level: 'intermediate' },
    { memberId: '2', skillId: '3', level: 'expert' },
    { memberId: '2', skillId: '5', level: 'advanced' },
    { memberId: '2', skillId: '2', level: 'intermediate' },
    { memberId: '3', skillId: '4', level: 'expert' },
    { memberId: '3', skillId: '1', level: 'beginner' },
  ]);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addSkillOpen, setAddSkillOpen] = useState(false);

  const addMember = (memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: Date.now().toString(),
    };
    setMembers(prev => [...prev, newMember]);
    toast({
      title: "Team member added",
      description: `${memberData.name} has been added to the team.`,
    });
  };

  const addSkill = (skillData: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skillData,
      id: Date.now().toString(),
    };
    setSkills(prev => [...prev, newSkill]);
    toast({
      title: "Skill added",
      description: `${skillData.name} has been added to the skill list.`,
    });
  };

  const updateAssignment = (memberId: string, skillId: string, level: SkillLevel) => {
    setAssignments(prev => {
      const existingIndex = prev.findIndex(a => a.memberId === memberId && a.skillId === skillId);
      if (existingIndex >= 0) {
        if (level === 'none') {
          return prev.filter((_, index) => index !== existingIndex);
        } else {
          return prev.map((assignment, index) => 
            index === existingIndex ? { ...assignment, level } : assignment
          );
        }
      } else if (level !== 'none') {
        return [...prev, { memberId, skillId, level }];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddMember={() => setAddMemberOpen(true)}
        onAddSkill={() => setAddSkillOpen(true)}
        totalMembers={members.length}
        totalSkills={skills.length}
      />
      
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 bg-gradient-card border-0 shadow-card">
              <h3 className="font-semibold mb-3 text-foreground">Team Members</h3>
              <div className="space-y-3">
                {members.map(member => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
                {members.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No team members yet
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <SkillMatrix
              members={members}
              skills={skills}
              assignments={assignments}
              onUpdateAssignment={updateAssignment}
            />
          </div>
        </div>
      </main>

      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        onAddMember={addMember}
      />

      <AddSkillDialog
        open={addSkillOpen}
        onOpenChange={setAddSkillOpen}
        onAddSkill={addSkill}
      />
    </div>
  );
};

export default Index;
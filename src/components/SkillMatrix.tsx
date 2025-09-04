import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember, Skill, SkillAssignment, SkillLevel, SKILL_LEVELS } from "@/types";
import { SkillLevelBadge } from "./SkillLevelBadge";
import { User } from "lucide-react";

interface SkillMatrixProps {
  members: TeamMember[];
  skills: Skill[];
  assignments: SkillAssignment[];
  onUpdateAssignment: (memberId: string, skillId: string, level: SkillLevel) => void;
}

export const SkillMatrix = ({ members, skills, assignments, onUpdateAssignment }: SkillMatrixProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(skills.map(skill => skill.category)))];
  const filteredSkills = selectedCategory === "all" 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  const getAssignment = (memberId: string, skillId: string): SkillLevel => {
    const assignment = assignments.find(a => a.memberId === memberId && a.skillId === skillId);
    return assignment?.level || 'none';
  };

  const updateSkillLevel = (memberId: string, skillId: string, currentLevel: SkillLevel) => {
    const currentIndex = SKILL_LEVELS.indexOf(currentLevel);
    const nextIndex = (currentIndex + 1) % SKILL_LEVELS.length;
    const newLevel = SKILL_LEVELS[nextIndex];
    onUpdateAssignment(memberId, skillId, newLevel);
  };

  if (members.length === 0 || skills.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-card border-0 shadow-card">
        <div className="text-muted-foreground">
          {members.length === 0 && skills.length === 0 
            ? "Add team members and skills to get started with your skill matrix."
            : members.length === 0 
            ? "Add team members to start building your skill matrix."
            : "Add skills to start tracking team expertise."}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skill Matrix</h2>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.slice(1).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden bg-gradient-card border-0 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-semibold min-w-48">Team Member</th>
                {filteredSkills.map(skill => (
                  <th key={skill.id} className="text-center p-4 font-semibold min-w-32">
                    <div className="space-y-1">
                      <div className="font-medium">{skill.name}</div>
                      <div className="text-xs text-muted-foreground">{skill.category}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                  </td>
                  {filteredSkills.map(skill => {
                    const level = getAssignment(member.id, skill.id);
                    return (
                      <td key={skill.id} className="p-4 text-center">
                        <SkillLevelBadge 
                          level={level} 
                          interactive
                          onClick={() => updateSkillLevel(member.id, skill.id, level)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        💡 Tip: Click on skill level badges to cycle through proficiency levels
      </div>
    </div>
  );
};
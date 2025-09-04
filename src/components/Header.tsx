import { Button } from "@/components/ui/button";
import { Plus, Users, Award } from "lucide-react";

interface HeaderProps {
  onAddMember: () => void;
  onAddSkill: () => void;
  totalMembers: number;
  totalSkills: number;
}

export const Header = ({ onAddMember, onAddSkill, totalMembers, totalSkills }: HeaderProps) => {
  return (
    <header className="bg-gradient-header text-white p-6 shadow-card">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Skill Matrix Dashboard</h1>
            <p className="text-gray-200">Track and visualize your team's skills and expertise</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={onAddSkill}
              variant="secondary"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
            <Button 
              onClick={onAddMember}
              className="bg-primary hover:bg-primary-hover shadow-primary transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
        
        <div className="flex gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-200" />
            <span className="font-semibold">{totalMembers} Team Members</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <Award className="w-5 h-5 text-blue-200" />
            <span className="font-semibold">{totalSkills} Skills</span>
          </div>
        </div>
      </div>
    </header>
  );
};
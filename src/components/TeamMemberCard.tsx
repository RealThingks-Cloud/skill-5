import { Card } from "@/components/ui/card";
import { TeamMember } from "@/types";
import { User } from "lucide-react";

interface TeamMemberCardProps {
  member: TeamMember;
}

export const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
  return (
    <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-hover transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          {member.avatar ? (
            <img 
              src={member.avatar} 
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{member.role}</p>
        </div>
      </div>
    </Card>
  );
};
import { cn } from "@/lib/utils";
import { SkillLevel, SKILL_LEVEL_LABELS } from "@/types";

interface SkillLevelBadgeProps {
  level: SkillLevel;
  onClick?: () => void;
  interactive?: boolean;
}

export const SkillLevelBadge = ({ level, onClick, interactive = false }: SkillLevelBadgeProps) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200";
  
  const levelClasses = {
    none: "bg-skill-none text-gray-600",
    beginner: "bg-skill-beginner text-white",
    intermediate: "bg-skill-intermediate text-white", 
    advanced: "bg-skill-advanced text-white",
    expert: "bg-skill-expert text-white"
  };
  
  const hoverClasses = interactive ? "hover:scale-105 hover:shadow-md cursor-pointer" : "";
  
  return (
    <span
      className={cn(baseClasses, levelClasses[level], hoverClasses)}
      onClick={onClick}
    >
      {SKILL_LEVEL_LABELS[level]}
    </span>
  );
};
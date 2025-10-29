import { Button } from "@/components/ui/button";
import { Download, UserPlus } from "lucide-react";
interface SkillExplorerHeaderProps {
  onExport: () => void;
}
export function SkillExplorerHeader({
  onExport
}: SkillExplorerHeaderProps) {
  return <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Skill Explorer</h1>
        
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="default" onClick={onExport} className="gap-2 transition-all hover:scale-105">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="default" className="gap-2 transition-all hover:scale-105">
          <UserPlus className="h-4 w-4" />
          Add to Project
        </Button>
      </div>
    </div>;
}
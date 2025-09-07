import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Download, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddCategoryModal } from "./AddCategoryModal";
import type { SkillCategory, Skill, Subskill } from "@/types/database";

interface ImportExportBarProps {
  categories: SkillCategory[];
  skills: Skill[];
  subskills: Subskill[];
  onRefresh: () => void;
}

export const ImportExportBar = ({
  categories,
  skills,
  subskills,
  onRefresh
}: ImportExportBarProps) => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  const exportToCSV = () => {
    const csvData: any[] = [];
    
    categories.forEach(category => {
      const categorySkills = skills.filter(s => s.category_id === category.id);
      
      if (categorySkills.length === 0) {
        csvData.push({
          "Category": category.name,
          "Skill": "",
          "Subskill": "",
          "Description": category.description || ""
        });
      }
      
      categorySkills.forEach(skill => {
        const skillSubskills = subskills.filter(s => s.skill_id === skill.id);
        
        if (skillSubskills.length === 0) {
          csvData.push({
            "Category": category.name,
            "Skill": skill.name,
            "Subskill": "",
            "Description": skill.description || ""
          });
        } else {
          skillSubskills.forEach(subskill => {
            csvData.push({
              "Category": category.name,
              "Skill": skill.name,
              "Subskill": subskill.name,
              "Description": subskill.description || ""
            });
          });
        }
      });
    });
    
    const headers = ["Category", "Skill", "Subskill", "Description"];
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills_hierarchy_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        
        setImportData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid CSV format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData.length) return;
    
    try {
      for (const row of importData) {
        // Create category if it doesn't exist
        let categoryId = categories.find(c => c.name === row["Category"])?.id;
        
        if (!categoryId && row["Category"]) {
          const { data: newCategory } = await supabase
            .from('skill_categories')
            .insert({ 
              name: row["Category"], 
              description: row["Skill"] ? "" : row["Description"] || '',
              color: '#3B82F6'
            })
            .select()
            .single();
          categoryId = newCategory?.id;
        }
        
        // Create skill if it doesn't exist
        let skillId: string | undefined;
        if (row["Skill"] && categoryId) {
          const existingSkill = skills.find(s => s.name === row["Skill"] && s.category_id === categoryId);
          if (!existingSkill) {
            const { data: newSkill } = await supabase
              .from('skills')
              .insert({
                name: row["Skill"],
                description: row["Subskill"] ? "" : row["Description"] || '',
                category_id: categoryId
              })
              .select()
              .single();
            skillId = newSkill?.id;
          } else {
            skillId = existingSkill.id;
          }
        }
        
        // TODO: Create subskill when table is created
        if (row["Subskill"] && skillId) {
          console.log('Would create subskill:', { name: row["Subskill"], description: row["Description"], skill_id: skillId });
          // const existingSubskill = subskills.find(s => s.name === row["Subskill"] && s.skill_id === skillId);
          // if (!existingSubskill) {
          //   await supabase
          //     .from('subskills')
          //     .insert({
          //       name: row["Subskill"],
          //       description: row["Description"] || '',
          //       skill_id: skillId
          //     });
          // }
        }
      }
      
      toast({
        title: "Success",
        description: `Imported ${importData.length} items successfully`,
      });
      
      setShowImportDialog(false);
      setImportData([]);
      setImportFile(null);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => setShowAddCategory(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Category
      </Button>
      
      <Button variant="outline" onClick={exportToCSV}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Skills Hierarchy from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <p className="text-sm text-muted-foreground mt-1">
                CSV should have columns: Category, Skill, Subskill, Description
              </p>
            </div>
            
            {importData.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Preview ({importData.length} rows)</h4>
                <ScrollArea className="h-40 border rounded-md p-2">
                  <div className="space-y-1">
                    {importData.slice(0, 10).map((row, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        <strong>{row["Category"]}</strong>
                        {row["Skill"] && <> → {row["Skill"]}</>}
                        {row["Subskill"] && <> → {row["Subskill"]}</>}
                      </div>
                    ))}
                    {importData.length > 10 && (
                      <div className="text-sm text-muted-foreground">
                        ... and {importData.length - 10} more
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <Button onClick={handleImport} className="w-full mt-4">
                  Import {importData.length} Items
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddCategoryModal
        open={showAddCategory}
        onOpenChange={setShowAddCategory}
        onSuccess={() => {
          setShowAddCategory(false);
          onRefresh();
        }}
      />
    </div>
  );
};
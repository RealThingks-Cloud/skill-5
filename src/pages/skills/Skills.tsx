import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { SkillCategory, Skill, UserSkill } from "@/types/database";

const Skills = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showManageSkills, setShowManageSkills] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDescription, setNewSkillDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  
  const { profile, isManagerOrAbove } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Fetch skill categories
      const { data: categoriesData } = await supabase
        .from('skill_categories')
        .select('*')
        .order('name');
      
      // Fetch skills with categories
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*, category:skill_categories(*)')
        .order('name');
      
      // Fetch user skills if employee/tech lead
      let userSkillsData: any[] = [];
      if (profile.user_id) {
        const { data } = await supabase
          .from('user_skills')
          .select('*, skill:skills(*)')
          .eq('user_id', profile.user_id);
        userSkillsData = data || [];
      }
      
      setSkillCategories(categoriesData || []);
      setSkills(skillsData || []);
      setUserSkills(userSkillsData as UserSkill[]);
      
      // Expand all categories by default
      if (categoriesData) {
        setExpandedCategories(new Set(categoriesData.map(c => c.id)));
      }
    } catch (error) {
      console.error('Error fetching skills data:', error);
      toast({
        title: "Error",
        description: "Failed to load skills data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('skill_categories')
        .insert({
          name: newCategoryName,
          description: newCategoryDescription,
          color: '#3B82F6'
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      
      setShowAddCategory(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim() || !selectedCategory) return;
    
    try {
      const { error } = await supabase
        .from('skills')
        .insert({
          name: newSkillName,
          description: newSkillDescription,
          category_id: selectedCategory
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
      
      setShowAddSkill(false);
      setNewSkillName("");
      setNewSkillDescription("");
      setSelectedCategory("");
      fetchData();
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (category: SkillCategory) => {
    if (!category.name.trim()) return;
    
    try {
      const { error } = await supabase
        .from('skill_categories')
        .update({
          name: category.name,
          description: category.description
        })
        .eq('id', category.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('skill_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleEditSkill = async (skill: Skill) => {
    if (!skill.name.trim()) return;
    
    try {
      const { error } = await supabase
        .from('skills')
        .update({
          name: skill.name,
          description: skill.description,
          category_id: skill.category_id
        })
        .eq('id', skill.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Skill updated successfully",
      });
      
      setEditingSkill(null);
      fetchData();
    } catch (error) {
      console.error('Error updating skill:', error);
      toast({
        title: "Error",
        description: "Failed to update skill",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    }
  };

  const handleRateSkill = async (skillId: string, rating: 'high' | 'medium' | 'low') => {
    if (!profile?.user_id) return;
    
    try {
      const existingUserSkill = userSkills.find(us => us.skill_id === skillId);
      
      if (existingUserSkill) {
        const { error } = await supabase
          .from('user_skills')
          .update({ rating })
          .eq('id', existingUserSkill.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_skills')
          .insert({
            user_id: profile.user_id,
            skill_id: skillId,
            rating,
            status: 'draft'
          });
        
        if (error) throw error;
      }
      
      fetchData();
    } catch (error) {
      console.error('Error rating skill:', error);
      toast({
        title: "Error",
        description: "Failed to update skill rating",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getSkillsByCategory = (categoryId: string) => {
    return skills.filter(skill => skill.category_id === categoryId);
  };

  const getUserSkillRating = (skillId: string) => {
    const userSkill = userSkills.find(us => us.skill_id === skillId);
    return userSkill?.rating;
  };

  const filteredCategories = skillCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSkillsByCategory(category.id).some(skill =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 text-muted-foreground">
          Loading skills...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills Management</h1>
          <p className="text-muted-foreground">
            {isManagerOrAbove ? "Manage and track skills across your organization" : "View and rate your skills"}
          </p>
        </div>
        {isManagerOrAbove && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowManageCategories(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
            
            <Button onClick={() => setShowManageSkills(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Manage Skills
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {skillCategories.length === 0 ? "No skill categories found. Add one to get started." : "No skills found matching your search."}
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category) => {
            const categorySkills = getSkillsByCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <Card key={category.id}>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {categorySkills.length} skills
                    </Badge>
                  </div>
                  {category.description && (
                    <CardDescription>{category.description}</CardDescription>
                  )}
                </CardHeader>
                
                {isExpanded && (
                  <CardContent>
                    {categorySkills.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No skills in this category yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {categorySkills.map((skill) => {
                          const userRating = getUserSkillRating(skill.id);
                          
                          return (
                            <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{skill.name}</h4>
                                {skill.description && (
                                  <p className="text-sm text-muted-foreground">{skill.description}</p>
                                )}
                              </div>
                              
                              {!isManagerOrAbove && (
                                <div className="flex gap-2">
                                  {(['high', 'medium', 'low'] as const).map((rating) => (
                                    <Button
                                      key={rating}
                                      variant={userRating === rating ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleRateSkill(skill.id, rating)}
                                    >
                                      {rating === 'high' ? 'High' : rating === 'medium' ? 'Mid' : 'Low'}
                                    </Button>
                                  ))}
                                </div>
                              )}
                              
                              {userRating && (
                                <Badge variant="outline">
                                  Rated: {userRating === 'high' ? 'High' : userRating === 'medium' ? 'Mid' : 'Low'}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Manage Categories Dialog */}
      <Dialog open={showManageCategories} onOpenChange={setShowManageCategories}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Existing Categories</h3>
              <Button onClick={() => setShowAddCategory(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Category
              </Button>
            </div>
            <div className="space-y-2">
              {skillCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    {editingCategory?.id === category.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                          placeholder="Category name"
                        />
                        <Textarea
                          value={editingCategory.description || ''}
                          onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                          placeholder="Category description"
                        />
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {editingCategory?.id === category.id ? (
                      <>
                        <Button size="sm" onClick={() => handleEditCategory(editingCategory)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Skills Dialog */}
      <Dialog open={showManageSkills} onOpenChange={setShowManageSkills}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Skills</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Existing Skills</h3>
              <Button onClick={() => setShowAddSkill(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Skill
              </Button>
            </div>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    {editingSkill?.id === skill.id ? (
                      <div className="space-y-2">
                        <select
                          value={editingSkill.category_id}
                          onChange={(e) => setEditingSkill({...editingSkill, category_id: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {skillCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={editingSkill.name}
                          onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                          placeholder="Skill name"
                        />
                        <Textarea
                          value={editingSkill.description || ''}
                          onChange={(e) => setEditingSkill({...editingSkill, description: e.target.value})}
                          placeholder="Skill description"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{skill.name}</h4>
                          <Badge variant="outline">
                            {skillCategories.find(c => c.id === skill.category_id)?.name}
                          </Badge>
                        </div>
                        {skill.description && (
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {editingSkill?.id === skill.id ? (
                      <>
                        <Button size="sm" onClick={() => handleEditSkill(editingSkill)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingSkill(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditingSkill(skill)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSkill(skill.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Frontend Development"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Category description..."
              />
            </div>
            <Button onClick={handleAddCategory} className="w-full">
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Skill Dialog */}
      <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="skillCategory">Category</Label>
              <select
                id="skillCategory"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a category</option>
                {skillCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="skillName">Skill Name</Label>
              <Input
                id="skillName"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g., React"
              />
            </div>
            <div>
              <Label htmlFor="skillDescription">Description</Label>
              <Textarea
                id="skillDescription"
                value={newSkillDescription}
                onChange={(e) => setNewSkillDescription(e.target.value)}
                placeholder="Skill description..."
              />
            </div>
            <Button onClick={handleAddSkill} className="w-full">
              Add Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Skills;
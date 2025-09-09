import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CategoryCard } from "./components/CategoryCard";
import { CategoryModal } from "./components/CategoryModal";
import { AddCategoryModal } from "./components/admin/AddCategoryModal";
import { ActionMenu } from "./components/admin/ActionMenu";
import { useSkills } from "./hooks/useSkills";
import type { SkillCategory } from "@/types/database";
const Skills = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const {
    isManagerOrAbove,
    profile
  } = useAuth();
  const {
    skillCategories,
    skills,
    subskills,
    userSkills,
    pendingRatings,
    loading,
    fetchData,
    handleSkillRate,
    handleSubskillRate,
    handleSaveRatings,
    setPendingRatings
  } = useSkills();
  const handleCategoryClick = (category: SkillCategory) => {
    setSelectedCategory(category);
  };
  const handleCloseModal = () => {
    setSelectedCategory(null);
    setPendingRatings(new Map()); // Clear pending ratings when closing modal
  };

  // Filter categories based on search
  const filteredCategories = skillCategories.filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()) || category.description?.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading skills...</p>
        </div>
      </div>;
  }
  return <>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Skills Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your skills across {skillCategories.length} categories
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {isManagerOrAbove && (
              <ActionMenu categories={skillCategories} skills={skills} subskills={subskills} onRefresh={fetchData} />
            )}
          </div>
        </div>

        {/* Enhanced Category Cards Grid */}
        <div className="flex-1 overflow-y-auto">
          <motion.div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 p-6 h-fit" layout>
            <AnimatePresence mode="popLayout">
              {filteredCategories.length === 0 ? (
                <motion.div 
                  className="col-span-full flex flex-col items-center justify-center py-16 text-center" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {skillCategories.length === 0 ? "No Categories Yet" : "No Results Found"}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {skillCategories.length === 0 ? "Get started by creating your first skill category." : "Try adjusting your search terms to find what you're looking for."}
                  </p>
                  {isManagerOrAbove && skillCategories.length === 0 && (
                    <Button onClick={() => setShowAddCategory(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Category
                    </Button>
                  )}
                </motion.div>
              ) : (
                filteredCategories.map((category, index) => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    skillCount={skills.filter(skill => skill.category_id === category.id).length}
                    subskills={subskills}
                    isManagerOrAbove={isManagerOrAbove} 
                    onClick={() => handleCategoryClick(category)} 
                    onRefresh={fetchData} 
                    index={index}
                    userSkills={userSkills}
                    skills={skills}
                  />
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {selectedCategory && <CategoryModal category={selectedCategory} skills={skills.filter(skill => skill.category_id === selectedCategory.id)} subskills={subskills} userSkills={userSkills} pendingRatings={pendingRatings} isManagerOrAbove={isManagerOrAbove} profile={profile as any} onClose={handleCloseModal} onSkillRate={handleSkillRate} onSubskillRate={handleSubskillRate} onSaveRatings={handleSaveRatings} onRefresh={fetchData} />}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AddCategoryModal open={showAddCategory} onOpenChange={setShowAddCategory} onSuccess={() => {
      setShowAddCategory(false);
      fetchData();
    }} />
    </>;
};
export default Skills;
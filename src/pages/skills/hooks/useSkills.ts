import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { SkillCategory, Skill, Subskill, UserSkill } from "@/types/database";

export const useSkills = () => {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [subskills, setSubskills] = useState<Subskill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [pendingRatings, setPendingRatings] = useState<Map<string, { type: 'skill' | 'subskill', id: string, rating: 'high' | 'medium' | 'low' }>>(new Map());
  const [loading, setLoading] = useState(true);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);

      // Fetch skill categories
      const { data: categoriesData } = await supabase
        .from('skill_categories')
        .select('*')
        .order('name');

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      // Fetch subskills
      const { data: subskillsData } = await supabase
        .from('subskills' as any)
        .select('*')
        .order('name');

      // Fetch user skills for current user
      let userSkillsData: any[] = [];
      if (profile.user_id) {
        const { data } = await supabase
          .from('user_skills')
          .select(`
            *,
            skill:skills(*),
            subskill:subskills(*),
            approver:profiles(*)
          `)
          .eq('user_id', profile.user_id);
        userSkillsData = data || [];
      }

      setSkillCategories(categoriesData || []);
      setSkills(skillsData || []);
      setSubskills(subskillsData as unknown as Subskill[] || []);
      setUserSkills(userSkillsData as UserSkill[]);
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

  useEffect(() => {
    fetchData();
  }, [profile]);

  const handleSkillRate = (skillId: string, rating: 'high' | 'medium' | 'low') => {
    if (!profile?.user_id) return;
    
    setPendingRatings(prev => {
      const newRatings = new Map(prev);
      newRatings.set(skillId, { type: 'skill', id: skillId, rating });
      return newRatings;
    });
  };

  const handleSubskillRate = (subskillId: string, rating: 'high' | 'medium' | 'low') => {
    if (!profile?.user_id) return;
    
    setPendingRatings(prev => {
      const newRatings = new Map(prev);
      newRatings.set(subskillId, { type: 'subskill', id: subskillId, rating });
      return newRatings;
    });
  };

  const handleSaveRatings = async () => {
    if (!profile?.user_id || pendingRatings.size === 0) return;

    try {
      const ratingsToSave = Array.from(pendingRatings.values());
      
      for (const rating of ratingsToSave) {
        if (rating.type === 'skill') {
          const existingRating = userSkills.find(us => us.skill_id === rating.id && !us.subskill_id);
          
          if (existingRating) {
            const { error } = await supabase
              .from('user_skills')
              .update({ 
                rating: rating.rating,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingRating.id);
            
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('user_skills')
              .insert({
                user_id: profile.user_id,
                skill_id: rating.id,
                rating: rating.rating,
                status: 'draft'
              });
            
            if (error) throw error;
          }
        } else {
          // Handle subskill rating
          const subskill = subskills.find(s => s.id === rating.id);
          if (!subskill) continue;

          const existingRating = userSkills.find(us => us.subskill_id === rating.id);
          
          if (existingRating) {
            const { error } = await supabase
              .from('user_skills')
              .update({ 
                rating: rating.rating,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingRating.id);
            
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('user_skills')
              .insert({
                user_id: profile.user_id,
                skill_id: subskill.skill_id,
                subskill_id: rating.id,
                rating: rating.rating,
                status: 'draft'
              });
            
            if (error) throw error;
          }
        }
      }

      toast({
        title: "✅ Ratings saved successfully",
        description: `${ratingsToSave.length} rating${ratingsToSave.length > 1 ? 's' : ''} saved`,
      });

      setPendingRatings(new Map());
      fetchData();
    } catch (error) {
      console.error('Error saving ratings:', error);
      toast({
        title: "Error",
        description: "Failed to save ratings",
        variant: "destructive",
      });
    }
  };

  return {
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
  };
};
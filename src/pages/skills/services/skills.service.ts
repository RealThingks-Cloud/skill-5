import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, Skill, Subskill } from "@/types/database";

export class SkillsService {
  static async getCategories(): Promise<SkillCategory[]> {
    const { data, error } = await supabase
      .from('skill_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getSkills(): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getSubskills(): Promise<Subskill[]> {
    const { data, error } = await supabase
      .from('subskills' as any)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return (data || []) as unknown as Subskill[];
  }

  static async createCategory(name: string, description?: string): Promise<SkillCategory> {
    const { data, error } = await supabase
      .from('skill_categories')
      .insert({ name, description })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createSkill(name: string, categoryId: string, description?: string): Promise<Skill> {
    const { data, error } = await supabase
      .from('skills')
      .insert({ name, category_id: categoryId, description })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createSubskill(name: string, skillId: string, description?: string): Promise<Subskill> {
    const { data, error } = await supabase
      .from('subskills' as any)
      .insert({ name, skill_id: skillId, description })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as Subskill;
  }
}
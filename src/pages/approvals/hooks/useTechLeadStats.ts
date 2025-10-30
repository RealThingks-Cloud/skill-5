import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database";

export interface TechLeadRating {
  id: string;
  user_id: string;
  skill_id: string;
  subskill_id: string | null;
  rating: 'high' | 'medium' | 'low';
  status: 'approved' | 'rejected';
  self_comment: string | null;
  approver_comment: string | null;
  approved_at: string;
  skill?: {
    id: string;
    name: string;
    skill_categories?: {
      id: string;
      name: string;
      color: string;
    };
  };
  subskill?: {
    id: string;
    name: string;
  };
  employee?: Profile;
}

export interface TechLeadStats {
  techLeadId: string;
  techLeadName: string;
  techLeadEmail: string;
  approvedCount: number;
  rejectedCount: number;
  totalReviews: number;
  ratings: TechLeadRating[];
}

export const useTechLeadStats = () => {
  const [loading, setLoading] = useState(false);
  const [techLeadStats, setTechLeadStats] = useState<TechLeadStats[]>([]);

  const fetchTechLeadStats = async () => {
    try {
      setLoading(true);

      // First, get all unique tech lead IDs who have approved/rejected ratings
      const { data: techLeadData, error: techLeadError } = await supabase
        .from('employee_ratings')
        .select('approved_by')
        .in('status', ['approved', 'rejected'])
        .not('approved_by', 'is', null);

      if (techLeadError) {
        console.error('Error fetching tech leads:', techLeadError);
        throw techLeadError;
      }

      const uniqueTechLeadIds = [...new Set((techLeadData || []).map(r => r.approved_by).filter(Boolean) as string[])];
      console.log('Found unique tech leads:', uniqueTechLeadIds.length);

      // Fetch profiles for all tech leads
      const { data: techLeadProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', uniqueTechLeadIds);

      if (profileError) {
        console.error('Error fetching tech lead profiles:', profileError);
        throw profileError;
      }

      // For each tech lead, fetch their rating counts and details
      const statsPromises = uniqueTechLeadIds.map(async (techLeadId) => {
        // Get counts for this tech lead
        const { count: approvedCount } = await supabase
          .from('employee_ratings')
          .select('*', { count: 'exact', head: true })
          .eq('approved_by', techLeadId)
          .eq('status', 'approved');

        const { count: rejectedCount } = await supabase
          .from('employee_ratings')
          .select('*', { count: 'exact', head: true })
          .eq('approved_by', techLeadId)
          .eq('status', 'rejected');

        // Fetch detailed ratings for this tech lead
        const { data: ratings } = await supabase
          .from('employee_ratings')
          .select(`
            *,
            skill:skills (
              id,
              name,
              skill_categories (
                id,
                name,
                color
              )
            ),
            subskill:subskills (
              id,
              name
            )
          `)
          .eq('approved_by', techLeadId)
          .in('status', ['approved', 'rejected'])
          .order('approved_at', { ascending: false });

        // Fetch employee profiles for these ratings
        const employeeIds = [...new Set((ratings || []).map(r => r.user_id))];
        const { data: employeeProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', employeeIds);

        const employeeMap = (employeeProfiles || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile as Profile;
          return acc;
        }, {} as Record<string, Profile>);

        // Enrich ratings with employee profiles
        const enrichedRatings: TechLeadRating[] = (ratings || []).map(rating => ({
          ...rating as any,
          employee: employeeMap[rating.user_id]
        }));

        const techLeadProfile = techLeadProfiles?.find(p => p.user_id === techLeadId);
        
        return {
          techLeadId,
          techLeadName: techLeadProfile?.full_name || 'Unknown',
          techLeadEmail: techLeadProfile?.email || '',
          approvedCount: approvedCount || 0,
          rejectedCount: rejectedCount || 0,
          totalReviews: (approvedCount || 0) + (rejectedCount || 0),
          ratings: enrichedRatings
        };
      });

      const stats = await Promise.all(statsPromises);
      
      // Sort by total reviews descending
      const sortedStats = stats.sort((a, b) => 
        b.totalReviews - a.totalReviews || a.techLeadName.localeCompare(b.techLeadName)
      );

      console.log('Tech lead stats:', sortedStats.map(s => ({ name: s.techLeadName, total: s.totalReviews })));
      
      setTechLeadStats(sortedStats);
    } catch (error) {
      console.error('Error fetching tech lead stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechLeadStats();
  }, []);

  return {
    techLeadStats,
    loading,
    refetch: fetchTechLeadStats
  };
};

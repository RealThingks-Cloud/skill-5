import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Flame, Star, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface UserAchievement {
  id: string;
  achievement_name: string;
  badge_icon: string;
  earned_at: string;
  description?: string;
}

interface GamificationData {
  total_xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
  goals_achieved_count: number;
  goals_set_count: number;
}

export const GamificationCard = () => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [recentXPEvents, setRecentXPEvents] = useState<Array<{event: string, xp: number, date: string}>>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.user_id) {
      fetchGamificationData();
    }
  }, [profile]);

  const fetchGamificationData = async () => {
    if (!profile?.user_id) return;

    try {
      setLoading(true);

      // Fetch gamification data
      let { data: gamificationData } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      // Create gamification record if it doesn't exist
      if (!gamificationData) {
        const { data: newGamificationData } = await supabase
          .from('user_gamification')
          .insert({ user_id: profile.user_id })
          .select()
          .single();
        gamificationData = newGamificationData;
      }

      setGamificationData(gamificationData);

      // Fetch recent achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('earned_at', { ascending: false })
        .limit(5);

      setAchievements(achievementsData || []);

      // Mock recent XP events (would come from XP history table in real app)
      setRecentXPEvents([
        { event: 'Category improvement', xp: 10, date: '2 hours ago' },
        { event: 'Goal completed', xp: 50, date: '1 day ago' },
        { event: 'Skill milestone', xp: 20, date: '3 days ago' }
      ]);

    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXPToNextLevel = (totalXP: number, level: number) => {
    const nextLevelXP = level * 100;
    const currentLevelXP = (level - 1) * 100;
    const progressXP = totalXP - currentLevelXP;
    const neededXP = nextLevelXP - totalXP;
    const progressPercentage = (progressXP / 100) * 100;
    
    return { neededXP, progressPercentage };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            XP & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gamificationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            XP & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Start rating skills to earn XP!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { neededXP, progressPercentage } = getXPToNextLevel(gamificationData.total_xp, gamificationData.level);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Zap className="h-5 w-5" />
          XP & Achievements
        </CardTitle>
        <CardDescription className="text-purple-700">
          Your skill development journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP and Level */}
        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-3 bg-purple-100 rounded-full"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Star className="h-6 w-6 text-purple-600" />
            </motion.div>
            <div>
              <p className="font-bold text-xl text-purple-900">Level {gamificationData.level}</p>
              <p className="text-purple-700">{gamificationData.total_xp} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-700">Next Level</p>
            <p className="font-semibold text-purple-900">{neededXP} XP needed</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700">Level Progress</span>
            <span className="font-semibold text-purple-900">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-purple-100" 
            style={{ '--progress-foreground': 'hsl(var(--purple-600))' } as React.CSSProperties}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="ml-1 font-bold text-lg">{gamificationData.current_streak}</span>
            </div>
            <p className="text-xs text-purple-700">Current Streak</p>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="ml-1 font-bold text-lg">{gamificationData.goals_achieved_count}</span>
            </div>
            <p className="text-xs text-purple-700">Goals Done</p>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="ml-1 font-bold text-lg">{achievements.length}</span>
            </div>
            <p className="text-xs text-purple-700">Badges</p>
          </div>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-purple-900 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Recent Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {achievements.slice(0, 3).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Badge 
                    variant="outline" 
                    className="bg-white/70 border-purple-200 text-purple-800 hover:bg-white/90 transition-colors cursor-help"
                    title={achievement.description}
                  >
                    <span className="mr-1">{achievement.badge_icon}</span>
                    {achievement.achievement_name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent XP Activity */}
        {recentXPEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-purple-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="space-y-1">
              {recentXPEvents.slice(0, 2).map((event, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-purple-700">{event.event}</span>
                  <div className="flex items-center gap-1 text-purple-900">
                    <span className="font-semibold">+{event.xp} XP</span>
                    <span className="text-purple-600">• {event.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
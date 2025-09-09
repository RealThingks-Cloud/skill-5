import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Award, ChevronRight, Star, Clock, Trophy, Code, Database, Settings, Shield, Zap, Brain, Layers, Cpu, Network } from "lucide-react";
import { useSkillMeters } from "../hooks/useSkillMeters";
import { ApprovedRatingsModal } from "./ApprovedRatingsModal";
export const SkillMetersCard = () => {
  const {
    metersData,
    loading
  } = useSkillMeters();
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const getLevelColor = (level: 'expert' | 'on-track' | 'developing') => {
    switch (level) {
      case 'expert':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'on-track':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'developing':
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };
  const getLevelText = (level: 'expert' | 'on-track' | 'developing') => {
    switch (level) {
      case 'expert':
        return 'Expert';
      case 'on-track':
        return 'On Track';
      case 'developing':
        return 'Developing';
    }
  };
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('autosar') || name.includes('automotive')) return Code;
    if (name.includes('database') || name.includes('sql')) return Database;
    if (name.includes('system') || name.includes('architecture')) return Settings;
    if (name.includes('security') || name.includes('crypto')) return Shield;
    if (name.includes('performance') || name.includes('optimization')) return Zap;
    if (name.includes('ai') || name.includes('machine') || name.includes('algorithm')) return Brain;
    if (name.includes('network') || name.includes('protocol')) return Network;
    if (name.includes('embedded') || name.includes('hardware')) return Cpu;
    return Layers; // Default icon
  };
  const getTrendIndicator = (percentage: number) => {
    // Simulate trend based on percentage (in real app, this would come from historical data)
    const trend = Math.random() > 0.5 ? 1 : -1;
    const change = Math.floor(Math.random() * 5) + 1;
    return {
      trend,
      change
    };
  };
  const getMilestone = (percentage: number, level: 'expert' | 'on-track' | 'developing') => {
    if (percentage >= 90) return {
      text: "Expert level achieved",
      icon: "🏆"
    };
    if (percentage >= 75) return {
      text: "Advanced milestone reached",
      icon: "🎯"
    };
    if (percentage >= 50) return {
      text: "Intermediate milestone reached",
      icon: "🎯"
    };
    if (percentage >= 25) return {
      text: "Basic milestone reached",
      icon: "📈"
    };
    return {
      text: "Getting started",
      icon: "🌱"
    };
  };
  const getProgressColor = (percentage: number) => {
    // Progressive color system: Red (0-40%) -> Orange (40-60%) -> Amber (60-80%) -> Green (80%+)
    if (percentage >= 80) return 'hsl(var(--skill-high))'; // Green for high performance
    if (percentage >= 60) return 'hsl(var(--skill-medium))'; // Amber for good performance
    if (percentage >= 40) return 'hsl(var(--skill-low))'; // Orange for developing skills
    return 'hsl(0 84% 60%)'; // Light red for low performance - accessible
  };
  const getProgressGradient = (percentage: number) => {
    if (percentage >= 80) return 'linear-gradient(90deg, hsl(var(--skill-high)), hsl(155 62% 48%))';
    if (percentage >= 60) return 'linear-gradient(90deg, hsl(var(--skill-medium)), hsl(54 91% 46%))';
    if (percentage >= 40) return 'linear-gradient(90deg, hsl(var(--skill-low)), hsl(38 92% 50%))';
    return 'linear-gradient(90deg, hsl(0 84% 60%), hsl(14 91% 54%))';
  };
  const getCategoryGradient = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('autosar') || name.includes('automotive')) return 'from-blue-50 to-blue-100 border-blue-200';
    if (name.includes('database') || name.includes('sql')) return 'from-green-50 to-emerald-100 border-green-200';
    if (name.includes('system') || name.includes('architecture')) return 'from-purple-50 to-violet-100 border-purple-200';
    if (name.includes('security') || name.includes('crypto')) return 'from-red-50 to-rose-100 border-red-200';
    if (name.includes('performance') || name.includes('optimization')) return 'from-yellow-50 to-amber-100 border-yellow-200';
    if (name.includes('ai') || name.includes('machine') || name.includes('algorithm')) return 'from-indigo-50 to-blue-100 border-indigo-200';
    if (name.includes('network') || name.includes('protocol')) return 'from-cyan-50 to-teal-100 border-cyan-200';
    if (name.includes('embedded') || name.includes('hardware')) return 'from-orange-50 to-red-100 border-orange-200';
    return 'from-gray-50 to-slate-100 border-gray-200';
  };
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skill Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading skill meters...</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skill Progress
            </CardTitle>
            
          </div>
          {metersData.overallGrowth > 0 && <div className="text-right">
              
              
            </div>}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Overall Summary */}
        {metersData.xpGained > 0 && <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">+{metersData.xpGained} XP Earned</span>
              </div>
              {metersData.badges.length > 0 && <Badge variant="outline" className="text-primary border-primary/30">
                  {metersData.badges.length} new badge{metersData.badges.length > 1 ? 's' : ''}
                </Badge>}
            </div>
          </div>}

        {/* Category Meters */}
        {metersData.categoryMeters.length === 0 ? <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No skill categories found</p>
              <p className="text-xs text-muted-foreground">
                Complete skill assessments to see your progress
              </p>
            </div>
          </div> : <div className="flex-1 min-h-0 overflow-hidden">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full auto-rows-fr">
              {metersData.categoryMeters.sort((a, b) => b.percentage - a.percentage) // Sort by progress percentage descending
          .map(meter => {
            const CategoryIcon = getCategoryIcon(meter.categoryName);
            const trendData = getTrendIndicator(meter.percentage);
            const milestone = getMilestone(meter.percentage, meter.level);
            const ratedCount = meter.breakdown.high + meter.breakdown.medium + meter.breakdown.low;
            return <div key={meter.categoryId} className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] animate-fade-in" onClick={() => setSelectedCategory({
              id: meter.categoryId,
              name: meter.categoryName
            })}>
                    <Card className={`h-full bg-gradient-to-br ${getCategoryGradient(meter.categoryName)} hover:shadow-lg hover:border-primary/30 transition-all duration-500 overflow-hidden transform hover:-translate-y-1`}>
                      <CardHeader className="pb-3 bg-gradient-to-r from-white/40 to-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/60 shadow-sm">
                              <CategoryIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                                {meter.categoryName}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">{ratedCount} skills rated</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                              {meter.percentage}%
                            </div>
                            <Badge variant="outline" className={`text-xs ${getLevelColor(meter.level)} font-medium`}>
                              {getLevelText(meter.level)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 flex-1 bg-gradient-to-b from-white/30 to-white/10">
                        {/* Progress Bar with Animation - Thicker */}
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-medium">
                              <span className="text-gray-700">Progress</span>
                              
                            </div>
                            <div className="relative">
                              <Progress value={meter.percentage} className="h-8 bg-white/60 shadow-inner transition-all duration-700 ease-out" style={{
                          '--progress-background': getProgressGradient(meter.percentage),
                          '--progress-foreground': getProgressGradient(meter.percentage)
                        } as React.CSSProperties} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-white drop-shadow-md transition-all duration-300">
                                  {meter.percentage}%
                                </span>
                              </div>
                              {/* Progress level indicator */}
                              <div className="absolute -top-1 right-0">
                                {meter.percentage >= 80 && <div className="w-2 h-2 rounded-full bg-skill-high animate-pulse"></div>}
                                {meter.percentage >= 60 && meter.percentage < 80 && <div className="w-2 h-2 rounded-full bg-skill-medium animate-pulse"></div>}
                                {meter.percentage < 60 && <div className="w-2 h-2 rounded-full bg-skill-low animate-pulse"></div>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/50 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Trophy className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-gray-700">Level</span>
                            </div>
                            <p className="text-lg font-bold text-primary">{getLevelText(meter.level)}</p>
                          </div>
                          
                          <div className="bg-white/50 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-gray-700">Updated</span>
                            </div>
                            <p className="text-lg font-bold text-primary">2d ago</p>
                          </div>
                        </div>

                        {/* Skill Breakdown - Enhanced */}
                        <div className="bg-white/40 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Skill Breakdown</span>
                            <ChevronRight className="h-4 w-4 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex items-center gap-4">
                            {meter.breakdown.high > 0 && <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-skill-high shadow-sm"></div>
                                <span className="text-sm font-medium text-gray-600">{meter.breakdown.high} Expert</span>
                              </div>}
                            {meter.breakdown.medium > 0 && <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-skill-medium shadow-sm"></div>
                                <span className="text-sm font-medium text-gray-600">{meter.breakdown.medium} Good</span>
                              </div>}
                            {meter.breakdown.low > 0 && <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-skill-low shadow-sm"></div>
                                <span className="text-sm font-medium text-gray-600">{meter.breakdown.low} Basic</span>
                              </div>}
                          </div>
                          {meter.breakdown.unrated > 0 && <div className="mt-2 text-xs text-gray-500 bg-gray-100/60 rounded px-2 py-1">
                              {meter.breakdown.unrated} skills not yet rated
                            </div>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>;
          })}
            </div>
          </div>}

        {/* Approved Ratings Modal */}
        <ApprovedRatingsModal isOpen={!!selectedCategory} onClose={() => setSelectedCategory(null)} categoryId={selectedCategory?.id || ''} categoryName={selectedCategory?.name || ''} />
      </CardContent>
    </Card>;
};
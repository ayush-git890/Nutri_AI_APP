'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, History, Leaf, ShieldCheck, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- Types ---
interface NutritionData {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  vitamins: string[];
  recommendation: string;
}

interface FoodAnalysis {
  id?: number;
  food_name: string;
  nutrition_data: NutritionData;
  health_verdict: string;
  health_score: number;
  created_at?: string;
}

// --- Helper Components ---
const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-green-100"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-green-600 transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-semibold text-[#1B4332]">{value}</span>
      </div>
      <span className="text-[10px] font-medium text-green-700 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

function FormattedDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState<string | null>(null);
  useEffect(() => {
    setFormatted(new Date(dateString).toLocaleDateString());
  }, [dateString]);
  return <>{formatted || '...'}</>;
}

// --- Main App ---
export default function NutriAIPage() {
  const [foodInput, setFoodInput] = useState('');
  const queryClient = useQueryClient();

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['food-history'],
    queryFn: async () => {
      // First try to fetch from API
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch history from API:', error);
      }
      
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('food_searches');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return [];
      }
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (foodName: string) => {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ foodName }),
      });
      if (!res.ok) throw new Error('Failed to analyze food');
      return res.json() as Promise<FoodAnalysis>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['current-analysis'], data);
      
      // Store in localStorage for history
      try {
        const stored = localStorage.getItem('food_searches');
        const existing = stored ? JSON.parse(stored) : [];
        // Add new search to the front
        const updated = [data, ...existing].slice(0, 10); // Keep last 10
        localStorage.setItem('food_searches', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
      
      queryClient.invalidateQueries({ queryKey: ['food-history'] });
      toast.success(`${data.food_name} analyzed!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { data: currentAnalysis } = useQuery<FoodAnalysis>({
    queryKey: ['current-analysis'],
    queryFn: async () => {
      // This is intentionally disabled and populated via setQueryData in the mutation
      throw new Error('This query should never run');
    },
    enabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodInput.trim()) return;
    analyzeMutation.mutate(foodInput);
    setFoodInput('');
  };

  return (
    <div className="min-h-screen bg-[#F2F7F4] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-green-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <img
            src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/c085a35f-ee98-48ee-98c0-29b3922f936f.jpg"
            alt="Nutri AI Logo"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-[#1B4332] leading-tight tracking-tight">
              Nutri AI
            </h1>
            <p className="text-[11px] text-green-600 font-medium tracking-wide">
              Smart Nutrition Analysis
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-[#1B4332]">Is your food healthy?</h2>
          <p className="text-sm text-green-700">
            Enter a food name to get an instant nutrition and health analysis.
          </p>
        </div>

        <Link href="/diet-plan" className="block group">
          <Card className="border-green-200 rounded-xl shadow-none bg-gradient-to-r from-white to-green-50/80 transition-all duration-200 group-hover:border-green-300 group-hover:shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <UtensilsCrossed className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-[#1B4332] leading-tight">Diet Plan</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      Personalized
                    </span>
                  </div>
                  <p className="text-sm italic text-green-800 leading-relaxed max-w-2xl">
                    "Eat better today to feel stronger tomorrow."
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 self-start sm:self-center px-3.5 py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-medium group-hover:bg-[#1B4332] transition-colors">
                Open Planner
                <ArrowRight className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Search */}
        <Card className="border-green-200 rounded-xl shadow-none">
          <CardContent className="p-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 w-4 h-4" />
                <Input
                  placeholder="e.g. Avocado, Big Mac, Oatmeal..."
                  className="pl-11 h-12 border-none shadow-none text-sm focus-visible:ring-0"
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="h-10 px-6 bg-[#2D6A4F] hover:bg-[#1B4332] rounded-lg font-medium text-sm text-white"
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Result */}
          <div className="lg:col-span-2">
            {currentAnalysis ? (
              <Card className="border-green-200 rounded-xl shadow-none p-6 space-y-5 bg-white">
                {/* Food name + score */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1B4332]">
                      {currentAnalysis.food_name}
                    </h3>
                    <span
                      className={cn(
                        'mt-1 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                        currentAnalysis.health_score > 70
                          ? 'bg-green-50 text-green-700'
                          : currentAnalysis.health_score > 40
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-red-50 text-red-700'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          currentAnalysis.health_score > 70
                            ? 'bg-green-500'
                            : currentAnalysis.health_score > 40
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                        )}
                      />
                      {currentAnalysis.health_score > 70
                        ? 'Healthy'
                        : currentAnalysis.health_score > 40
                          ? 'Moderate'
                          : 'Unhealthy'}
                    </span>
                  </div>
                  <CircularProgress value={currentAnalysis.health_score} label="Score" />
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Calories', value: `${currentAnalysis.nutrition_data.calories} kcal` },
                    { label: 'Protein', value: currentAnalysis.nutrition_data.protein },
                    { label: 'Carbs', value: currentAnalysis.nutrition_data.carbs },
                    { label: 'Fat', value: currentAnalysis.nutrition_data.fat },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-green-50 border border-green-100 rounded-lg p-3 text-center"
                    >
                      <p className="text-[11px] text-green-600 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-[#1B4332] mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Verdict */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-[#2D6A4F] w-4 h-4" />
                    <h4 className="text-sm font-semibold text-[#1B4332]">Health Verdict</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentAnalysis.health_verdict}
                  </p>
                </div>

                {/* Vitamins */}
                {currentAnalysis.nutrition_data.vitamins.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="text-green-500 w-4 h-4" />
                      <h4 className="text-sm font-semibold text-[#1B4332]">
                        Key Vitamins & Benefits
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.nutrition_data.vitamins.map((v: string) => (
                        <span
                          key={v}
                          className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="border-green-200 rounded-xl shadow-none h-[320px] flex flex-col items-center justify-center text-center p-8 border-dashed bg-white">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="text-green-300 w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-[#1B4332]">No analysis yet</h3>
                <p className="text-sm text-green-400 mt-1">
                  Search for a food above to see results here.
                </p>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="border-green-200 rounded-xl shadow-none overflow-hidden bg-white">
              <CardHeader className="bg-white border-b border-green-100 p-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-green-600" />
                  <CardTitle className="text-sm font-semibold text-[#1B4332]">
                    Recent Searches
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-green-50">
                  {historyLoading ? (
                    <div className="p-4 text-sm text-green-400">Loading...</div>
                  ) : history && history.length > 0 ? (
                    history.map((item: FoodAnalysis) => (
                      <button
                        key={item.id}
                        onClick={() => queryClient.setQueryData(['current-analysis'], item)}
                        className="w-full text-left p-4 hover:bg-green-50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800 group-hover:text-[#2D6A4F] transition-colors">
                            {item.food_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.created_at && <FormattedDate dateString={item.created_at} />}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              item.health_score > 70
                                ? 'bg-green-500'
                                : item.health_score > 40
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                            )}
                          />
                          <span className="text-xs font-semibold text-[#2D6A4F]">
                            {item.health_score}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-xs text-green-400">Your searches will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
          <p className="text-xs text-gray-400">
            Powered by <span className="text-gray-500 font-medium">PBL Group (7-J)</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

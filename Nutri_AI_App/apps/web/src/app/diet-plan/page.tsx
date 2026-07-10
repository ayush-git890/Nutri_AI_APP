'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Droplets, MapPin, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Gender = 'male' | 'female' | 'other';

interface FormValues {
  age: string;
  weightKg: string;
  heightFt: string;
  gender: Gender | '';
  state: string;
}

interface MealBlock {
  title: string;
  time: string;
  calories: number;
  items: string[];
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
];

const REGION_BY_STATE: Record<string, 'north' | 'south' | 'east' | 'west' | 'central' | 'north-east'> = {
  'Andhra Pradesh': 'south',
  'Arunachal Pradesh': 'north-east',
  Assam: 'north-east',
  Bihar: 'east',
  Chhattisgarh: 'central',
  Goa: 'west',
  Gujarat: 'west',
  Haryana: 'north',
  'Himachal Pradesh': 'north',
  Jharkhand: 'east',
  Karnataka: 'south',
  Kerala: 'south',
  'Madhya Pradesh': 'central',
  Maharashtra: 'west',
  Manipur: 'north-east',
  Meghalaya: 'north-east',
  Mizoram: 'north-east',
  Nagaland: 'north-east',
  Odisha: 'east',
  Punjab: 'north',
  Rajasthan: 'north',
  Sikkim: 'north-east',
  'Tamil Nadu': 'south',
  Telangana: 'south',
  Tripura: 'north-east',
  'Uttar Pradesh': 'north',
  Uttarakhand: 'north',
  'West Bengal': 'east',
  Delhi: 'north',
  'Jammu and Kashmir': 'north',
  Ladakh: 'north',
  Puducherry: 'south',
};

const REGION_PROFILE = {
  north: {
    grains: ['2 whole-wheat rotis', '1 bajra roti', '1 small brown rice bowl'],
    proteins: ['dal tadka', 'rajma/chole', 'paneer bhurji', 'grilled chicken'],
    veg: ['sauteed seasonal sabzi', 'salad with cucumber and carrot'],
    snack: 'roasted chana + buttermilk',
  },
  south: {
    grains: ['2 millet dosas', '2 idlis', '1 red-rice bowl'],
    proteins: ['sambar', 'rasam + dal', 'fish curry', 'egg bhurji'],
    veg: ['poriyal/thoran', 'vegetable kootu'],
    snack: 'sundal + coconut water',
  },
  east: {
    grains: ['1 small rice bowl', '2 phulkas'],
    proteins: ['moong dal', 'fish curry', 'chana dal', 'soy chunk curry'],
    veg: ['mixed vegetable torkari', 'saag bhaja'],
    snack: 'muri chaat with peanuts',
  },
  west: {
    grains: ['2 jowar rotis', '2 multigrain rotis', '1 rice bowl'],
    proteins: ['sprouted usal', 'dal', 'grilled fish/chicken', 'paneer tikka'],
    veg: ['bhindi or lauki sabzi', 'kachumber salad'],
    snack: 'dhokla + green chutney',
  },
  central: {
    grains: ['2 phulkas', '1 small rice bowl'],
    proteins: ['dal', 'chana curry', 'egg curry', 'tofu/paneer'],
    veg: ['bhaji + salad', 'stir-fried greens'],
    snack: 'makhana roasted in ghee',
  },
  'north-east': {
    grains: ['1 red-rice bowl', '2 rotis'],
    proteins: ['boiled lentils', 'steamed fish/chicken', 'egg curry', 'tofu'],
    veg: ['lightly steamed vegetables', 'fermented vegetable side'],
    snack: 'fruit bowl + peanuts',
  },
};

function toNumber(value: string) {
  return Number.parseFloat(value);
}

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function getBmr(age: number, weightKg: number, heightCm: number, gender: Gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78;
}

export default function DietPlanPage() {
  const [form, setForm] = useState<FormValues>({
    age: '',
    weightKg: '',
    heightFt: '',
    gender: '',
    state: '',
  });
  const [showPlan, setShowPlan] = useState(false);
  const [error, setError] = useState('');

  const plan = useMemo(() => {
    if (!showPlan) return null;

    const age = toNumber(form.age);
    const weightKg = toNumber(form.weightKg);
    const heightFt = toNumber(form.heightFt);
    const heightCm = heightFt * 30.48;
    const gender = form.gender as Gender;

    if (!age || !weightKg || !heightFt || !gender || !form.state) return null;

    const bmi = weightKg / (heightCm / 100) ** 2;
    const bmiCategory = getBmiCategory(bmi);

    const bmr = getBmr(age, weightKg, heightCm, gender);
    const maintenanceCalories = Math.round(bmr * 1.35);
    const targetCalories =
      bmiCategory === 'Underweight'
        ? maintenanceCalories + 300
        : bmiCategory === 'Overweight' || bmiCategory === 'Obese'
          ? maintenanceCalories - 300
          : maintenanceCalories;

    const proteinPerKg = bmiCategory === 'Underweight' ? 1.6 : bmiCategory === 'Healthy' ? 1.2 : 1.4;
    const protein = Math.round(weightKg * proteinPerKg);
    const fat = Math.round(Math.max(45, Math.min(80, weightKg * 0.8)));
    const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4);

    const region = REGION_BY_STATE[form.state] ?? 'central';
    const profile = REGION_PROFILE[region];

    const meals: MealBlock[] = [
      {
        title: 'Breakfast',
        time: '7:30 AM - 8:30 AM',
        calories: Math.round(targetCalories * 0.25),
        items: [
          profile.grains[0],
          `${profile.proteins[0]} (1 medium bowl)`,
          '1 fruit (banana/apple/orange)',
          'Unsweetened tea or milk',
        ],
      },
      {
        title: 'Mid-Morning',
        time: '10:30 AM - 11:00 AM',
        calories: Math.round(targetCalories * 0.1),
        items: ['1 seasonal fruit bowl', '8-10 soaked almonds + 2 walnuts', 'Water (300-400 ml)'],
      },
      {
        title: 'Lunch',
        time: '1:00 PM - 2:00 PM',
        calories: Math.round(targetCalories * 0.3),
        items: [
          `${profile.grains[2] ?? profile.grains[1]}`,
          `${profile.proteins[1]} (1 bowl)`,
          `${profile.veg[0]} + ${profile.veg[1]}`,
          '1 cup curd or chaas',
        ],
      },
      {
        title: 'Evening Snack',
        time: '5:00 PM - 5:30 PM',
        calories: Math.round(targetCalories * 0.1),
        items: [profile.snack, 'Green tea or lemon water', 'Avoid deep-fried snacks'],
      },
      {
        title: 'Dinner',
        time: '8:00 PM - 9:00 PM',
        calories: Math.round(targetCalories * 0.25),
        items: [
          `${profile.grains[1]} (light portion)`,
          `${profile.proteins[2]} (1 bowl)`,
          `${profile.veg[0]}`,
          'Optional: 1 cup soup before dinner',
        ],
      },
    ];

    const weeklyStructure = [
      '5 days follow this base plan with portion control.',
      '2 days include one favorite meal, but keep quantity moderate.',
      'Include at least 150 minutes of walking or exercise each week.',
      'Keep sugar drinks and packaged snacks for special occasions only.',
    ];

    const goal =
      bmiCategory === 'Underweight'
        ? 'Healthy weight gain with higher-quality calories and protein.'
        : bmiCategory === 'Healthy'
          ? 'Weight maintenance with better body composition and energy.'
          : 'Fat loss while preserving muscle and improving metabolic health.';

    return {
      bmi,
      bmiCategory,
      targetCalories,
      protein,
      carbs,
      fat,
      goal,
      meals,
      weeklyStructure,
      stateNote: `Your plan includes foods commonly available in ${form.state} (${region.replace('-', ' ')}) to keep it practical and sustainable.`,
    };
  }, [form, showPlan]);

  const onGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();

    const age = toNumber(form.age);
    const weightKg = toNumber(form.weightKg);
    const heightFt = toNumber(form.heightFt);

    if (!age || !weightKg || !heightFt || !form.gender || !form.state) {
      setError('Please fill all details before generating your diet plan.');
      setShowPlan(false);
      return;
    }

    if (age < 10 || age > 100) {
      setError('Please enter an age between 10 and 100.');
      setShowPlan(false);
      return;
    }

    if (weightKg < 20 || weightKg > 250 || heightFt < 3 || heightFt > 8) {
      setError('Please enter realistic height (in feet) and weight values.');
      setShowPlan(false);
      return;
    }

    setError('');
    setShowPlan(true);
  };

  return (
    <div className="min-h-screen bg-[#F2F7F4]">
      <header className="bg-white border-b border-green-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1B4332]">Nutri AI Diet Planner</h1>
            <p className="text-xs text-green-700">Personalized meal plan for Indian lifestyle</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-green-300 text-green-800 hover:bg-green-50">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-7">
        <Card className="border-green-200 rounded-xl shadow-none bg-white">
          <CardHeader>
            <CardTitle className="text-[#1B4332] text-xl">Create Your Complete Diet Plan</CardTitle>
            <p className="text-sm text-green-700">
              Enter your details and get a full daily meal schedule with calorie and macro targets.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onGeneratePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={form.age}
                    onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                    placeholder="Years"
                    type="number"
                    min={10}
                    max={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    value={form.weightKg}
                    onChange={(e) => setForm((prev) => ({ ...prev, weightKg: e.target.value }))}
                    placeholder="e.g. 70"
                    type="number"
                    min={20}
                    max={250}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="height">Height (ft)</Label>
                  <Input
                    id="height"
                    value={form.heightFt}
                    onChange={(e) => setForm((prev) => ({ ...prev, heightFt: e.target.value }))}
                    placeholder="e.g. 5.8"
                    type="number"
                    step="0.1"
                    min={3}
                    max={8}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(value: Gender) => setForm((prev) => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>State (India)</Label>
                  <Select value={form.state} onValueChange={(value) => setForm((prev) => ({ ...prev, state: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((stateName) => (
                        <SelectItem key={stateName} value={stateName}>
                          {stateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white">
                Generate Complete Diet Plan
              </Button>
            </form>
          </CardContent>
        </Card>

        {plan ? (
          <div className="space-y-6">
            <Card className="border-green-200 rounded-xl shadow-none bg-white">
              <CardHeader>
                <CardTitle className="text-[#1B4332] text-lg">Your Personalized Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">BMI: {plan.bmi.toFixed(1)}</Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Category: {plan.bmiCategory}</Badge>
                  <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Calories: {plan.targetCalories} kcal/day</Badge>
                  <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-100">Protein: {plan.protein} g</Badge>
                  <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Carbs: {plan.carbs} g</Badge>
                  <Badge className="bg-orange-100 text-orange-900 hover:bg-orange-100">Fat: {plan.fat} g</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2 text-[#1B4332] font-semibold mb-1">
                      <Target className="w-4 h-4" /> Goal
                    </div>
                    <p className="text-sm text-green-900">{plan.goal}</p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2 text-[#1B4332] font-semibold mb-1">
                      <MapPin className="w-4 h-4" /> Location Focus
                    </div>
                    <p className="text-sm text-green-900">{plan.stateNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.meals.map((meal) => (
                <Card key={meal.title} className="border-green-200 rounded-xl shadow-none bg-white">
                  <CardHeader>
                    <CardTitle className="text-base text-[#1B4332] flex items-center justify-between">
                      <span>{meal.title}</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        ~{meal.calories} kcal
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-green-700">{meal.time}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc ml-5 space-y-1.5 text-sm text-gray-700">
                      {meal.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-green-200 rounded-xl shadow-none bg-white">
              <CardHeader>
                <CardTitle className="text-[#1B4332] text-lg">Weekly Structure and Habits</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-green-100 p-4 bg-[#FBFEFC]">
                  <h3 className="font-semibold text-[#1B4332] mb-2">Weekly Rhythm</h3>
                  <ul className="list-disc ml-5 space-y-1.5 text-sm text-gray-700">
                    {plan.weeklyStructure.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-green-100 p-4 bg-[#FBFEFC]">
                  <h3 className="font-semibold text-[#1B4332] mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" /> Hydration and Recovery
                  </h3>
                  <ul className="list-disc ml-5 space-y-1.5 text-sm text-gray-700">
                    <li>Drink 2.5 to 3 liters of water daily.</li>
                    <li>Sleep 7 to 8 hours for better hunger and recovery control.</li>
                    <li>Keep dinner at least 2 hours before bedtime.</li>
                    <li>Track body weight once per week and adjust portions slowly.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-gray-500">
              This plan is educational and general. For medical conditions (diabetes, kidney, thyroid, pregnancy), consult a registered dietitian.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

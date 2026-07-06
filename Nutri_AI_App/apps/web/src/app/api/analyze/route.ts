import sql from '@/app/api/utils/sql';

// Common food-related keywords and patterns
const FOOD_KEYWORDS = [
  // Fruits
  'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'mango', 'pineapple', 'kiwi', 'peach', 'pear', 'watermelon', 'melon', 'berry', 'cherry', 'lime', 'lemon', 'coconut',
  // Vegetables
  'broccoli', 'carrot', 'spinach', 'lettuce', 'tomato', 'potato', 'cucumber', 'onion', 'garlic', 'pepper', 'bean', 'pea', 'corn', 'cabbage', 'celery', 'radish', 'squash', 'zucchini', 'eggplant',
  // Proteins
  'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'egg', 'tofu', 'tempeh', 'turkey', 'lamb', 'duck', 'steak', 'meat',
  // Grains
  'rice', 'bread', 'pasta', 'oat', 'cereal', 'wheat', 'barley', 'quinoa', 'noodle', 'flour',
  // Dairy
  'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream',
  // Prepared Foods
  'burger', 'pizza', 'salad', 'soup', 'sandwich', 'taco', 'pasta', 'sushi', 'steak', 'fries', 'chips', 'snack', 'dessert', 'cake', 'cookie', 'donut',
  // Beverages
  'water', 'juice', 'coffee', 'tea', 'soda', 'beer', 'wine', 'smoothie', 'milk',
  // Other food items
  'nut', 'seed', 'honey', 'oil', 'sauce', 'spice', 'seasoning', 'candy', 'chocolate', 'peanut', 'almond', 'walnut',
];

function isFoodItem(input: string): boolean {
  const lower = input.toLowerCase().trim();
  
  // Check if input contains any food keywords
  return FOOD_KEYWORDS.some(keyword => lower.includes(keyword));
}

// Mock nutrition data generator for development
function generateMockNutritionData(foodName: string) {
  const healthScores: Record<string, number> = {
    apple: 85,
    banana: 75,
    broccoli: 90,
    chicken: 80,
    salad: 88,
    burger: 35,
    fries: 25,
    pizza: 40,
    soda: 15,
    water: 100,
  };

  const foodLower = foodName.toLowerCase();
  const healthScore = healthScores[foodLower] || Math.floor(Math.random() * 100);

  return {
    calories: Math.floor(Math.random() * 500) + 50,
    protein: `${Math.floor(Math.random() * 30) + 5}g`,
    carbs: `${Math.floor(Math.random() * 100) + 10}g`,
    fat: `${Math.floor(Math.random() * 20) + 2}g`,
    vitamins: ['Vitamin C', 'Vitamin A', 'Potassium'],
    healthScore,
    healthVerdict:
      healthScore > 70
        ? `${foodName} is a nutritious choice packed with essential nutrients.`
        : healthScore > 40
          ? `${foodName} has moderate nutritional value. Consider balancing with healthier options.`
          : `${foodName} is high in calories and low in nutrients. Consume in moderation.`,
    recommendation:
      healthScore > 70
        ? 'Great choice! Continue incorporating this into your diet.'
        : healthScore > 40
          ? 'Consider pairing with vegetables or whole grains for better nutrition.'
          : 'Limit portions and balance with more nutritious foods.',
  };
}

export async function POST(request: Request) {
  try {
    const { foodName } = await request.json();

    if (!foodName) {
      return Response.json({ error: 'Food name is required' }, { status: 400 });
    }

    // Validate that input is a food item
    if (!isFoodItem(foodName)) {
      return Response.json(
        { error: 'Please choose food name only' },
        { status: 400 }
      );
    }

    // Use mock data for now (replace with real API when available)
    const nutritionInfo = generateMockNutritionData(foodName);

    // Try to save to DB, but don't fail if DB is unavailable
    try {
      await sql`
        INSERT INTO food_searches (food_name, nutrition_data, health_verdict, health_score)
        VALUES (${foodName}, ${JSON.stringify(nutritionInfo)}, ${nutritionInfo.healthVerdict}, ${nutritionInfo.healthScore})
      `;
    } catch (dbError) {
      console.warn('Could not save to database:', dbError);
      // Continue anyway - DB is optional for this endpoint
    }

    return Response.json({
      id: Date.now(),
      food_name: foodName,
      nutrition_data: nutritionInfo,
      health_verdict: nutritionInfo.healthVerdict,
      health_score: nutritionInfo.healthScore,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: 'Failed to analyze food' }, { status: 500 });
  }
}

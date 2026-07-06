import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const searches = await sql`
      SELECT * FROM food_searches 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    return Response.json(searches);
  } catch (error) {
    console.error('History error:', error);
    // Return empty array instead of error to allow UI to work
    return Response.json([]);
  }
}

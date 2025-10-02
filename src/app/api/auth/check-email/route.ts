// src/app/api/auth/check-email/route.ts (NEW FILE)

// src/app/api/auth/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assumes named export is correct
import { z } from 'zod';

const CheckEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CheckEmailSchema.parse(body);

    const { email } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Respond with whether the user exists or not
    return NextResponse.json({
      exists: !!user,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    console.error('Error checking email:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
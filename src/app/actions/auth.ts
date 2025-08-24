'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, users } from '@/lib/db';
import { hashPassword, comparePassword, createToken } from '@/lib/auth';
import { signUpSchema, signInSchema, type SignUpData, type SignInData } from '@/lib/validation';

export async function signUpAction(formData: FormData) {
  const rawData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validate input
  const validatedData = signUpSchema.safeParse(rawData);
  const unsuccessful = !validatedData.success;

  if (unsuccessful) {
    return {
      error: validatedData.error.issues[0].message
    };
  }

  const { firstName, lastName, email, password } = validatedData.data;

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    const existingUserFound = existingUser.length > 0;


    if (existingUserFound) {
      return {
        error: 'An account with this email already exists',
      };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = await db.insert(users).values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    }).returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    });

    // Create token and set cookie
    const token = createToken(newUser[0]);
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}

export async function signInAction(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validate input
  const validatedData = signInSchema.safeParse(rawData);
  if (!validatedData.success) {
    return {
      error: validatedData.error.issues[0].message,
    };
  }

  const { email, password } = validatedData.data;

  try {
    // Find user
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return {
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user[0].password);
    if (!isValidPassword) {
      return {
        error: 'Invalid email or password',
      };
    }

    // Create token and set cookie
    const userForToken = {
      id: user[0].id,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      email: user[0].email,
    };

    const token = createToken(userForToken);
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  redirect('/signin');
}
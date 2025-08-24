'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpAction } from '@/app/actions/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [mediaHasLoaded, setMediaHasLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    const result = await signUpAction(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      router.push('/dashboard');
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: string) => {
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear general error when user interacts with form
    if (error) {
      setError('');
    }
  };

  const handleMediaLoading = () => setMediaHasLoaded(true);

  return (
    <div className="h-screen overflow-hidden relative">
      <Image
        src="/images/background.webp"
        alt="background"
        fill
        onLoad={handleMediaLoading}
        className="aspect-[9/16] lg:aspect-video object-cover"
        priority
      />

      <div className="h-full w-full space-y-4 absolute inset-0 p-8 flex items-center flex-col">
        <div className={`transition-opacity duration-1000 ${mediaHasLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="mb-1 text-center text-4xl font-extrabold text-bootstrap uppercase">
            Create account
          </h2>
          <p className="text-center text-sm text-bootstrap">
            Or{' '}
            <Link href="/signin" className="font-medium text-bootstrap transition-colors duration-100 hover:text-fudge hover:underline">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form action={handleSubmit} className={`transition-opacity duration-1000 space-y-4 w-full ${mediaHasLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-4 grid-cols-2">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className='border-bootstrap border-2 rounded bg-white text-bootstrap p-2 outline-none'
              onChange={() => handleInputChange('firstName')}
              placeholder="First Name" />
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className='border-bootstrap border-2 rounded bg-white text-bootstrap p-2 outline-none'
              onChange={() => handleInputChange('lastName')}
              placeholder="Last Name" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className='border-bootstrap border-2 rounded bg-white text-bootstrap p-2 col-span-full outline-none'
              onChange={() => handleInputChange('email')}
              placeholder="Email" />
            <input
              id="password"
              name="password"
              type="password"
              required
              className='border-bootstrap border-2 rounded bg-white text-bootstrap p-2 col-span-full outline-none'
              onChange={() => handleInputChange('password')}
              placeholder="Password" />
            <button type="submit"disabled={isSubmitting} className='col-span-full rounded text-white bg-bootstrap p-2 cursor-pointer transition-colors hover:bg-fudge duration-300'>
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Shield className="h-12 w-12 text-privacy-500 animate-glow" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-privacy-600 to-secure-600 bg-clip-text text-transparent">
            eERC Dashboard
          </h1>
        </div>
        <LoadingSpinner size="lg" variant="privacy" />
        <p className="text-muted-foreground">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="rounded-full bg-muted p-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          It might have been moved or deleted, or the URL might be incorrect.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
        <Button onClick={() => navigate('/dashboard')} className="gap-2">
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

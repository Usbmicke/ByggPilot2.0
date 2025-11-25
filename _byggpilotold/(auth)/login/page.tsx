import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Logga in på ByggPilot</h1>
        <LoginForm />
      </div>
    </div>
  );
}

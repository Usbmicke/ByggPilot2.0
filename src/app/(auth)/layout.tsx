// src/app/(auth)/layout.tsx

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // This layout is for pages like login, signup, and onboarding.
  // It's intentionally simple, often just a centered container.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}

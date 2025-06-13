"use client";
import { LoginForm } from "../../../components/auth/LoginForm";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.is_superuser) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold ">
          Sign in to your account
        </h2>
        <LoginForm />
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>
            <span className="font-semibold">Superuser?</span> Use your admin
            credentials to access the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

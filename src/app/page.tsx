import Link from "next/link";
import MainLayout from "../components/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Property Manager</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl">
          Effortlessly manage real estate projects, plots, partners, and
          transactions. Built for property developers, admins, and partners to
          collaborate and track every detail in one place.
        </p>
        <ul className="mb-8 text-left max-w-xl mx-auto list-disc list-inside text-gray-800">
          <li>Project and plot management</li>
          <li>Partner and customer onboarding</li>
          <li>Sales, expenses, and EMI tracking</li>
          <li>Transaction approvals and history</li>
          <li>Role-based dashboards for superusers and regular users</li>
        </ul>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
        >
          Sign In
        </Link>
      </div>
    </MainLayout>
  );
}

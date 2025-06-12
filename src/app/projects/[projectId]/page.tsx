"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../../components/MainLayout";

interface PageProps {
  params: { projectId: string } | Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const router = useRouter();

  // Properly handle both direct params and Promise params
  const { projectId } =
    typeof params === "object" && "then" in params
      ? use(params as Promise<{ projectId: string }>)
      : (params as { projectId: string });

  return (
    <MainLayout breadcrumbs={[{ label: "Projects", href: "/" }]}>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href={`/projects/${projectId}/sales`}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Sales</h3>
                  <span className="text-indigo-600">→</span>
                </div>
                <p className="text-sm">View and manage sales records</p>
              </Link>
              <Link
                href={`/projects/${projectId}/expenses`}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Expenses</h3>
                  <span className="text-indigo-600">→</span>
                </div>
                <p className="text-sm">Track and manage expenses</p>
              </Link>
              <Link
                href={`/projects/${projectId}/summary`}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Summary</h3>
                  <span className="text-indigo-600">→</span>
                </div>
                <p className="text-sm">View financial summary and reports</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}

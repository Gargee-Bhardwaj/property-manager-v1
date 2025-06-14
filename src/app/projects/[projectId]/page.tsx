"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";
import { getProjectDetails } from "../../../lib/apis/auth";
import { useAuth } from "../../../lib/contexts/AuthContext";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      setProjectLoading(true);
      try {
        if (!token) throw new Error("No access token found");
        const project = await getProjectDetails(token, projectId);
        console.log(project, "project in dashboad/project id page");
        setProjectName(project.name || projectId);
      } catch {
        setProjectName(projectId);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId, token]);

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: projectLoading ? "Loading..." : projectName },
      ]}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales Card */}
        <div
          onClick={() => router.push(`/projects/${projectId}/sales`)}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sales</h3>
            <span className="text-indigo-600">→</span>
          </div>
          <p className="text-sm">View and manage sales records</p>
        </div>
        {/* Expenses Card */}
        <div
          onClick={() => router.push(`/projects/${projectId}/expenses`)}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Expenses</h3>
            <span className="text-indigo-600">→</span>
          </div>
          <p className="text-sm">Track and manage expenses</p>
        </div>
        {/* Summary Card */}
        <div
          onClick={() => router.push(`/projects/${projectId}/summary`)}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Summary</h3>
            <span className="text-indigo-600">→</span>
          </div>
          <p className="text-sm">View financial summary and reports</p>
        </div>

        {/* transactions Card */}
        <div
          onClick={() => router.push(`/projects/${projectId}/transactions`)}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Transactions</h3>
            <span className="text-indigo-600">→</span>
          </div>
          <p className="text-sm">Track and manage transactions</p>
        </div>
      </div>
    </MainLayout>
  );
}

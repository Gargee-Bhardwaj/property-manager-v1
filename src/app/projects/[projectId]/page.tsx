"use client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
        const project = (await getProjectDetails(token, projectId)) as {
          name: string;
        };
        setProjectName(project.name || projectId);
      } catch {
        setProjectName(projectId);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId, token]);

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(`/projects/${projectId}/${path}`);
    },
    [router, projectId]
  );

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
          onClick={() => handleNavigate("sales")}
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
          onClick={() => handleNavigate("expenses")}
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
          onClick={() => handleNavigate("summary")}
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
          onClick={() => handleNavigate("transactions")}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Transactions</h3>
            <span className="text-indigo-600">→</span>
          </div>
          <p className="text-sm">Track and manage transactions</p>
        </div>

        {/* Partner Details Card */}
        <div
          onClick={() => handleNavigate("partner-details")}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Partner Details</h3>
            <span className="text-indigo-600">→</span>
          </div>
          <p className="text-sm">Track and manage partner details</p>
        </div>

        {/* Project Documents Card */}
        <div
          onClick={() => handleNavigate("project-documents")}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Project Documents</h3>
            <span className="text-indigo-600">→</span>
          </div>
          <p className="text-sm">Track and manage project documents</p>
        </div>
      </div>
    </MainLayout>
  );
}

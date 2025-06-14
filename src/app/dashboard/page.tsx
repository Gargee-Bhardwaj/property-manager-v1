"use client";
import { useAuth } from "../../lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProjectsApi } from "../../lib/apis/auth";
import MainLayout from "../../components/MainLayout";
import { useAtom } from "jotai";
import { projectsAtom } from "../../lib/atoms";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useAtom(projectsAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Separate projects by role
  const ownerProjects = projects.filter((project) => project.role === "owner");
  const memberProjects = projects.filter(
    (project) => project.role === "member"
  );

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.is_superuser) {
      router.replace("/admin/dashboard");
      return;
    }
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error("No access token found");
        const response = await getMyProjectsApi(token);
        setProjects(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user, router, setProjects, token]);

  const renderProjectCard = (project: any) => (
    <div
      key={project.id}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
      <p className="text-sm mb-2">
        Created:{" "}
        {project.created_at
          ? new Date(project.created_at).toLocaleDateString()
          : "-"}
      </p>
      <p className="text-sm">ID: {project.id}</p>
      <span
        className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
          project.role === "owner"
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {project.role.toUpperCase()}
      </span>
    </div>
  );

  return (
    <MainLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <h2 className="text-2xl font-bold mb-6">Your Projects</h2>

      {loading ? (
        <div>Loading projects...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : projects.length === 0 ? (
        <div>No projects found.</div>
      ) : (
        <div className="space-y-8">
          {/* Owner Projects Section */}
          {ownerProjects.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Projects You Own
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ownerProjects.map(renderProjectCard)}
              </div>
            </div>
          )}

          {/* Member Projects Section */}
          {memberProjects.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Projects You are a Member Of
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {memberProjects.map(renderProjectCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}

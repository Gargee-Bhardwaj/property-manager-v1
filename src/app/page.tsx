"use client";
import { useAuth } from "../lib/contexts/AuthContext";
import LoginPage from "./(auth)/login/page";
import { useEffect, useState } from "react";
import { getMyProjectsApi } from "../lib/apis/auth";
import Link from "next/link";

export default function Home() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");
        const response = await getMyProjectsApi(token);
        setProjects(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProjects();
  }, [user]);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Property Manager</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-4">
                Welcome, {user.full_name || user.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-4 text-gray-600">
            Your Projects
          </h2>
          {loading ? (
            <div>Loading projects...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : projects.length === 0 ? (
            <div>No projects found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects?.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm mb-2">
                    Created:{" "}
                    {project.created_at
                      ? new Date(project.created_at).toLocaleDateString()
                      : "-"}
                  </p>
                  <p className="text-sm">ID: {project.id}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

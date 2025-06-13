"use client";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";
import {
  createProjectApi,
  createUserApi,
  getUserByPhoneApi,
} from "../../../lib/apis/adminApis";

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    owner_id: "",
  });
  const [userManagement, setUserManagement] = useState<{
    mode: "none" | "create" | "find";
    email: string;
    password: string;
    full_name: string;
    phone: string;
    is_active: boolean;
    is_superuser: boolean;
    searchPhone: string;
    foundUsers: any[];
  }>({
    mode: "none",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    is_active: true,
    is_superuser: false,
    searchPhone: "",
    foundUsers: [],
  });
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectForPartner, setSelectedProjectForPartner] =
    useState<string>("");
  const [editingProjectForPartner, setEditingProjectForPartner] = useState<
    any | null
  >(null);
  const [partnerUser, setPartnerUser] = useState<any>(null);
  const [partnerRole, setPartnerRole] = useState<string>("member");
  const [partnerSearchPhone, setPartnerSearchPhone] = useState("");
  const [partnerFoundUsers, setPartnerFoundUsers] = useState<any[]>([]);
  const [partnerSuccess, setPartnerSuccess] = useState("");
  const [partnerError, setPartnerError] = useState("");

  useEffect(() => {
    if (!user || !user.is_superuser) {
      router.replace("/login");
    }
  }, [user, router]);

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!token) return;
        const resp = await fetch(
          "https://hustle-jldf.onrender.com/api/v1/projects",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await resp.json();
        setProjects(data.data || []);
      } catch (err) {
        // ignore for now
      }
    };
    fetchProjects();
  }, [token, showCreateProject, success]);

  console.log(projects, "projects in admin page");

  const handleProjectInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value,
    });
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUserManagement({
      ...userManagement,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!token) throw new Error("Not authenticated");

      const newUser = await createUserApi(token, {
        email: userManagement.email,
        password: userManagement.password,
        full_name: userManagement.full_name,
        phone: userManagement.phone,
        is_active: userManagement.is_active,
        is_superuser: userManagement.is_superuser,
      });

      setSuccess("User created successfully!");
      setProjectData({
        ...projectData,
        owner_id: newUser.id,
      });
      setUserManagement({
        ...userManagement,
        mode: "none",
        email: "",
        password: "",
        full_name: "",
        phone: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleFindUser = async () => {
    setError("");
    setSuccess("");

    try {
      if (!token) throw new Error("Not authenticated");
      if (!userManagement.searchPhone.trim())
        throw new Error("Phone number is required");

      const user = await getUserByPhoneApi(token, userManagement.searchPhone);
      setUserManagement({
        ...userManagement,
        foundUsers: [user],
      });
      setSuccess("User found successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find user");
    }
  };

  const handleAddUser = (user: any) => {
    setProjectData({
      ...projectData,
      owner_id: user.id,
    });
    setSelectedOwner(user);
    setUserManagement({
      ...userManagement,
      mode: "none",
      foundUsers: [],
      searchPhone: "",
    });
    setSuccess("User added as project owner!");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!token) throw new Error("Not authenticated");
      if (!projectData.owner_id) throw new Error("Please select an owner");

      await createProjectApi(token, projectData);
      setSuccess("Project created successfully!");
      setProjectData({
        name: "",
        owner_id: "",
      });
      setUserManagement({
        mode: "none",
        email: "",
        password: "",
        full_name: "",
        phone: "",
        is_active: true,
        is_superuser: false,
        searchPhone: "",
        foundUsers: [],
      });
      setSuccess("");
      setTimeout(() => setShowCreateProject(false), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  // Add Partner API
  const handleAddPartner = async () => {
    setPartnerSuccess("");
    setPartnerError("");
    try {
      if (!token) throw new Error("Not authenticated");
      if (!editingProjectForPartner) throw new Error("No project selected");
      if (!partnerUser) throw new Error("Select a user");
      const resp = await fetch(
        `https://hustle-jldf.onrender.com/api/v1/projects/${editingProjectForPartner.id}/partners`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: partnerUser.id, role: partnerRole }),
        }
      );
      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to add partner");
      }
      setPartnerSuccess("Partner added successfully!");
      setPartnerUser(null);
      setPartnerRole("member");
      setPartnerSearchPhone("");
      setPartnerFoundUsers([]);
    } catch (err: any) {
      setPartnerError(err.message || "Failed to add partner");
    }
  };

  const handlePartnerFindUser = async () => {
    setPartnerError("");
    setPartnerSuccess("");
    try {
      if (!token) throw new Error("Not authenticated");
      if (!partnerSearchPhone.trim())
        throw new Error("Phone number is required");
      const user = await getUserByPhoneApi(token, partnerSearchPhone);
      setPartnerFoundUsers([user]);
    } catch (err: any) {
      setPartnerError(err.message || "Failed to find user");
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Admin Dashboard" }]}>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowCreateProject(true)}
        >
          <h3 className="text-lg font-semibold mb-2">Create Project</h3>
          <p className="text-sm mb-2">
            Start a new real estate project and assign owners.
          </p>
        </div>
      </div>

      {/* Create Project Form */}
      {showCreateProject && (
        <div className="bg-opacity-50 flex items-center justify-center w-full mt-4">
          <div className="bg-gray-100 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <button
              onClick={() => {
                setShowCreateProject(false);
                setError("");
                setSuccess("");
              }}
              className="text-gray-500 hover:text-gray-700 absolute right-6 top-6"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={projectData.name}
                  onChange={handleProjectInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Owner*
                </label>
                {projectData.owner_id ? (
                  <div className="bg-gray-50 p-3 rounded-md mb-2">
                    <p className="text-sm">
                      Owner selected:{" "}
                      {selectedOwner
                        ? `${selectedOwner.full_name}  ${selectedOwner.email}`
                        : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectData({ ...projectData, owner_id: "" });
                        setSelectedOwner(null);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Change owner
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() =>
                          setUserManagement({
                            ...userManagement,
                            mode: "create",
                          })
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Create New User
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUserManagement({ ...userManagement, mode: "find" })
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Find Existing User
                      </button>
                    </div>

                    {/* Create User Form */}
                    {userManagement.mode === "create" && (
                      <div className="bg-gray-50 p-4 rounded-md mt-3">
                        <h4 className="font-medium text-sm mb-3">
                          Create New User
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Email*
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={userManagement.email}
                              onChange={handleUserInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Password*
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={userManagement.password}
                              onChange={handleUserInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="full_name"
                              value={userManagement.full_name}
                              onChange={handleUserInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="text"
                              name="phone"
                              value={userManagement.phone}
                              onChange={handleUserInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                setUserManagement({
                                  ...userManagement,
                                  mode: "none",
                                })
                              }
                              className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateUser}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                            >
                              Create User
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Find User Form */}
                    {userManagement.mode === "find" && (
                      <div className="bg-gray-50 p-4 rounded-md mt-3">
                        <h4 className="font-medium text-sm mb-3">
                          Find Existing User
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Phone Number*
                            </label>
                            <input
                              type="text"
                              name="searchPhone"
                              value={userManagement.searchPhone}
                              onChange={handleUserInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Enter user's phone number"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                setUserManagement({
                                  ...userManagement,
                                  mode: "none",
                                })
                              }
                              className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleFindUser}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                            >
                              Search
                            </button>
                          </div>
                        </div>

                        {userManagement.foundUsers.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {userManagement.foundUsers.map((user) => (
                              <div
                                key={user.id}
                                className="bg-white p-3 rounded-md border border-gray-200 flex justify-between items-center"
                              >
                                <div>
                                  <p className="text-sm font-medium">
                                    {user.full_name || user.email}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.phone}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddUser(user)}
                                  className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectData.owner_id}
                  className={`px-4 py-2 text-white rounded-md text-sm font-medium ${
                    !projectData.owner_id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List all projects */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">All Projects</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-4 rounded shadow border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setEditingProjectForPartner(project)}
            >
              <div className="font-bold text-lg mb-1">{project.name}</div>
              <div className="text-sm text-gray-600">ID: {project.id}</div>
              <div className="text-sm text-gray-600">
                Owner: {project.owner_id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Partner to Project section - now conditional */}
      {editingProjectForPartner && (
        <div className="mt-10 p-6 bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Add Partner to {editingProjectForPartner.name}
            </h3>
            <button
              onClick={() => setEditingProjectForPartner(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          {/* Remove the select box for project here as it's now pre-selected */}
          {/* The rest of the partner form goes here */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Find User by Phone
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={partnerSearchPhone}
                onChange={(e) => setPartnerSearchPhone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter phone number"
              />
              <button
                type="button"
                onClick={handlePartnerFindUser}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Search
              </button>
            </div>
            {partnerFoundUsers.length > 0 && (
              <div className="mt-2 space-y-2">
                {partnerFoundUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span>
                      {user.full_name || user.email} ({user.phone})
                    </span>
                    <button
                      type="button"
                      onClick={() => setPartnerUser(user)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
            {partnerUser && (
              <div className="mt-2 text-green-700 text-sm">
                Selected: {partnerUser.full_name || partnerUser.email}
              </div>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={partnerRole}
              onChange={(e) => setPartnerRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="member"
            />
          </div>
          <button
            type="button"
            onClick={handleAddPartner}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Partner
          </button>
          {partnerSuccess && (
            <div className="mt-2 text-green-700">{partnerSuccess}</div>
          )}
          {partnerError && (
            <div className="mt-2 text-red-700">{partnerError}</div>
          )}
        </div>
      )}
    </MainLayout>
  );
}

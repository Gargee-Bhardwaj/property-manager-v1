"use client";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";
import {
  createProjectApi,
  createUserApi,
  getUserByPhoneApi,
  getAllProjectsApi,
  addPartnerToProjectApi,
} from "../../../lib/apis/adminApis";

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    owner_id: "",
    budget: 0,
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

  // Loading states
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isFindingUser, setIsFindingUser] = useState(false);
  const [isFetchingProjects, setIsFetchingProjects] = useState(true);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [isCreatingPartnerUser, setIsCreatingPartnerUser] = useState(false);

  // Partner states
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProjectForPartner, setEditingProjectForPartner] = useState<
    any | null
  >(null);
  const [partnerMode, setPartnerMode] = useState<"none" | "create" | "find">(
    "none"
  );
  const [partnerUser, setPartnerUser] = useState<any>(null);
  const [partnerRole, setPartnerRole] = useState<string>("member");
  const [partnerSearchPhone, setPartnerSearchPhone] = useState("");
  const [partnerFoundUsers, setPartnerFoundUsers] = useState<any[]>([]);
  const [partnerCreateFormData, setPartnerCreateFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    is_active: true,
    is_superuser: false,
  });
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
      setIsFetchingProjects(true);
      try {
        if (!token) return;
        const data = (await getAllProjectsApi(token)) as { data: any[] };
        setProjects(data.data || []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setIsFetchingProjects(false);
      }
    };
    fetchProjects();
  }, [token, success, partnerSuccess]);

  const handleProjectInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setProjectData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleProjectBudgetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setProjectData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    },
    []
  );

  const handleUserInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setUserManagement((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handlePartnerCreateUserChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setPartnerCreateFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleCreateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsCreatingUser(true);

      try {
        if (!token) throw new Error("Not authenticated");

        const newUser = (await createUserApi(token, {
          email: userManagement.email,
          password: userManagement.password,
          full_name: userManagement.full_name,
          phone: userManagement.phone,
          is_active: userManagement.is_active,
          is_superuser: userManagement.is_superuser,
        })) as { id: string };

        setSuccess("User created successfully!");
        setProjectData((prev) => ({
          ...prev,
          owner_id: newUser.id,
        }));
        setSelectedOwner(newUser);
        setUserManagement((prev) => ({
          ...prev,
          mode: "none",
          email: "",
          password: "",
          full_name: "",
          phone: "",
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create user");
      } finally {
        setIsCreatingUser(false);
      }
    },
    [token, userManagement]
  );

  const handleFindUser = useCallback(async () => {
    setError("");
    setSuccess("");
    setIsFindingUser(true);

    try {
      if (!token) throw new Error("Not authenticated");
      if (!userManagement.searchPhone.trim())
        throw new Error("Phone number is required");

      const user = await getUserByPhoneApi(token, userManagement.searchPhone);
      setUserManagement((prev) => ({
        ...prev,
        foundUsers: [user],
      }));
      setSuccess("User found successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find user");
    } finally {
      setIsFindingUser(false);
    }
  }, [token, userManagement.searchPhone]);

  const handleAddUser = useCallback((user: any) => {
    setProjectData((prev) => ({
      ...prev,
      owner_id: user.id,
    }));
    setSelectedOwner(user);
    setUserManagement((prev) => ({
      ...prev,
      mode: "none",
      foundUsers: [],
      searchPhone: "",
    }));
    setSuccess("User added as project owner!");
  }, []);

  const handleCreateProject = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsCreatingProject(true);

      try {
        if (!token) throw new Error("Not authenticated");
        if (!projectData.owner_id) throw new Error("Please select an owner");

        await createProjectApi(token, projectData);
        setSuccess("Project created successfully!");
        setProjectData({
          name: "",
          owner_id: "",
          budget: 0,
        });
        setSelectedOwner(null);
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
        setTimeout(() => {
          setShowCreateProject(false);
          setSuccess(""); // Clear success message after modal closes
        }, 1000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create project"
        );
      } finally {
        setIsCreatingProject(false);
      }
    },
    [token, projectData]
  );

  const handleAddPartner = useCallback(async () => {
    setPartnerError("");
    setPartnerSuccess("");

    if (!editingProjectForPartner || !partnerUser) {
      setPartnerError("Please select a project and a partner.");
      return;
    }

    setIsAddingPartner(true);
    try {
      if (!token) throw new Error("Not authenticated");

      await addPartnerToProjectApi(token, editingProjectForPartner.id, {
        user_id: partnerUser.id,
        role: partnerRole,
      });

      setPartnerSuccess("Partner added successfully!");
      setEditingProjectForPartner(null);
      setPartnerUser(null);
      setPartnerMode("none");
      setPartnerFoundUsers([]);
      setPartnerSearchPhone("");
    } catch (err) {
      setPartnerError(
        err instanceof Error ? err.message : "Failed to add partner"
      );
    } finally {
      setIsAddingPartner(false);
    }
  }, [token, editingProjectForPartner, partnerUser, partnerRole]);

  const handlePartnerFindUser = useCallback(async () => {
    setPartnerError("");
    setPartnerSuccess("");
    if (!partnerSearchPhone.trim()) {
      setPartnerError("Phone number is required");
      return;
    }

    try {
      if (!token) throw new Error("Not authenticated");
      const user = await getUserByPhoneApi(token, partnerSearchPhone);
      setPartnerFoundUsers([user]);
      setPartnerSuccess("User found!");
    } catch (err) {
      setPartnerError(
        err instanceof Error ? err.message : "Failed to find partner"
      );
    }
  }, [token, partnerSearchPhone]);

  const handlePartnerCreateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPartnerError("");
      setPartnerSuccess("");
      setIsCreatingPartnerUser(true);

      try {
        if (!token) throw new Error("Not authenticated");
        const newUser = (await createUserApi(token, partnerCreateFormData)) as {
          id: string;
        };

        setPartnerUser(newUser);
        setPartnerSuccess("Partner user created and selected!");
        setPartnerMode("none"); // Switch back to selection
      } catch (err) {
        setPartnerError(
          err instanceof Error ? err.message : "Failed to create partner user"
        );
      } finally {
        setIsCreatingPartnerUser(false);
      }
    },
    [token, partnerCreateFormData]
  );

  // Close partner modal and reset states
  const closePartnerModal = useCallback(() => {
    setEditingProjectForPartner(null);
    setPartnerMode("none");
    setPartnerUser(null);
    setPartnerSearchPhone("");
    setPartnerFoundUsers([]);
    setPartnerCreateFormData({
      email: "",
      password: "",
      full_name: "",
      phone: "",
      is_active: true,
      is_superuser: false,
    });
    setPartnerError("");
    setPartnerSuccess("");
  }, []);

  return (
    <MainLayout>
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
                  disabled={isCreatingProject}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Budget
                </label>
                <input
                  type="number"
                  name="budget"
                  value={projectData.budget}
                  onChange={handleProjectBudgetChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isCreatingProject}
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
                        ? `${selectedOwner.full_name} (${selectedOwner.email})`
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
                    <div className="flex space-x-3 mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setUserManagement({
                            ...userManagement,
                            mode: "create",
                          })
                        }
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          userManagement.mode === "create"
                            ? "bg-green-700 text-white"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                        disabled={isCreatingUser || isFindingUser}
                      >
                        Create New User
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUserManagement({ ...userManagement, mode: "find" })
                        }
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          userManagement.mode === "find"
                            ? "bg-blue-700 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                        disabled={isCreatingUser || isFindingUser}
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
                              disabled={isCreatingUser}
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
                              disabled={isCreatingUser}
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
                              disabled={isCreatingUser}
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
                              disabled={isCreatingUser}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                setUserManagement({
                                  ...userManagement,
                                  mode: "none",
                                })
                              }
                              className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                              disabled={isCreatingUser}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateUser}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:bg-blue-400"
                              disabled={isCreatingUser}
                            >
                              {isCreatingUser ? "Creating..." : "Create User"}
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
                              disabled={isFindingUser}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                setUserManagement({
                                  ...userManagement,
                                  mode: "none",
                                  foundUsers: [], // Clear found users on cancel
                                  searchPhone: "",
                                })
                              }
                              className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                              disabled={isFindingUser}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleFindUser}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:bg-blue-400"
                              disabled={isFindingUser}
                            >
                              {isFindingUser ? "Searching..." : "Search"}
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
                  onClick={() => {
                    setShowCreateProject(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isCreatingProject}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectData.owner_id || isCreatingProject}
                  className={`px-4 py-2 text-white rounded-md text-sm font-medium ${
                    !projectData.owner_id || isCreatingProject
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isCreatingProject ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List all projects */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">All Projects</h3>
        {isFetchingProjects ? (
          <div className="text-gray-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-600">No projects found.</div>
        ) : (
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
        )}
      </div>

      {/* Add Partner to Project section - now conditional */}
      {editingProjectForPartner && (
        <div className="bg-opacity-50 flex items-center justify-center my-4">
          <div className="bg-white rounded-lg p-6 w-full relative">
            <button
              onClick={closePartnerModal}
              className="text-gray-500 hover:text-gray-700 absolute right-4 top-4"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Add Partner to {editingProjectForPartner.name}
            </h3>

            {partnerError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {partnerError}
              </div>
            )}
            {partnerSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {partnerSuccess}
              </div>
            )}

            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Partner User
              </label>
              {partnerUser ? (
                <div className="bg-gray-50 p-3 rounded-md mb-2 flex justify-between items-center">
                  <p className="text-sm">
                    Selected: {partnerUser.full_name || partnerUser.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPartnerUser(null)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setPartnerMode("create")}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        partnerMode === "create"
                          ? "bg-green-700 text-white"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                      disabled={isCreatingPartnerUser || isFindingUser}
                    >
                      Create New User
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerMode("find")}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        partnerMode === "find"
                          ? "bg-blue-700 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      disabled={isCreatingPartnerUser || isFindingUser}
                    >
                      Find Existing User
                    </button>
                  </div>

                  {partnerMode === "create" && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-sm mb-3">
                        Create New User (Partner)
                      </h4>
                      <form
                        onSubmit={handlePartnerCreateUser}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email*
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={partnerCreateFormData.email}
                            onChange={handlePartnerCreateUserChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={isCreatingPartnerUser}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Password*
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={partnerCreateFormData.password}
                            onChange={handlePartnerCreateUserChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={isCreatingPartnerUser}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            value={partnerCreateFormData.full_name}
                            onChange={handlePartnerCreateUserChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={isCreatingPartnerUser}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={partnerCreateFormData.phone}
                            onChange={handlePartnerCreateUserChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={isCreatingPartnerUser}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            type="button"
                            onClick={() => setPartnerMode("none")}
                            className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                            disabled={isCreatingPartnerUser}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:bg-blue-400"
                            disabled={isCreatingPartnerUser}
                          >
                            {isCreatingPartnerUser
                              ? "Creating..."
                              : "Create User"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {partnerMode === "find" && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-sm mb-3">
                        Find Existing User (Partner)
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Phone Number*
                          </label>
                          <input
                            type="text"
                            name="partnerSearchPhone"
                            value={partnerSearchPhone}
                            onChange={(e) =>
                              setPartnerSearchPhone(e.target.value)
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Enter user's phone number"
                            disabled={isFindingUser}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            type="button"
                            onClick={() => setPartnerMode("none")}
                            className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                            disabled={isFindingUser}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handlePartnerFindUser}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:bg-blue-400"
                            disabled={isFindingUser}
                          >
                            {isFindingUser ? "Searching..." : "Search"}
                          </button>
                        </div>
                      </div>

                      {partnerFoundUsers.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {partnerFoundUsers.map((user) => (
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
                                onClick={() => setPartnerUser(user)}
                                className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                              >
                                Select
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
                disabled={!partnerUser || isAddingPartner}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closePartnerModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isAddingPartner}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPartner}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={
                  !partnerUser || !editingProjectForPartner || isAddingPartner
                }
              >
                {isAddingPartner ? "Adding..." : "Add Partner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

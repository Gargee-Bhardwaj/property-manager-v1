"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectPlotsApi } from "../../../../lib/apis/auth";
import MainLayout from "../../../../components/MainLayout";

async function getProjectDetails(token: string, projectId: string) {
  const BASE_URL = "https://hustle-jldf.onrender.com/api/v1";
  const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch project details");
  return response.json();
}

export default function SalesPage() {
  const router = useRouter();
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<any | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchProject = async () => {
      setProjectLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");
        const project = await getProjectDetails(token, projectId);
        setProjectName(project.name || projectId);
      } catch {
        setProjectName(projectId);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const fetchPlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");
        const response = await getProjectPlotsApi(token, projectId);
        setPlots(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch plots");
      } finally {
        setLoading(false);
      }
    };
    fetchPlots();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    if (status === "available") return "bg-red-500";
    if (status === "sold") return "bg-green-500";
    if (status === "in_progress") return "bg-yellow-500";
    return "bg-gray-300";
  };

  const handleCloseDetails = () => {
    setSelectedPlot(null);
  };

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Projects", href: "/" },
        {
          label: projectLoading ? "Loading..." : projectName,
          href: `/projects/${projectId}`,
        },
        { label: "Sales" },
      ]}
    >
      <h2 className="text-lg font-medium mb-4">Plots</h2>
      {loading ? (
        <div>Loading plots...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : plots.length === 0 ? (
        <div>No plots found.</div>
      ) : (
        <div className="flex flex-wrap gap-4 mb-8">
          {plots.map((plot) => (
            <div
              key={plot.id}
              className={`p-4 rounded-lg shadow-sm border-2 cursor-pointer min-w-[100px] text-center text-lg font-bold ${getStatusColor(
                plot.plot_status
              )} ${
                selectedPlot?.id === plot.id ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => setSelectedPlot(plot)}
            >
              Plot #{plot.number}
            </div>
          ))}
        </div>
      )}
      {selectedPlot && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">
              Plot #{selectedPlot.number} Details
            </h2>
            <div className="flex gap-4 items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedPlot.plot_status === "sold"
                    ? "bg-green-100 text-green-800"
                    : selectedPlot.plot_status === "available"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedPlot.plot_status.replace("_", " ").toUpperCase()}
              </span>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700 focus:outline-none flex justify-end"
                aria-label="Close details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">
                Plot Information
              </h3>
              <p>
                <span className="font-medium">Area:</span> {selectedPlot.area}{" "}
                sq.ft
              </p>
              <p>
                <span className="font-medium">Price:</span> ₹
                {selectedPlot.price.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Amount Collected:</span> ₹
                {selectedPlot.amount_collected.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Balance:</span> ₹
                {(
                  selectedPlot.price - selectedPlot.amount_collected
                ).toLocaleString()}
              </p>
            </div>

            {/* Sale Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">
                Sale Details
              </h3>
              {selectedPlot.plot_status === "sold" ||
              selectedPlot.plot_status === "in_progress" ? (
                <>
                  <p>
                    <span className="font-medium">Sold On:</span>{" "}
                    {new Date(selectedPlot.sold_on_date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Customer ID:</span>{" "}
                    {selectedPlot.customer_id}
                  </p>
                  <p>
                    <span className="font-medium">Sold By:</span>{" "}
                    {selectedPlot.sold_by_user_id}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">Plot is available for sale</p>
              )}
            </div>

            {/* EMI & Transaction Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">
                Payment Details
              </h3>
              {selectedPlot.is_emi ? (
                <>
                  <p>
                    <span className="font-medium">EMI Amount:</span> ₹
                    {selectedPlot.emi_amount?.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">EMI Frequency:</span> Every{" "}
                    {selectedPlot.emi_frequency_months} month(s)
                  </p>
                  <p>
                    <span className="font-medium">EMI Start Date:</span>{" "}
                    {new Date(selectedPlot.emi_start_date).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p>No EMI plan</p>
              )}

              {selectedPlot.transaction_approval_status && (
                <p>
                  <span className="font-medium">Approval Status:</span>{" "}
                  <span
                    className={`${
                      selectedPlot.transaction_approval_status === "approved"
                        ? "text-green-600"
                        : selectedPlot.transaction_approval_status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedPlot.transaction_approval_status.toUpperCase()}
                  </span>
                </p>
              )}

              {selectedPlot.transaction_approved_at && (
                <p>
                  <span className="font-medium">Approved At:</span>{" "}
                  {new Date(
                    selectedPlot.transaction_approved_at
                  ).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
              View Documents
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
              Transaction History
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

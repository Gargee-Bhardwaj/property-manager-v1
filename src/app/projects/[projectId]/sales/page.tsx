"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getProjectPlotsApi,
  createPlotApi,
  getProjectDetails,
} from "../../../../lib/apis/auth";
import MainLayout from "../../../../components/MainLayout";
import { useAtom } from "jotai";
import { plotsAtom } from "../../../../lib/atoms";

export default function SalesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [plots, setPlots] = useAtom(plotsAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<any | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  const [showCreatePlotModal, setShowCreatePlotModal] = useState(false);
  const [plotFormData, setPlotFormData] = useState({
    plot_status: "available",
    area: "",
    price: "",
    number_of_plots: "1",
  });
  const [createPlotError, setCreatePlotError] = useState<string | null>(null);
  const [createPlotSuccess, setCreatePlotSuccess] = useState<string | null>(
    null
  );

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
  }, [projectId, setPlots]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sold":
        return "bg-green-100 text-green-800 border-green-300";
      case "available":
        return "bg-red-100 text-red-800 border-red-300";
      case "work_in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handlePlotClick = (plot: any) => {
    setSelectedPlot(plot);
  };

  const handleCloseDetails = () => {
    setSelectedPlot(null);
  };

  const handlePlotFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPlotFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatePlotError(null);
    setCreatePlotSuccess(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const plotData = {
        ...plotFormData,
        area: Number(plotFormData.area),
        price: Number(plotFormData.price),
        number_of_plots: Number(plotFormData.number_of_plots),
      };

      await createPlotApi(token, projectId, plotData);
      setCreatePlotSuccess("Plot created successfully!");

      // Refresh plots list
      const response = await getProjectPlotsApi(token, projectId);
      setPlots(response.data || []);

      // Reset form
      setPlotFormData({
        plot_status: "available",
        area: "",
        price: "",
        number_of_plots: "1",
      });

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowCreatePlotModal(false);
        setCreatePlotSuccess(null);
      }, 1500);
    } catch (err: any) {
      setCreatePlotError(err.message || "Failed to create plot");
    }
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Plots</h2>
        <button
          onClick={() => setShowCreatePlotModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Create Plot
        </button>
      </div>

      {/* Create Plot Modal */}
      {showCreatePlotModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Plot</h3>
              <button
                onClick={() => setShowCreatePlotModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {createPlotError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {createPlotError}
              </div>
            )}
            {createPlotSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {createPlotSuccess}
              </div>
            )}

            <form onSubmit={handleCreatePlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Status
                </label>
                <select
                  name="plot_status"
                  value={plotFormData.plot_status}
                  onChange={handlePlotFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="work_in_progress">In Progress</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (sq.ft)
                </label>
                <input
                  type="number"
                  name="area"
                  value={plotFormData.area}
                  onChange={handlePlotFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={plotFormData.price}
                  onChange={handlePlotFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Plots
                </label>
                <input
                  type="number"
                  name="number_of_plots"
                  value={plotFormData.number_of_plots}
                  onChange={handlePlotFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="1"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePlotModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Create Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              onClick={() => handlePlotClick(plot)}
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
              selectedPlot.plot_status === "work_in_progress" ? (
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

"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getProjectPlotsApi,
  createPlotApi,
  getProjectDetails,
  updatePlotApi,
  sellPlotApi,
  getMyProjectsApi,
} from "../../../../lib/apis/auth";
import MainLayout from "../../../../components/MainLayout";
import { useAtom } from "jotai";
import { plotsAtom } from "../../../../lib/atoms";
import { useAuth } from "../../../../lib/contexts/AuthContext";
import { getPlotTransactionHistory } from "../../../../lib/apis/transactions";

export default function SalesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [plots, setPlots] = useAtom(plotsAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<any | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  //p plot states
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

  // edit plot
  const [showEditPlotModal, setShowEditPlotModal] = useState(false);
  const [editPlotFormData, setEditPlotFormData] = useState({
    plot_status: "available",
    area: "",
    price: "",
  });
  const [editPlotError, setEditPlotError] = useState<string | null>(null);
  const [editPlotSuccess, setEditPlotSuccess] = useState<string | null>(null);

  // sell plot
  const [showSellPlotForm, setShowSellPlotForm] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    amount_collected: "",
    sold_on_date: new Date().toISOString(),
    customer_name: "",
    customer_phone: "",
    customer_email: "",
  });
  const [sellPlotError, setSellPlotError] = useState<string | null>(null);
  const [sellPlotSuccess, setSellPlotSuccess] = useState<string | null>(null);
  const { token, isLoading: authLoading } = useAuth();

  // transaction history of a plot
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [transactionHistoryLoading, setTransactionHistoryLoading] =
    useState(false);
  const [transactionHistoryError, setTransactionHistoryError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (authLoading) return; // Wait until auth is loaded

      setProjectLoading(true);
      try {
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
  }, [projectId, token, authLoading]);

  useEffect(() => {
    const fetchPlots = async () => {
      if (authLoading) return; // Wait until auth is loaded

      setLoading(true);
      setError(null);
      try {
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
  }, [projectId, setPlots, token, authLoading]);

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
    setShowEditPlotModal(false);
    setShowSellPlotForm(false);
    setShowTransactionHistory(false);
    setTransactionHistory([]);
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

  // Add this handler function
  const handleEditPlotClick = (plot: any) => {
    setEditPlotFormData({
      plot_status: plot.plot_status,
      area: plot.area.toString(),
      price: plot.price.toString(),
    });
    setShowEditPlotModal(true);
  };

  // Add this submit handler
  const handleEditPlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditPlotError(null);
    setEditPlotSuccess(null);

    try {
      if (!token) throw new Error("No access token found");
      if (!selectedPlot) throw new Error("No plot selected");

      const plotData = {
        ...editPlotFormData,
        area: Number(editPlotFormData.area),
        price: Number(editPlotFormData.price),
      };

      await updatePlotApi(token, selectedPlot.id, plotData);
      setEditPlotSuccess("Plot updated successfully!");

      // Refresh plots list
      const response = await getProjectPlotsApi(token, projectId);
      setPlots(response.data || []);

      // Update the selected plot with new data
      const updatedPlot = response.data.find(
        (plot: any) => plot.id === selectedPlot.id
      );
      if (updatedPlot) {
        setSelectedPlot(updatedPlot);
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowEditPlotModal(false);
        setEditPlotSuccess(null);
      }, 1000);
    } catch (err: any) {
      setEditPlotError(err.message || "Failed to update plot");
    }
  };

  const handleEditPlotFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditPlotFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add this to your fetchProject useEffect to get user role
  useEffect(() => {
    const fetchProject = async () => {
      setProjectLoading(true);
      try {
        if (!token) throw new Error("No access token found");
        const project = await getProjectDetails(token, projectId);
        setProjectName(project.name || projectId);

        // Get user role for this project
        const myProjects = await getMyProjectsApi(token);
        const currentProject = myProjects.data.find(
          (p: any) => p.id === projectId
        );
      } catch {
        setProjectName(projectId);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId, token]);

  // Add this handler function
  const handleSellPlotClick = () => {
    setSellFormData({
      amount_collected: selectedPlot?.price.toString() || "",
      sold_on_date: new Date().toISOString(),
      customer_name: "",
      customer_phone: "",
      customer_email: "",
    });
    setShowSellPlotForm(true);
  };

  // Add this submit handler
  const handleSellPlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSellPlotError(null);
    setSellPlotSuccess(null);

    try {
      if (!token) throw new Error("No access token found");
      if (!selectedPlot) throw new Error("No plot selected");

      const sellData = {
        ...sellFormData,
        amount_collected: Number(sellFormData.amount_collected),
      };

      await sellPlotApi(token, selectedPlot.id, sellData);
      setSellPlotSuccess("Plot sold successfully!");

      // Refresh plots list
      const response = await getProjectPlotsApi(token, projectId);
      setPlots(response.data || []);

      // Update the selected plot with new data
      const updatedPlot = response.data.find(
        (plot: any) => plot.id === selectedPlot.id
      );
      if (updatedPlot) {
        setSelectedPlot(updatedPlot);
      }

      // Close form after 1.5 seconds
      setTimeout(() => {
        setShowSellPlotForm(false);
        setSellPlotSuccess("");
      }, 1500);
    } catch (err: any) {
      setSellPlotError(err.message || "Failed to sell plot");
    }
  };

  // Add this form change handler
  const handleSellFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSellFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleViewTransactionHistory = async () => {
    if (!selectedPlot) return;

    setTransactionHistoryLoading(true);
    setTransactionHistoryError(null);

    try {
      if (!token) throw new Error("No access token found");
      const history = await getPlotTransactionHistory(token, selectedPlot.id);
      setTransactionHistory(history.data || []);
      setShowTransactionHistory(true);
    } catch (err: any) {
      setTransactionHistoryError(
        err.message || "Failed to load transaction history"
      );
      console.log(err);
    } finally {
      setTransactionHistoryLoading(false);
    }
  };

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition cursor-pointer"
        >
          Create Plot
        </button>
      </div>

      {/* Create Plot Modal */}
      {showCreatePlotModal && (
        <div className="fixed inset-0  flex items-center justify-center p-4 z-10">
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
                onClick={() => handleEditPlotClick(selectedPlot)}
                className="px-3 py-1 bg-blue-600 text-white cursor-pointer rounded-md text-sm hover:bg-blue-700"
              >
                Edit Plot
              </button>
              <button
                onClick={handleSellPlotClick}
                disabled={
                  selectedPlot.plot_status === "sold" ||
                  selectedPlot.transaction_approval_status === "pending"
                }
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedPlot.plot_status === "sold" ||
                  selectedPlot.transaction_approval_status === "pending"
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Sell Plot
              </button>
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
            <button
              onClick={handleViewTransactionHistory}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              {transactionHistoryLoading ? "Loading..." : "Transaction History"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Plot Modal */}
      {showEditPlotModal && (
        <div className="bg-opacity-50 flex items-center justify-center my-4">
          <div className="bg-white rounded-lg p-6  w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Edit Plot #{selectedPlot?.number}
              </h3>
              <button
                onClick={() => setShowEditPlotModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {editPlotError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {editPlotError}
              </div>
            )}
            {editPlotSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {editPlotSuccess}
              </div>
            )}

            <form onSubmit={handleEditPlotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Status
                </label>
                <select
                  name="plot_status"
                  value={editPlotFormData.plot_status}
                  onChange={handleEditPlotFormChange}
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
                  value={editPlotFormData.area}
                  onChange={handleEditPlotFormChange}
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
                  value={editPlotFormData.price}
                  onChange={handleEditPlotFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditPlotModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Update Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* sell plot modal */}
      {showSellPlotForm && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Sell Plot #{selectedPlot.number}
          </h3>

          {sellPlotError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {sellPlotError}
            </div>
          )}
          {sellPlotSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {sellPlotSuccess}
            </div>
          )}

          <form onSubmit={handleSellPlotSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Collected (₹)
              </label>
              <input
                type="number"
                name="amount_collected"
                value={sellFormData.amount_collected}
                onChange={handleSellFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                name="customer_name"
                value={sellFormData.customer_name}
                onChange={handleSellFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Phone
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={sellFormData.customer_phone}
                onChange={handleSellFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                name="customer_email"
                value={sellFormData.customer_email}
                onChange={handleSellFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowSellPlotForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Confirm Sale
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionHistory && (
        <div className="flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Transaction History for Plot #{selectedPlot?.number}
              </h3>
              <button
                onClick={() => setShowTransactionHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {transactionHistoryError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {transactionHistoryError}
              </div>
            )}

            {transactionHistory.length === 0 ? (
              <p>No transaction history found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Initiated By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionHistory.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(transaction.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.mode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ₹{transaction.total_amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              transaction.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.initiated_by?.full_name || "System"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

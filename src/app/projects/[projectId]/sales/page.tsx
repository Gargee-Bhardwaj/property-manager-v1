"use client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getProjectPlotsApi,
  createPlotApi,
  getProjectDetails,
  updatePlotApi,
  sellPlotApi,
  getMyProjectsApi,
  getPlotEmiDetails,
  markEmiAsPaid,
} from "../../../../lib/apis/auth";
import MainLayout from "../../../../components/MainLayout";
import { useAtom } from "jotai";
import { plotsAtom } from "../../../../lib/atoms";
import { useAuth } from "../../../../lib/contexts/AuthContext";
import { getPlotTransactionHistory } from "../../../../lib/apis/transactions";
import { CreatePlotModal } from "../../../../components/modals/CreatePlotModal";
import { EditPlotModal } from "../../../../components/modals/EditPlotModal";
import { SellPlotModal } from "../../../../components/modals/SellPlotModal";
import { TransactionHistoryModal } from "../../../../components/modals/TransactionHistoryModal";
import { PlotDetailsModal } from "../../../../components/modals/PlotDetailsModal";

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
    amount_collected: selectedPlot?.price.toString() || "",
    sold_on_date: new Date().toISOString().split("T")[0],
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    is_emi: false,
    emi_amount: undefined,
    emi_start_date: new Date().toISOString().split("T")[0],
    emi_frequency_months: undefined,
    remaining_amount: selectedPlot ? selectedPlot.price : 0,
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

  // emi details
  const [emiDetails, setEmiDetails] = useState<any[]>([]);
  const [loadingEmiDetails, setLoadingEmiDetails] = useState(false);
  const [emiError, setEmiError] = useState<string | null>(null);

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

  console.log(plots, "plots in sales page");

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

  const handlePlotClick = async (plot: any) => {
    setSelectedPlot(plot);
    setLoadingEmiDetails(true);
    setEmiError(null);

    try {
      if (!token) throw new Error("No access token found");
      if (plot.is_emi) {
        const response = await getPlotEmiDetails(token, plot.id);
        setEmiDetails(response.data || []);
      } else {
        setEmiDetails([]);
      }
    } catch (err: any) {
      setEmiError(err.message || "Failed to load EMI details");
    } finally {
      setLoadingEmiDetails(false);
    }
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
      sold_on_date: new Date().toISOString().split("T")[0],
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      is_emi: false,
      emi_amount: undefined,
      emi_start_date: new Date().toISOString().split("T")[0],
      emi_frequency_months: undefined,
      remaining_amount: 0,
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

      if (sellFormData.is_emi) {
        const remaining =
          selectedPlot.price - Number(sellFormData.amount_collected);
        const calculatedInstallments = Math.ceil(
          remaining / Number(sellFormData.emi_amount)
        );

        if (
          calculatedInstallments !== Number(sellFormData.emi_frequency_months)
        ) {
          throw new Error(
            "EMI calculation mismatch. Please check your amounts."
          );
        }
      }

      const sellData = {
        amount_collected: Number(sellFormData.amount_collected),
        sold_on_date: sellFormData.sold_on_date,
        customer_name: sellFormData.customer_name,
        customer_phone: sellFormData.customer_phone,
        customer_email: sellFormData.customer_email,
        is_emi: sellFormData.is_emi || undefined,
        ...(sellFormData.is_emi && {
          emi_amount: Number(sellFormData.emi_amount),
          emi_start_date: sellFormData.emi_start_date,
          emi_frequency_months: Number(sellFormData.emi_frequency_months),
        }),
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

  // Memoized calculation function
  const calculateInstallments = useCallback(
    (price: number, collected: number, emiAmount: number) =>
      Math.ceil((price - collected) / emiAmount),
    []
  );

  // More efficient handler

  // const handleSellFormChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const { name, value } = e.target;

  //     setSellFormData((prev) => {
  //       // Early return if no plot selected
  //       if (!selectedPlot) return { ...prev, [name]: value };

  //       const plotPrice = selectedPlot.price;
  //       const collected =
  //         name === "amount_collected"
  //           ? Number(value) || 0
  //           : Number(prev.amount_collected) || 0;

  //       const emiAmount =
  //         name === "emi_amount"
  //           ? Number(value) || 0
  //           : Number(prev.emi_amount) || 0;

  //       // Calculate once
  //       const remaining = plotPrice - collected;
  //       const shouldCalculateEMI =
  //         prev.is_emi &&
  //         (name === "emi_amount" || name === "amount_collected") &&
  //         emiAmount > 0;

  //       return {
  //         ...prev,
  //         [name]: value,
  //         remaining_amount: remaining,
  //         emi_frequency_months: shouldCalculateEMI
  //           ? calculateInstallments(plotPrice, collected, emiAmount)
  //           : prev.emi_frequency_months,
  //       };
  //     });
  //   },
  //   [selectedPlot, calculateInstallments]
  // );

  const handleSellFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSellFormData((prev) => {
      // Create base update
      const updated = {
        ...prev,
        [name]: value,
      };

      // Only calculate if we have a selected plot
      if (!selectedPlot) return updated;

      // Convert relevant values to numbers
      const plotPrice = selectedPlot.price;
      const collected =
        name === "amount_collected"
          ? Number(value) || 0
          : Number(prev.amount_collected) || 0;
      const emiAmount =
        name === "emi_amount"
          ? Number(value) || 0
          : Number(prev.emi_amount) || 0;

      // Calculate remaining amount
      const remaining = plotPrice - collected;
      updated.remaining_amount = remaining;

      // Auto-calculate EMI frequency when relevant fields change
      if (
        prev.is_emi &&
        (name === "emi_amount" || name === "amount_collected") &&
        emiAmount > 0
      ) {
        updated.emi_frequency_months = Math.ceil(remaining / emiAmount);
      }

      return updated;
    });
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

  const handleMarkEmiAsPaid = async (emiId: string) => {
    try {
      if (!token) throw new Error("No access token found");
      await markEmiAsPaid(token, emiId);

      // Refresh EMI details
      if (selectedPlot) {
        const response = await getPlotEmiDetails(token, selectedPlot.id);
        setEmiDetails(response.data || []);
      }

      // Optionally show success message
      setEmiError(null);
    } catch (err: any) {
      setEmiError(err.message || "Failed to mark EMI as paid");
    }
  };

  console.log(transactionHistory, "transaction history");
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
      <CreatePlotModal
        show={showCreatePlotModal}
        onClose={() => setShowCreatePlotModal(false)}
        formData={plotFormData}
        error={createPlotError}
        success={createPlotSuccess}
        onChange={handlePlotFormChange}
        onSubmit={handleCreatePlot}
      />

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
        <PlotDetailsModal
          show={!!selectedPlot}
          plot={selectedPlot}
          onClose={handleCloseDetails}
          onEditClick={() => handleEditPlotClick(selectedPlot)}
          onSellClick={handleSellPlotClick}
          onViewHistory={handleViewTransactionHistory}
          loadingHistory={transactionHistoryLoading}
          emiDetails={emiDetails}
          loadingEmi={loadingEmiDetails}
          emiError={emiError}
          onMarkEmiAsPaid={handleMarkEmiAsPaid}
        />
      )}

      {/* Edit Plot Modal */}
      {selectedPlot && (
        <EditPlotModal
          show={showEditPlotModal}
          onClose={() => setShowEditPlotModal(false)}
          formData={editPlotFormData}
          error={editPlotError}
          success={editPlotSuccess}
          onChange={handleEditPlotFormChange}
          onSubmit={handleEditPlotSubmit}
          plotNumber={selectedPlot.number}
        />
      )}

      {/* Sell Plot Modal */}
      {selectedPlot && (
        <SellPlotModal
          show={showSellPlotForm}
          onClose={() => setShowSellPlotForm(false)}
          formData={sellFormData}
          error={sellPlotError}
          success={sellPlotSuccess}
          onChange={handleSellFormChange}
          onCheckboxChange={(e) => {
            setSellFormData((prev) => ({
              ...prev,
              is_emi: e.target.checked,
            }));
          }}
          onSubmit={handleSellPlotSubmit}
          plotNumber={selectedPlot.number}
        />
      )}

      {/* Transaction History Modal */}
      {selectedPlot && (
        <TransactionHistoryModal
          show={showTransactionHistory}
          onClose={() => setShowTransactionHistory(false)}
          transactions={transactionHistory}
          loading={transactionHistoryLoading}
          error={transactionHistoryError}
          plotNumber={selectedPlot.number}
        />
      )}
    </MainLayout>
  );
}

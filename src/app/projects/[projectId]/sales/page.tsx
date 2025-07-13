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
  addAmountToPlotApi,
  generateUploadUrlApi,
  associatePlotDocumentApi,
  uploadFile,
  getPlotDocumentsApi,
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
import { AddAmountModal } from "../../../../components/modals/AddAmountModal";
import { UploadDocumentModal } from "../../../../components/modals/UploadDocumentModal";
import {
  ViewDocumentsModal,
  PlotDocument,
} from "../../../../components/modals/ViewDocumentsModal";

// Add interfaces for type safety
interface Plot {
  id: string;
  number: number;
  plot_status: string;
  area: number;
  price: number;
  is_emi: boolean;
  amount_collected: number;
  misc_amount: number;
  total_amount_collected: number;
  transaction_approval_status?: string;
}

interface ProjectDetails {
  name: string;
}

interface ApiResponse<T> {
  data: T;
}

const GreenTickIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-green-600"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

export default function SalesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [plots, setPlots] = useAtom(plotsAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
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
  const [isCreatingPlot, setIsCreatingPlot] = useState(false);

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
    amount_collected: selectedPlot?.price.toLocaleString("en-IN") || "",
    misc_amount: selectedPlot?.misc_amount?.toLocaleString("en-IN") || "0",
    sold_on_date: new Date().toISOString().split("T")[0],
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    is_emi: false,
    emi_amount: undefined,
    emi_start_date: new Date().toISOString().split("T")[0],
    emi_frequency_months: 1,
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
  // Track which EMI is being marked as paid
  const [markingEmiId, setMarkingEmiId] = useState<string | null>(null);
  const [sentForApprovalEmis, setSentForApprovalEmis] = useState<string[]>([]);

  // Add Amount state
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const [isSubmittingAmount, setIsSubmittingAmount] = useState(false);
  const [addAmountError, setAddAmountError] = useState<string | null>(null);

  // Upload Document state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // View Documents state
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [documents, setDocuments] = useState<PlotDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // client side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const plotsPerPage = 20;
  const [displayedPlots, setDisplayedPlots] = useState<Plot[]>([]);
  const [totalPlots, setTotalPlots] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (authLoading) return; // Wait until auth is loaded

      setProjectLoading(true);
      try {
        if (!token) throw new Error("No access token found");
        const project = (await getProjectDetails(
          token,
          projectId
        )) as ProjectDetails;
        setProjectName(project?.name || projectId);
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
      if (authLoading) return;

      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error("No access token found");
        const response = (await getProjectPlotsApi(
          token,
          projectId,
          plotsPerPage,
          currentPage
        )) as ApiResponse<Plot[]>;
        setPlots(response?.data || []);
        setDisplayedPlots(response?.data || []);
        setTotalPlots(response?.data?.length || 0);
      } catch (err: any) {
        setError(err.message || "Failed to fetch plots");
      } finally {
        setLoading(false);
      }
    };
    fetchPlots();
  }, [projectId, setPlots, token, authLoading, currentPage]);

  const getStatusColor = useCallback((plot: Plot) => {
    if (plot.transaction_approval_status === "pending") {
      return "bg-orange-100 text-orange-800 border-orange-300";
    }
    switch (plot.plot_status) {
      case "sold":
        return "bg-green-100 text-green-800 border-green-300";
      case "available":
        return "bg-red-200 text-red-800 border-red-400";
      case "work_in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }, []);

  const handlePlotClick = useCallback(
    async (plot: Plot) => {
      setSelectedPlot(plot);
      setLoadingEmiDetails(true);
      setEmiError(null);

      try {
        if (!token) throw new Error("No access token found");
        if (plot.is_emi) {
          const response = (await getPlotEmiDetails(
            token,
            plot.id
          )) as ApiResponse<any[]>;
          setEmiDetails(response?.data || []);
        } else {
          setEmiDetails([]);
        }
      } catch (err: any) {
        setEmiError(err.message || "Failed to load EMI details");
      } finally {
        setLoadingEmiDetails(false);
      }
    },
    [token]
  );

  const handleCloseDetails = useCallback(() => {
    setSelectedPlot(null);
    setShowEditPlotModal(false);
    setShowSellPlotForm(false);
    setShowTransactionHistory(false);
    setTransactionHistory([]);
  }, []);

  const handlePlotFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setPlotFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleCreatePlot = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreatePlotError(null);
      setCreatePlotSuccess(null);
      setIsCreatingPlot(true);
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

        const response = (await getProjectPlotsApi(
          token,
          projectId,
          plotsPerPage,
          currentPage
        )) as ApiResponse<Plot[]>;
        setPlots(response?.data || []);
        setDisplayedPlots(response?.data || []);

        setPlotFormData({
          plot_status: "available",
          area: "",
          price: "",
          number_of_plots: "1",
        });

        setTimeout(() => {
          setShowCreatePlotModal(false);
          setCreatePlotSuccess(null);
          setIsCreatingPlot(false);
        }, 1500);
      } catch (err: any) {
        setCreatePlotError(err.message || "Failed to create plot");
        setIsCreatingPlot(false);
      }
    },
    [token, projectId, plotFormData, setPlots, currentPage]
  );

  const handleEditPlotClick = useCallback((plot: Plot) => {
    setSelectedPlot(plot);
    setEditPlotFormData({
      plot_status: plot.plot_status,
      area: plot.area.toString(),
      price: plot.price.toString(),
    });
    setShowEditPlotModal(true);
  }, []);

  const handleEditPlotSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setEditPlotError(null);
      setEditPlotSuccess(null);
      if (!selectedPlot) return;

      try {
        if (!token) throw new Error("No access token found");

        const plotData = {
          plot_status: editPlotFormData.plot_status,
          area: Number(editPlotFormData.area),
          price: Number(editPlotFormData.price),
        };

        await updatePlotApi(token, selectedPlot.id, plotData);
        setEditPlotSuccess("Plot updated successfully!");

        const response = (await getProjectPlotsApi(
          token,
          projectId,
          plotsPerPage,
          currentPage
        )) as ApiResponse<Plot[]>;
        setPlots(response?.data || []);
        setDisplayedPlots(response?.data || []);

        setTimeout(() => {
          setShowEditPlotModal(false);
          setEditPlotSuccess(null);
          handleCloseDetails();
        }, 1500);
      } catch (err: any) {
        setEditPlotError(err.message || "Failed to update plot");
      }
    },
    [
      token,
      selectedPlot,
      editPlotFormData,
      projectId,
      setPlots,
      handleCloseDetails,
      currentPage,
    ]
  );

  const handleEditPlotFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditPlotFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSellPlotClick = useCallback(() => {
    if (selectedPlot) {
      setSellFormData({
        amount_collected: "0",
        misc_amount: "0",
        sold_on_date: new Date().toISOString().split("T")[0],
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        is_emi: false,
        emi_amount: undefined,
        emi_start_date: new Date().toISOString().split("T")[0],
        emi_frequency_months: 1,
        remaining_amount: selectedPlot.price,
      });
    }
    setShowSellPlotForm(true);
  }, [selectedPlot]);

  const handleSellPlotSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSellPlotError(null);
      setSellPlotSuccess(null);
      if (!selectedPlot) return;
      if (!token) {
        setSellPlotError("No access token found. Please log in.");
        return;
      }

      const {
        amount_collected,
        sold_on_date,
        customer_name,
        customer_phone,
        customer_email,
        is_emi,
        emi_amount,
        emi_start_date,
        emi_frequency_months,
        misc_amount,
      } = sellFormData;

      const sellData: any = {
        amount_collected: Number(amount_collected),
        sold_on_date,
        customer_name,
        customer_phone,
        customer_email,
        is_emi,
        misc_amount,
      };

      if (is_emi) {
        sellData.emi_amount = Number(emi_amount);
        sellData.emi_start_date = emi_start_date;
        sellData.emi_frequency_months = Number(emi_frequency_months);
      }

      try {
        await sellPlotApi(token, selectedPlot.id, sellData);
        setSellPlotSuccess("Plot sold successfully!");

        const response = (await getProjectPlotsApi(
          token,
          projectId,
          plotsPerPage,
          currentPage
        )) as ApiResponse<Plot[]>;
        setPlots(response?.data || []);
        setDisplayedPlots(response?.data || []);

        setTimeout(() => {
          setShowSellPlotForm(false);
          setSellPlotSuccess(null);
          handleCloseDetails();
        }, 1000);
      } catch (err: any) {
        setSellPlotError(err.message || "Failed to sell plot");
      }
    },
    [
      token,
      selectedPlot,
      sellFormData,
      projectId,
      setPlots,
      handleCloseDetails,
      currentPage,
    ]
  );

  const handleSellFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      if (name === "is_emi") {
        setSellFormData((prev) => ({
          ...prev,
          is_emi: checked,
          emi_amount: undefined,
          emi_frequency_months: 1,
        }));
      } else {
        setSellFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    []
  );

  const handleViewTransactionHistory = useCallback(async () => {
    if (!selectedPlot) return;
    setTransactionHistoryLoading(true);
    setTransactionHistoryError(null);
    try {
      if (!token) throw new Error("No access token found");
      const history = (await getPlotTransactionHistory(
        token,
        selectedPlot.id
      )) as ApiResponse<any[]>;
      setTransactionHistory(history?.data || []);
      setShowTransactionHistory(true);
    } catch (err: any) {
      setTransactionHistoryError(
        err.message || "Failed to fetch transaction history"
      );
    } finally {
      setTransactionHistoryLoading(false);
    }
  }, [token, selectedPlot]);

  const handleAddAmount = useCallback(
    async (amount: number) => {
      if (!selectedPlot || !token) return;
      setIsSubmittingAmount(true);
      setAddAmountError(null);
      try {
        await addAmountToPlotApi(token, selectedPlot.id, amount);
        setShowAddAmountModal(false);
        // Refresh plot data
        const response = (await getProjectPlotsApi(
          token,
          projectId,
          plotsPerPage,
          currentPage
        )) as ApiResponse<Plot[]>;
        setPlots(response?.data || []);
        setDisplayedPlots(response?.data || []);
      } catch (err: any) {
        setAddAmountError(err.message || "Failed to add amount.");
      } finally {
        setIsSubmittingAmount(false);
      }
    },
    [token, selectedPlot, projectId, setPlots, currentPage]
  );

  const handleUploadDocument = useCallback(
    async (file: File) => {
      if (!selectedPlot || !token) {
        console.error("Upload Error: No selected plot or token available.");
        return;
      }

      console.log("--- Starting file upload process ---");
      console.log("1. Selected file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      console.log("2. Target Plot ID:", selectedPlot.id);

      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      try {
        console.log("3. Requesting pre-signed upload URL from the backend...");
        const response = (await generateUploadUrlApi(
          token,
          file.name,
          file.type
        )) as { upload_url: string; unique_key: string };
        console.log("4. Received response from backend:", response);

        if (!response || !response.upload_url || !response.unique_key) {
          throw new Error(
            "Backend did not return a valid upload URL or unique key."
          );
        }
        const { upload_url, unique_key } = response;
        console.log("   - Extracted Upload URL:", upload_url);
        console.log("   - Extracted Unique Key:", unique_key);

        console.log(
          "5. Uploading file directly to the pre-signed URL via PUT request..."
        );
        await uploadFile(upload_url, file);
        console.log("6. File successfully uploaded to storage.");

        console.log("7. Associating uploaded file with the plot...");
        await associatePlotDocumentApi(token, selectedPlot.id, unique_key);
        console.log("8. File successfully associated with the plot.");

        setUploadSuccess("File uploaded successfully!");
        // Adding a small delay to show success message before closing.
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess(null);
        }, 1500);
      } catch (err: any) {
        console.error("--- ERROR during file upload process ---", err);
        setUploadError(
          err.message || "An unexpected error occurred during file upload."
        );
      } finally {
        setIsUploading(false);
        console.log("--- File upload process finished ---");
      }
    },
    [token, selectedPlot]
  );

  const handleViewDocuments = useCallback(async () => {
    if (!selectedPlot || !token) return;
    setShowDocumentsModal(true);
    setIsLoadingDocuments(true);
    setDocumentsError(null);
    try {
      const response = (await getPlotDocumentsApi(
        token,
        selectedPlot.id
      )) as ApiResponse<PlotDocument[]>;
      setDocuments(response?.data || []);
    } catch (err: any) {
      setDocumentsError(err.message || "Could not fetch documents.");
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [token, selectedPlot]);

  const handleMarkEmiAsPaid = useCallback(
    async (emiId: string) => {
      if (!selectedPlot) return;
      setMarkingEmiId(emiId);
      try {
        if (!token) throw new Error("No access token found");
        await markEmiAsPaid(token, selectedPlot.id, emiId);
        // Refresh EMI details
        const response = (await getPlotEmiDetails(
          token,
          selectedPlot.id
        )) as ApiResponse<any[]>;
        setEmiDetails(response?.data || []);
        setSentForApprovalEmis((prev) => [...prev, emiId]);
      } catch (err: any) {
        setEmiError(err.message || "Failed to mark EMI as paid");
      } finally {
        setMarkingEmiId(null);
      }
    },
    [token, selectedPlot]
  );

  const handleNextPage = useCallback(() => {
    setCurrentPage(currentPage + 1);
  }, [currentPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleCreatePlotModalClose = useCallback(() => {
    setShowCreatePlotModal(false);
    setCreatePlotError(null);
    setCreatePlotSuccess(null);
  }, []);

  const handleEditPlotModalClose = useCallback(() => {
    setShowEditPlotModal(false);
    setEditPlotError(null);
    setEditPlotSuccess(null);
  }, []);

  const handleSellPlotModalClose = useCallback(() => {
    setShowSellPlotForm(false);
    setSellPlotError(null);
    setSellPlotSuccess(null);
  }, []);

  const handleAddAmountModalClose = useCallback(() => {
    setShowAddAmountModal(false);
    setAddAmountError(null);
  }, []);

  const handleUploadModalClose = useCallback(() => {
    setShowUploadModal(false);
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  const handleViewDocumentsModalClose = useCallback(() => {
    setShowDocumentsModal(false);
    setDocumentsError(null);
  }, []);

  if (authLoading) {
    return (
      <MainLayout>
        <div>Loading session...</div>
      </MainLayout>
    );
  }

  console.log(plots);
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
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Sales for {projectName}</h2>
          <button
            onClick={() => setShowCreatePlotModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-semibold"
          >
            + Add Plot
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-4">
            {Array.from({ length: plotsPerPage }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-4">
              {displayedPlots.map((plot) => (
                <div
                  key={plot.id}
                  className={`relative p-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105 border-2 ${getStatusColor(
                    plot
                  )}`}
                  onClick={() => handlePlotClick(plot)}
                >
                  {plot.plot_status === "sold" &&
                    Number(
                      plot.total_amount_collected ?? plot.amount_collected
                    ) >= Number(plot.price) && (
                      <div className="absolute top-1 right-1">
                        <GreenTickIcon />
                      </div>
                    )}
                  <p className="font-semibold">Plot #{plot.number}</p>

                  <span
                    className={`text-xs font-bold py-1 px-2 rounded-full mt-2 inline-block`}
                  >
                    {plot.transaction_approval_status === "pending"
                      ? "PENDING APPROVAL"
                      : plot.plot_status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            {plots.length > 0 && (
              <div className="flex justify-center items-center mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="mx-4">Page {currentPage}</span>
                <button
                  onClick={handleNextPage}
                  disabled={plots.length < plotsPerPage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <CreatePlotModal
          show={showCreatePlotModal}
          onClose={handleCreatePlotModalClose}
          onSubmit={handleCreatePlot}
          formData={plotFormData}
          onChange={handlePlotFormChange}
          error={createPlotError}
          success={createPlotSuccess}
          isSubmitting={isCreatingPlot}
        />

        {selectedPlot && (
          <>
            <EditPlotModal
              show={showEditPlotModal}
              onClose={handleEditPlotModalClose}
              onSubmit={handleEditPlotSubmit}
              formData={editPlotFormData}
              onChange={handleEditPlotFormChange}
              error={editPlotError}
              success={editPlotSuccess}
              plotNumber={selectedPlot.number}
            />

            <SellPlotModal
              show={showSellPlotForm}
              onClose={handleSellPlotModalClose}
              onSubmit={handleSellPlotSubmit}
              formData={sellFormData}
              onChange={handleSellFormChange}
              onCheckboxChange={handleSellFormChange}
              error={sellPlotError}
              success={sellPlotSuccess}
              plotNumber={selectedPlot.number}
            />

            <TransactionHistoryModal
              show={showTransactionHistory}
              onClose={() => setShowTransactionHistory(false)}
              transactions={transactionHistory}
              loading={transactionHistoryLoading}
              error={transactionHistoryError}
              plotNumber={selectedPlot.number}
            />

            <PlotDetailsModal
              show={!!selectedPlot}
              plot={selectedPlot}
              onClose={handleCloseDetails}
              onEditClick={() => handleEditPlotClick(selectedPlot)}
              onSellClick={handleSellPlotClick}
              onViewHistory={handleViewTransactionHistory}
              onAddAmountClick={() => setShowAddAmountModal(true)}
              onUploadDocumentClick={() => setShowUploadModal(true)}
              onViewDocumentsClick={handleViewDocuments}
              loadingHistory={transactionHistoryLoading}
              emiDetails={emiDetails}
              loadingEmi={loadingEmiDetails}
              emiError={emiError}
              onMarkEmiAsPaid={handleMarkEmiAsPaid}
              markingEmiId={markingEmiId}
              sentForApprovalEmis={sentForApprovalEmis}
            />
            <AddAmountModal
              show={showAddAmountModal}
              onClose={handleAddAmountModalClose}
              onSubmit={handleAddAmount}
              plotNumber={selectedPlot.number}
              isSubmitting={isSubmittingAmount}
              error={addAmountError}
            />
            <UploadDocumentModal
              show={showUploadModal}
              onClose={handleUploadModalClose}
              onUpload={handleUploadDocument}
              plotNumber={selectedPlot.number}
              isUploading={isUploading}
              error={uploadError}
              success={uploadSuccess}
            />
            <ViewDocumentsModal
              show={showDocumentsModal}
              onClose={handleViewDocumentsModalClose}
              documents={documents}
              plotNumber={selectedPlot.number}
              isLoading={isLoadingDocuments}
              error={documentsError}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}

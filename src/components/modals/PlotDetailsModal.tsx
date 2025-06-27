import React, { useState } from "react";

interface PlotDetailsModalProps {
  show: boolean;
  plot: {
    number: number;
    plot_status: string;
    area: number;
    price: number;
    total_amount_collected: number;
    sold_on_date?: string;
    customer_id?: string;
    sold_by_user_id?: string;
    is_emi?: boolean;
    emi_amount?: number;
    emi_frequency_months?: number;
    emi_start_date?: string;
    transaction_approval_status?: string;
    transaction_approved_at?: string;
    sold_by_user?: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
    };
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
  };
  onClose: () => void;
  onEditClick: () => void;
  onSellClick: () => void;
  onViewHistory: () => void;
  onAddAmountClick: () => void;
  onUploadDocumentClick: () => void;
  onViewDocumentsClick: () => void;
  loadingHistory: boolean;
  emiDetails?: Array<{
    id: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
    paid_date?: string;
    transaction_id?: string;
  }>;
  loadingEmi?: boolean;
  emiError?: string | null;
  onMarkEmiAsPaid?: (emiId: string) => void;
  markingEmiId?: string | null;
  sentForApprovalEmis?: string[];
}

export const PlotDetailsModal: React.FC<PlotDetailsModalProps> = ({
  show,
  plot,
  onClose,
  onEditClick,
  onSellClick,
  onViewHistory,
  onAddAmountClick,
  onUploadDocumentClick,
  onViewDocumentsClick,
  loadingHistory,
  emiDetails = [],
  loadingEmi = false,
  emiError = null,
  onMarkEmiAsPaid,
  markingEmiId = null,
  sentForApprovalEmis = [],
}) => {
  if (!show) return null;

  const [showEmiSchedule, setShowEmiSchedule] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sold":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-red-100 text-red-800";
      case "work_in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 my-4 max-w-[95vw] w-[90vw] md:w-auto mx-auto overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2 md:gap-0">
        <h2 className="text-xl font-bold">Plot #{plot.number} Details</h2>
        <div className="flex gap-2 md:gap-4 items-center flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              plot.plot_status
            )}`}
          >
            {plot.plot_status.replace("_", " ").toUpperCase()}
          </span>
          <button
            onClick={onEditClick}
            disabled={
              plot.plot_status === "sold" ||
              plot.transaction_approval_status === "pending"
            }
            className={`px-3 py-1 rounded-md text-sm ${
              plot.plot_status === "sold" ||
              plot.transaction_approval_status === "pending"
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Edit Plot
          </button>
          <button
            onClick={onSellClick}
            disabled={
              plot.plot_status === "sold" ||
              plot.transaction_approval_status === "pending"
            }
            className={`px-3 py-1 rounded-md text-sm ${
              plot.plot_status === "sold" ||
              plot.transaction_approval_status === "pending"
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Sell Plot
          </button>
          <button
            onClick={onClose}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Basic Info */}
        <div className="space-y-2 md:space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">
            Plot Information
          </h3>
          <p>
            <span className="font-medium">Area:</span> {plot.area} sq.ft
          </p>
          <p>
            <span className="font-medium">Price:</span> ₹
            {plot.price.toLocaleString("en-IN")}
          </p>
          <p>
            <span className="font-medium">Amount Collected:</span> ₹
            {plot.total_amount_collected.toLocaleString("en-IN")}
          </p>
          <p>
            <span className="font-medium">Balance:</span> ₹
            {(plot.price - plot.total_amount_collected).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Sale Details */}
        <div className="space-y-2 md:space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">Sale Details</h3>
          {plot.plot_status === "sold" ||
          plot.plot_status === "work_in_progress" ? (
            <>
              <p>
                <span className="font-medium">Sold On:</span>{" "}
                {plot.sold_on_date
                  ? new Date(plot.sold_on_date).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <span className="font-medium">Sold By:</span>{" "}
                {`${plot.sold_by_user?.full_name} | ${plot.sold_by_user?.email} | ${plot.sold_by_user?.phone}` ||
                  "N/A"}
              </p>
              <p>
                <span className="font-medium">Sold To:</span>{" "}
                {`${plot.customer_name} | ${plot.customer_email} | ${plot.customer_phone}` ||
                  "N/A"}
              </p>
            </>
          ) : (
            <p className="text-gray-500">Plot is available for sale</p>
          )}
        </div>

        {/* EMI & Transaction Details */}
        <div className="space-y-2 md:space-y-3">
          <h3 className="font-semibold text-lg border-b pb-2">
            Payment Details
          </h3>
          {plot.is_emi ? (
            <>
              <p>
                <span className="font-medium">EMI Amount per installment:</span>{" "}
                ₹{plot.emi_amount?.toLocaleString("en-IN") || "N/A"}
              </p>
              <p>
                <span className="font-medium">EMI Frequency:</span> Every{" "}
                {plot.emi_frequency_months || "N/A"} month(s)
              </p>
              <p>
                <span className="font-medium">EMI Start Date:</span>{" "}
                {plot.emi_start_date
                  ? new Date(plot.emi_start_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </>
          ) : (
            <p>No EMI plan</p>
          )}

          {plot.transaction_approval_status && (
            <p>
              <span className="font-medium">Approval Status:</span>{" "}
              <span
                className={`$ {
                  plot.transaction_approval_status === "approved"
                    ? "text-green-600"
                    : plot.transaction_approval_status === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {plot.transaction_approval_status.toUpperCase()}
              </span>
            </p>
          )}

          {plot.transaction_approved_at && (
            <p>
              <span className="font-medium">Approved At:</span>{" "}
              {new Date(plot.transaction_approved_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-wrap mt-6">
        <button
          onClick={onViewDocumentsClick}
          className="px-4 py-2 bg-amber-300 rounded hover:bg-amber-400 transition w-full md:w-auto"
        >
          View Documents
        </button>
        <button
          onClick={onUploadDocumentClick}
          className="px-4 py-2 bg-blue-300 rounded hover:bg-blue-400 transition w-full md:w-auto"
        >
          Upload Document
        </button>
        <button
          onClick={onAddAmountClick}
          className="px-4 py-2 bg-green-300 rounded hover:bg-green-400 transition w-full md:w-auto"
        >
          Add Amount
        </button>
        <button
          onClick={onViewHistory}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition w-full md:w-auto"
        >
          {loadingHistory ? "Loading..." : "Transaction History"}
        </button>
        {plot.is_emi && (
          <button
            onClick={() => setShowEmiSchedule((v) => !v)}
            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded transition w-full md:w-auto text-indigo-700"
            aria-expanded={showEmiSchedule}
            aria-controls="emi-schedule-section"
          >
            {showEmiSchedule ? "Hide EMI Schedule" : "View EMI Schedule"}
          </button>
        )}
      </div>

      {/* EMI Schedule Toggle Button */}
      {plot.is_emi && (
        <div className="mt-6 w-full">
          <div
            id="emi-schedule-section"
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showEmiSchedule
                ? "max-h-[600px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-2">
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">
                EMI Schedule
              </h3>
              {/* Error Handling: Show error but keep EMI list visible */}
              {emiError && (
                <div className="text-red-500 mb-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">
                  {emiError}
                </div>
              )}
              {loadingEmi ? (
                <div>Loading EMI details...</div>
              ) : emiDetails.length === 0 ? (
                <div>No EMI details found</div>
              ) : (
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto max-w-full">
                  <table className="min-w-[500px] w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-2 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-2 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-2 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emiDetails.map((emi) => (
                        <tr key={emi.id}>
                          <td className="px-2 py-4 whitespace-nowrap">
                            ₹{emi.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap">
                            {new Date(emi.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                emi.is_paid
                                  ? "bg-green-100 text-green-800"
                                  : sentForApprovalEmis.includes(emi.id)
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-400"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {emi.is_paid ? (
                                "Paid"
                              ) : sentForApprovalEmis.includes(emi.id) ? (
                                <span className="flex items-center gap-1">
                                  Pending Approval
                                  <svg
                                    className="w-3 h-3 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                                    />
                                  </svg>
                                </span>
                              ) : (
                                "Pending"
                              )}
                            </span>
                            {emi.is_paid && emi.paid_date && (
                              <div className="text-xs text-gray-500">
                                Paid on:{" "}
                                {new Date(emi.paid_date).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap">
                            {!emi.is_paid &&
                              onMarkEmiAsPaid &&
                              (sentForApprovalEmis.includes(emi.id) ? (
                                <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-md text-sm">
                                  Sent for Approval
                                </span>
                              ) : (
                                <button
                                  onClick={() => onMarkEmiAsPaid(emi.id)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-300"
                                  disabled={markingEmiId === emi.id}
                                >
                                  {markingEmiId === emi.id ? (
                                    <span className="flex items-center">
                                      <svg
                                        className="animate-spin h-4 w-4 mr-1 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8v8z"
                                        ></path>
                                      </svg>
                                      Marking...
                                    </span>
                                  ) : (
                                    "Mark as Paid"
                                  )}
                                </button>
                              ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

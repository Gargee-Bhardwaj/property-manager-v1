import React from "react";

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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative my-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">Plot #{plot.number} Details</h2>
        <div className="flex gap-4 items-center">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="space-y-3">
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
        <div className="space-y-3">
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
        <div className="space-y-3">
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
                className={`${
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

        {/* mark emi paid */}
        {plot.is_emi && (
          <div className="mt-6 w-full col-span-full">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">
              EMI Schedule
            </h3>
            {loadingEmi ? (
              <div>Loading EMI details...</div>
            ) : emiError ? (
              <div className="text-red-500">{emiError}</div>
            ) : emiDetails.length === 0 ? (
              <div>No EMI details found</div>
            ) : (
              <div className="overflow-y-auto max-h-[400px] w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emiDetails.map((emi) => (
                      <tr key={emi.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ₹{emi.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(emi.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              emi.is_paid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {emi.is_paid ? "Paid" : "Pending"}
                          </span>
                          {emi.is_paid && emi.paid_date && (
                            <div className="text-xs text-gray-500">
                              Paid on:{" "}
                              {new Date(emi.paid_date).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
        )}

        {/* {plot.plot_status === "sold" && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-md font-bold text-gray-800 mb-2">
              Customer Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-600">Name</p>
                <p>{plot.customer_name || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Phone</p>
                <p>{plot.customer_phone || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold text-gray-600">Email</p>
                <p>{plot.customer_email || "N/A"}</p>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4 flex-wrap">
        <button
          onClick={onViewDocumentsClick}
          className="px-4 py-2 bg-amber-300 rounded hover:bg-amber-400 transition"
        >
          View Documents
        </button>
        <button
          onClick={onUploadDocumentClick}
          className="px-4 py-2 bg-blue-300 rounded hover:bg-blue-400 transition"
        >
          Upload Document
        </button>
        <button
          onClick={onAddAmountClick}
          className="px-4 py-2 bg-green-300 rounded hover:bg-green-400 transition"
        >
          Add Amount
        </button>
        <button
          onClick={onViewHistory}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          {loadingHistory ? "Loading..." : "Transaction History"}
        </button>
      </div>
    </div>
  );
};

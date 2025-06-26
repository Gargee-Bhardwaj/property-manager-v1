import React from "react";

interface CreatePlotModalProps {
  show: boolean;
  onClose: () => void;
  formData: {
    plot_status: string;
    area: string;
    price: string;
    number_of_plots: string;
  };
  error: string | null;
  success: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const CreatePlotModal: React.FC<CreatePlotModalProps> = ({
  show,
  onClose,
  formData,
  error,
  success,
  onChange,
  onSubmit,
  isSubmitting = false,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Plot</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="plot_status" value="available" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (sq.ft)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={onChange}
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
              value={formData.price}
              onChange={onChange}
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
              value={formData.number_of_plots}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              min="1"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? "Creating..." : "Create Plot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

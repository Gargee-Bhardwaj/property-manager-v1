import React from "react";

interface EditPlotModalProps {
  show: boolean;
  onClose: () => void;
  formData: {
    plot_status: string;
    area: string;
    price: string;
  };
  error: string | null;
  success: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  plotNumber: number;
}

export const EditPlotModal: React.FC<EditPlotModalProps> = ({
  show,
  onClose,
  formData,
  error,
  success,
  onChange,
  onSubmit,
  plotNumber,
}) => {
  if (!show) return null;

  return (
    <div className="flex items-center justify-center bg-white rounded-lg shadow-md border border-gray-200 fixed inset-0 z-10 max-w-[90vw] md:max-w-[60vw] max-h-[50vh] overflow-y-auto m-auto">
      <div className="bg-white rounded-lg p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Plot #{plotNumber}</h3>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plot Status
            </label>
            <select
              name="plot_status"
              value={formData.plot_status}
              onChange={onChange}
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Update Plot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

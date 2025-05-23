"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { dummyPlots } from "../../../../../../data/dummyData";
import { Card } from "@ui/components/card";

export default function SalesPage() {
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const t = useTranslations("sales");

  const getColorClass = (status: string) => {
    switch (status) {
      case "available":
        return "bg-red-500";
      case "sold":
        return "bg-green-500";
      case "in-progress":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <div className="grid grid-cols-6 gap-4">
        {dummyPlots.map((plot: any) => (
          <button
            key={plot.number}
            onClick={() => setSelectedPlot(plot)}
            className={`h-16 w-16 text-white font-bold rounded ${getColorClass(
              plot.status,
            )}`}
          >
            {plot.number}
          </button>
        ))}
      </div>

      {selectedPlot && (
        <Card className="mt-6 p-4">
          <h2 className="text-lg font-semibold mb-2">
            {t("plotDetails", { number: selectedPlot.number })}
          </h2>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>{t("customerName")}:</strong> {selectedPlot.details.customerName}
            </li>
            <li>
              <strong>{t("soldTo")}:</strong> {selectedPlot.details.soldTo}
            </li>
            <li>
              <strong>{t("soldOn")}:</strong> {selectedPlot.details.soldOn}
            </li>
            <li>
              <strong>{t("amountCollected")}:</strong> ₹{selectedPlot.details.amountCollected}
            </li>
            <li>
              <strong>{t("collectedTillDate")}:</strong> ₹{selectedPlot.details.amountCollectedTillDate}
            </li>
            <li>
              <strong>{t("pendingAmount")}:</strong> ₹{selectedPlot.details.pendingAmount}
            </li>
            <li>
              <strong>{t("nextInstallment")}:</strong> ₹{selectedPlot.details.nextInstallmentAmount} on {selectedPlot.details.nextInstallmentDate}
            </li>
            <li>
              <strong>{t("amountGivenTo")}:</strong> {selectedPlot.details.amountGivenTo} on {selectedPlot.details.amountGivenOn}
            </li>
            <li>
              <strong>{t("documents")}:</strong>
              <ul className="list-disc ml-4">
                {selectedPlot.details.documents.map((doc: any, i: number) => (
                  <li key={i}>
                    <a href={doc.url} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { dummyPlots } from "../../../../../../data/dummyData";
import { Card } from "@ui/components/card";
import { apiClient } from "@shared/lib/api-client";
import { CreatePlotForm } from "@marketing/home/components/CreatePlotForm";


export default function SalesPage() {
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [plots , setPlots] = useState<any>([]);
  const [createPlotModalOpen , setCreatePlotModalOpen] = useState<any>(false);
  const t = useTranslations("sales");


  const fetchAllPlots = async () => {
 
const response = await apiClient.plots.$get();
console.log(response , "res in sales page");

 
if (!response.ok) {
	throw new Error("Failed to fetch posts");
}
 
const plots = await response.json();
console.log(plots , "plots in fetch")
setPlots(plots);
  }

useEffect (() => {
      fetchAllPlots();
}, []);

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
  const openCreatePlotModal = () => {
    setCreatePlotModalOpen(true);
  }

  return (
    <div className="p-4">
     <div className="flex w-full items-center justify-between m-2">
         <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
         <button className="p-2  bg-amber-400 text-lg rounded-md shadow cursor-pointer text-white" onClick={openCreatePlotModal}>
            Add Plot
         </button>
     </div>
      <div className="grid grid-cols-6 gap-4">
        {plots.map((plot: any , index: any) => (
          <button
            key={plot.id}
            onClick={() => setSelectedPlot(plot)}
            className={`h-16 w-16 text-white font-bold rounded ${getColorClass(
              plot.status,
            )}`}
          >
            {index + 1}
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
              <strong>{t("soldTo")}:</strong> {selectedPlot.soldTo}
            </li>
            <li>
              <strong>{t("soldOn")}:</strong> {selectedPlot.soldOn}
            </li>
            <li>
              <strong>{t("amountCollected")}:</strong> ₹{selectedPlot.amountCollected}
            </li>
            <li>
              <strong>{t("collectedTillDate")}:</strong> ₹{selectedPlot.amountCollectedTillDate}
            </li>
            <li>
              <strong>{t("pendingAmount")}:</strong> ₹{selectedPlot.pendingAmount}
            </li>
            <li>
              <strong>{t("nextInstallment")}:</strong> ₹{selectedPlot.nextInstallmentAmount} on {selectedPlot.nextInstallmentDate}
            </li>
            <li>
              <strong>{t("amountGivenTo")}:</strong> {selectedPlot.amountGivenTo} on {selectedPlot.amountGivenOn}
            </li>
            <li>
              <strong>{t("documents")}:</strong>
              <ul className="list-disc ml-4">
                {selectedPlot.documents.map((doc: any, i: number) => (
                  <li key={i}>
                    <a href={doc.url} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                      {doc}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </Card>
      )}

      {createPlotModalOpen && 
      (
      <div>
        <CreatePlotForm/>
      </div>
      )
      }


    </div>
  );
}

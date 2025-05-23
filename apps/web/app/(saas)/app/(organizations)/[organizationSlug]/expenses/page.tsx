"use client";

import { useTranslations } from "next-intl";
import { dummyExpenses } from "../../../../../../data/dummyData";
import { Card } from "@ui/components/card";

export default function ExpensesPage() {
  const t = useTranslations("expenses");
  const d = dummyExpenses;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Card className="p-6">
        <h2 className="font-semibold mb-2">{t("spendOnCategories")}</h2>
        <ul>
          {d.categories.map((cat, i) => (
            <li key={i} className="flex justify-between py-1 border-b">
              <span>{cat.name}</span>
              <span>₹{cat.amountSpent.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">{t("totalAmountSpent")}</h3>
            <p>₹{d.totalAmountSpent.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t("dateOfSpend")}</h3>
            <p>{d.dateOfSpend}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t("amountPending")}</h3>
            <p>₹{d.amountPending.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-semibold">{t("amountExceedingLimit")}</h3>
            <p>₹{d.amountExceedingLimit.toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <h3 className="font-semibold">{t("amountGivenBy")}</h3>
            <ul>
              {d.amountGivenBy.map((src, i) => (
                <li key={i} className="flex justify-between py-1 border-b">
                  <span>{src.source}</span>
                  <span>₹{src.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">{t("totalAmountAllotted")}</h3>
            <p>₹{d.totalAmountAllotted.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

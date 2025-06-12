"use client";
import { useRouter } from "next/navigation";
import React from "react";

type Breadcrumb = { label: string; href?: string };

export default function MainLayout({
  children,
  breadcrumbs = [],
  actions = null,
}: {
  children: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center mb-6">
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-md text-gray-600 font-bold">
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  {bc.href ? (
                    <button
                      onClick={() => router.push(bc.href!)}
                      className="hover:scale-110 cursor-pointer transition-all ease-in-out duration-300"
                    >
                      {bc.label}
                    </button>
                  ) : (
                    <span className="font-semibold">{bc.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}
          {actions && <div className="ml-auto">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

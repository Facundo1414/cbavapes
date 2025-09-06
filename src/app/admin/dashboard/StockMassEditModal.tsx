import React from "react";
import StockMassEdit from "../stock/StockMassEdit";
import { Button } from "@/components/ui/button";

export default function StockMassEditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-6xl relative overflow-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <StockMassEdit />
      </div>
    </div>
  );
}

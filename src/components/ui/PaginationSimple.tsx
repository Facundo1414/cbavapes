import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pageCount: number;
  setPage: (n: number) => void;
};

export default function PaginationSimple({ page, pageCount, setPage }: Props) {
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>&lt;</Button>
      <span>Página {page} de {pageCount}</span>
      <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount}>&gt;</Button>
    </div>
  );
}

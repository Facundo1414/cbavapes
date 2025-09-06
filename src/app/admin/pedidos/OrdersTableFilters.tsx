import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  filterPaid: 'all' | 'paid' | 'unpaid';
  setFilterPaid: (v: 'all' | 'paid' | 'unpaid') => void;
  filterDelivered: 'all' | 'delivered' | 'undelivered';
  setFilterDelivered: (v: 'all' | 'delivered' | 'undelivered') => void;
};

export default function OrdersTableFilters({ filterPaid, setFilterPaid, filterDelivered, setFilterDelivered }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="font-semibold">Pagado:</span>
      <Button size="sm" variant={filterPaid === 'all' ? 'default' : 'outline'} onClick={() => setFilterPaid('all')}>Todos</Button>
      <Button size="sm" variant={filterPaid === 'paid' ? 'default' : 'outline'} onClick={() => setFilterPaid('paid')}>Pagados</Button>
      <Button size="sm" variant={filterPaid === 'unpaid' ? 'default' : 'outline'} onClick={() => setFilterPaid('unpaid')}>No pagados</Button>
      <span className="ml-4 font-semibold">Entregado:</span>
      <Button size="sm" variant={filterDelivered === 'all' ? 'default' : 'outline'} onClick={() => setFilterDelivered('all')}>Todos</Button>
      <Button size="sm" variant={filterDelivered === 'delivered' ? 'default' : 'outline'} onClick={() => setFilterDelivered('delivered')}>Entregados</Button>
      <Button size="sm" variant={filterDelivered === 'undelivered' ? 'default' : 'outline'} onClick={() => setFilterDelivered('undelivered')}>No entregados</Button>
    </div>
  );
}

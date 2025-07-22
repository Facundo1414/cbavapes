// components/FlavorOption.tsx

import { useState } from "react";

interface FlavorProps {
  name: string;
  price: number;
}

export function FlavorOption({ name, price }: FlavorProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={count > 0} readOnly />
        <span>{name}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-2 bg-gray-200 rounded"
          onClick={() => setCount(Math.max(0, count - 1))}
        >
          -
        </button>
        <span>{count}</span>
        <button
          className="px-2 bg-gray-200 rounded"
          onClick={() => setCount(count + 1)}
        >
          +
        </button>
        <span className="w-16 text-right">${price.toLocaleString()}</span>
      </div>
    </div>
  );
}

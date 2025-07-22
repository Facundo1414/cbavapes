import { useState } from 'react';

type FilterProps = {
  onFilterChange: (filters: { category: string }) => void;
  categories: string[];
  selectedCategory: string;
};

export default function FilterBar({ onFilterChange, categories, selectedCategory }: FilterProps) {
  const handleCategoryClick = (cat: string) => {
    const newCategory = selectedCategory === cat ? '' : cat;
    onFilterChange({ category: newCategory });

    if (newCategory) {
      const element = document.getElementById(`category-${newCategory.replace(/\s+/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

return (
  <div className="sticky top-0 z-50 bg-white border-b shadow-sm py-2">
    <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategoryClick(cat)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors duration-200 ${
            selectedCategory === cat
              ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);

}

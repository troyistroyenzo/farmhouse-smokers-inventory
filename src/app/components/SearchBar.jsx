// components/SearchBar.jsx
'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch, onSortChange, onFilterChange, sortOrder, activeFilter }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onSearch(newValue);
  };

  // Product filter options
  const filterOptions = [
    { id: 'all', label: 'All Products' },
    { id: 'brisket', label: 'Beef Brisket' },
    { id: 'angus', label: 'Angus "Bri-Steak"' },
    { id: 'belly', label: 'Beef Belly' }
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-3xl font-semibold text-black">Inventory</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => onSortChange(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sort by Weight: {sortOrder === 'desc' ? '↓ Largest First' : '↑ Smallest First'}
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, weight, or price..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full md:w-72 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent transition duration-200"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Product filter tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200">
        {filterOptions.map(option => (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeFilter === option.id 
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
// components/InventoryDashboard.jsx
'use client';

import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for largest first
  const [activeFilter, setActiveFilter] = useState('all'); // Default: show all products

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/inventory');
        
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        
        const data = await response.json();
        setInventory(data.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to load inventory data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Fixed pricing for each product category
  const productPricing = {
    'Smoked Beef Brisket': 3300,
    'Smoked Angus "Bri-Steak"': 3300,
    'Smoked Beef Belly': 2200
  };

  // Custom sort order for smoked beef items - in the specified order
  const beefOrder = ['Smoked Beef Brisket', 'Smoked Angus "Bri-Steak"', 'Smoked Beef Belly'];
  
  // Enhanced search filter that checks all relevant fields
  const filterBySearch = (item) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in product name
    if (item.ITEM?.toLowerCase().includes(searchLower)) return true;
    
    // Search in KG (convert to string for text search)
    if (item.KG?.toString().includes(searchLower)) return true;
    
    // Search in UNIT price (convert to string for text search)
    if (item.UNIT?.toString().includes(searchLower)) return true;
    
    // Search in SRP (convert to string for text search)
    if (item.SRP?.toString().includes(searchLower)) return true;
    
    return false;
  };

  // Product type filter
  const filterByProductType = (item) => {
    if (activeFilter === 'all') return true;
    
    const itemName = item.ITEM?.toLowerCase() || '';
    
    switch (activeFilter) {
      case 'brisket':
        return itemName.includes('brisket');
      case 'angus':
        return itemName.includes('angus') || itemName.includes('bri-steak');
      case 'belly':
        return itemName.includes('belly');
      default:
        return true;
    }
  };
  
  // Organize inventory by categories with all filters applied
  const categorizedInventory = beefOrder.map(category => {
    const items = inventory
      .filter(item => item.ITEM === category && filterBySearch(item) && filterByProductType(item))
      .sort((a, b) => sortOrder === 'desc' ? 
        (b.KG || 0) - (a.KG || 0) : 
        (a.KG || 0) - (b.KG || 0));
    
    return {
      category,
      items,
      pricePerKg: productPricing[category] || 0
    };
  });

  // Get other items that don't fit in the categories
  const otherItems = inventory
    .filter(item => !beefOrder.includes(item.ITEM) && filterBySearch(item) && filterByProductType(item))
    .sort((a, b) => sortOrder === 'desc' ? 
      (b.KG || 0) - (a.KG || 0) : 
      (a.KG || 0) - (b.KG || 0));

  // Get total count of filtered items
  const filteredItemCount = categorizedInventory.reduce((count, category) => count + category.items.length, 0) + otherItems.length;

  // Custom formatter for currency
  const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  });

  // Handler for search term changes
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handler for sort order changes
  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  // Handler for product filter changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-500 border border-red-100">
          <p>{error}</p>
        </div>
      )}
      
      <SearchBar 
        onSearch={handleSearch} 
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        sortOrder={sortOrder}
        activeFilter={activeFilter}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {categorizedInventory.map((category, idx) => (
            category.items.length > 0 && (
              <div key={idx} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-black">{category.category}</h2>
                  <div className="text-sm text-gray-600">
                    Price per KG: {currencyFormatter.format(category.pricePerKg || 0)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx} 
                      className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition-all duration-300"
                    >
                      <h3 className="text-lg font-medium text-black mb-3 truncate">{item.ITEM}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-black">Weight</span>
                          <span className="text-sm font-medium text-black">{item.KG?.toFixed(3) || '0.000'} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-black">SRP</span>
                          <span className="text-sm font-medium text-black">
                            {(item.KG && category.pricePerKg) 
                              ? currencyFormatter.format(item.KG * category.pricePerKg) 
                              : 'PHP 0.00'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {/* Display other items if any */}
          {otherItems.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-black mb-4">Other Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition-all duration-300"
                  >
                    <h3 className="text-lg font-medium text-black mb-3 truncate">{item.ITEM}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-black">Weight</span>
                        <span className="text-sm font-medium text-black">{item.KG?.toFixed(3) || '0.000'} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-black">Price per KG</span>
                        <span className="text-sm font-medium text-black">{item.UNIT ? currencyFormatter.format(item.UNIT) : 'PHP 0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-black">SRP</span>
                        <span className="text-sm font-medium text-black">{item.SRP ? currencyFormatter.format(item.SRP) : 'PHP 0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {filteredItemCount === 0 && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-black">No items found</h3>
                <p className="mt-1 text-sm text-black">
                  {searchTerm || activeFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Your inventory appears to be empty.'}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-sm text-black flex justify-between items-center">
            <span>Showing {filteredItemCount} of {inventory.length} items</span>
            <span className="text-xs text-black">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </>
      )}
    </div>
  );
}
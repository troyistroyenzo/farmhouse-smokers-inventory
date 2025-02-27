// app/page.js
import InventoryDashboard from '@/app/components/InventoryDashboard';

export const metadata = {
  title: 'Farmhouse Smokers Inventory',
  description: 'Inventory management system for premium meat products',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <InventoryDashboard />
      </main>
      <footer className="mt-8 py-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Farmhouse Smokers. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
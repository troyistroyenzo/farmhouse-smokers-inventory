// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Farmhouse Smokers Inventory',
  description: 'Inventory management system for Farmhouse Smokers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
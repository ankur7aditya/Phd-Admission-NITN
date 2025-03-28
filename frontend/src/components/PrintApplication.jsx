import { Button } from './ui/button';
import { Printer } from 'lucide-react';

export default function PrintApplication() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Print Application</h1>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Application
        </Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Your application details will be displayed here in a printable format.
          Click the "Print Application" button to print your application.
        </p>
      </div>
    </div>
  );
} 
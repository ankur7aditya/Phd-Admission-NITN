import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';

export default function NavigationBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">PhD Admission Portal</h1>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 
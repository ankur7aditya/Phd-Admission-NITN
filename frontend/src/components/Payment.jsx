import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Payment() {
  const [isUploading, setIsUploading] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(null);

  useEffect(() => {
    fetchPersonalDetails();
  }, []);

  const fetchPersonalDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/personal/get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setPersonalDetails(response.data);
    } catch (error) {
      console.error('Error fetching personal details:', error);
      toast.error('Failed to fetch personal details');
    }
  };

  const handleDDUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/personal/upload-demand-draft`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setPersonalDetails(prev => ({
          ...prev,
          dd_url: response.data.url
        }));
        toast.success('Demand draft uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading demand draft:', error);
      toast.error(error.response?.data?.message || 'Failed to upload demand draft');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Payment Details</h1>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Demand Draft Upload</h2>
            <div className="space-y-4">
              <div>
                <Label>Upload Demand Draft (PDF)</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleDDUpload}
                    disabled={isUploading}
                    className="h-9 text-sm"
                  />
                  {isUploading && (
                    <div className="mt-2 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              {personalDetails?.dd_url && (
                <div className="mt-4">
                  <Label>Uploaded Document</Label>
                  <div className="mt-2 w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                    <iframe
                      src={personalDetails.dd_url}
                      className="w-full h-full"
                      title="Demand Draft Document"
                    />
                  </div>
                  <div className="mt-2">
                    <a
                      href={personalDetails.dd_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Instructions</h3>
            <ul className="list-disc list-inside space-y-2 text-yellow-700">
              <li>Please ensure the demand draft is in PDF format</li>
              <li>Maximum file size: 5MB</li>
              <li>The demand draft should be clearly visible and readable</li>
              <li>Make sure all details on the demand draft are legible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
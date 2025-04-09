import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Payment() {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [formData, setFormData] = useState({
    transaction_id: '',
    transaction_date: '',
    issued_bank: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/personal/upload-transaction-screenshot`,
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
          transaction_screenshot_url: response.data.url
        }));
        await fetchPersonalDetails();
        toast.success('Transaction screenshot uploaded successfully', {
          style: {
            background: '#10B981',
            color: '#ffffff',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10B981',
          },
        });
      }
    } catch (error) {
      console.error('Error uploading transaction screenshot:', error);
      toast.error(error.response?.data?.message || 'Failed to upload transaction screenshot');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.transaction_id || !formData.transaction_date || !formData.issued_bank) {
        toast.error('Please fill in all transaction details');
        return;
      }

      if (!personalDetails?.transaction_screenshot_url) {
        toast.error('Please upload transaction screenshot');
        return;
      }

      // Prepare payment data
      const paymentData = {
        transaction_id: formData.transaction_id,
        transaction_date: formData.transaction_date,
        issued_bank: formData.issued_bank,
        transaction_screenshot_url: personalDetails.transaction_screenshot_url,
        amount: 500 // Fixed application fee
      };

      // Save payment data
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/create`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Payment details saved successfully', {
          style: {
            background: '#10B981',
            color: '#ffffff',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10B981',
          },
        });
        navigate('/print-application');
      }
    } catch (error) {
      console.error('Error saving payment details:', error);
      toast.error(error.response?.data?.message || 'Failed to save payment details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Payment Details</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Payment Information</h3>
            <ul className="list-disc list-inside space-y-2 text-yellow-700">
              <li>Application fee: Rs. 500/- (non-refundable)</li>
              <li>SC/ST/PH candidates are exempted from application fee</li>
              <li>Payment should be made through online transaction</li>
            </ul>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700">
                <li><span className="font-medium">Account Name:</span> IRG NIT Nagaland</li>
                <li><span className="font-medium">Account Number:</span> 35747839287</li>
                <li><span className="font-medium">IFSC Code:</span> SBIN0007543</li>
                <li><span className="font-medium">Branch:</span> SBI, Chumukedima</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_id">Transaction ID</Label>
                  <Input
                    id="transaction_id"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleChange}
                    placeholder="Enter your transaction ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_date">Transaction Date</Label>
                  <Input
                    id="transaction_date"
                    name="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issued_bank">Issued Bank</Label>
                  <Input
                    id="issued_bank"
                    name="issued_bank"
                    value={formData.issued_bank}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Upload Transaction Screenshot (Image)</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
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

                {personalDetails?.transaction_screenshot_url && (
                  <div className="mt-4">
                    <Label>Uploaded Screenshot</Label>
                    <div className="mt-2 w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <img
                        src={personalDetails.transaction_screenshot_url}
                        alt="Transaction Screenshot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-2">
                      <a
                        href={personalDetails.transaction_screenshot_url}
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Instructions</h3>
                <ul className="list-disc list-inside space-y-2 text-yellow-700">
                  <li>Please ensure the transaction screenshot is clear and readable</li>
                  <li>Maximum file size: 5MB</li>
                  <li>The screenshot should show transaction ID, date, and amount clearly</li>
                  <li>Make sure all details in the screenshot are legible</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Payment Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
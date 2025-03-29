import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Button } from "./ui/button.jsx";
import { Checkbox } from "./ui/checkbox.jsx";
import { ArrowUpFromLine, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdmissionForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    nationality: "",
    category: "",
    religion: "",
    father_name: "",
    mother_name: "",
    marital_status: "",
    spouse_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    communication_address: {
      street: "",
      line2: "",
      line3: "",
      city: "",
      state: "",
      pincode: "",
    },
    permanent_address: {
      street: "",
      line2: "",
      line3: "",
      city: "",
      state: "",
      pincode: "",
    },
    photo: "",
    signature: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    // Load saved form data from localStorage
    const savedData = localStorage.getItem('admissionFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admissionFormData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSameAddressChange = (checked) => {
    setSameAddress(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permanent_address: { ...prev.communication_address }
      }));
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/personal/upload-${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setFormData(prev => ({
        ...prev,
        [type]: response.data.url
      }));

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
      console.error(`Error uploading ${type}:`, error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting form data:', formData);
      const response = await axios.post(
        'http://localhost:5000/api/personal/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      toast.success('Personal details submitted successfully');
      // Clear form data from localStorage after successful submission
      localStorage.removeItem('admissionFormData');
      // Navigate to academic details form
      navigate('/academic-details');
    } catch (error) {
      toast.error('Failed to submit personal details');
      console.error('Error submitting form:', error);
      if (error.response?.data?.fields) {
        console.error('Missing required fields:', error.response.data.fields);
        toast.error(`Missing required fields: ${error.response.data.fields.join(', ')}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Personal Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Date of Birth and Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange({ target: { name: 'gender', value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nationality and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange({ target: { name: 'category', value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="OBC">OBC</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Religion and Marital Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="religion">Religion</Label>
            <Input
              id="religion"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="marital_status">Marital Status</Label>
            <Select
              value={formData.marital_status}
              onValueChange={(value) => handleChange({ target: { name: 'marital_status', value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Parent Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="father_name">Father's Name</Label>
            <Input
              id="father_name"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="mother_name">Mother's Name</Label>
            <Input
              id="mother_name"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="alternate_phone">Alternate Phone Number</Label>
          <Input
            id="alternate_phone"
            name="alternate_phone"
            type="tel"
            value={formData.alternate_phone}
            onChange={handleChange}
          />
        </div>

        {/* Communication Address */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Communication Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="communication_address.street">Street Address</Label>
              <Input
                id="communication_address.street"
                name="communication_address.street"
                value={formData.communication_address.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="communication_address.line2">Address Line 2</Label>
              <Input
                id="communication_address.line2"
                name="communication_address.line2"
                value={formData.communication_address.line2}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="communication_address.line3">Address Line 3</Label>
              <Input
                id="communication_address.line3"
                name="communication_address.line3"
                value={formData.communication_address.line3}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="communication_address.city">City</Label>
              <Input
                id="communication_address.city"
                name="communication_address.city"
                value={formData.communication_address.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="communication_address.state">State</Label>
              <Input
                id="communication_address.state"
                name="communication_address.state"
                value={formData.communication_address.state}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="communication_address.pincode">Pincode</Label>
              <Input
                id="communication_address.pincode"
                name="communication_address.pincode"
                value={formData.communication_address.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Same Address Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="same_address"
            checked={sameAddress}
            onCheckedChange={handleSameAddressChange}
          />
          <Label htmlFor="same_address">Same as Communication Address</Label>
        </div>

        {/* Permanent Address */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Permanent Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="permanent_address.street">Street Address</Label>
              <Input
                id="permanent_address.street"
                name="permanent_address.street"
                value={formData.permanent_address.street}
                onChange={handleChange}
                required
                disabled={sameAddress}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="permanent_address.line2">Address Line 2</Label>
              <Input
                id="permanent_address.line2"
                name="permanent_address.line2"
                value={formData.permanent_address.line2}
                onChange={handleChange}
                disabled={sameAddress}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="permanent_address.line3">Address Line 3</Label>
              <Input
                id="permanent_address.line3"
                name="permanent_address.line3"
                value={formData.permanent_address.line3}
                onChange={handleChange}
                disabled={sameAddress}
              />
            </div>
            <div>
              <Label htmlFor="permanent_address.city">City</Label>
              <Input
                id="permanent_address.city"
                name="permanent_address.city"
                value={formData.permanent_address.city}
                onChange={handleChange}
                required
                disabled={sameAddress}
              />
            </div>
            <div>
              <Label htmlFor="permanent_address.state">State</Label>
              <Input
                id="permanent_address.state"
                name="permanent_address.state"
                value={formData.permanent_address.state}
                onChange={handleChange}
                required
                disabled={sameAddress}
              />
            </div>
            <div>
              <Label htmlFor="permanent_address.pincode">Pincode</Label>
              <Input
                id="permanent_address.pincode"
                name="permanent_address.pincode"
                value={formData.permanent_address.pincode}
                onChange={handleChange}
                required
                disabled={sameAddress}
              />
            </div>
          </div>
        </div>

        {/* Photo and Signature Upload */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Photo</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'photo')}
                disabled={isUploading}
              />
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Uploaded photo"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Signature</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'signature')}
                disabled={isUploading}
              />
              {formData.signature && (
                <div className="mt-2">
                  <img
                    src={formData.signature}
                    alt="Uploaded signature"
                    className="w-32 h-16 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </div>
  );
} 
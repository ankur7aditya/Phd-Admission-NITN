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

// Validation functions
const validateName = (name) => {
  if (!name) return 'Please enter your name';
  if (name.length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 30) return 'Name cannot exceed 30 characters';
  if (!/^[a-zA-Z\s]*$/.test(name)) return 'Name can only contain letters and spaces';
  return '';
};

const validateAge = (dob) => {
  if (!dob) return 'Please select your date of birth';
  const today = new Date();
  const birthDate = new Date(dob);
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18) return 'You must be at least 18 years old to apply';
  if (age > 50) return 'Age limit for application is 50 years';
  return '';
};

const validatePhone = (phone) => {
  if (!phone) return 'Please enter your phone number';
  if (!/^[0-9]{10}$/.test(phone)) return 'Please enter a valid 10-digit mobile number';
  return '';
};

const validatePincode = (pincode) => {
  if (!pincode) return 'Please enter your PIN code';
  if (!/^[0-9]{6}$/.test(pincode)) return 'Please enter a valid 6-digit PIN code';
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'Please enter your email address';
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return 'Please enter a valid email address (e.g., example@domain.com)';
  }
  return '';
};

const validateAddress = (address) => {
  if (!address.street) return 'Please enter your street address';
  if (!address.city) return 'Please enter your city';
  if (!address.state) return 'Please enter your state';
  if (!address.pincode) return 'Please enter your PIN code';
  if (!/^[0-9]{6}$/.test(address.pincode)) return 'Please enter a valid 6-digit PIN code';
  return '';
};

const validateFile = (file, type) => {
  if (!file) return `Please upload your ${type}`;
  
  // Only handle image files since this is for photo and signature
  const maxSize = 2 * 1024 * 1024; // 2MB for images
  if (file.size > maxSize) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} size should not exceed 2MB`;
  }

  // Check file type - only images allowed
  if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
    return `Please upload a valid image file (JPEG, PNG, or GIF) for your ${type}`;
  }

  return '';
};

// Add this helper function at the top of the file after the imports
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export default function AdmissionForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    programme_type: "phd", // Default to PhD
    department: "", // Add department field
    mode_of_phd: "", // Add mode of PhD field
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
    signature: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);

  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/personal/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        
        if (response.data) {
          // Format the date before setting the form data
          const formattedData = {
            ...response.data,
            dob: formatDateForInput(response.data.dob)
          };
          setFormData(formattedData);
          setIsExistingData(true);
        }
      } catch (error) {
        console.error('Error fetching personal details:', error);
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch personal details');
        }
      }
    };

    fetchPersonalDetails();
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admissionFormData', JSON.stringify(formData));
  }, [formData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
      case 'last_name':
      case 'father_name':
      case 'mother_name':
        return validateName(value);
      case 'dob':
        return validateAge(value);
      case 'phone':
        return validatePhone(value);
      case 'alternate_phone':
        return value ? validatePhone(value) : '';
      case 'email':
        return validateEmail(value);
      case 'gender':
        return !value ? 'Gender is required' : '';
      case 'nationality':
        return !value ? 'Nationality is required' : '';
      case 'category':
        return !value ? 'Category is required' : '';
      case 'religion':
        return !value ? 'Religion is required' : '';
      case 'marital_status':
        return !value ? 'Marital status is required' : '';
      case 'communication_address':
        return validateAddress(value);
      case 'permanent_address':
        return validateAddress(value);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Format phone numbers to remove non-digits
    if (name === 'phone' || name === 'alternate_phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    // Format pincode to remove non-digits
    if (name.includes('pincode')) {
      newValue = value.replace(/\D/g, '').slice(0, 6);
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: newValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Validate field and update errors
    const error = validateField(name, newValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
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

    // Validate file
    const error = validateFile(file, type);
    if (error) {
      setErrors(prev => ({ ...prev, [type]: error }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/personal/upload-${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.data[type]) {
        setFormData(prev => ({
          ...prev,
          [type]: response.data[type]
        }));
        setErrors(prev => ({ ...prev, [type]: '' }));
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setErrors(prev => ({
        ...prev,
        [type]: error.response?.data?.message || `Error uploading ${type}`
      }));
      toast.error(error.response?.data?.message || `Error uploading ${type}`);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'object') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      } else {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    // Validate spouse name based on marital status
    if (formData.marital_status !== 'Single' && !formData.spouse_name) {
      newErrors.spouse_name = 'Spouse name is required for married, divorced, or widowed applicants';
      isValid = false;
    }

    // Validate addresses
    if (!sameAddress) {
      const permanentAddressError = validateAddress(formData.permanent_address);
      if (permanentAddressError) {
        newErrors.permanent_address = permanentAddressError;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter(error => error);
      if (errorMessages.length > 0) {
        toast.error('Please correct the following errors:', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
        errorMessages.forEach(message => {
          toast.error(message, {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          });
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      // Format the date to ISO string for backend
      const formattedData = {
        ...formData,
        dob: new Date(formData.dob).toISOString()
      };

      console.log('Submitting form data:', formattedData);
      
      const response = await axios({
        method: isExistingData ? 'put' : 'post',
        url: `${import.meta.env.VITE_BACKEND_URL}/api/personal/${isExistingData ? 'update' : 'create'}`,
        data: formattedData,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log('Server response:', response.data);

      // Clear form data from localStorage after successful submission
      localStorage.removeItem('admissionFormData');

      toast.success(`Personal details ${isExistingData ? 'updated' : 'submitted'} successfully`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });

      // Always navigate to academic details after successful submission/update
      navigate('/academic-details');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.data?.fields) {
        const missingFields = error.response.data.fields;
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      } else {
        toast.error(error.response?.data?.message || `Failed to ${isExistingData ? 'update' : 'submit'} personal details. Please try again.`, {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Personal Details
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Programme Type Selection */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Select Programme Type</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="phd"
                name="programme_type"
                value="phd"
                checked={formData.programme_type === "phd"}
                onChange={(e) => handleChange({ target: { name: 'programme_type', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="phd">PhD Programme</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="integrated_phd"
                name="programme_type"
                value="integrated_phd"
                checked={formData.programme_type === "integrated_phd"}
                onChange={(e) => handleChange({ target: { name: 'programme_type', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="integrated_phd">Integrated PhD Programme</Label>
            </div>
          </div>
        </div>

        {/* Department Selection */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Select Department</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="cse"
                name="department"
                value="cse"
                checked={formData.department === "cse"}
                onChange={(e) => handleChange({ target: { name: 'department', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="cse">Computer Science & Engineering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="ece"
                name="department"
                value="ece"
                checked={formData.department === "ece"}
                onChange={(e) => handleChange({ target: { name: 'department', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="ece">Electronics & Communication Engineering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="ee"
                name="department"
                value="ee"
                checked={formData.department === "ee"}
                onChange={(e) => handleChange({ target: { name: 'department', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="ee">Electrical Engineering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="me"
                name="department"
                value="me"
                checked={formData.department === "me"}
                onChange={(e) => handleChange({ target: { name: 'department', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="me">Mechanical Engineering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="eie"
                name="department"
                value="eie"
                checked={formData.department === "eie"}
                onChange={(e) => handleChange({ target: { name: 'department', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="eie">Electronics and Instrumentation Engineering</Label>
            </div>
          </div>
          
          {/* Notes */}
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p className="font-medium">Note:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Submit separate applications for applying in one or more Departments (Regular or IR)</li>
              <li>The candidate shall submit his/her research plan in about 250 to 300 words along with his/her application</li>
            </ol>
          </div>
        </div>

        {/* Mode of PhD Selection */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Mode of PhD</h2>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="full_time"
                name="mode_of_phd"
                value="full_time"
                checked={formData.mode_of_phd === "full_time"}
                onChange={(e) => handleChange({ target: { name: 'mode_of_phd', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="full_time">Full Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="part_time"
                name="mode_of_phd"
                value="part_time"
                checked={formData.mode_of_phd === "part_time"}
                onChange={(e) => handleChange({ target: { name: 'mode_of_phd', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="part_time">Part Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="full_time_sponsored"
                name="mode_of_phd"
                value="full_time_sponsored"
                checked={formData.mode_of_phd === "full_time_sponsored"}
                onChange={(e) => handleChange({ target: { name: 'mode_of_phd', value: e.target.value } })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="full_time_sponsored">Full Time (Sponsored)</Label>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" required>First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && (
              <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" required>Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Date of Birth and Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dob" required>Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
              className={errors.dob ? "border-red-500" : ""}
            />
            {errors.dob && (
              <p className="text-sm text-red-500 mt-1">{errors.dob}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" required>Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange({ target: { name: 'gender', value } })}
            >
              <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        {/* Nationality and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality" required>Nationality</Label>
            <Input
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" required>Category</Label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="religion" required>Religion</Label>
            <Input
              id="religion"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marital_status" required>Marital Status</Label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="father_name" required>Father's Name</Label>
            <Input
              id="father_name"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_name" required>Mother's Name</Label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" required>Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="communication_address.street" required>Street Address</Label>
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
              <Label htmlFor="communication_address.city" required>City</Label>
              <Input
                id="communication_address.city"
                name="communication_address.city"
                value={formData.communication_address.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="communication_address.state" required>State</Label>
              <Input
                id="communication_address.state"
                name="communication_address.state"
                value={formData.communication_address.state}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="communication_address.pincode" required>Pincode</Label>
              <Input
                id="communication_address.pincode"
                name="communication_address.pincode"
                value={formData.communication_address.pincode}
                onChange={handleChange}
                required
                className={errors['communication_address.pincode'] ? "border-red-500" : ""}
              />
              {errors['communication_address.pincode'] && (
                <p className="text-sm text-red-500 mt-1">{errors['communication_address.pincode']}</p>
              )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="permanent_address.street" required>Street Address</Label>
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
              <Label htmlFor="permanent_address.city" required>City</Label>
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
              <Label htmlFor="permanent_address.state" required>State</Label>
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
              <Label htmlFor="permanent_address.pincode" required>Pincode</Label>
              <Input
                id="permanent_address.pincode"
                name="permanent_address.pincode"
                value={formData.permanent_address.pincode}
                onChange={handleChange}
                required
                disabled={sameAddress}
                className={errors['permanent_address.pincode'] ? "border-red-500" : ""}
              />
              {errors['permanent_address.pincode'] && (
                <p className="text-sm text-red-500 mt-1">{errors['permanent_address.pincode']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photo (2x2 inches)</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => handleFileUpload(e, 'photo')}
                className="h-9 text-sm"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF. Max size: 2MB
              </p>
            </div>
            {isUploading && (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            )}
            {formData.photo && (
              <div className="w-20 h-20 border rounded overflow-hidden relative group">
                <img
                  src={formData.photo}
                  alt="Photo preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                    className="text-white"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
          {errors.photo && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.photo}
            </p>
          )}
        </div>

        {/* Signature Upload */}
        <div className="space-y-2">
          <Label>Signature</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => handleFileUpload(e, 'signature')}
                className="h-9 text-sm"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF. Max size: 2MB
              </p>
            </div>
            {isUploading && (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            )}
            {formData.signature && (
              <div className="w-40 h-20 border rounded overflow-hidden relative group">
                <img
                  src={formData.signature}
                  alt="Signature preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, signature: '' }))}
                    className="text-white"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
          {errors.signature && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.signature}
            </p>
          )}
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
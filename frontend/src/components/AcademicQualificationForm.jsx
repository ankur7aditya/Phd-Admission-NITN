import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Button } from "./ui/button.jsx";
import { Loader2, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Add validation functions at the top of the file
const validateField = (field, value, context = {}) => {
  switch (field) {
    case 'standard':
      if (!value) return 'Please select your qualification level';
      if (!['10th', '12th', 'UG', 'PG', 'PhD'].includes(value)) {
        return 'Please select a valid qualification level (10th, 12th, UG, PG, or PhD)';
      }
      break;
    case 'degree_name':
      if (!value) return 'Please enter your degree name';
      break;
    case 'university':
      if (!value) return 'Please enter your university or board name';
      break;
    case 'year_of_completion':
      return validateYear(value, 'completion');
    case 'marks_type':
      if (!value) return 'Please select your marks type';
      if (!['Percentage', 'CGPA'].includes(value)) {
        return 'Please select either Percentage or CGPA';
      }
      break;
    case 'marks_obtained':
      return validateMarks(value, context.max_cgpa || 100);
    case 'branch':
      if (!value) return 'Please enter your branch or specialization';
      break;
    case 'program_duration_months':
      if (!value) return 'Please enter the program duration';
      if (parseInt(value) < 0) return 'Program duration cannot be negative';
      break;
    case 'exam_type':
      if (!value) return 'Please select the type of exam';
      if (!['CAT', 'GATE', 'GMAT', 'NET', 'Others'].includes(value)) {
        return 'Please select a valid exam type (CAT, GATE, GMAT, NET, or Others)';
      }
      break;
    case 'registration_no':
      if (!value) return 'Please enter your registration number';
      break;
    case 'year_of_qualification':
      return validateYear(value, 'qualification');
    case 'type':
      if (!value) return 'Please select the type';
      if (context.type === 'experience' && !['Industry', 'Academia', 'Research'].includes(value)) {
        return 'Please select a valid experience type (Industry, Academia, or Research)';
      }
      if (context.type === 'publication' && !['Journal', 'Conference', 'Book'].includes(value)) {
        return 'Please select a valid publication type (Journal, Conference, or Book)';
      }
      break;
    case 'organisation':
      if (!value) return 'Please enter the organization name';
      break;
    case 'place':
      if (!value) return 'Please enter the location';
      break;
    case 'period_from':
      if (!value) return 'Please select the start date';
      break;
    case 'monthly_compensation':
      if (!value) return 'Please enter your monthly compensation';
      if (parseFloat(value) < 0) return 'Monthly compensation cannot be negative';
      break;
    case 'designation':
      if (!value) return 'Please enter your designation';
      break;
    case 'nature_of_work':
      if (!value) return 'Please describe the nature of your work';
      break;
    case 'paper_title':
      if (!value) return 'Please enter the paper title';
      break;
    case 'affiliation':
      if (!value) return 'Please enter your affiliation';
      break;
    case 'acceptance_year':
      return validateYear(value, 'acceptance');
  }
  return '';
};

const validateYear = (year, context = '') => {
  if (!year) return `Please enter the year of ${context}`;
  const currentYear = new Date().getFullYear();
  if (parseInt(year) < 1900) return 'Please enter a valid year (after 1900)';
  if (parseInt(year) > currentYear) return 'Year cannot be in the future';
  return '';
};

const validateMarks = (marks, maxMarks) => {
  if (!marks) return 'Please enter your marks';
  const marksNum = parseFloat(marks);
  if (isNaN(marksNum)) return 'Please enter a valid number for marks';
  if (marksNum < 0) return 'Marks cannot be negative';
  if (marksNum > maxMarks) return `Marks cannot exceed ${maxMarks}`;
  return '';
};

const validateNETType = (examType, netDetails) => {
  if (examType === 'NET' && !netDetails?.type) {
    return 'Please select your NET qualification type';
  }
  if (netDetails?.type && !['With Fellowship', 'Without Fellowship'].includes(netDetails.type)) {
    return 'Please select either "With Fellowship" or "Without Fellowship"';
  }
  return '';
};

const validateGATEMarks = (gateDetails) => {
  if (!gateDetails) return '';
  
  if (gateDetails.marks_out_of_100 !== undefined) {
    const marksError = validateMarks(gateDetails.marks_out_of_100, 100);
    if (marksError) return marksError;
  }

  if (gateDetails.qualifying_marks !== undefined) {
    const marksError = validateMarks(gateDetails.qualifying_marks, 100);
    if (marksError) return marksError;
  }

  if (gateDetails.gate_rank !== undefined && gateDetails.gate_rank < 1) {
    return 'Please enter a valid GATE rank (must be at least 1)';
  }

  return '';
};

const validateCATMarks = (catDetails) => {
  if (!catDetails) return '';
  
  const fields = [
    'total_percentile', 'quant_percentile', 'di_lr_percentile', 'verbal_percentile'
  ];
  
  for (const field of fields) {
    if (catDetails[field] !== undefined) {
      const marksError = validateMarks(catDetails[field], 100);
      if (marksError) return marksError;
    }
  }

  return '';
};

const validateGMATMarks = (gmatDetails) => {
  if (!gmatDetails) return '';
  
  const fields = [
    'total_score', 'verbal_score', 'quantitative_score',
    'analytical_writing_score', 'integrated_reasoning_score'
  ];
  
  for (const field of fields) {
    if (gmatDetails[field] !== undefined && gmatDetails[field] < 0) {
      return `Please enter a valid ${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }
  }

  return '';
};

// Add this utility function at the top of your file
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Add this function at the top of the file, after the validation functions
const scrollToError = (fieldId) => {
  const element = document.getElementById(fieldId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

export default function AcademicQualificationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    qualifications: [{
      standard: '',
      degree_name: '',
      university: '',
      year_of_completion: '',
      marks_obtained: '',
      marks_type: '',
      branch: '',
      program_duration_months: '',
      document_url: ''
    }],
    qualifying_exams: [{
      exam_type: '',
      registration_no: '',
      year_of_qualification: '',
      net_details: {
        type: '',
        subject: '',
        score: '',
        rank: ''
        },
        gate_details: {
        marks_out_of_100: '',
        qualifying_marks: '',
        gate_rank: ''
      },
      cat_details: {
        total_percentile: '',
        quant_percentile: '',
        di_lr_percentile: '',
        verbal_percentile: ''
        },
        gmat_details: {
        total_score: '',
        verbal_score: '',
        quantitative_score: '',
        analytical_writing_score: '',
        integrated_reasoning_score: ''
      },
      document_url: ''
    }],
    experience: [{
      type: '',
      organisation: '',
      place: '',
      period_from: '',
      period_to: '',
      designation: '',
      monthly_compensation: '',
      nature_of_work: '',
      experience_certificate_url: ''
    }],
    publications: [{
      type: '',
      paper_title: '',
      affiliation: '',
      acceptance_year: '',
      document_url: ''
    }],
    bachelors_branch: '',
    bachelors_aggregate: '',
    bachelors_class: '',
    bachelors_percentage: '',
    bachelors_sem1: '',
    bachelors_sem2: '',
    bachelors_sem3: '',
    bachelors_sem4: '',
    bachelors_sem5: '',
    bachelors_sem6: '',
    bachelors_sem7: '',
    bachelors_sem8: '',
    masters_branch: '',
    masters_aggregate: '',
    masters_class: '',
    masters_percentage: '',
    masters_sem1: '',
    masters_sem2: '',
    masters_sem3: '',
    masters_sem4: '',
    other_degree: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);

  useEffect(() => {
    const fetchAcademicDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/academic/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        
        if (response.data) {
          setFormData(response.data);
          setIsExistingData(true);
        }
      } catch (error) {
        console.error('Error fetching academic details:', error);
        // Only show error if it's not a 404 (not found) error
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch academic details');
        }
      }
    };

    fetchAcademicDetails();
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('academicFormData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e, index, type) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, [name]: value } : item
      )
    }));
  };

  const handleQualificationChange = (e, index) => {
    const { name, value } = e.target;
    let error = '';

    // Validate field based on name
    switch (name) {
      case 'year_of_completion':
        error = validateYear(value, 'completion');
        break;
      case 'marks_obtained':
        error = validateMarks(value, formData.qualifications[index].max_cgpa || 100);
        break;
      case 'program_duration_months':
        if (!value) error = 'Please enter the program duration';
        else if (parseInt(value) < 0) error = 'Program duration cannot be negative';
        break;
      default:
        if (!value) error = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [`qualifications.${index}.${name}`]: error
    }));

    // If there's an error, scroll to the field
    if (error) {
      const fieldId = `qualification-${index}-${name}`;
      scrollToError(fieldId);
    }

    // Update form data
    handleChange(e, index, 'qualifications');
  };

  const handleExamChange = (e, index) => {
    const { name, value } = e.target;
    let error = '';

    // Validate field based on name
    switch (name) {
      case 'year_of_qualification':
        error = validateYear(value, 'qualification');
        break;
      case 'registration_no':
        if (!value) error = 'Please enter your registration number';
        break;
      default:
        if (!value) error = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [`qualifying_exams.${index}.${name}`]: error
    }));

    // If there's an error, scroll to the field
    if (error) {
      const fieldId = `exam-${index}-${name}`;
      scrollToError(fieldId);
    }

    // Update form data
    handleChange(e, index, 'qualifying_exams');
  };

  const handleExamDetailsChange = (e, index, examType) => {
    const { name, value } = e.target;
    let error = '';

    // Validate field based on exam type and field name
    switch (examType) {
      case 'net_details':
        error = validateNETType(formData.qualifying_exams[index].exam_type, { ...formData.qualifying_exams[index].net_details, [name]: value });
        break;
      case 'gate_details':
        error = validateGATEMarks({ ...formData.qualifying_exams[index].gate_details, [name]: value });
        break;
      case 'cat_details':
        error = validateCATMarks({ ...formData.qualifying_exams[index].cat_details, [name]: value });
        break;
      case 'gmat_details':
        error = validateGMATMarks({ ...formData.qualifying_exams[index].gmat_details, [name]: value });
        break;
      default:
        if (!value) error = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [`qualifying_exams.${index}.${examType}.${name}`]: error
    }));

    // If there's an error, scroll to the field
    if (error) {
      const fieldId = `exam-${index}-${examType}-${name}`;
      scrollToError(fieldId);
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      qualifying_exams: prev.qualifying_exams.map((exam, i) => 
        i === index ? {
          ...exam,
          [examType]: { ...exam[examType], [name]: value }
        } : exam
      )
    }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          standard: "",
          degree_name: "",
          university: "",
          year_of_completion: "",
          marks_type: "",
          marks_obtained: "",
          max_cgpa: 10,
          branch: "",
          program_duration_months: "",
          document_url: "",
        }
      ]
    }));
  };

  const addQualifyingExam = () => {
    setFormData(prev => ({
      ...prev,
      qualifying_exams: [
        ...prev.qualifying_exams,
        {
          exam_type: "",
          registration_no: "",
          year_of_qualification: "",
          cat_details: {
            total_score: "",
            total_percentile: "",
            quant_score: "",
            quant_percentile: "",
            di_lr_score: "",
            di_lr_percentile: "",
            verbal_score: "",
            verbal_percentile: "",
          },
          gate_details: {
            discipline: "",
            gate_score: "",
            gate_rank: "",
            marks_out_of_100: "",
            qualifying_marks: "",
          },
          gmat_details: {
            total_score: "",
            quant_score: "",
            verbal_score: "",
            awa_score: "",
            ir_score: "",
          },
          net_details: {
            subject: "",
            score: "",
            rank: "",
            qualifying_marks: "",
          },
          other_details: {
            exam_name: "",
            score: "",
            rank: "",
            qualifying_marks: "",
          }
        }
      ]
    }));
  };

  const handleFileUpload = async (e, index) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'qualification');
      formData.append('index', index);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/academic/upload-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );

      if (response.data?.url) {
        const secureUrl = response.data.url.replace(/^http:/, 'https:');
        setFormData(prev => ({
          ...prev,
          qualifications: prev.qualifications.map((qual, i) => 
            i === index ? { ...qual, document_url: secureUrl } : qual
          )
        }));
        toast.success('Document uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      if (error.response?.status === 413) {
        toast.error('File size too large');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload document');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFieldError = (path) => {
    const pathParts = path.split('.');
    let current = errors;
    for (const part of pathParts) {
      if (!current || !current[part]) return '';
      current = current[part];
    }
    return current;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter(error => error);
      if (errorMessages.length > 0) {
        // Find the first error field and scroll to it
        const firstErrorField = Object.keys(errors)[0];
        const fieldId = firstErrorField.split('.').join('-');
        scrollToError(fieldId);

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
      const endpoint = isExistingData ? 'update' : 'create';
      const method = isExistingData ? 'put' : 'post';
      
      const response = await axios[method](
        `${import.meta.env.VITE_BACKEND_URL}/api/academic/${endpoint}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      toast.success(`Academic details ${isExistingData ? 'updated' : 'submitted'} successfully`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });
      
      // Clear form data from localStorage after successful submission
      localStorage.removeItem('academicDetails');
      // Navigate to payment page
      navigate('/payment');
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
        toast.error(`Failed to ${isExistingData ? 'update' : 'submit'} academic details. Please try again.`, {
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

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          type: "",
          organisation: "",
          place: "",
          period_from: "",
          period_to: "",
          monthly_compensation: "",
          designation: "",
          nature_of_work: "",
          experience_certificate_url: ""
        }
      ]
    }));
  };

  const addPublication = () => {
    setFormData(prev => ({
      ...prev,
      publications: [
        ...prev.publications,
        {
          type: "",
          paper_title: "",
          affiliation: "",
          acceptance_year: "",
          document_url: ""
        }
      ]
    }));
  };

  const handleExperienceChange = (e, index) => {
    const { name, value } = e.target;
    let error = '';

    // Validate field based on name
    switch (name) {
      case 'period_from':
        if (!value) error = 'Please select the start date';
        break;
      case 'monthly_compensation':
        if (!value) error = 'Please enter your monthly compensation';
        else if (parseFloat(value) < 0) error = 'Monthly compensation cannot be negative';
        break;
      default:
        if (!value) error = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [`experience.${index}.${name}`]: error
    }));

    // If there's an error, scroll to the field
    if (error) {
      const fieldId = `experience-${index}-${name}`;
      scrollToError(fieldId);
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [name]: value } : exp
      )
    }));
  };

  const handlePublicationChange = (e, index) => {
    const { name, value } = e.target;
    let error = '';

    // Validate field based on name
    switch (name) {
      case 'acceptance_year':
        error = validateYear(value, 'acceptance');
        break;
      default:
        if (!value) error = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [`publications.${index}.${name}`]: error
    }));

    // If there's an error, scroll to the field
    if (error) {
      const fieldId = `publication-${index}-${name}`;
      scrollToError(fieldId);
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      publications: prev.publications.map((pub, i) => 
        i === index ? { ...pub, [name]: value } : pub
      )
    }));
  };

  const handleExperienceFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for experience certificates');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', 'experience');
    formData.append('index', index);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/academic/upload-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );

      const secureUrl = response.data.url.replace(/^http:/, 'https:');
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.map((exp, i) => 
          i === index ? { ...exp, experience_certificate_url: secureUrl } : exp
        )
      }));

      toast.success('Experience certificate uploaded successfully');
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to upload experience certificate');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublicationFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for publication documents');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', 'publication');
    formData.append('index', index);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/academic/upload-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );

      const secureUrl = response.data.url.replace(/^http:/, 'https:');
      setFormData(prev => ({
        ...prev,
        publications: prev.publications.map((pub, i) => 
          i === index ? { ...pub, document_url: secureUrl } : pub
        )
      }));

      toast.success('Publication document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload publication document');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const deleteQualifyingExam = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifying_exams: prev.qualifying_exams.filter((_, i) => i !== index)
    }));
  };

  const deleteExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const deletePublication = (index) => {
    setFormData(prev => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index)
    }));
  };

  const handleExamCertificateUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for exam certificates');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', 'exam');
    formData.append('index', index);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/academic/upload-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );

      const secureUrl = response.data.url.replace(/^http:/, 'https:');
      setFormData(prev => ({
        ...prev,
        qualifying_exams: prev.qualifying_exams.map((exam, i) => 
          i === index ? { ...exam, exam_certificate_url: secureUrl } : exam
        )
      }));

      toast.success('Exam certificate uploaded successfully');
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to upload exam certificate');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    // Validate qualifications
    formData.qualifications.forEach((qual, index) => {
      Object.keys(qual).forEach(field => {
        const error = validateField(field, qual[field], 'qualification');
        if (error) {
          errors[`qualifications.${index}.${field}`] = error;
          hasErrors = true;
        }
      });
    });

    // Validate qualifying exams
    formData.qualifying_exams.forEach((exam, index) => {
      Object.keys(exam).forEach(field => {
        const error = validateField(field, exam[field], 'exam');
        if (error) {
          errors[`qualifying_exams.${index}.${field}`] = error;
          hasErrors = true;
        }
      });
    });

    // Validate experience
    formData.experience.forEach((exp, index) => {
      Object.keys(exp).forEach(field => {
        const error = validateField(field, exp[field], 'experience');
        if (error) {
          errors[`experience.${index}.${field}`] = error;
          hasErrors = true;
        }
      });
    });

    // Validate publications
    formData.publications.forEach((pub, index) => {
      Object.keys(pub).forEach(field => {
        const error = validateField(field, pub[field], 'publication');
        if (error) {
          errors[`publications.${index}.${field}`] = error;
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      setErrors(errors);
      return false;
    }

    return true;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {isExistingData ? 'Update Academic Details' : 'Academic Details'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Qualifications */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-700">Qualifications</h2>
              <Button 
                type="button" 
                onClick={addQualification} 
                variant="outline"
                className="text-sm px-3 py-1"
              >
              Add Qualification
            </Button>
          </div>

          {formData.qualifications.map((qualification, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 space-y-4 relative">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => deleteQualification(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor={`qualification-${index}-standard`} className="text-sm font-medium text-gray-700">Standard</Label>
                    <Select
                      value={qualification.standard}
                      onValueChange={(value) => handleQualificationChange(
                        { target: { name: 'standard', value } },
                        index
                      )}
                    >
                        <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10th">10th</SelectItem>
                        <SelectItem value="12th">12th</SelectItem>
                        <SelectItem value="UG">UG</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                      <Label htmlFor={`qualification-${index}-degree_name`} className="text-sm font-medium text-gray-700">Degree Name</Label>
                    <Input
                      id={`qualification-${index}-degree_name`}
                      name="degree_name"
                      value={qualification.degree_name}
                      onChange={(e) => handleQualificationChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`qualification-${index}-university`} className="text-sm font-medium text-gray-700">University/Board</Label>
                    <Input
                      id={`qualification-${index}-university`}
                      name="university"
                      value={qualification.university}
                      onChange={(e) => handleQualificationChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`qualification-${index}-year_of_completion`} className="text-sm font-medium text-gray-700">Year of Completion</Label>
                    <Input
                      id={`qualification-${index}-year_of_completion`}
                      name="year_of_completion"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={qualification.year_of_completion}
                      onChange={(e) => handleQualificationChange(e, index)}
                      className={getFieldError(`qualifications.${index}.year_of_completion`) ? "border-red-500" : ""}
                    />
                      {getFieldError(`qualifications.${index}.year_of_completion`) && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(`qualifications.${index}.year_of_completion`)}</p>
                      )}
                  </div>

                  <div>
                      <Label htmlFor={`qualification-${index}-marks_type`} className="text-sm font-medium text-gray-700">Marks Type</Label>
                    <Select
                      value={qualification.marks_type}
                      onValueChange={(value) => handleQualificationChange(
                        { target: { name: 'marks_type', value } },
                        index
                      )}
                    >
                        <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select marks type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                        <SelectItem value="CGPA">CGPA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                      <Label htmlFor={`qualification-${index}-marks_obtained`} className="text-sm font-medium text-gray-700">Marks Obtained</Label>
                    <Input
                      id={`qualification-${index}-marks_obtained`}
                      name="marks_obtained"
                      type="number"
                      value={qualification.marks_obtained}
                      onChange={(e) => handleQualificationChange(e, index)}
                        className={getFieldError(`qualifications.${index}.marks_obtained`) ? "border-red-500" : ""}
                    />
                      {getFieldError(`qualifications.${index}.marks_obtained`) && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(`qualifications.${index}.marks_obtained`)}</p>
                      )}
                  </div>

                  {qualification.marks_type === "CGPA" && (
                    <div>
                        <Label htmlFor={`qualification-${index}-max_cgpa`} className="text-sm font-medium text-gray-700">Maximum CGPA</Label>
                      <Input
                        id={`qualification-${index}-max_cgpa`}
                        name="max_cgpa"
                        type="number"
                        value={qualification.max_cgpa}
                        onChange={(e) => handleQualificationChange(e, index)}
                        required
                      />
                    </div>
                  )}

                  <div>
                      <Label htmlFor={`qualification-${index}-branch`} className="text-sm font-medium text-gray-700">Branch/Specialization</Label>
                    <Input
                      id={`qualification-${index}-branch`}
                      name="branch"
                      value={qualification.branch}
                      onChange={(e) => handleQualificationChange(e, index)}
                    />
                  </div>

                  <div>
                      <Label htmlFor={`qualification-${index}-program_duration_months`} className="text-sm font-medium text-gray-700">Program Duration (months)</Label>
                    <Input
                      id={`qualification-${index}-program_duration_months`}
                      name="program_duration_months"
                      type="number"
                      value={qualification.program_duration_months}
                      onChange={(e) => handleQualificationChange(e, index)}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Document Upload</Label>
                      <div className="text-xs text-gray-500 mb-2">
                        Please upload only PDF files (max size: 5MB)
                      </div>
                    <Input
                      type="file"
                        accept=".pdf"
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={isUploading}
                        className="h-9 text-sm"
                    />
                    {qualification.document_url && (
                      <div className="mt-2">
                          <object
                            data={`${qualification.document_url}#toolbar=0&navpanes=0`}
                            type="application/pdf"
                            className="w-full h-[400px] border border-gray-200 rounded"
                          >
                            <p className="text-sm text-gray-600">Unable to display PDF file. <a href={qualification.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> instead.</p>
                          </object>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Examination Results */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Examination Results</h2>
          
          {/* Bachelor's Degree */}
          <div className="space-y-4">
            <h3 className="font-medium">a) Bachelor's Degree: B.E./B.Tech./B.Sc./Others</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bachelors_branch">Branch</Label>
                    <Input
                  id="bachelors_branch"
                  name="bachelors_branch"
                  value={formData.bachelors_branch}
                  onChange={handleChange}
                />
              </div>
                  </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Semester</th>
                    <th className="border p-2">I</th>
                    <th className="border p-2">II</th>
                    <th className="border p-2">III</th>
                    <th className="border p-2">IV</th>
                    <th className="border p-2">V</th>
                    <th className="border p-2">VI</th>
                    <th className="border p-2">VII</th>
                    <th className="border p-2">VIII</th>
                    <th className="border p-2">Aggregate/CGPA</th>
                    <th className="border p-2">Class</th>
                    <th className="border p-2">% of Marks/GPA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Marks/CGPA</td>
                    <td className="border p-2">
                    <Input
                        type="text"
                        name="bachelors_sem1"
                        value={formData.bachelors_sem1}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_sem2"
                        value={formData.bachelors_sem2}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_sem3"
                        value={formData.bachelors_sem3}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_sem4"
                        value={formData.bachelors_sem4}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_sem5"
                        value={formData.bachelors_sem5}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_sem6"
                        value={formData.bachelors_sem6}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_sem7"
                        value={formData.bachelors_sem7}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_sem8"
                        value={formData.bachelors_sem8}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="bachelors_aggregate"
                        value={formData.bachelors_aggregate}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        type="text"
                        name="bachelors_class"
                        value={formData.bachelors_class}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        type="text"
                        name="bachelors_percentage"
                        value={formData.bachelors_percentage}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
                      </div>
          </div>

          {/* Master's Degree */}
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">b) Master's Degree: M.E./M.Tech./M.S./M.Sc./Others</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="masters_branch">Branch</Label>
                        <Input
                  id="masters_branch"
                  name="masters_branch"
                  value={formData.masters_branch}
                  onChange={handleChange}
                        />
                      </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Semester</th>
                    <th className="border p-2">I</th>
                    <th className="border p-2">II</th>
                    <th className="border p-2">III</th>
                    <th className="border p-2">IV</th>
                    <th className="border p-2">Aggregate/CGPA</th>
                    <th className="border p-2">Class</th>
                    <th className="border p-2">% of Marks/GPA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Marks/CGPA</td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="masters_sem1"
                        value={formData.masters_sem1}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="masters_sem2"
                        value={formData.masters_sem2}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="masters_sem3"
                        value={formData.masters_sem3}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="masters_sem4"
                        value={formData.masters_sem4}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="masters_aggregate"
                        value={formData.masters_aggregate}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                        <Input
                        type="text"
                        name="masters_class"
                        value={formData.masters_class}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <Input
                        type="text"
                        name="masters_percentage"
                        value={formData.masters_percentage}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
                      </div>
          </div>

          {/* Other Degree/Diploma */}
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">c) Other degree/diploma programme, if any:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="other_degree">Degree/Diploma Details</Label>
                        <Input
                  id="other_degree"
                  name="other_degree"
                  value={formData.other_degree}
                  onChange={handleChange}
                />
                      </div>
            </div>
          </div>
        </div>

        {/* Additional Qualifications */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Additional Qualifications</h2>
          
          {/* GATE Details */}
          <div className="space-y-4">
            <h3 className="font-medium">1. GATE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gate_score">Score</Label>
                        <Input
                  id="gate_score"
                  name="gate_score"
                  value={formData.gate_score}
                  onChange={handleChange}
                />
                      </div>
              <div className="space-y-2">
                <Label htmlFor="gate_qualifying_year">Qualifying Year</Label>
                        <Input
                  id="gate_qualifying_year"
                  name="gate_qualifying_year"
                          type="number"
                  value={formData.gate_qualifying_year}
                  onChange={handleChange}
                        />
                      </div>
                    </div>
          </div>

          {/* NET/CSIR/UGC/JRF/Lectureship/NBHM/Others */}
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">2. NET/CSIR/UGC/JRF/Lectureship/NBHM/Others</h3>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Select Examination</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="net"
                      name="net_exam"
                      value="net"
                      checked={formData.net_exam === "net"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="net">NET</Label>
                      </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="csir"
                      name="net_exam"
                      value="csir"
                      checked={formData.net_exam === "csir"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="csir">CSIR</Label>
                      </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="ugc"
                      name="net_exam"
                      value="ugc"
                      checked={formData.net_exam === "ugc"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="ugc">UGC</Label>
                      </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="jrf"
                      name="net_exam"
                      value="jrf"
                      checked={formData.net_exam === "jrf"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="jrf">JRF</Label>
                      </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="lectureship"
                      name="net_exam"
                      value="lectureship"
                      checked={formData.net_exam === "lectureship"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="lectureship">Lectureship</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="nbhm"
                      name="net_exam"
                      value="nbhm"
                      checked={formData.net_exam === "nbhm"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="nbhm">NBHM</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="others"
                      name="net_exam"
                      value="others"
                      checked={formData.net_exam === "others"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="others">Others</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam_date">Date of Exam</Label>
                  <Input
                    id="exam_date"
                    name="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={handleChange}
                  />
                    </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifying_year">Qualifying Year</Label>
                    <Input
                    id="qualifying_year"
                    name="qualifying_year"
                    type="number"
                    value={formData.qualifying_year}
                    onChange={handleChange}
                  />
                      </div>
                  </div>
                </div>
              </div>
        </div>

        {/* Experience */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700">Experience</h2>
            <Button 
              type="button" 
              onClick={addExperience} 
              variant="outline"
              className="text-sm px-3 py-1"
            >
              Add Experience
            </Button>
          </div>

          {formData.experience.map((experience, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4 space-y-4 relative">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => deleteExperience(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`experience-${index}-type`} className="text-sm font-medium text-gray-700">Type</Label>
                  <Select
                    value={experience.type}
                    onValueChange={(value) => handleExperienceChange(
                      { target: { name: 'type', value } },
                      index
                    )}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Industry">Industry</SelectItem>
                      <SelectItem value="Academia">Academia</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError(`experience.${index}.type`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`experience.${index}.type`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`experience-${index}-organisation`} className="text-sm font-medium text-gray-700">Organisation</Label>
                  <Input
                    id={`experience-${index}-organisation`}
                    name="organisation"
                    value={experience.organisation}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className={getFieldError(`experience.${index}.organisation`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`experience.${index}.organisation`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`experience.${index}.organisation`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`experience-${index}-place`} className="text-sm font-medium text-gray-700">Place</Label>
                  <Input
                    id={`experience-${index}-place`}
                    name="place"
                    value={experience.place}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className={getFieldError(`experience.${index}.place`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`experience.${index}.place`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`experience.${index}.place`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`experience-${index}-period_from`} className="text-sm font-medium text-gray-700">Period From</Label>
                  <Input
                    id={`experience-${index}-period_from`}
                    name="period_from"
                    type="date"
                    value={formatDateForInput(experience.period_from)}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className={getFieldError(`experience.${index}.period_from`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`experience.${index}.period_from`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`experience.${index}.period_from`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`experience-${index}-period_to`} className="text-sm font-medium text-gray-700">Period To</Label>
                  <Input
                    id={`experience-${index}-period_to`}
                    name="period_to"
                    type="date"
                    value={formatDateForInput(experience.period_to)}
                    onChange={(e) => handleExperienceChange(e, index)}
                  />
                </div>

                <div>
                  <Label htmlFor={`experience-${index}-monthly_compensation`} className="text-sm font-medium text-gray-700">Monthly Compensation</Label>
                  <Input
                    id={`experience-${index}-monthly_compensation`}
                    name="monthly_compensation"
                    type="number"
                    value={experience.monthly_compensation}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className={getFieldError(`experience.${index}.monthly_compensation`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`experience.${index}.monthly_compensation`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`experience.${index}.monthly_compensation`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`experience-${index}-designation`} className="text-sm font-medium text-gray-700">Designation</Label>
                  <Input
                    id={`experience-${index}-designation`}
                    name="designation"
                    value={experience.designation}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className={getFieldError(`experience.${index}.designation`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`experience.${index}.designation`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`experience.${index}.designation`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`experience-${index}-nature_of_work`} className="text-sm font-medium text-gray-700">Nature of Work</Label>
                  <Input
                    id={`experience-${index}-nature_of_work`}
                    name="nature_of_work"
                    value={experience.nature_of_work}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className={getFieldError(`experience.${index}.nature_of_work`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`experience.${index}.nature_of_work`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`experience.${index}.nature_of_work`)}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Experience Certificate Upload</Label>
                  <div className="text-xs text-gray-500 mb-2">
                    Please upload only PDF files (max size: 5MB)
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleExperienceFileUpload(e, index)}
                    disabled={isUploading}
                    className="h-9 text-sm"
                  />
                  {experience.experience_certificate_url && (
                    <div className="mt-2">
                      <object
                        data={`${experience.experience_certificate_url}#toolbar=0&navpanes=0`}
                        type="application/pdf"
                        className="w-full h-[400px] border border-gray-200 rounded"
                      >
                        <p className="text-sm text-gray-600">Unable to display PDF file. <a href={experience.experience_certificate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> instead.</p>
                      </object>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Project Titles */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Title of UG/PG Project</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ug_project_title">UG Project Title</Label>
              <Input
                id="ug_project_title"
                name="ug_project_title"
                value={formData.ug_project_title}
                onChange={handleChange}
                placeholder="Enter your UG project title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pg_project_title">PG Project Title</Label>
              <Input
                id="pg_project_title"
                name="pg_project_title"
                value={formData.pg_project_title}
                onChange={handleChange}
                placeholder="Enter your PG project title"
              />
            </div>
          </div>
        </div>

        {/* Interested Area of Research */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Interested Area of Research</h2>
          
          {/* Department Selection */}
          <div className="space-y-4">
            <Label>Select Department</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="research_cse"
                  name="research_department"
                  value="cse"
                  checked={formData.research_department === "cse"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="research_cse">Computer Science & Engineering</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="research_ece"
                  name="research_department"
                  value="ece"
                  checked={formData.research_department === "ece"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="research_ece">Electronics & Communication Engineering</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="research_ee"
                  name="research_department"
                  value="ee"
                  checked={formData.research_department === "ee"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="research_ee">Electrical Engineering</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="research_me"
                  name="research_department"
                  value="me"
                  checked={formData.research_department === "me"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="research_me">Mechanical Engineering</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="research_eie"
                  name="research_department"
                  value="eie"
                  checked={formData.research_department === "eie"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="research_eie">Electronics and Instrumentation Engineering</Label>
              </div>
            </div>
          </div>

          {/* Specialization/Area of Research */}
          <div className="space-y-2">
            <Label htmlFor="research_area">Specialization/Area of Research</Label>
            <Input
              id="research_area"
              name="research_area"
              value={formData.research_area}
              onChange={handleChange}
              placeholder="Enter your area of research interest"
            />
          </div>
        </div>

        {/* Publications */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700">Publications</h2>
            <Button 
              type="button" 
              onClick={addPublication} 
              variant="outline"
              className="text-sm px-3 py-1"
            >
              Add Publication
            </Button>
          </div>

          {formData.publications.map((publication, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4 space-y-4 relative">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => deletePublication(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`publication-${index}-type`} className="text-sm font-medium text-gray-700">Type</Label>
                  <Select
                    value={publication.type}
                    onValueChange={(value) => handlePublicationChange(
                      { target: { name: 'type', value } },
                      index
                    )}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Journal">Journal</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Book">Book</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError(`publications.${index}.type`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`publications.${index}.type`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`publication-${index}-paper_title`} className="text-sm font-medium text-gray-700">Paper Title</Label>
                  <Input
                    id={`publication-${index}-paper_title`}
                    name="paper_title"
                    value={publication.paper_title}
                    onChange={(e) => handlePublicationChange(e, index)}
                    className={getFieldError(`publications.${index}.paper_title`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`publications.${index}.paper_title`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`publications.${index}.paper_title`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`publication-${index}-affiliation`} className="text-sm font-medium text-gray-700">Affiliation</Label>
                  <Input
                    id={`publication-${index}-affiliation`}
                    name="affiliation"
                    value={publication.affiliation}
                    onChange={(e) => handlePublicationChange(e, index)}
                    className={getFieldError(`publications.${index}.affiliation`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`publications.${index}.affiliation`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`publications.${index}.affiliation`)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`publication-${index}-acceptance_year`} className="text-sm font-medium text-gray-700">Acceptance Year</Label>
                  <Input
                    id={`publication-${index}-acceptance_year`}
                    name="acceptance_year"
                    type="number"
                    value={publication.acceptance_year}
                    onChange={(e) => handlePublicationChange(e, index)}
                    className={getFieldError(`publications.${index}.acceptance_year`) ? "border-red-500" : ""}
                  />
                  {getFieldError(`publications.${index}.acceptance_year`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`publications.${index}.acceptance_year`)}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Document Upload</Label>
                  <div className="text-xs text-gray-500 mb-2">
                    Please upload only PDF files (max size: 5MB)
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handlePublicationFileUpload(e, index)}
                    disabled={isUploading}
                    className="h-9 text-sm"
                  />
                  {publication.document_url && (
                    <div className="mt-2">
                      <object
                        data={`${publication.document_url}#toolbar=0&navpanes=0`}
                        type="application/pdf"
                        className="w-full h-[400px] border border-gray-200 rounded"
                      >
                        <p className="text-sm text-gray-600">Unable to display PDF file. <a href={publication.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> instead.</p>
                      </object>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  </div>
);
}
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
      if (!value) return 'Standard is required';
      if (!['10th', '12th', 'UG', 'PG', 'PhD'].includes(value)) {
        return 'Invalid standard';
      }
      break;
    case 'degree_name':
      if (!value) return 'Degree name is required';
      break;
    case 'university':
      if (!value) return 'University/Board is required';
      break;
    case 'year_of_completion':
      return validateYear(value);
    case 'marks_type':
      if (!value) return 'Marks type is required';
      if (!['Percentage', 'CGPA'].includes(value)) {
        return 'Invalid marks type';
      }
      break;
    case 'marks_obtained':
      return validateMarks(value, context.max_cgpa || 100);
    case 'branch':
      if (!value) return 'Branch/Specialization is required';
      break;
    case 'program_duration_months':
      if (!value) return 'Program duration is required';
      if (parseInt(value) < 0) return 'Duration cannot be negative';
      break;
    case 'exam_type':
      if (!value) return 'Exam type is required';
      if (!['CAT', 'GATE', 'GMAT', 'NET', 'Others'].includes(value)) {
        return 'Invalid exam type';
      }
      break;
    case 'registration_no':
      if (!value) return 'Registration number is required';
      break;
    case 'year_of_qualification':
      return validateYear(value);
    case 'type':
      if (!value) return 'Type is required';
      if (context.type === 'experience' && !['Industry', 'Academia', 'Research'].includes(value)) {
        return 'Invalid experience type';
      }
      if (context.type === 'publication' && !['Journal', 'Conference', 'Book'].includes(value)) {
        return 'Invalid publication type';
      }
      break;
    case 'organisation':
      if (!value) return 'Organisation is required';
      break;
    case 'place':
      if (!value) return 'Place is required';
      break;
    case 'period_from':
      if (!value) return 'Period from is required';
      break;
    case 'monthly_compensation':
      if (!value) return 'Monthly compensation is required';
      if (parseFloat(value) < 0) return 'Compensation cannot be negative';
      break;
    case 'designation':
      if (!value) return 'Designation is required';
      break;
    case 'nature_of_work':
      if (!value) return 'Nature of work is required';
      break;
    case 'paper_title':
      if (!value) return 'Paper title is required';
      break;
    case 'affiliation':
      if (!value) return 'Affiliation is required';
      break;
    case 'acceptance_year':
      return validateYear(value);
  }
  return '';
};

const validateYear = (year) => {
  if (!year) return 'Year is required';
  const currentYear = new Date().getFullYear();
  if (parseInt(year) < 1900) return 'Invalid year';
  if (parseInt(year) > currentYear) return 'Year cannot be in the future';
  return '';
};

const validateMarks = (marks, maxMarks) => {
  if (!marks) return 'Marks are required';
  const marksNum = parseFloat(marks);
  if (isNaN(marksNum)) return 'Marks must be a number';
  if (marksNum < 0) return 'Marks cannot be negative';
  if (marksNum > maxMarks) return `Marks cannot exceed ${maxMarks}`;
  return '';
};

const validateNETType = (examType, netDetails) => {
  if (examType === 'NET' && !netDetails?.type) {
    return 'NET type is required';
  }
  if (netDetails?.type && !['With Fellowship', 'Without Fellowship'].includes(netDetails.type)) {
    return 'Invalid NET type';
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
    return 'Rank must be at least 1';
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
      return `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} cannot be negative`;
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

export default function AcademicQualificationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    qualifications: [
      {
        standard: "UG",
        degree_name: "B.Tech",
        university: "National Institute of Technology",
        year_of_completion: new Date().getFullYear(),
        marks_type: "CGPA",
        marks_obtained: "8.5",
        max_cgpa: 10,
        branch: "Computer Science",
        program_duration_months: "48",
        document_url: "",
      }
    ],
    qualifying_exams: [
      {
        exam_type: "GATE",
        registration_no: "GATE2024XXXXX",
        year_of_qualification: new Date().getFullYear(),
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
          discipline: "Computer Science",
          gate_score: "750",
          gate_rank: "1000",
          marks_out_of_100: "85",
          qualifying_marks: "25",
        },
        gmat_details: {
          total_score: "",
          quant_score: "",
          verbal_score: "",
          awa_score: "",
          ir_score: "",
        },
        net_details: {
          type: "Without Fellowship"
        },
        other_details: {
          exam_name: "",
          score: "",
          rank: "",
          qualifying_marks: "",
        }
      }
    ],
    experience: [
      {
        type: "Industry",
        organisation: "Tech Company",
        place: "Bangalore",
        period_from: new Date().toISOString().split('T')[0],
        period_to: "",
        monthly_compensation: "50000",
        designation: "Software Engineer",
        nature_of_work: "Full Stack Development",
        experience_certificate_url: ""
      }
    ],
    publications: [
      {
        type: "Journal",
        paper_title: "Sample Research Paper",
        affiliation: "National Institute of Technology",
        acceptance_year: new Date().getFullYear(),
        document_url: ""
      }
    ]
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
        error = validateYear(value);
        break;
      case 'marks_obtained':
        error = validateMarks(value, formData.qualifications[index].max_cgpa || 100);
        break;
      case 'program_duration_months':
        if (!value) error = 'Program duration is required';
        else if (parseInt(value) < 0) error = 'Duration cannot be negative';
        break;
      default:
        if (!value) error = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [`qualifications.${index}.${name}`]: error
    }));

    // Update form data
    handleChange(e, index, 'qualifications');
  };

  const handleExamChange = (e, index) => {
    const { name, value } = e.target;
    let error = '';

    // Validate field based on name
    switch (name) {
      case 'year_of_qualification':
        error = validateYear(value);
        break;
      case 'registration_no':
        if (!value) error = 'Registration number is required';
        break;
      default:
        if (!value) error = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [`qualifying_exams.${index}.${name}`]: error
    }));

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
    setIsLoading(true);

    try {
      // Validate all fields before submission
      const newErrors = {};
      let isValid = true;

      // Validate qualifications
      formData.qualifications.forEach((qual, index) => {
        Object.keys(qual).forEach(field => {
          if (field !== 'document_url') { // Skip document_url validation as it's optional
            const error = validateField(field, qual[field], qual);
            if (error) {
              newErrors[`qualifications.${index}.${field}`] = error;
              isValid = false;
            }
          }
        });
      });

      // Validate qualifying exams
      formData.qualifying_exams.forEach((exam, index) => {
        // Validate basic exam fields
        Object.keys(exam).forEach(field => {
          if (field !== 'cat_details' && field !== 'gate_details' && field !== 'gmat_details' && field !== 'net_details' && field !== 'other_details' && field !== 'exam_certificate_url') {
            const error = validateField(field, exam[field]);
            if (error) {
              newErrors[`qualifying_exams.${index}.${field}`] = error;
              isValid = false;
            }
          }
        });

        // Validate exam-specific details
        if (exam.exam_type === 'NET') {
          const netError = validateNETType(exam.exam_type, exam.net_details);
          if (netError) {
            newErrors[`qualifying_exams.${index}.net_details.type`] = netError;
            isValid = false;
          }
        } else if (exam.exam_type === 'GATE') {
          const gateError = validateGATEMarks(exam.gate_details);
          if (gateError) {
            newErrors[`qualifying_exams.${index}.gate_details`] = gateError;
            isValid = false;
          }
        } else if (exam.exam_type === 'CAT') {
          const catError = validateCATMarks(exam.cat_details);
          if (catError) {
            newErrors[`qualifying_exams.${index}.cat_details`] = catError;
            isValid = false;
          }
        } else if (exam.exam_type === 'GMAT') {
          const gmatError = validateGMATMarks(exam.gmat_details);
          if (gmatError) {
            newErrors[`qualifying_exams.${index}.gmat_details`] = gmatError;
            isValid = false;
          }
        }
      });

      // Validate experience
      formData.experience.forEach((exp, index) => {
        Object.keys(exp).forEach(field => {
          if (field !== 'experience_certificate_url') { // Skip certificate URL validation
            const error = validateField(field, exp[field], { type: 'experience' });
            if (error) {
              newErrors[`experience.${index}.${field}`] = error;
              isValid = false;
            }
          }
        });
      });

      // Validate publications
      formData.publications.forEach((pub, index) => {
        Object.keys(pub).forEach(field => {
          if (field !== 'document_url') { // Skip document URL validation
            const error = validateField(field, pub[field], { type: 'publication' });
            if (error) {
              newErrors[`publications.${index}.${field}`] = error;
              isValid = false;
            }
          }
        });
      });

      if (!isValid) {
        setErrors(newErrors);
        // Show specific validation errors
        const errorMessages = Object.entries(newErrors)
          .map(([field, error]) => `${field}: ${error}`)
          .join('\n');
        toast.error(errorMessages);
        return;
      }

      // Rest of the submission code...
      console.log('Starting form submission...');
      console.log('Original form data:', formData);

      // Format the data before submission
      const formattedData = {
        qualifications: formData.qualifications.map(qual => ({
          ...qual,
          year_of_completion: parseInt(qual.year_of_completion),
          marks_obtained: parseFloat(qual.marks_obtained),
          program_duration_months: parseInt(qual.program_duration_months)
        })),
        qualifying_exams: formData.qualifying_exams.map(exam => {
          const formattedExam = {
            exam_type: exam.exam_type,
            registration_no: exam.registration_no,
            year_of_qualification: parseInt(exam.year_of_qualification)
          };

          // Add exam-specific details based on exam type
          if (exam.exam_type === 'NET') {
            formattedExam.net_details = {
              type: exam.net_details?.type || 'Without Fellowship'
            };
          } else if (exam.exam_type === 'CAT') {
            formattedExam.cat_details = exam.cat_details;
          } else if (exam.exam_type === 'GATE') {
            formattedExam.gate_details = exam.gate_details;
          } else if (exam.exam_type === 'GMAT') {
            formattedExam.gmat_details = exam.gmat_details;
          } else if (exam.exam_type === 'Others') {
            formattedExam.other_details = exam.other_details;
          }

          return formattedExam;
        }),
        experience: formData.experience.map(exp => ({
          ...exp,
          period_from: new Date(exp.period_from),
          period_to: exp.period_to ? new Date(exp.period_to) : undefined,
          monthly_compensation: parseFloat(exp.monthly_compensation)
        })),
        publications: formData.publications.map(pub => ({
          ...pub,
          acceptance_year: parseInt(pub.acceptance_year)
        }))
      };

      console.log('Formatted data before submission:', formattedData);

      const endpoint = isExistingData ? 'update' : 'create';
      const method = isExistingData ? 'put' : 'post';
      
      const response = await axios[method](
        `${import.meta.env.VITE_BACKEND_URL}/api/academic/${endpoint}`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      console.log('Response from server:', response.data);

      if (response.data.success) {
        // Fetch fresh data immediately after successful update
        const freshData = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/academic/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        setFormData(freshData.data);
        
        toast.success(`Academic details ${isExistingData ? 'updated' : 'submitted'} successfully`, {
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
      } else {
        throw new Error(response.data.message || 'Failed to submit academic details');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        console.error('Validation errors:', validationErrors);
        const errorMessages = Object.entries(validationErrors)
          .map(([field, error]) => `${field}: ${error.message}`)
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(error.message || `Failed to ${isExistingData ? 'update' : 'submit'} academic details`);
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
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [name]: value } : exp
      )
    }));
  };

  const handlePublicationChange = (e, index) => {
    const { name, value } = e.target;
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

        {/* Qualifying Exams */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-700">Qualifying Exams</h2>
              <Button 
                type="button" 
                onClick={addQualifyingExam} 
                variant="outline"
                className="text-sm px-3 py-1"
              >
              Add Exam
            </Button>
          </div>

          {formData.qualifying_exams.map((exam, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 space-y-4 relative">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => deleteQualifyingExam(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor={`exam-${index}-type`} className="text-sm font-medium text-gray-700">Exam Type</Label>
                    <Select
                      value={exam.exam_type}
                      onValueChange={(value) => handleExamChange(
                        { target: { name: 'exam_type', value } },
                        index
                      )}
                    >
                        <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAT">CAT</SelectItem>
                        <SelectItem value="GATE">GATE</SelectItem>
                        <SelectItem value="GMAT">GMAT</SelectItem>
                        <SelectItem value="NET">NET</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                      <Label htmlFor={`exam-${index}-registration_no`} className="text-sm font-medium text-gray-700">Registration Number</Label>
                    <Input
                      id={`exam-${index}-registration_no`}
                      name="registration_no"
                      value={exam.registration_no}
                      onChange={(e) => handleExamChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`exam-${index}-year_of_qualification`} className="text-sm font-medium text-gray-700">Year of Qualification</Label>
                    <Input
                      id={`exam-${index}-year_of_qualification`}
                      name="year_of_qualification"
                      type="number"
                      value={exam.year_of_qualification}
                      onChange={(e) => handleExamChange(e, index)}
                        className={getFieldError(`qualifying_exams.${index}.year_of_qualification`) ? "border-red-500" : ""}
                    />
                      {getFieldError(`qualifying_exams.${index}.year_of_qualification`) && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(`qualifying_exams.${index}.year_of_qualification`)}</p>
                      )}
                  </div>

                  {/* CAT Details */}
                  {exam.exam_type === "CAT" && (
                    <>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-total_score`} className="text-sm font-medium text-gray-700">Total Score</Label>
                        <Input
                          id={`exam-${index}-cat-total_score`}
                          name="total_score"
                          type="number"
                          value={exam.cat_details.total_score}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-total_percentile`} className="text-sm font-medium text-gray-700">Total Percentile</Label>
                        <Input
                          id={`exam-${index}-cat-total_percentile`}
                          name="total_percentile"
                          type="number"
                          value={exam.cat_details.total_percentile}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-quant_score`} className="text-sm font-medium text-gray-700">Quantitative Score</Label>
                        <Input
                          id={`exam-${index}-cat-quant_score`}
                          name="quant_score"
                          type="number"
                          value={exam.cat_details.quant_score}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-quant_percentile`} className="text-sm font-medium text-gray-700">Quantitative Percentile</Label>
                        <Input
                          id={`exam-${index}-cat-quant_percentile`}
                          name="quant_percentile"
                          type="number"
                          value={exam.cat_details.quant_percentile}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-di_lr_score`} className="text-sm font-medium text-gray-700">DI/LR Score</Label>
                        <Input
                          id={`exam-${index}-cat-di_lr_score`}
                          name="di_lr_score"
                          type="number"
                          value={exam.cat_details.di_lr_score}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-di_lr_percentile`} className="text-sm font-medium text-gray-700">DI/LR Percentile</Label>
                        <Input
                          id={`exam-${index}-cat-di_lr_percentile`}
                          name="di_lr_percentile"
                          type="number"
                          value={exam.cat_details.di_lr_percentile}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-verbal_score`} className="text-sm font-medium text-gray-700">Verbal Score</Label>
                        <Input
                          id={`exam-${index}-cat-verbal_score`}
                          name="verbal_score"
                          type="number"
                          value={exam.cat_details.verbal_score}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-cat-verbal_percentile`} className="text-sm font-medium text-gray-700">Verbal Percentile</Label>
                        <Input
                          id={`exam-${index}-cat-verbal_percentile`}
                          name="verbal_percentile"
                          type="number"
                          value={exam.cat_details.verbal_percentile}
                          onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                        />
                      </div>
                    </>
                  )}

                  {/* GATE Details */}
                  {exam.exam_type === "GATE" && (
                    <>
                      <div>
                          <Label htmlFor={`exam-${index}-gate-discipline`} className="text-sm font-medium text-gray-700">Discipline</Label>
                        <Input
                          id={`exam-${index}-gate-discipline`}
                          name="discipline"
                          value={exam.gate_details.discipline}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-gate-gate_score`} className="text-sm font-medium text-gray-700">GATE Score</Label>
                        <Input
                          id={`exam-${index}-gate-gate_score`}
                          name="gate_score"
                          type="number"
                          value={exam.gate_details.gate_score}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-gate-gate_rank`} className="text-sm font-medium text-gray-700">GATE Rank</Label>
                        <Input
                          id={`exam-${index}-gate-gate_rank`}
                          name="gate_rank"
                          type="number"
                          value={exam.gate_details.gate_rank}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-gate-marks_out_of_100`} className="text-sm font-medium text-gray-700">Marks out of 100</Label>
                        <Input
                          id={`exam-${index}-gate-marks_out_of_100`}
                          name="marks_out_of_100"
                          type="number"
                          value={exam.gate_details.marks_out_of_100}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                            className={getFieldError(`qualifying_exams.${index}.gate_details.marks_out_of_100`) ? "border-red-500" : ""}
                        />
                          {getFieldError(`qualifying_exams.${index}.gate_details.marks_out_of_100`) && (
                            <p className="text-sm text-red-500 mt-1">{getFieldError(`qualifying_exams.${index}.gate_details.marks_out_of_100`)}</p>
                          )}
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-gate-qualifying_marks`} className="text-sm font-medium text-gray-700">Qualifying Marks</Label>
                        <Input
                          id={`exam-${index}-gate-qualifying_marks`}
                          name="qualifying_marks"
                          type="number"
                          value={exam.gate_details.qualifying_marks}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                            className={getFieldError(`qualifying_exams.${index}.gate_details.qualifying_marks`) ? "border-red-500" : ""}
                        />
                          {getFieldError(`qualifying_exams.${index}.gate_details.qualifying_marks`) && (
                            <p className="text-sm text-red-500 mt-1">{getFieldError(`qualifying_exams.${index}.gate_details.qualifying_marks`)}</p>
                          )}
                      </div>
                    </>
                  )}

                  {/* GMAT Details */}
                  {exam.exam_type === "GMAT" && (
                    <>
                      <div>
                        <Label htmlFor={`exam-${index}-gmat_details.total_score`} className="text-sm font-medium text-gray-700">Total Score</Label>
                        <Input
                          id={`exam-${index}-gmat_details.total_score`}
                          name="total_score"
                          type="number"
                          value={exam.gmat_details?.total_score || ''}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`exam-${index}-gmat_details.verbal_score`} className="text-sm font-medium text-gray-700">Verbal Score</Label>
                        <Input
                          id={`exam-${index}-gmat_details.verbal_score`}
                          name="verbal_score"
                          type="number"
                          value={exam.gmat_details?.verbal_score || ''}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`exam-${index}-gmat_details.quantitative_score`} className="text-sm font-medium text-gray-700">Quantitative Score</Label>
                        <Input
                          id={`exam-${index}-gmat_details.quantitative_score`}
                          name="quantitative_score"
                          type="number"
                          value={exam.gmat_details?.quantitative_score || ''}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`exam-${index}-gmat_details.analytical_writing_score`} className="text-sm font-medium text-gray-700">Analytical Writing Score</Label>
                        <Input
                          id={`exam-${index}-gmat_details.analytical_writing_score`}
                          name="analytical_writing_score"
                          type="number"
                          value={exam.gmat_details?.analytical_writing_score || ''}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`exam-${index}-gmat_details.integrated_reasoning_score`} className="text-sm font-medium text-gray-700">Integrated Reasoning Score</Label>
                        <Input
                          id={`exam-${index}-gmat_details.integrated_reasoning_score`}
                          name="integrated_reasoning_score"
                          type="number"
                          value={exam.gmat_details?.integrated_reasoning_score || ''}
                          onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                        />
                      </div>
                    </>
                  )}

                  {/* NET Details */}
                  {exam.exam_type === "NET" && (
                    <div>
                      <Label htmlFor={`exam-${index}-net_details.type`} className="text-sm font-medium text-gray-700">NET Type</Label>
                      <Select
                        value={exam.net_details?.type || ''}
                        onValueChange={(value) => handleExamDetailsChange({ target: { name: 'type', value } }, index, 'net_details')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select NET type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="With Fellowship">With Fellowship</SelectItem>
                          <SelectItem value="Without Fellowship">Without Fellowship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Other Details */}
                  {exam.exam_type === "Others" && (
                    <>
                      <div>
                          <Label htmlFor={`exam-${index}-other-exam_name`} className="text-sm font-medium text-gray-700">Exam Name</Label>
                        <Input
                          id={`exam-${index}-other-exam_name`}
                          name="exam_name"
                          value={exam.other_details.exam_name}
                          onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-other-score`} className="text-sm font-medium text-gray-700">Score</Label>
                        <Input
                          id={`exam-${index}-other-score`}
                          name="score"
                          type="number"
                          value={exam.other_details.score}
                          onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-other-rank`} className="text-sm font-medium text-gray-700">Rank</Label>
                        <Input
                          id={`exam-${index}-other-rank`}
                          name="rank"
                          type="number"
                          value={exam.other_details.rank}
                          onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                        />
                      </div>
                      <div>
                          <Label htmlFor={`exam-${index}-other-qualifying_marks`} className="text-sm font-medium text-gray-700">Qualifying Marks</Label>
                        <Input
                          id={`exam-${index}-other-qualifying_marks`}
                          name="qualifying_marks"
                          type="number"
                          value={exam.other_details.qualifying_marks}
                          onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                            className={getFieldError(`qualifying_exams.${index}.other_details.qualifying_marks`) ? "border-red-500" : ""}
                        />
                          {getFieldError(`qualifying_exams.${index}.other_details.qualifying_marks`) && (
                            <p className="text-sm text-red-500 mt-1">{getFieldError(`qualifying_exams.${index}.other_details.qualifying_marks`)}</p>
                          )}
                      </div>
                    </>
                  )}

                  {/* Exam Certificate Upload */}
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Exam Certificate Upload</Label>
                    <div className="text-xs text-gray-500 mb-2">
                      Please upload only PDF files (max size: 5MB)
                    </div>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleExamCertificateUpload(e, index)}
                      disabled={isUploading}
                      className="h-9 text-sm"
                    />
                    {exam.exam_certificate_url && (
                      <div className="mt-2">
                        <object
                          data={`${exam.exam_certificate_url}#toolbar=0&navpanes=0`}
                          type="application/pdf"
                          className="w-full h-[400px] border border-gray-200 rounded"
                        >
                          <p className="text-sm text-gray-600">Unable to display PDF file. <a href={exam.exam_certificate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> instead.</p>
                        </object>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                  </div>

                  <div>
                      <Label htmlFor={`experience-${index}-organisation`} className="text-sm font-medium text-gray-700">Organisation</Label>
                    <Input
                      id={`experience-${index}-organisation`}
                      name="organisation"
                      value={experience.organisation}
                      onChange={(e) => handleExperienceChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`experience-${index}-place`} className="text-sm font-medium text-gray-700">Place</Label>
                    <Input
                      id={`experience-${index}-place`}
                      name="place"
                      value={experience.place}
                      onChange={(e) => handleExperienceChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`experience-${index}-period_from`} className="text-sm font-medium text-gray-700">Period From</Label>
                    <Input
                      id={`experience-${index}-period_from`}
                      name="period_from"
                      type="date"
                      value={formatDateForInput(experience.period_from)}
                      onChange={(e) => handleExperienceChange(e, index)}
                      required
                    />
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
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`experience-${index}-designation`} className="text-sm font-medium text-gray-700">Designation</Label>
                    <Input
                      id={`experience-${index}-designation`}
                      name="designation"
                      value={experience.designation}
                      onChange={(e) => handleExperienceChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`experience-${index}-nature_of_work`} className="text-sm font-medium text-gray-700">Nature of Work</Label>
                    <Input
                      id={`experience-${index}-nature_of_work`}
                      name="nature_of_work"
                      value={experience.nature_of_work}
                      onChange={(e) => handleExperienceChange(e, index)}
                      required
                    />
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
                  </div>

                  <div>
                      <Label htmlFor={`publication-${index}-paper_title`} className="text-sm font-medium text-gray-700">Paper Title</Label>
                    <Input
                      id={`publication-${index}-paper_title`}
                      name="paper_title"
                      value={publication.paper_title}
                      onChange={(e) => handlePublicationChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`publication-${index}-affiliation`} className="text-sm font-medium text-gray-700">Affiliation</Label>
                    <Input
                      id={`publication-${index}-affiliation`}
                      name="affiliation"
                      value={publication.affiliation}
                      onChange={(e) => handlePublicationChange(e, index)}
                      required
                    />
                  </div>

                  <div>
                      <Label htmlFor={`publication-${index}-acceptance_year`} className="text-sm font-medium text-gray-700">Acceptance Year</Label>
                    <Input
                      id={`publication-${index}-acceptance_year`}
                      name="acceptance_year"
                      type="number"
                      value={publication.acceptance_year}
                      onChange={(e) => handlePublicationChange(e, index)}
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
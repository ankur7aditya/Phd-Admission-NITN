import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Printer, Loader2, Combine } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { PDFDocument } from 'pdf-lib';
import { pdf } from '@react-pdf/renderer';
import { Input } from './ui/input';
import { ensureHttps } from '../utils/urlUtils';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    width: '70%',
    fontSize: 12,
    color: '#000',
  },
  fullWidth: {
    width: '100%',
    fontSize: 12,
    marginBottom: 5,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: 150,
    height: 150,
    objectFit: 'contain',
  },
  documentContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  documentImage: {
    width: 300,
    height: 400,
    objectFit: 'contain',
  },
  photo: {
    width: 144, // 2 inches at 72 DPI
    height: 144, // 2 inches at 72 DPI
    objectFit: 'cover',
  },
  signature: {
    width: 216, // 3 inches at 72 DPI
    height: 72, // 1 inch at 72 DPI
    objectFit: 'contain',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  personalDetails: {
    flex: 1,
    marginRight: 20,
  },
  photoSignatureContainer: {
    width: 200,
    alignItems: 'center',
  },
  photoContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
  },
});

// PDF Document Component
const ApplicationPDF = ({ personalDetails, academicDetails, applicationNumber }) => (
  <>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PhD Admission Application</Text>
        <Text style={styles.subtitle}>Application Number: {applicationNumber}</Text>
      </View>

      {/* Personal Details Section */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <View style={styles.personalDetails}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{personalDetails?.first_name} {personalDetails?.last_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{new Date(personalDetails?.dob).toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{personalDetails?.gender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nationality</Text>
              <Text style={styles.value}>{personalDetails?.nationality}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{personalDetails?.category}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Religion</Text>
              <Text style={styles.value}>{personalDetails?.religion}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Father's Name</Text>
              <Text style={styles.value}>{personalDetails?.father_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mother's Name</Text>
              <Text style={styles.value}>{personalDetails?.mother_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Marital Status</Text>
              <Text style={styles.value}>{personalDetails?.marital_status}</Text>
            </View>
            {personalDetails?.marital_status !== 'Single' && (
              <View style={styles.row}>
                <Text style={styles.label}>Spouse Name</Text>
                <Text style={styles.value}>{personalDetails?.spouse_name}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{personalDetails?.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{personalDetails?.phone}</Text>
            </View>
            {personalDetails?.alternate_phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Alternate Phone</Text>
                <Text style={styles.value}>{personalDetails.alternate_phone}</Text>
              </View>
            )}
          </View>
          
          {/* Photo and Signature */}
          <View style={styles.photoSignatureContainer}>
            {personalDetails?.photo && (
              <View style={styles.photoContainer}>
                <Image
                  src={ensureHttps(personalDetails.photo)}
                  style={styles.photo}
                  cache={false}
                />
              </View>
            )}
            {personalDetails?.signature && (
              <View style={styles.signatureContainer}>
                <Image
                  src={ensureHttps(personalDetails.signature)}
                  style={styles.signature}
                  cache={false}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication Address</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Street</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.street}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Line 2</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.line2}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Line 3</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.line3}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>City</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.city}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>State</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.state}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pincode</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.pincode}</Text>
        </View>
      </View>

      {/* Academic Details Section - Reformatted */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Qualifications</Text>
        {academicDetails?.qualifications.map((qual, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{qual.standard}</Text>
            <View style={styles.value}>
              <Text>{qual.degree_name}</Text>
              <Text>{qual.university}</Text>
              <Text>Year: {qual.year_of_completion}</Text>
              <Text>Marks: {qual.marks_obtained} {qual.marks_type}</Text>
              {qual.branch && <Text>Branch: {qual.branch}</Text>}
              <Text>Duration: {qual.program_duration_months} months</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Qualifying Exams Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Qualifying Examinations</Text>
        {academicDetails?.qualifying_exams.map((exam, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{exam.exam_type}</Text>
            <View style={styles.value}>
              <Text>Registration No: {exam.registration_no}</Text>
              <Text>Year: {exam.year_of_qualification}</Text>
              {exam.exam_type === 'NET' && (
                <>
                  <Text>Type: {exam.net_details?.type}</Text>
                  <Text>Subject: {exam.net_details?.subject}</Text>
                  <Text>Score: {exam.net_details?.score}</Text>
                  <Text>Rank: {exam.net_details?.rank}</Text>
                </>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {academicDetails?.experience.map((exp, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{exp.type}</Text>
            <View style={styles.value}>
              <Text>Organization: {exp.organisation}</Text>
              <Text>Place: {exp.place}</Text>
              <Text>Period: {new Date(exp.period_from).toLocaleDateString()} - {exp.period_to ? new Date(exp.period_to).toLocaleDateString() : 'Present'}</Text>
              <Text>Designation: {exp.designation}</Text>
              <Text>Monthly Compensation: {exp.monthly_compensation}</Text>
              <Text>Nature of Work: {exp.nature_of_work}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Publications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publications</Text>
        {academicDetails?.publications.map((pub, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{pub.type}</Text>
            <View style={styles.value}>
              <Text>Title: {pub.paper_title}</Text>
              <Text>Affiliation: {pub.affiliation}</Text>
              <Text>Year: {pub.acceptance_year}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Demand Draft</Text>
          <Text style={styles.value}>{personalDetails?.dd_url ? 'Uploaded' : 'Not Uploaded'}</Text>
        </View>
      </View>

      {/* Documents Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documents</Text>
      </View> */}
    </Page>
  </>
);

export default function PrintApplication() {
  const [personalDetails, setPersonalDetails] = useState(null);
  const [academicDetails, setAcademicDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [showPDF, setShowPDF] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching personal and academic details...');
        
        // Get user data first
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/current-user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('User data:', userResponse.data);
        setApplicationNumber(userResponse.data.user.usernameid);

        // Fetch personal details
        const personalResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/personal/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Personal details response:', personalResponse.data);
        setPersonalDetails(personalResponse.data);

        // Fetch academic details
        const academicResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/academic/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Academic details response:', academicResponse.data);
        setAcademicDetails(academicResponse.data);

      } catch (error) {
        console.error('Error fetching details:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
          
          if (error.response.status === 404) {
            toast.error('No application details found. Please complete your application first.');
          } else {
            toast.error(error.response.data.message || 'Failed to load application details');
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          toast.error('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          toast.error('Error setting up request. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      console.log('Starting PDF generation process...');
      
      // Create a new PDF document
      console.log('Creating new PDF document...');
      const mergedPdf = await PDFDocument.create();

      // Generate the application form PDF
      console.log('Generating application form PDF...');
      try {
        const pdfBlob = await pdf(
          <Document>
            <ApplicationPDF 
              personalDetails={personalDetails} 
              academicDetails={academicDetails} 
              applicationNumber={applicationNumber}
            />
          </Document>
        ).toBlob();
        
        console.log('Application form PDF generated successfully');
        
        // Load the application form PDF
        console.log('Loading application form PDF...');
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const applicationFormDoc = await PDFDocument.load(arrayBuffer);
        console.log('Application form PDF loaded successfully');
        
        // Copy all pages from the application form
        const applicationPages = await mergedPdf.copyPages(applicationFormDoc, applicationFormDoc.getPageIndices());
        applicationPages.forEach(page => mergedPdf.addPage(page));
        console.log(`Added ${applicationPages.length} pages from application form`);

        // Merge all documents
        const documentsToMerge = [
          // Personal documents - only demand draft
          ...(personalDetails?.dd_url ? [{ url: personalDetails.dd_url, type: 'demand-draft', contentType: 'application/pdf' }] : []),
          
          // Qualification documents - directly map to array
          ...(academicDetails?.qualifications?.flatMap(qual => 
            qual.document_url ? [{
              url: qual.document_url,
              type: `qualification-${qual.standard}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Qualifying exam documents
          ...(academicDetails?.qualifying_exams?.flatMap(exam => 
            exam.document_url ? [{
              url: exam.document_url,
              type: `exam-${exam.exam_type}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Experience documents
          ...(academicDetails?.experience?.flatMap(exp => 
            exp.document_url ? [{
              url: exp.document_url,
              type: `experience-${exp.organisation}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Publication documents
          ...(academicDetails?.publications?.flatMap(pub => 
            pub.document_url ? [{
              url: pub.document_url,
              type: `publication-${pub.paper_title}`,
              contentType: 'application/pdf'
            }] : []
          ) || [])
        ];

        // Process each document sequentially
        for (const doc of documentsToMerge) {
          if (doc.url) {
            try {
              console.log(`Processing document for ${doc.type}...`);
              const docResponse = await fetch(doc.url);
              if (!docResponse.ok) throw new Error(`Failed to fetch document: ${docResponse.statusText}`);
              const docBytes = await docResponse.arrayBuffer();
              
              if (doc.contentType === 'application/pdf') {
                const docPdf = await PDFDocument.load(docBytes);
                const pages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
                console.log(`Added ${pages.length} pages from ${doc.type} document`);
              } else if (doc.contentType.startsWith('image/')) {
                const docPage = mergedPdf.addPage();
                let docImage;
                
                try {
                  if (doc.contentType === 'image/jpeg') {
                    docImage = await mergedPdf.embedJpg(docBytes);
                  } else if (doc.contentType === 'image/png') {
                    docImage = await mergedPdf.embedPng(docBytes);
                  } else {
                    throw new Error(`Unsupported image format: ${doc.contentType}`);
                  }
                  
                  const { width, height } = docImage.scale(1);
                  const pageWidth = docPage.getWidth();
                  const pageHeight = docPage.getHeight();
                  
                  // Calculate dimensions for photo and signature
                  let targetWidth, targetHeight;
                  if (doc.type === 'photo') {
                    // Photo dimensions: 2x2 inches (144x144 points)
                    targetWidth = 144;
                    targetHeight = 144;
                  } else if (doc.type === 'signature') {
                    // Signature dimensions: 3x1 inches (216x72 points)
                    targetWidth = 216;
                    targetHeight = 72;
                  } else {
                    // For other images, maintain aspect ratio
                    const scale = Math.min(pageWidth / width, pageHeight / height);
                    targetWidth = width * scale;
                    targetHeight = height * scale;
                  }
                  
                  // Center the image on the page
                  const x = (pageWidth - targetWidth) / 2;
                  const y = (pageHeight - targetHeight) / 2;
                  
                  docPage.drawImage(docImage, {
                    x,
                    y,
                    width: targetWidth,
                    height: targetHeight,
                  });
                  console.log(`Added image from ${doc.type} document`);
                } catch (imageError) {
                  console.error(`Error processing image for ${doc.type}:`, imageError);
                  // Add a text placeholder if image processing fails
                  docPage.drawText(`[${doc.type} image could not be processed]`, {
                    x: 50,
                    y: pageHeight / 2,
                    size: 12,
                    color: rgb(1, 0, 0),
                  });
                }
              }
            } catch (error) {
              console.error(`Error processing document for ${doc.type}:`, error);
              toast.error(`Failed to add ${doc.type} document to PDF`);
            }
          }
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const finalBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(finalBlob);
        setMergedPdfUrl(url);
        setShowPDF(true);
        toast.success('PDF generated successfully!');
      } catch (error) {
        console.error('Error in application form generation:', error);
        throw new Error(`Failed to generate application form: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in PDF generation process:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showPDF) {
    return (
      <div className="h-screen">
        {mergedPdfUrl ? (
          <iframe
            src={mergedPdfUrl}
            className="w-full h-full"
            title="Complete Application PDF"
          />
        ) : (
          <PDFViewer className="w-full h-full">
            <ApplicationPDF 
              personalDetails={personalDetails} 
              academicDetails={academicDetails} 
              applicationNumber={applicationNumber}
            />
          </PDFViewer>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Print Application</h1>
        <Button 
          onClick={handlePrint} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Printer className="h-4 w-4" />
          Generate Complete Application
        </Button>
      </div>

      {/* Important Note */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">Important:</span> Print the application form and send the hard copy of the Demand Draft (DD) via post.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Application Number */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">Application Number</h2>
          <p className="text-lg font-mono">{applicationNumber}</p>
        </div>

        {/* Personal Details */}
        {personalDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{personalDetails.first_name} {personalDetails.last_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Date of Birth</p>
                <p className="font-medium">{new Date(personalDetails.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium">{personalDetails.gender}</p>
              </div>
              <div>
                <p className="text-gray-600">Nationality</p>
                <p className="font-medium">{personalDetails.nationality}</p>
              </div>
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium">{personalDetails.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Religion</p>
                <p className="font-medium">{personalDetails.religion}</p>
              </div>
              <div>
                <p className="text-gray-600">Father's Name</p>
                <p className="font-medium">{personalDetails.father_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Mother's Name</p>
                <p className="font-medium">{personalDetails.mother_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Marital Status</p>
                <p className="font-medium">{personalDetails.marital_status}</p>
              </div>
              {personalDetails.marital_status !== 'Single' && (
                <div>
                  <p className="text-gray-600">Spouse Name</p>
                  <p className="font-medium">{personalDetails.spouse_name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{personalDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{personalDetails.phone}</p>
              </div>
              {personalDetails.alternate_phone && (
                <div>
                  <p className="text-gray-600">Alternate Phone</p>
                  <p className="font-medium">{personalDetails.alternate_phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Communication Address */}
        {personalDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Communication Address</h2>
            <div>
              <p className="font-medium">{personalDetails.communication_address.street}</p>
              {personalDetails.communication_address.line2 && (
                <p className="font-medium">{personalDetails.communication_address.line2}</p>
              )}
              {personalDetails.communication_address.line3 && (
                <p className="font-medium">{personalDetails.communication_address.line3}</p>
              )}
              <p className="font-medium">
                {personalDetails.communication_address.city}, {personalDetails.communication_address.state} - {personalDetails.communication_address.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Academic Details */}
        {academicDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Academic Details</h2>
            
            {/* Qualifications */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Qualifications</h3>
              {academicDetails.qualifications.map((qual, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{qual.standard} - {qual.degree_name}</p>
                  <p className="text-gray-600">{qual.university}</p>
                  <p className="text-gray-600">Year: {qual.year_of_completion}</p>
                  <p className="text-gray-600">Marks: {qual.marks_obtained} {qual.marks_type}</p>
                  {qual.branch && <p className="text-gray-600">Branch: {qual.branch}</p>}
                  <p className="text-gray-600">Program Duration: {qual.program_duration_months} months</p>
                </div>
              ))}
            </div>

            {/* Qualifying Exams */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Qualifying Exams</h3>
              {academicDetails.qualifying_exams.map((exam, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{exam.exam_type}</p>
                  <p className="text-gray-600">Registration No: {exam.registration_no}</p>
                  <p className="text-gray-600">Year: {exam.year_of_qualification}</p>
                  
                  {/* Exam-specific details */}
                  {exam.exam_type === 'NET' && (
                    <>
                      <p className="text-gray-600">NET Type: {exam.net_details?.type}</p>
                      <p className="text-gray-600">Subject: {exam.net_details?.subject}</p>
                      <p className="text-gray-600">Score: {exam.net_details?.score}</p>
                      <p className="text-gray-600">Rank: {exam.net_details?.rank}</p>
                    </>
                  )}
                  {/* Add other exam types as needed */}
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Experience</h3>
              {academicDetails.experience.map((exp, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{exp.type}</p>
                  <p className="text-gray-600">Organization: {exp.organisation}</p>
                  <p className="text-gray-600">Place: {exp.place}</p>
                  <p className="text-gray-600">Period: {new Date(exp.period_from).toLocaleDateString()} - {exp.period_to ? new Date(exp.period_to).toLocaleDateString() : 'Present'}</p>
                  <p className="text-gray-600">Designation: {exp.designation}</p>
                  <p className="text-gray-600">Monthly Compensation: {exp.monthly_compensation}</p>
                  <p className="text-gray-600">Nature of Work: {exp.nature_of_work}</p>
                </div>
              ))}
            </div>

            {/* Publications */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Publications</h3>
              {academicDetails.publications.map((pub, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{pub.type}</p>
                  <p className="text-gray-600">Title: {pub.paper_title}</p>
                  <p className="text-gray-600">Affiliation: {pub.affiliation}</p>
                  <p className="text-gray-600">Acceptance Year: {pub.acceptance_year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Preview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          
          {/* Academic Documents */}
          <div>
            <h3 className="text-lg font-medium mb-2">Academic Documents</h3>
            <div className="space-y-4">
              {/* Qualification Documents */}
              {academicDetails?.qualifications.map((qual, index) => (
                qual.document_url && (
                  <div key={`qual-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{qual.standard} - {qual.degree_name}</p>
                      <a 
                        href={ensureHttps(qual.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <iframe
                        src={ensureHttps(qual.document_url)}
                        className="w-full h-full"
                        title={`Document ${index + 1}`}
                      />
                    </div>
                  </div>
                )
              ))}

              {/* Experience Documents */}
              {academicDetails?.experience.map((exp, index) => (
                exp.document_url && (
                  <div key={`exp-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Experience at {exp.organisation}</p>
                      <a 
                        href={ensureHttps(exp.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <iframe
                        src={ensureHttps(exp.document_url)}
                        className="w-full h-full"
                        title={`Experience Document ${index + 1}`}
                      />
                    </div>
                  </div>
                )
              ))}

              {/* Publication Documents */}
              {academicDetails?.publications.map((pub, index) => (
                pub.document_url && (
                  <div key={`pub-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{pub.paper_title}</p>
                      <a 
                        href={ensureHttps(pub.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <iframe
                        src={ensureHttps(pub.document_url)}
                        className="w-full h-full"
                        title={`Publication Document ${index + 1}`}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Payment Documents */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Payment Documents</h3>
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Demand Draft</p>
                <div className="flex items-center gap-2">
                  {personalDetails?.dd_url ? (
                    <a 
                      href={ensureHttps(personalDetails.dd_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Document
                    </a>
                  ) : (
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleDDUpload}
                      disabled={isUploading}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              </div>
              {personalDetails?.dd_url && (
                <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                  <iframe
                    src={ensureHttps(personalDetails.dd_url)}
                    className="w-full h-full"
                    title="Demand Draft Document"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Printer, Loader2, Combine } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { PDFDocument } from 'pdf-lib';
import { pdf } from '@react-pdf/renderer';
import { Input } from './ui/input';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    width: '70%',
    fontSize: 12,
    color: '#000',
  },
  fullWidth: {
    width: '100%',
    fontSize: 12,
    marginBottom: 5,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'solid',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: 150,
    height: 150,
    objectFit: 'contain',
  },
  documentContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  documentImage: {
    width: 300,
    height: 400,
    objectFit: 'contain',
  },
  photo: {
    width: 144, // 2 inches at 72 DPI
    height: 144, // 2 inches at 72 DPI
    objectFit: 'cover',
  },
  signature: {
    width: 216, // 3 inches at 72 DPI
    height: 72, // 1 inch at 72 DPI
    objectFit: 'contain',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  personalDetails: {
    flex: 1,
    marginRight: 20,
  },
  photoSignatureContainer: {
    width: 200,
    alignItems: 'center',
  },
  photoContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
  },
});

// PDF Document Component
const ApplicationPDF = ({ personalDetails, academicDetails, applicationNumber }) => (
  <>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PhD Admission Application</Text>
        <Text style={styles.subtitle}>Application Number: {applicationNumber}</Text>
      </View>

      {/* Personal Details Section */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <View style={styles.personalDetails}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{personalDetails?.first_name} {personalDetails?.last_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{new Date(personalDetails?.dob).toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{personalDetails?.gender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nationality</Text>
              <Text style={styles.value}>{personalDetails?.nationality}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{personalDetails?.category}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Religion</Text>
              <Text style={styles.value}>{personalDetails?.religion}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Father's Name</Text>
              <Text style={styles.value}>{personalDetails?.father_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mother's Name</Text>
              <Text style={styles.value}>{personalDetails?.mother_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Marital Status</Text>
              <Text style={styles.value}>{personalDetails?.marital_status}</Text>
            </View>
            {personalDetails?.marital_status !== 'Single' && (
              <View style={styles.row}>
                <Text style={styles.label}>Spouse Name</Text>
                <Text style={styles.value}>{personalDetails?.spouse_name}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{personalDetails?.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{personalDetails?.phone}</Text>
            </View>
            {personalDetails?.alternate_phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Alternate Phone</Text>
                <Text style={styles.value}>{personalDetails.alternate_phone}</Text>
              </View>
            )}
          </View>
          
          {/* Photo and Signature */}
          <View style={styles.photoSignatureContainer}>
            {personalDetails?.photo && (
              <View style={styles.photoContainer}>
                <Image
                  src={personalDetails.photo}
                  style={styles.photo}
                  cache={false}
                />
              </View>
            )}
            {personalDetails?.signature && (
              <View style={styles.signatureContainer}>
                <Image
                  src={personalDetails.signature}
                  style={styles.signature}
                  cache={false}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication Address</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Street</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.street}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Line 2</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.line2}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Line 3</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.line3}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>City</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.city}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>State</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.state}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pincode</Text>
          <Text style={styles.value}>{personalDetails?.communication_address?.pincode}</Text>
        </View>
      </View>

      {/* Academic Details Section - Reformatted */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Qualifications</Text>
        {academicDetails?.qualifications.map((qual, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{qual.standard}</Text>
            <View style={styles.value}>
              <Text>{qual.degree_name}</Text>
              <Text>{qual.university}</Text>
              <Text>Year: {qual.year_of_completion}</Text>
              <Text>Marks: {qual.marks_obtained} {qual.marks_type}</Text>
              {qual.branch && <Text>Branch: {qual.branch}</Text>}
              <Text>Duration: {qual.program_duration_months} months</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Qualifying Exams Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Qualifying Examinations</Text>
        {academicDetails?.qualifying_exams.map((exam, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{exam.exam_type}</Text>
            <View style={styles.value}>
              <Text>Registration No: {exam.registration_no}</Text>
              <Text>Year: {exam.year_of_qualification}</Text>
              {exam.exam_type === 'NET' && (
                <>
                  <Text>Type: {exam.net_details?.type}</Text>
                  <Text>Subject: {exam.net_details?.subject}</Text>
                  <Text>Score: {exam.net_details?.score}</Text>
                  <Text>Rank: {exam.net_details?.rank}</Text>
                </>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {academicDetails?.experience.map((exp, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{exp.type}</Text>
            <View style={styles.value}>
              <Text>Organization: {exp.organisation}</Text>
              <Text>Place: {exp.place}</Text>
              <Text>Period: {new Date(exp.period_from).toLocaleDateString()} - {exp.period_to ? new Date(exp.period_to).toLocaleDateString() : 'Present'}</Text>
              <Text>Designation: {exp.designation}</Text>
              <Text>Monthly Compensation: {exp.monthly_compensation}</Text>
              <Text>Nature of Work: {exp.nature_of_work}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Publications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publications</Text>
        {academicDetails?.publications.map((pub, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{pub.type}</Text>
            <View style={styles.value}>
              <Text>Title: {pub.paper_title}</Text>
              <Text>Affiliation: {pub.affiliation}</Text>
              <Text>Year: {pub.acceptance_year}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Demand Draft</Text>
          <Text style={styles.value}>{personalDetails?.dd_url ? 'Uploaded' : 'Not Uploaded'}</Text>
        </View>
      </View>

      {/* Documents Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documents</Text>
      </View> */}
    </Page>
  </>
);

// Add this utility function at the top of the file
const convertToHttps = (url) => {
  if (url && url.startsWith('http:')) {
    return url.replace('http:', 'https:');
  }
  return url;
};

export default function PrintApplication() {
  const [personalDetails, setPersonalDetails] = useState(null);
  const [academicDetails, setAcademicDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [showPDF, setShowPDF] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching personal and academic details...');
        
        // Get user data first
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/current-user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('User data:', userResponse.data);
        setApplicationNumber(userResponse.data.user.usernameid);

        // Fetch personal details
        const personalResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/personal/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Personal details response:', personalResponse.data);
        setPersonalDetails(personalResponse.data);

        // Fetch academic details
        const academicResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/academic/get`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        console.log('Academic details response:', academicResponse.data);
        setAcademicDetails(academicResponse.data);

      } catch (error) {
        console.error('Error fetching details:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
          
          if (error.response.status === 404) {
            toast.error('No application details found. Please complete your application first.');
          } else {
            toast.error(error.response.data.message || 'Failed to load application details');
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          toast.error('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          toast.error('Error setting up request. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      console.log('Starting PDF generation process...');
      
      // Create a new PDF document
      console.log('Creating new PDF document...');
      const mergedPdf = await PDFDocument.create();

      // Generate the application form PDF
      console.log('Generating application form PDF...');
      try {
        const pdfBlob = await pdf(
          <Document>
            <ApplicationPDF 
              personalDetails={personalDetails} 
              academicDetails={academicDetails} 
              applicationNumber={applicationNumber}
            />
          </Document>
        ).toBlob();
        
        console.log('Application form PDF generated successfully');
        
        // Load the application form PDF
        console.log('Loading application form PDF...');
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const applicationFormDoc = await PDFDocument.load(arrayBuffer);
        console.log('Application form PDF loaded successfully');
        
        // Copy all pages from the application form
        const applicationPages = await mergedPdf.copyPages(applicationFormDoc, applicationFormDoc.getPageIndices());
        applicationPages.forEach(page => mergedPdf.addPage(page));
        console.log(`Added ${applicationPages.length} pages from application form`);

        // Merge all documents
        const documentsToMerge = [
          // Personal documents - only demand draft
          ...(personalDetails?.dd_url ? [{
            url: convertToHttps(personalDetails.dd_url),
            type: 'demand-draft',
            contentType: 'application/pdf'
          }] : []),
          
          // Qualification documents
          ...(academicDetails?.qualifications?.flatMap(qual => 
            qual.document_url ? [{
              url: convertToHttps(qual.document_url),
              type: `qualification-${qual.standard}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Qualifying exam documents
          ...(academicDetails?.qualifying_exams?.flatMap(exam => 
            exam.document_url ? [{
              url: convertToHttps(exam.document_url),
              type: `exam-${exam.exam_type}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Experience documents
          ...(academicDetails?.experience?.flatMap(exp => 
            exp.document_url ? [{
              url: convertToHttps(exp.document_url),
              type: `experience-${exp.organisation}`,
              contentType: 'application/pdf'
            }] : []
          ) || []),
          
          // Publication documents
          ...(academicDetails?.publications?.flatMap(pub => 
            pub.document_url ? [{
              url: convertToHttps(pub.document_url),
              type: `publication-${pub.paper_title}`,
              contentType: 'application/pdf'
            }] : []
          ) || [])
        ];

        // Process each document sequentially
        for (const doc of documentsToMerge) {
          if (doc.url) {
            try {
              console.log(`Processing document for ${doc.type}...`);
              const docResponse = await fetch(doc.url);
              if (!docResponse.ok) throw new Error(`Failed to fetch document: ${docResponse.statusText}`);
              const docBytes = await docResponse.arrayBuffer();
              
              if (doc.contentType === 'application/pdf') {
                const docPdf = await PDFDocument.load(docBytes);
                const pages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
                console.log(`Added ${pages.length} pages from ${doc.type} document`);
              } else if (doc.contentType.startsWith('image/')) {
                const docPage = mergedPdf.addPage();
                let docImage;
                
                try {
                  if (doc.contentType === 'image/jpeg') {
                    docImage = await mergedPdf.embedJpg(docBytes);
                  } else if (doc.contentType === 'image/png') {
                    docImage = await mergedPdf.embedPng(docBytes);
                  } else {
                    throw new Error(`Unsupported image format: ${doc.contentType}`);
                  }
                  
                  const { width, height } = docImage.scale(1);
                  const pageWidth = docPage.getWidth();
                  const pageHeight = docPage.getHeight();
                  
                  // Calculate dimensions for photo and signature
                  let targetWidth, targetHeight;
                  if (doc.type === 'photo') {
                    // Photo dimensions: 2x2 inches (144x144 points)
                    targetWidth = 144;
                    targetHeight = 144;
                  } else if (doc.type === 'signature') {
                    // Signature dimensions: 3x1 inches (216x72 points)
                    targetWidth = 216;
                    targetHeight = 72;
                  } else {
                    // For other images, maintain aspect ratio
                    const scale = Math.min(pageWidth / width, pageHeight / height);
                    targetWidth = width * scale;
                    targetHeight = height * scale;
                  }
                  
                  // Center the image on the page
                  const x = (pageWidth - targetWidth) / 2;
                  const y = (pageHeight - targetHeight) / 2;
                  
                  docPage.drawImage(docImage, {
                    x,
                    y,
                    width: targetWidth,
                    height: targetHeight,
                  });
                  console.log(`Added image from ${doc.type} document`);
                } catch (imageError) {
                  console.error(`Error processing image for ${doc.type}:`, imageError);
                  // Add a text placeholder if image processing fails
                  docPage.drawText(`[${doc.type} image could not be processed]`, {
                    x: 50,
                    y: pageHeight / 2,
                    size: 12,
                    color: rgb(1, 0, 0),
                  });
                }
              }
            } catch (error) {
              console.error(`Error processing document for ${doc.type}:`, error);
              toast.error(`Failed to add ${doc.type} document to PDF`);
            }
          }
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const finalBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(finalBlob);
        setMergedPdfUrl(url);
        setShowPDF(true);
        toast.success('PDF generated successfully!');
      } catch (error) {
        console.error('Error in application form generation:', error);
        throw new Error(`Failed to generate application form: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in PDF generation process:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showPDF) {
    return (
      <div className="h-screen">
        {mergedPdfUrl ? (
          <iframe
            src={mergedPdfUrl}
            className="w-full h-full"
            title="Complete Application PDF"
          />
        ) : (
          <PDFViewer className="w-full h-full">
            <ApplicationPDF 
              personalDetails={personalDetails} 
              academicDetails={academicDetails} 
              applicationNumber={applicationNumber}
            />
          </PDFViewer>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Print Application</h1>
        <Button 
          onClick={handlePrint} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Printer className="h-4 w-4" />
          Generate Complete Application
        </Button>
      </div>

      {/* Important Note */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">Important:</span> Print the application form and send the hard copy of the Demand Draft (DD) via post.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Application Number */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">Application Number</h2>
          <p className="text-lg font-mono">{applicationNumber}</p>
        </div>

        {/* Personal Details */}
        {personalDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{personalDetails.first_name} {personalDetails.last_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Date of Birth</p>
                <p className="font-medium">{new Date(personalDetails.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium">{personalDetails.gender}</p>
              </div>
              <div>
                <p className="text-gray-600">Nationality</p>
                <p className="font-medium">{personalDetails.nationality}</p>
              </div>
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium">{personalDetails.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Religion</p>
                <p className="font-medium">{personalDetails.religion}</p>
              </div>
              <div>
                <p className="text-gray-600">Father's Name</p>
                <p className="font-medium">{personalDetails.father_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Mother's Name</p>
                <p className="font-medium">{personalDetails.mother_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Marital Status</p>
                <p className="font-medium">{personalDetails.marital_status}</p>
              </div>
              {personalDetails.marital_status !== 'Single' && (
                <div>
                  <p className="text-gray-600">Spouse Name</p>
                  <p className="font-medium">{personalDetails.spouse_name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{personalDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{personalDetails.phone}</p>
              </div>
              {personalDetails.alternate_phone && (
                <div>
                  <p className="text-gray-600">Alternate Phone</p>
                  <p className="font-medium">{personalDetails.alternate_phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Communication Address */}
        {personalDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Communication Address</h2>
            <div>
              <p className="font-medium">{personalDetails.communication_address.street}</p>
              {personalDetails.communication_address.line2 && (
                <p className="font-medium">{personalDetails.communication_address.line2}</p>
              )}
              {personalDetails.communication_address.line3 && (
                <p className="font-medium">{personalDetails.communication_address.line3}</p>
              )}
              <p className="font-medium">
                {personalDetails.communication_address.city}, {personalDetails.communication_address.state} - {personalDetails.communication_address.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Academic Details */}
        {academicDetails && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Academic Details</h2>
            
            {/* Qualifications */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Qualifications</h3>
              {academicDetails.qualifications.map((qual, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{qual.standard} - {qual.degree_name}</p>
                  <p className="text-gray-600">{qual.university}</p>
                  <p className="text-gray-600">Year: {qual.year_of_completion}</p>
                  <p className="text-gray-600">Marks: {qual.marks_obtained} {qual.marks_type}</p>
                  {qual.branch && <p className="text-gray-600">Branch: {qual.branch}</p>}
                  <p className="text-gray-600">Program Duration: {qual.program_duration_months} months</p>
                </div>
              ))}
            </div>

            {/* Qualifying Exams */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Qualifying Exams</h3>
              {academicDetails.qualifying_exams.map((exam, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{exam.exam_type}</p>
                  <p className="text-gray-600">Registration No: {exam.registration_no}</p>
                  <p className="text-gray-600">Year: {exam.year_of_qualification}</p>
                  
                  {/* Exam-specific details */}
                  {exam.exam_type === 'NET' && (
                    <>
                      <p className="text-gray-600">NET Type: {exam.net_details?.type}</p>
                      <p className="text-gray-600">Subject: {exam.net_details?.subject}</p>
                      <p className="text-gray-600">Score: {exam.net_details?.score}</p>
                      <p className="text-gray-600">Rank: {exam.net_details?.rank}</p>
                    </>
                  )}
                  {/* Add other exam types as needed */}
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Experience</h3>
              {academicDetails.experience.map((exp, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{exp.type}</p>
                  <p className="text-gray-600">Organization: {exp.organisation}</p>
                  <p className="text-gray-600">Place: {exp.place}</p>
                  <p className="text-gray-600">Period: {new Date(exp.period_from).toLocaleDateString()} - {exp.period_to ? new Date(exp.period_to).toLocaleDateString() : 'Present'}</p>
                  <p className="text-gray-600">Designation: {exp.designation}</p>
                  <p className="text-gray-600">Monthly Compensation: {exp.monthly_compensation}</p>
                  <p className="text-gray-600">Nature of Work: {exp.nature_of_work}</p>
                </div>
              ))}
            </div>

            {/* Publications */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Publications</h3>
              {academicDetails.publications.map((pub, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{pub.type}</p>
                  <p className="text-gray-600">Title: {pub.paper_title}</p>
                  <p className="text-gray-600">Affiliation: {pub.affiliation}</p>
                  <p className="text-gray-600">Acceptance Year: {pub.acceptance_year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Preview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          
          {/* Academic Documents */}
          <div>
            <h3 className="text-lg font-medium mb-2">Academic Documents</h3>
            <div className="space-y-4">
              {/* Qualification Documents */}
              {academicDetails?.qualifications.map((qual, index) => (
                qual.document_url && (
                  <div key={`qual-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{qual.standard} - {qual.degree_name}</p>
                      <a 
                        href={qual.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <iframe
                        src={qual.document_url}
                        className="w-full h-full"
                        title={`Document ${index + 1}`}
                      />
                    </div>
                  </div>
                )
              ))}

              {/* Experience Documents */}
              {academicDetails?.experience.map((exp, index) => (
                exp.document_url && (
                  <div key={`exp-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Experience at {exp.organisation}</p>
                      <a 
                        href={exp.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <iframe
                        src={exp.document_url}
                        className="w-full h-full"
                        title={`Experience Document ${index + 1}`}
                      />
                    </div>
                  </div>
                )
              ))}

              {/* Publication Documents */}
              {academicDetails?.publications.map((pub, index) => (
                pub.document_url && (
                  <div key={`pub-${index}`} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{pub.paper_title}</p>
                      <a 
                        href={pub.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Open in new tab
                      </a>
                    </div>
                    <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                      <iframe
                        src={pub.document_url}
                        className="w-full h-full"
                        title={`Publication Document ${index + 1}`}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Payment Documents */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Payment Documents</h3>
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Demand Draft</p>
                <div className="flex items-center gap-2">
                  {personalDetails?.dd_url ? (
                    <a 
                      href={personalDetails.dd_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Document
                    </a>
                  ) : (
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleDDUpload}
                      disabled={isUploading}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              </div>
              {personalDetails?.dd_url && (
                <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
                  <iframe
                    src={personalDetails.dd_url}
                    className="w-full h-full"
                    title="Demand Draft Document"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
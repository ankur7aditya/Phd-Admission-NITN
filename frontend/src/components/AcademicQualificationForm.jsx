import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Button } from "./ui/button.jsx";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AcademicQualificationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    qualifications: [
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
    ],
    qualifying_exams: [
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Load saved form data from localStorage
    const savedData = localStorage.getItem('academicFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
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
    handleChange(e, index, 'qualifications');
  };

  const handleExamChange = (e, index) => {
    handleChange(e, index, 'qualifying_exams');
  };

  const handleExamDetailsChange = (e, index, examType) => {
    const { name, value } = e.target;
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

  const handleFileUpload = async (e, qualificationIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/academic/upload-document',
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
        qualifications: prev.qualifications.map((qual, i) => 
          i === qualificationIndex ? { ...qual, document_url: response.data.url } : qual
        )
      }));

      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        throw new Error('User not found');
      }

      const response = await axios.post(
        'http://localhost:5000/api/academic/create',
        {
          ...formData,
          userid: user._id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      toast.success('Academic details submitted successfully');
      localStorage.removeItem('academicFormData');
      // Navigate to print application page
      navigate('/print-application');
    } catch (error) {
      toast.error('Failed to submit academic details');
      console.error('Error submitting form:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Academic Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Qualifications */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Qualifications</h2>
            <Button type="button" onClick={addQualification} variant="outline">
              Add Qualification
            </Button>
          </div>

          {formData.qualifications.map((qualification, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`qualification-${index}-standard`}>Standard</Label>
                  <Select
                    value={qualification.standard}
                    onValueChange={(value) => handleQualificationChange(
                      { target: { name: 'standard', value } },
                      index
                    )}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor={`qualification-${index}-degree_name`}>Degree Name</Label>
                  <Input
                    id={`qualification-${index}-degree_name`}
                    name="degree_name"
                    value={qualification.degree_name}
                    onChange={(e) => handleQualificationChange(e, index)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`qualification-${index}-university`}>University/Board</Label>
                  <Input
                    id={`qualification-${index}-university`}
                    name="university"
                    value={qualification.university}
                    onChange={(e) => handleQualificationChange(e, index)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`qualification-${index}-year_of_completion`}>Year of Completion</Label>
                  <Input
                    id={`qualification-${index}-year_of_completion`}
                    name="year_of_completion"
                    type="number"
                    value={qualification.year_of_completion}
                    onChange={(e) => handleQualificationChange(e, index)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`qualification-${index}-marks_type`}>Marks Type</Label>
                  <Select
                    value={qualification.marks_type}
                    onValueChange={(value) => handleQualificationChange(
                      { target: { name: 'marks_type', value } },
                      index
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marks type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                      <SelectItem value="CGPA">CGPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`qualification-${index}-marks_obtained`}>Marks Obtained</Label>
                  <Input
                    id={`qualification-${index}-marks_obtained`}
                    name="marks_obtained"
                    type="number"
                    value={qualification.marks_obtained}
                    onChange={(e) => handleQualificationChange(e, index)}
                    required
                  />
                </div>

                {qualification.marks_type === "CGPA" && (
                  <div>
                    <Label htmlFor={`qualification-${index}-max_cgpa`}>Maximum CGPA</Label>
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
                  <Label htmlFor={`qualification-${index}-branch`}>Branch/Specialization</Label>
                  <Input
                    id={`qualification-${index}-branch`}
                    name="branch"
                    value={qualification.branch}
                    onChange={(e) => handleQualificationChange(e, index)}
                  />
                </div>

                <div>
                  <Label htmlFor={`qualification-${index}-program_duration_months`}>Program Duration (months)</Label>
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
                  <Label>Document Upload</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, index)}
                    disabled={isUploading}
                  />
                  {qualification.document_url && (
                    <div className="mt-2">
                      <a
                        href={qualification.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Document
                      </a>
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
            <h2 className="text-xl font-semibold">Qualifying Exams</h2>
            <Button type="button" onClick={addQualifyingExam} variant="outline">
              Add Exam
            </Button>
          </div>

          {formData.qualifying_exams.map((exam, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`exam-${index}-type`}>Exam Type</Label>
                  <Select
                    value={exam.exam_type}
                    onValueChange={(value) => handleExamChange(
                      { target: { name: 'exam_type', value } },
                      index
                    )}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor={`exam-${index}-registration_no`}>Registration Number</Label>
                  <Input
                    id={`exam-${index}-registration_no`}
                    name="registration_no"
                    value={exam.registration_no}
                    onChange={(e) => handleExamChange(e, index)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`exam-${index}-year_of_qualification`}>Year of Qualification</Label>
                  <Input
                    id={`exam-${index}-year_of_qualification`}
                    name="year_of_qualification"
                    type="number"
                    value={exam.year_of_qualification}
                    onChange={(e) => handleExamChange(e, index)}
                    required
                  />
                </div>

                {/* CAT Details */}
                {exam.exam_type === "CAT" && (
                  <>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-total_score`}>Total Score</Label>
                      <Input
                        id={`exam-${index}-cat-total_score`}
                        name="total_score"
                        type="number"
                        value={exam.cat_details.total_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-total_percentile`}>Total Percentile</Label>
                      <Input
                        id={`exam-${index}-cat-total_percentile`}
                        name="total_percentile"
                        type="number"
                        value={exam.cat_details.total_percentile}
                        onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-quant_score`}>Quantitative Score</Label>
                      <Input
                        id={`exam-${index}-cat-quant_score`}
                        name="quant_score"
                        type="number"
                        value={exam.cat_details.quant_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-quant_percentile`}>Quantitative Percentile</Label>
                      <Input
                        id={`exam-${index}-cat-quant_percentile`}
                        name="quant_percentile"
                        type="number"
                        value={exam.cat_details.quant_percentile}
                        onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-di_lr_score`}>DI/LR Score</Label>
                      <Input
                        id={`exam-${index}-cat-di_lr_score`}
                        name="di_lr_score"
                        type="number"
                        value={exam.cat_details.di_lr_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-di_lr_percentile`}>DI/LR Percentile</Label>
                      <Input
                        id={`exam-${index}-cat-di_lr_percentile`}
                        name="di_lr_percentile"
                        type="number"
                        value={exam.cat_details.di_lr_percentile}
                        onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-verbal_score`}>Verbal Score</Label>
                      <Input
                        id={`exam-${index}-cat-verbal_score`}
                        name="verbal_score"
                        type="number"
                        value={exam.cat_details.verbal_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'cat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-cat-verbal_percentile`}>Verbal Percentile</Label>
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
                      <Label htmlFor={`exam-${index}-gate-discipline`}>Discipline</Label>
                      <Input
                        id={`exam-${index}-gate-discipline`}
                        name="discipline"
                        value={exam.gate_details.discipline}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gate-gate_score`}>GATE Score</Label>
                      <Input
                        id={`exam-${index}-gate-gate_score`}
                        name="gate_score"
                        type="number"
                        value={exam.gate_details.gate_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gate-gate_rank`}>GATE Rank</Label>
                      <Input
                        id={`exam-${index}-gate-gate_rank`}
                        name="gate_rank"
                        type="number"
                        value={exam.gate_details.gate_rank}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gate-marks_out_of_100`}>Marks out of 100</Label>
                      <Input
                        id={`exam-${index}-gate-marks_out_of_100`}
                        name="marks_out_of_100"
                        type="number"
                        value={exam.gate_details.marks_out_of_100}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gate-qualifying_marks`}>Qualifying Marks</Label>
                      <Input
                        id={`exam-${index}-gate-qualifying_marks`}
                        name="qualifying_marks"
                        type="number"
                        value={exam.gate_details.qualifying_marks}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gate_details')}
                      />
                    </div>
                  </>
                )}

                {/* GMAT Details */}
                {exam.exam_type === "GMAT" && (
                  <>
                    <div>
                      <Label htmlFor={`exam-${index}-gmat-total_score`}>Total Score</Label>
                      <Input
                        id={`exam-${index}-gmat-total_score`}
                        name="total_score"
                        type="number"
                        value={exam.gmat_details.total_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gmat-quant_score`}>Quantitative Score</Label>
                      <Input
                        id={`exam-${index}-gmat-quant_score`}
                        name="quant_score"
                        type="number"
                        value={exam.gmat_details.quant_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gmat-verbal_score`}>Verbal Score</Label>
                      <Input
                        id={`exam-${index}-gmat-verbal_score`}
                        name="verbal_score"
                        type="number"
                        value={exam.gmat_details.verbal_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gmat-awa_score`}>AWA Score</Label>
                      <Input
                        id={`exam-${index}-gmat-awa_score`}
                        name="awa_score"
                        type="number"
                        value={exam.gmat_details.awa_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-gmat-ir_score`}>IR Score</Label>
                      <Input
                        id={`exam-${index}-gmat-ir_score`}
                        name="ir_score"
                        type="number"
                        value={exam.gmat_details.ir_score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'gmat_details')}
                      />
                    </div>
                  </>
                )}

                {/* NET Details */}
                {exam.exam_type === "NET" && (
                  <>
                    <div>
                      <Label htmlFor={`exam-${index}-net-subject`}>Subject</Label>
                      <Input
                        id={`exam-${index}-net-subject`}
                        name="subject"
                        value={exam.net_details.subject}
                        onChange={(e) => handleExamDetailsChange(e, index, 'net_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-net-score`}>Score</Label>
                      <Input
                        id={`exam-${index}-net-score`}
                        name="score"
                        type="number"
                        value={exam.net_details.score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'net_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-net-rank`}>Rank</Label>
                      <Input
                        id={`exam-${index}-net-rank`}
                        name="rank"
                        type="number"
                        value={exam.net_details.rank}
                        onChange={(e) => handleExamDetailsChange(e, index, 'net_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-net-qualifying_marks`}>Qualifying Marks</Label>
                      <Input
                        id={`exam-${index}-net-qualifying_marks`}
                        name="qualifying_marks"
                        type="number"
                        value={exam.net_details.qualifying_marks}
                        onChange={(e) => handleExamDetailsChange(e, index, 'net_details')}
                      />
                    </div>
                  </>
                )}

                {/* Other Exam Details */}
                {exam.exam_type === "Others" && (
                  <>
                    <div>
                      <Label htmlFor={`exam-${index}-other-exam_name`}>Exam Name</Label>
                      <Input
                        id={`exam-${index}-other-exam_name`}
                        name="exam_name"
                        value={exam.other_details.exam_name}
                        onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-other-score`}>Score</Label>
                      <Input
                        id={`exam-${index}-other-score`}
                        name="score"
                        type="number"
                        value={exam.other_details.score}
                        onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-other-rank`}>Rank</Label>
                      <Input
                        id={`exam-${index}-other-rank`}
                        name="rank"
                        type="number"
                        value={exam.other_details.rank}
                        onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`exam-${index}-other-qualifying_marks`}>Qualifying Marks</Label>
                      <Input
                        id={`exam-${index}-other-qualifying_marks`}
                        name="qualifying_marks"
                        type="number"
                        value={exam.other_details.qualifying_marks}
                        onChange={(e) => handleExamDetailsChange(e, index, 'other_details')}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
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
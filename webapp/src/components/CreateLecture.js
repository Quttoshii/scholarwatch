import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { pdfjs } from "react-pdf";
import axios from "axios";
import { toast } from "react-toastify";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const CreateLecture = ({ userID }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfData, setPdfData] = useState(null);
    const [lectureName, setLectureName] = useState("");
    const [lectures, setLectures] = useState([]);
    const [fetchTrigger, setFetchTrigger] = useState(0);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                const response = await axios.post(
                    "http://localhost/scholarwatch/fetchLecture.php",
                    { userID },
                    { headers: { "Content-Type": "application/json" } }
                );

                if (response.data.success) {
                    setLectures(response.data.data);
                } else {
                    console.error("Error fetching lectures:", response.data.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        const fetchCourses = async () => {
            try {
                const response = await axios.get(`http://localhost/scholarwatch/getTeacherCourses.php?teacherId=${userID}`);
                if (response.data.success) {
                    setCourses(response.data.courses);
                } else {
                    console.error("Error fetching courses:", response.data.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchLectures();
        fetchCourses();
    }, [userID, fetchTrigger]);

    const onFileLoad = (event) => {
        const file = event.target.files[0];

        if (!file || file.type !== "application/pdf") {
            toast.error("Please upload a valid PDF file.");
            return;
        }

        setSelectedFile(file);
        setPdfData(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.onload = () => setPdfData(reader.result);
        reader.readAsDataURL(file);
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleUpload = async () => {
        if (!selectedFile || !numPages || !lectureName.trim() || !selectedCourse) {
            toast.error("Please select a valid PDF file, provide a lecture name, and select a course.");
            return;
        }

        try {
            const sanitizedFileName = lectureName.replace(/[^a-zA-Z0-9-_]/g, "_") + ".pdf";

            const formData = new FormData();
            formData.append("lecture_file", selectedFile, sanitizedFileName);
            formData.append("num_pages", numPages);
            formData.append("courseID", selectedCourse);

            const response = await axios.post(
                "http://localhost/scholarwatch/insertLecture.php",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success) {
                toast.success("Lecture uploaded successfully!");
                setLectureName("");
                setSelectedFile(null);
                setPdfData(null);
                setNumPages(null);
                setPageNumber(1);
                setSelectedCourse("");
                setFetchTrigger(prev => prev + 1);
            } else {
                toast.error(`Error uploading lecture: ${response.data.message || "Unknown error"}`);
            }
        } catch (error) {
            toast.error(`Error uploading lecture: ${error.response?.data?.message || error.message || "Unknown error"}`);
        }
    };

    return (
        <div className="teacher-lectures-page" style={{ background: '#FFF5EE', borderRadius: '18px', padding: '32px', maxWidth: '900px', margin: '32px auto', boxShadow: '0 4px 24px rgba(246, 166, 35, 0.10)' }}>
            <h2 style={{ color: '#2C1810', fontWeight: 800, fontSize: '2rem', marginBottom: '24px', letterSpacing: '1px' }}>Lectures</h2>
            {lectures.length > 0 ? (
                <div className="lectures-table-container" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '0', marginBottom: '32px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none', tableLayout: 'fixed' }}>
                    <thead>
                            <tr style={{ background: '#f6a523', color: '#fff', fontWeight: 700, borderRadius: '8px 8px 0 0' }}>
                                <th style={{ padding: '14px 0', border: 'none', borderRight: '1px solid #f5c46a', borderRadius: '8px 0 0 8px' }}>Lecture Name</th>
                                <th style={{ padding: '14px 0', border: 'none', borderRight: '1px solid #f5c46a' }}>Number of Pages</th>
                                <th style={{ padding: '14px 0', border: 'none', borderRadius: '0 8px 8px 0' }}>Uploaded At</th>
                        </tr>
                    </thead>
                    <tbody>
                            {lectures.map((lecture, idx) => (
                                <tr key={lecture.lectureID} style={{ background: idx % 2 === 0 ? '#fffbe9' : '#fff', color: '#2C1810' }}>
                                    <td style={{ padding: '12px 14px', border: 'none' }}>
                                        <a href={`http://localhost/scholarwatch${lecture.directoryPath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2C1810', fontWeight: 700, textDecoration: 'none', fontSize: '1.08rem' }}
                                            onMouseOver={e => e.currentTarget.style.color = '#f6a523'}
                                            onMouseOut={e => e.currentTarget.style.color = '#2C1810'}
                                        >
                                        {lecture.lectureName}
                                    </a>
                                    </td>
                                    <td style={{ padding: '12px 14px', border: 'none' }}>{lecture.slideCount}</td>
                                    <td style={{ padding: '12px 14px', border: 'none' }}>{new Date(lecture.StartTimestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <p style={{ color: '#666', textAlign: 'center', fontSize: '1.1rem', marginBottom: '32px' }}>No lectures uploaded yet.</p>
            )}

            <hr style={{ border: 'none', borderTop: '2px solid #ffe5b4', margin: '32px 0' }} />

            <h2 style={{ color: '#2C1810', fontWeight: 800, fontSize: '1.5rem', marginBottom: '18px' }}>Upload New Lecture</h2>
            <div className="upload-section" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '24px', marginBottom: '16px' }}>
                <label htmlFor="lecture-name" style={{ fontWeight: 700, color: '#2C1810', fontSize: '1.12rem', marginBottom: '8px', display: 'inline-block' }}>Lecture Name: </label>
            <input
                type="text"
                id="lecture-name"
                value={lectureName}
                onChange={(e) => setLectureName(e.target.value)}
                placeholder="Lecture name (used as filename)"
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '2px solid #ffe5b4', margin: '0 0 18px 12px', fontSize: '1rem', outline: 'none', width: '60%', marginBottom: '18px' }}
            />
                <br />
                <label htmlFor="course-select" style={{ fontWeight: 700, color: '#2C1810', fontSize: '1.12rem', marginBottom: '8px', display: 'inline-block' }}>Select Course: </label>
                <select
                    id="course-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '2px solid #ffe5b4', margin: '0 0 18px 12px', fontSize: '1rem', outline: 'none', width: '60%', marginBottom: '18px' }}
                >
                    <option value="">-- Select a course --</option>
                    {courses.map((course) => (
                        <option key={course.CourseID} value={course.CourseID}>
                            {course.CourseName}
                        </option>
                    ))}
                </select>
                <br />
                <label htmlFor="file-upload" className="smaller-button take-quiz-btn" style={{ background: '#f6a523', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', padding: '10px 24px', cursor: 'pointer', marginRight: '18px' }}>
                Choose File
                <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={onFileLoad}
                    style={{ display: "none" }}
                />
            </label>

            {pdfData && (
                    <div style={{ margin: '18px 0' }}>
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} />
                </Document>
                    </div>
            )}

            {pdfData && numPages && (
                    <div style={{ margin: '12px 0' }}>
                        <p style={{ color: '#2C1810', fontWeight: 600 }}>Page {pageNumber} of {numPages}</p>
                        <button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)} style={{ background: '#f6a523', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', padding: '8px 18px', marginRight: '8px', cursor: 'pointer' }}>Previous</button>
                        <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(pageNumber + 1)} style={{ background: '#f6a523', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', padding: '8px 18px', marginRight: '8px', cursor: 'pointer' }}>Next</button>
                    <br />
                        <button onClick={handleUpload} className="take-quiz-btn" style={{ background: '#f6a523', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', padding: '10px 24px', marginTop: '12px', cursor: 'pointer' }}>Upload Lecture</button>
                </div>
            )}
            </div>
        </div>
    );
};

export default CreateLecture;

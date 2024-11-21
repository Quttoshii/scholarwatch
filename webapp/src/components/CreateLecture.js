import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { pdfjs } from "react-pdf";
import axios from "axios";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const CreateLecture = ({ userID }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfData, setPdfData] = useState(null);
    const [lectureName, setLectureName] = useState(""); // State for lecture name
    const [lectures, setLectures] = useState([]); // State to store fetched lectures

    // Fetch lecture data from the backend
    useEffect(() => {
        const fetchLectures = async () => {

            try {
                const response = await axios.post(
                    "http://localhost/scholarwatch/fetchLecture.php",
                    { userID }, // Send the userID in the request body
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
    
                if (response.data.success) {
                    setLectures(response.data.data); // Update lectures state with fetched data
                } else {
                    console.error("Error fetching lectures:", response.data.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };
    
        fetchLectures();
    }, [userID]); // Dependency on userID
    

    const onFileLoad = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            setPdfData(e.target.result);
        };

        if (file && file.type === "application/pdf") {
            reader.readAsDataURL(file);
            setSelectedFile(file);
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleUpload = async () => {
    if (!selectedFile || !numPages || !lectureName.trim()) {
        alert("Please select a valid PDF file, ensure it is loaded, and provide a lecture name.");
        return;
    }

    try {
        // Step 1: Upload the PDF file
        const formData = new FormData();
        formData.append("lecture_file", selectedFile);

        const uploadResponse = await axios.post("http://localhost/scholarwatch/uploadPDF.php", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (!uploadResponse.data.success) {
            alert(`Error uploading PDF: ${uploadResponse.data.message}`);
            return;
        }

        // Step 2: Send metadata
        const metadata = {
            lecture_name: lectureName.trim(),
            num_pages: numPages,
            file_path: uploadResponse.data.file_path, // File path returned by the server
        };

        const metadataResponse = await axios.post(
            "http://localhost/scholarwatch/insertMetadata.php",
            metadata,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (metadataResponse.data.success) {
            alert("Lecture uploaded successfully!");
            setLectureName(""); // Clear lecture name input
            setSelectedFile(null); // Clear selected file
            setPdfData(null); // Clear PDF viewer
            setNumPages(null); // Reset number of pages
            setPageNumber(1); // Reset page number
        } else {
            alert(`Error uploading metadata: ${metadataResponse.data.message}`);
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred while uploading the lecture.");
    }
};


    return (
        <div>
            <h2>Lectures</h2>
            {lectures.length > 0 ? (
                <table border="1" style={{ width: "100%", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th>Lecture Name</th>
                            <th>File Path</th>
                            <th>Number of Pages</th>
                            <th>Uploaded At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lectures.length > 0 ? (
                            lectures.map((lecture) => (
                                <tr key={lecture.lectureID}>
                                    <td>{lecture.lectureName}</td>
                                    <td>
                                        <a href={`http://localhost/scholarwatch/${lecture.DirectoryPath}`} target="_blank" rel="noopener noreferrer">
                                            {lecture.DirectoryPath}
                                        </a>
                                    </td>
                                    <td>{lecture.slideCount}</td>
                                    <td>{new Date(lecture.StartTimestamp).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No lectures available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            ) : (
                <p>No lectures uploaded yet.</p>
            )}

            <hr />

            <h2>Upload New Lecture</h2>
            <label htmlFor="lecture-name">Lecture Name: </label>
            <input
                type="text"
                id="lecture-name"
                value={lectureName}
                onChange={(e) => setLectureName(e.target.value)}
                placeholder="lecture name"
            />
            <br></br><br></br>
            <label htmlFor="file-upload" className="smaller-button take-quiz-btn">
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
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} />
                </Document>
            )}

            {pdfData && numPages && (
                <div>
                    <p>
                        Page {pageNumber} of {numPages}
                    </p>
                    <button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>
                        Previous
                    </button>
                    <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(pageNumber + 1)}>
                        Next
                    </button>
                    <br />
                    <button onClick={handleUpload} className="take-quiz-btn">
                        Upload Lecture
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreateLecture;

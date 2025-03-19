import React, { useState } from "react";
import { Document, Page } from "react-pdf"; // Import Document and Page for PDF viewing
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Import styles for PDF annotations
import 'react-pdf/dist/esm/Page/TextLayer.css'; // Import styles for PDF text layer
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfData, setPdfData] = useState(null);

    const onFileLoad = event => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            setPdfData(e.target.result); // Use result as the pdf data
        };

        if (file && file.type === 'application/pdf') {
            reader.readAsDataURL(file); // Only read the file if it's a PDF
            setSelectedFile(file);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages); // Set the number of pages
    };

    return (
        <div>
            {/* <input type="file" accept=".pdf" onChange={onFileLoad} /> */}

            <label htmlFor="file-upload" className="smaller-button take-quiz-btn">
                Choose File
                <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={onFileLoad}
                    style={{ display: 'none' }} // Hide the default file input
                />
            </label>

            {pdfData && (
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} onError={(error) => console.error('PDF loading error:', error)}>
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
                </div>
            )}
        </div>
    );
}

export default PDFViewer;

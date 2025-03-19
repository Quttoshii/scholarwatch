import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFViewer = ({ selectedLecture, setTakeQuiz, onLectureFinish, onPageGazeData }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [focusStartTime, setFocusStartTime] = useState(Date.now());
// console.log("Selected Lecture:", selectedLecture.split('/')[2]);
  const lecturePath = `http://localhost/scholarwatch/getPDF.php?file=${encodeURIComponent(selectedLecture.split('/')[2])}`;
  // console.log("Full PDF Path:", lecturePath);

  useEffect(() => {
    if (numPages && pageNumber === numPages) {
      setTakeQuiz(true);
      onLectureFinish();
    }
  }, [pageNumber, numPages, setTakeQuiz, onLectureFinish]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handlePageChange = (newPage) => {
    const now = Date.now();
    const focusTime = now - focusStartTime;
    const unfocusTime = Math.max(0, focusTime * 0.1);

    onPageGazeData(focusTime, unfocusTime, pageNumber);

    setPageNumber(newPage);
    setFocusStartTime(Date.now());
  };

  return (
    <div>
      <h3>Lecture Material</h3>

      {selectedLecture ? (
        <Document file={lecturePath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(error) => console.error('PDF loading error:', error)}>
          <Page pageNumber={pageNumber} />
        </Document>
      ) : (
        <p style={{ color: "gray" }}>No lecture selected.</p>
      )}

      {numPages && (
        <div>
          <p>Page {pageNumber} of {numPages}</p>
          <button disabled={pageNumber <= 1} onClick={() => handlePageChange(pageNumber - 1)}>Previous</button>
          <button disabled={pageNumber >= numPages} onClick={() => handlePageChange(pageNumber + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;

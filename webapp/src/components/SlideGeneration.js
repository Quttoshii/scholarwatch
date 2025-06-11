import React, { useState, useRef } from 'react';
import { toast } from "react-toastify";

function SlideGeneration() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);
  const fileInputRef = useRef(null);

 
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setDownloadLink(null); 
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  };


  const handleGenerateSlides = async () => {
    if (!pdfFile) {
      toast.error('Please select a PDF file first.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const response = await fetch('http://localhost:8002/generate_presentation/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error generating presentation: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

     
      setDownloadLink(url);
      setIsLoading(false);

    } catch (error) {

      console.error('Error during file upload or slide generation:', error);

      setIsLoading(false);

      toast.error('An error occurred while generating the slides. Please try again later.');
      
    }
  };

  return (
    <div id="slide-generation-container" className="slideGeneration">
      <h2>Generate PowerPoint from PDF</h2>

      <div className="file-upload-container">
        <label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          {/* <span className="file-name">{pdfFile ? pdfFile.name : 'No file chosen'}</span> */}
        </label>

        {pdfFile && (
          <button
            onClick={handleGenerateSlides}
            disabled={isLoading}
            className="generate-button"
          >
            {isLoading ? 'Generating...' : 'Generate Slides'}
            
          </button>
        )}

        {isLoading && (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Generating Slides...</p>
          </div>
        )}

        {downloadLink && (
          <div className="download-container">
            <a href={downloadLink} download="generated_presentation.pptx">
              <button className="download-button">Download PowerPoint</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default SlideGeneration;
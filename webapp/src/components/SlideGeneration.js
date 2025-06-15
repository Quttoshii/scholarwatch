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
    <div id="slide-generation-container" className="slideGeneration" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(246, 166, 35, 0.10)', padding: '32px', maxWidth: '600px', margin: '32px auto' }}>
      <h2 style={{ color: '#2C1810', fontWeight: 800, fontSize: '2rem', marginBottom: '24px', letterSpacing: '1px' }}>Generate PowerPoint from PDF</h2>
      <div className="file-upload-container" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ color: '#2C1810', fontWeight: 700, fontSize: '1.08rem', marginBottom: '12px', display: 'block', textAlign: 'center' }}>Select PDF File:</label>
        <button
          type="button"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{ background: '#f6a523', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', padding: '12px 24px', cursor: 'pointer', marginBottom: '12px', transition: 'background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.15s', textAlign: 'center' }}
          onMouseOver={e => e.currentTarget.style.background = '#d48f20'}
          onMouseOut={e => e.currentTarget.style.background = '#f6a523'}
          aria-label="Choose PDF file"
        >
          Choose File
        </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          style={{ display: 'none' }}
          />
        {pdfFile && (
          <span style={{ color: '#2C1810', fontWeight: 600, fontSize: '1rem', display: 'block', marginBottom: '12px', textAlign: 'center' }}>{pdfFile.name}</span>
        )}
        {pdfFile && (
          <button
            onClick={handleGenerateSlides}
            disabled={isLoading}
            className="generate-button"
            style={{ background: '#f6a523', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', padding: '12px 24px', marginTop: '8px', cursor: 'pointer', transition: 'background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.15s', textAlign: 'center' }}
            onMouseOver={e => e.currentTarget.style.background = '#d48f20'}
            onMouseOut={e => e.currentTarget.style.background = '#f6a523'}
          >
            {isLoading ? 'Generating...' : 'Generate Slides'}
          </button>
        )}
        {isLoading && (
          <div className="loader-container" style={{ marginTop: '18px', textAlign: 'center' }}>
            <div className="loader"></div>
            <p style={{ color: '#2C1810', fontWeight: 600 }}>Generating Slides...</p>
          </div>
        )}
        {downloadLink && (
          <div className="download-container" style={{ marginTop: '18px', textAlign: 'center' }}>
            <a href={downloadLink} download="generated_presentation.pptx" style={{ textDecoration: 'none' }}>
              <button className="download-button" style={{ background: '#f6a523', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.05rem', padding: '12px 24px', cursor: 'pointer', transition: 'background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.15s', textAlign: 'center' }}
                onMouseOver={e => e.currentTarget.style.background = '#d48f20'}
                onMouseOut={e => e.currentTarget.style.background = '#f6a523'}
              >
                Download PowerPoint
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default SlideGeneration;
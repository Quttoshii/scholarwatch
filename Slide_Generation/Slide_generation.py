import fitz  # PyMuPDF for PDF extraction
from transformers import pipeline  # For summarization
from pptx import Presentation  # For creating PowerPoint
from pptx.util import Inches  # Util to adjust layout
import re  # Regex for text cleaning

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    full_text = ""
    for page in document:
        full_text += page.get_text('text')
    document.close()
    return full_text

# Function to summarize text
def summarize_text(text):
    # Initialize the Hugging Face summarization pipeline
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    # Split text into chunks if too large for the model
    paragraphs = re.split(r'\n{2,}', text)
    summary = ""
    for paragraph in paragraphs:
        if len(paragraph.strip()) > 40:  # Filter out too short paragraphs which probably don't contain much information
            try:
                part_summary = summarizer(paragraph, max_length=130, min_length=30, do_sample=False)
                summary += part_summary[0]['summary_text']
            except Exception as e:
                print(f"Error summarizing text: {e}")
    return summary

# Function to create PowerPoint presentation
def create_presentation(summary):
    prs = Presentation()
    slide_layout = prs.slide_layouts[1]  # Title and Content layout

    # Split summary into topic and bullets
    lines = summary.split('. ')
    title_slide = prs.slides.add_slide(slide_layout)
    title_slide.shapes.title.text = lines[0]  # First sentence as the title
    content_holder = title_slide.shapes.placeholders[1]
    content_holder.text = "Key Points:"

    for line in lines[1:]:
        if line.strip():  # Ensure the line has content
            slide = prs.slides.add_slide(slide_layout)
            slide.shapes.title.text = ""
            content = slide.shapes.placeholders[1]
            content.text = line
            content.text_frame.paragraphs[0].font.size = Inches(0.5)  # Adjust font size if needed

    return prs

# Main function to handle the workflow
def main(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    summary = summarize_text(text)
    prs = create_presentation(summary)
    pptx_path = pdf_path.replace('.pdf', '.pptx')
    prs.save(pptx_path)
    print(f"Presentation created successfully! Check the file {pptx_path}.")

# Example usage
pdf_path = 'Marketing.pdf'  # Update this path with your actual PDF file path
main(pdf_path)
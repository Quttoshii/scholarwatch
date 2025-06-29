from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from langchain.document_loaders import PyPDFLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import FastEmbedEmbeddings
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import re
from typing import List, Dict, Any, Optional

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
GAK = ""

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class MCQRequest(BaseModel):
    pdf_location: str
    page_numbers: List[int]
    num_questions: int = 5
    api_key: Optional[str] = None

class MCQResponse(BaseModel):
    questions: List[Dict[str, Any]]

@app.get("/")
async def root():
    return {"message": "MCQ Generator API is running. Use /generate-mcqs endpoint to generate questions."}

@app.post("/generate-mcqs", response_model=MCQResponse)
async def generate_mcqs(request: MCQRequest):
    try:
        print("Request received:", request)
        
        def load_env_file(filepath=".env"):
            with open(filepath) as f:
                for line in f:
                    if line.strip() and not line.startswith("#"):
                        key, value = line.strip().split("=", 1)
                        os.environ[key] = value

        load_env_file()

        # Load API Key
        api_key = request.api_key or os.environ.get("GOOGLE_API_KEY", GAK)
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-lite')

        # --- Path fix: prepend lectures dir if not absolute ---
        LECTURES_DIR = "/Applications/XAMPP/xamppfiles/htdocs/scholarwatch/lectures"
        if not os.path.isabs(request.pdf_location):
            request.pdf_location = os.path.join(LECTURES_DIR, request.pdf_location)

        # Check if PDF exists
        if not os.path.exists(request.pdf_location):
            raise HTTPException(status_code=404, detail=f"PDF file not found at {request.pdf_location}")

        # Load the PDF and extract text from specified pages
        loader = PyPDFLoader(request.pdf_location)
        documents = loader.load()
        total_pages = len(documents)  # Get total pages in PDF

        selected_texts = []
        for page in request.page_numbers:
            zero_based_page = page - 1  # Convert 1-based index to 0-based
            
            if 0 <= zero_based_page < total_pages:
                selected_texts.append(documents[zero_based_page].page_content)
                print(f"Added content from page {page} (actual index: {zero_based_page})")
            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Page {page} is out of range for this PDF (Total pages: {total_pages})"
                )

        selected_text = "\n".join(selected_texts)

        # Generate keywords using LLM
        keyword_prompt = f"""
        Extract key concepts as keywords from the following text. 
        The keywords should capture the most important topics and be comma-separated.

        **TEXT:**
        {selected_text}

        **FORMAT REQUIREMENTS:**
        Return only the keywords in a single comma-separated list.
        """

        keyword_response = model.generate_content(keyword_prompt)
        if not keyword_response:
            raise HTTPException(status_code=500, detail="Failed to generate keywords: No response received.")

        keywords = keyword_response.text.strip()

        # Embedding & RAG Setup
        embedding_function = FastEmbedEmbeddings()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )

        index_creator = VectorstoreIndexCreator(
            embedding=embedding_function,
            text_splitter=text_splitter
        )
        index = index_creator.from_loaders([loader])
        print("Keywords extracted: ", keywords)
        # Perform similarity search using generated keywords
        retrieved_docs = index.vectorstore.similarity_search(keywords)
        context = "\n".join([doc.page_content for doc in retrieved_docs])

        # Generate MCQs
        mcq_prompt = f"""
        Generate {request.num_questions} multiple-choice questions from the following context.

        **CONTEXT:**
        {context}

        **FORMAT:**
        ```json
        {{
        "questions": [
            {{
            "question": "The complete question text?",
            "options": {{
                "A": "Option 1",
                "B": "Option 2",
                "C": "Option 3",
                "D": "Option 4"
            }},
            "correct_answer": "A",
            "explanation": "Brief explanation",
            "topic": "One word topic",
            "page_number": 3
            }}
        ]
        }}
        ```
        """

        mcq_response = model.generate_content(mcq_prompt)
        if not mcq_response:
            raise HTTPException(status_code=500, detail="Failed to generate MCQs: No response received.")

        # Extract JSON from response
        try:
            mcq_data = json.loads(mcq_response.text)
            return mcq_data
        except json.JSONDecodeError:
            json_match = re.search(r'```json\s*(.*?)\s*```', mcq_response.text, re.DOTALL)
            if json_match:
                try:
                    mcq_data = json.loads(json_match.group(1))
                    print(mcq_data)
                    return mcq_data
                except json.JSONDecodeError:
                    raise HTTPException(status_code=500, detail="Failed to parse JSON response from model")
            else:
                raise HTTPException(status_code=500, detail="Failed to extract JSON from model response")

    except Exception as e:
        from traceback import format_exc
        print(format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating MCQs: {str(e)}")

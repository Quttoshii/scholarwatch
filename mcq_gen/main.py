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
from typing import List, Dict, Any, Optional

# request body
# {
#   "pdf_location": "/path/to/your/document.pdf",
#   "query": "What are the key concepts in this document?",
#   "num_questions": 5,
#   "api_key": "your_google_api_key_here"  // Optional if set as environment variable
# }

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class MCQRequest(BaseModel):
    pdf_location: str
    query: str = "What are the key concepts in this document?"
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
        api_key = request.api_key or os.environ.get("GOOGLE_API_KEY", "AIzaSyC9NW3A-UEqFyKVV3aPQk5pCeNWudOV_8s")
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        if not os.path.exists(request.pdf_location):
            raise HTTPException(status_code=404, detail=f"PDF file not found at {request.pdf_location}")
        
        loader = PyPDFLoader(request.pdf_location)
        documents = loader.load()
        
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
        
        retrieved_docs = index.vectorstore.similarity_search(request.query, k=4) 
        
        context = "\n".join([doc.page_content for doc in retrieved_docs])
        
        prompt = f"""
        You are an expert MCQ generator specializing in technical and educational content. 
        Use the following context from a document to create multiple-choice questions that test understanding of fundamental concepts.

        **CONTEXT:**
        {context}

        **TASK:**
        Generate {request.num_questions} multiple-choice questions based solely on the provided context.
        Each question should:
        - Test comprehension of important concepts from the text
        - Have varying difficulty levels (basic recall to application)
        - Include one correct answer and three plausible but incorrect distractors
        - Be clear, unambiguous, and professionally worded
        - Have the correct answer randomly distributed among options A, B, C, and D (don't make the correct answer follow an obvious pattern)

        **FORMAT REQUIREMENTS:**
        Return your response in valid JSON format with the following structure:
        ```json
        {{
          "questions": [
            {{
              "question": "The complete question text goes here?",
              "options": {{
                "A": "First option",
                "B": "Second option",
                "C": "Third option",
                "D": "Fourth option"
              }},
              "correct_answer": "A",
              "explanation": "Brief explanation of why this is the correct answer"
            }},
            // Additional questions follow the same structure
          ]
        }}
        ```
        """
        
        response = model.generate_content(prompt)
        
        if not response:
            raise HTTPException(status_code=500, detail="Failed to generate MCQs: No response received.")
        
        try:
            mcq_data = json.loads(response.text)
            return mcq_data
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', response.text, re.DOTALL)
            if json_match:
                try:
                    mcq_data = json.loads(json_match.group(1))
                    return mcq_data
                except json.JSONDecodeError:
                    raise HTTPException(status_code=500, detail="Failed to parse JSON response from model")
            else:
                raise HTTPException(status_code=500, detail="Failed to extract JSON from model response")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating MCQs: {str(e)}")

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
import asyncio
import os
import time

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

model = YOLO("best.pt")


is_detecting = False
awake_time = 0
drowsy_time = 0
start_time = None  
frame_rate = 30  

def read_image(file) -> np.ndarray:
    image = Image.open(BytesIO(file))
    return np.array(image)

def detect_emotions(frame):
    global awake_time, drowsy_time

    model_results = model.predict(source=frame)

  
    if model_results:
        for result in model_results:
            boxes = result.boxes
            labels = result.names

            
            for box in boxes:
                cls = box.cls.item()
                label = labels[int(cls)]
                print(f"Detected label: {label}")  
                
                if label == "awake":
                    awake_time += 1
                elif label == "drowsy":
                    drowsy_time += 1




@app.post("/start_detection/")

async def start_detection():

    global is_detecting, awake_time, drowsy_time, start_time

    is_detecting = True
    awake_time = 0
    drowsy_time = 0
    start_time = time.time()  


    cap = cv2.VideoCapture(0)
    frame_count = 0 

    while is_detecting:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1  
        detect_emotions(frame)
        await asyncio.sleep(0.1)  

    cap.release()
    print(f"Total frames processed: {frame_count}") 

    return {"message": "Detection started"}





@app.post("/stop_detection/")

async def stop_detection():

    global is_detecting, awake_time, drowsy_time
    is_detecting = False
    

    total_time = time.time() - start_time  
    return {
        "message": "Detection stopped",
        "results": {
            "awake_time": awake_time / frame_rate, 
            "drowsy_time": drowsy_time / frame_rate   
        }
    }

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    global results
    if not is_detecting:
        return {"message": "Detection is not active"}

    image = read_image(await file.read())
    model_results = model.predict(source=image)

    detections = []
    for result in model_results:
        boxes = result.boxes
        labels = result.names

        for box in boxes:
            cls = box.cls.item()
            detections.append(labels[int(cls)]) 

    results = detections
    return {"detections": detections}
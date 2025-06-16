from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
import asyncio
import os
import time
from typing import Optional

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

# Global variables for detection state
is_detecting = False
awake_time = 0
drowsy_time = 0
start_time = None
frame_rate = 30
cap: Optional[cv2.VideoCapture] = None
detection_task = None

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

async def run_detection():
    global is_detecting, cap, awake_time, drowsy_time
    
    try:
        while is_detecting and cap is not None and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("Failed to read frame from camera")
                break
            detect_emotions(frame)
            await asyncio.sleep(0.1)
    except Exception as e:
        print(f"Error in detection loop: {e}")
    finally:
        print("Detection loop ended")

@app.get("/detection_status")
async def get_detection_status():
    return {"is_detecting": is_detecting}

@app.post("/start_detection")
async def start_detection():
    global is_detecting, awake_time, drowsy_time, start_time, cap, detection_task

    if is_detecting:
        return {"message": "Detection is already running"}

    try:
        # Initialize camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise HTTPException(status_code=500, detail="Failed to open camera")

        # Reset state
        is_detecting = True
        awake_time = 0
        drowsy_time = 0
        start_time = time.time()

        # Start detection in background
        detection_task = asyncio.create_task(run_detection())

        return {"message": "Detection started successfully"}
    except Exception as e:
        is_detecting = False
        if cap is not None:
            cap.release()
            cap = None
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stop_detection")
async def stop_detection():
    global is_detecting, awake_time, drowsy_time, cap, detection_task, start_time

    # Always return results structure, even if detection wasn't running
    try:
        # Stop detection
        was_detecting = is_detecting
        is_detecting = False
        
        # Wait for detection task to complete with timeout
        if detection_task is not None:
            try:
                await asyncio.wait_for(detection_task, timeout=5.0)
            except asyncio.TimeoutError:
                print("Detection task timeout")
            except Exception as e:
                print(f"Error waiting for detection task: {e}")
            finally:
                detection_task = None

        # Clean up camera
        if cap is not None:
            cap.release()
            cap = None

        # Calculate results - ensure we always return results
        total_time = time.time() - start_time if start_time else 0
        awake_seconds = awake_time / frame_rate if awake_time > 0 else 0
        drowsy_seconds = drowsy_time / frame_rate if drowsy_time > 0 else 0
        
        # Reset counters
        awake_time = 0
        drowsy_time = 0
        start_time = None
        
        return {
            "message": "Detection stopped successfully" if was_detecting else "No detection was running",
            "results": {
                "awake_time": awake_seconds,
                "drowsy_time": drowsy_seconds,
                "total_time": total_time
            }
        }
    except Exception as e:
        # Even on error, return results structure
        print(f"Error in stop_detection: {e}")
        
        # Force cleanup
        is_detecting = False
        if cap is not None:
            cap.release()
            cap = None
        
        # Reset state
        awake_time = 0
        drowsy_time = 0
        start_time = None
        
        return {
            "message": f"Detection stopped with error: {str(e)}",
            "results": {
                "awake_time": 0,
                "drowsy_time": 0,
                "total_time": 0
            }
        }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not is_detecting:
        return {"message": "Detection is not active"}

    try:
        image = read_image(await file.read())
        model_results = model.predict(source=image)

        detections = []
        for result in model_results:
            boxes = result.boxes
            labels = result.names

            for box in boxes:
                cls = box.cls.item()
                detections.append(labels[int(cls)])

        return {"detections": detections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
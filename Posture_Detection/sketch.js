let capture;
let posenet;
let cocossd;
let singlePose;
let alertMessage = "";  // To display posture alerts
let lastAlertMessage = "";  // To store the last displayed message to prevent repeats
let slouchThreshold = 0.7;  // To detect slouching
let lookThreshold = 0.25;  // To detect looking left/right
let phoneDetected = false;  // To track phone detection
let phoneDetectionFrames = 0;  // To track consistent phone detection
let detectionThreshold = 0.6;  // Confidence threshold for phone detection
let detectionConsistency = 10;  // Frames required for consistent phone detection
let cooldown = 60;  // Cooldown frames after phone detection
let timing = false;  // Controls whether the timing is active
let detectionStartTimes = {};
let detectionDurations = {
    noPerson: 0,
    phoneUse: 0,
    lookingRight: 0,
    lookingLeft: 0,
    slouching: 0
};
let sessionStartTime;
let totalSessionTime = 0;
let goodPostureTime = 0;
let showResults = false;  // Controls the display of timing results

function setup() {
    createCanvas(800, 500);
    capture = createCapture(VIDEO);
    capture.hide();

    posenet = ml5.poseNet(capture, modelLoaded);
    posenet.on('pose', receivedPoses);

    cocossd = ml5.objectDetector('cocossd', modelLoaded);

    let startButton = createButton('Start Lecture');
    startButton.position(10, 550);
    startButton.mousePressed(startTiming);

    let stopButton = createButton('End Lecture');
    stopButton.position(100, 550);
    stopButton.mousePressed(stopTiming);
}

function modelLoaded() {
    console.log('Model loaded');
}

function startTiming() {
    detectionDurations = {
        noPerson: 0,
        phoneUse: 0,
        lookingRight: 0,
        lookingLeft: 0,
        slouching: 0
    };
    detectionStartTimes = {};
    sessionStartTime = millis();
    timing = true;
    showResults = false;
    alertMessage = "";
}

function stopTiming() {
    if (timing) {
        // Finalize all ongoing detections
        let currentTime = millis();
        Object.keys(detectionStartTimes).forEach(function(key) {
            if (detectionStartTimes[key] !== undefined) {
                detectionDurations[key] += currentTime - detectionStartTimes[key];
                detectionStartTimes[key] = undefined;
            }
        });
        updateSessionTime();
        timing = false;
        showResults = true;
    }
}

function updateSessionTime() {
    totalSessionTime = (millis() - sessionStartTime) / 1000;
    goodPostureTime = totalSessionTime - (
        detectionDurations.noPerson / 1000 +
        detectionDurations.phoneUse / 1000 +
        detectionDurations.lookingRight / 1000 +
        detectionDurations.lookingLeft / 1000 +
        detectionDurations.slouching / 1000
    );
}

function receivedPoses(poses) {
    if (!timing) return;
    if (poses.length > 0 && poses[0].pose.score > 0.1) {
        if (detectionStartTimes.noPerson) {
            detectionDurations.noPerson += millis() - detectionStartTimes.noPerson;
            detectionStartTimes.noPerson = undefined;
        }
        singlePose = poses[0].pose;
        evaluatePosture(singlePose);
    } else {
        if (!detectionStartTimes.noPerson) {
            detectionStartTimes.noPerson = millis();
        }
        updateAlert("No person detected.");
    }
    cocossd.detect(capture, gotDetections);
}

function gotDetections(error, results) {
    if (!timing) return;
    if (error) {
        console.error(error);
        return;
    }
    updatePhoneDetection(results);
}

function updatePhoneDetection(results) {
    let phoneDetectedInFrame = results.some(obj => obj.label === 'cell phone' && obj.confidence > detectionThreshold);
    phoneDetectionFrames = phoneDetectedInFrame ? phoneDetectionFrames + 1 : Math.max(0, phoneDetectionFrames - 1);
    
    if (phoneDetectionFrames >= detectionConsistency) {
        if (!detectionStartTimes.phoneUse) {
            detectionStartTimes.phoneUse = millis();
        }
        phoneDetected = true;
        phoneDetectionFrames = 0;  // Reset after consistent detection
    }

    if (phoneDetected) {
        cooldown--;
        if (cooldown <= 0) {
            if (detectionStartTimes.phoneUse) {
                detectionDurations.phoneUse += millis() - detectionStartTimes.phoneUse;
                detectionStartTimes.phoneUse = undefined;
            }
            phoneDetected = false;
            cooldown = 60;  // Reset cooldown
        }
    }
}

function evaluatePosture(pose) {
    const margin = 10;
    const minX = margin;
    const maxX = width - margin;
    const minY = margin;
    const maxY = height - margin;

    let nose = pose.keypoints[0];
    if (nose.position.x < minX || nose.position.x > maxX || nose.position.y < minY || nose.position.y > maxY) {
        updateAlert("Person is out of the bounding box!");
        return;
    }

    performPostureCheck(pose);
}

function performPostureCheck(pose) {
    let message = "";
    let nose = pose.keypoints[0];
    let shoulders = pose.keypoints.filter(k => k.part === 'leftShoulder' || k.part === 'rightShoulder');
    let eyes = pose.keypoints.filter(k => k.part === 'leftEye' || k.part === 'rightEye');

    if (shoulders.length < 2 || eyes.length < 2) {
        updateAlert("Not all keypoints are visible.");
        return;
    }

    let shoulderHeight = (shoulders[0].position.y + shoulders[1].position.y) / 2;
    let noseHeightRatio = nose.position.y / shoulderHeight;
    let eyeLine = (eyes[0].position.x + eyes[1].position.x) / 2;
    let shoulderMidpointX = (shoulders[0].position.x + shoulders[1].position.x) / 2;
    let shoulderWidth = Math.abs(shoulders[0].position.x - shoulders[1].position.x);

    if (noseHeightRatio > slouchThreshold) {
        message += "You are slouching! ";
        if (!detectionStartTimes.slouching) {
            detectionStartTimes.slouching = millis();
        }
    } else if (detectionStartTimes.slouching) {
        detectionDurations.slouching += millis() - detectionStartTimes.slouching;
        detectionStartTimes.slouching = undefined;
    }

    if (eyeLine < shoulderMidpointX - (shoulderWidth * lookThreshold)) {
        message += "You are not attentive: Looking right. ";
        if (!detectionStartTimes.lookingRight) {
            detectionStartTimes.lookingRight = millis();
        }
    } else if (detectionStartTimes.lookingRight) {
        detectionDurations.lookingRight += millis() - detectionStartTimes.lookingRight;
        detectionStartTimes.lookingRight = undefined;
    }

    if (eyeLine > shoulderMidpointX + (shoulderWidth * lookThreshold)) {
        message += "You are not attentive: Looking left. ";
        if (!detectionStartTimes.lookingLeft) {
            detectionStartTimes.lookingLeft = millis();
        }
    } else if (detectionStartTimes.lookingLeft) {
        detectionDurations.lookingLeft += millis() - detectionStartTimes.lookingLeft;
        detectionStartTimes.lookingLeft = undefined;
    }

    if (message === "") {
        message = "Good posture! ";  // Only show good posture if no other alerts have been triggered
    }

    if (phoneDetected) {
        message += "Using a phone. ";
    }

    updateAlert(message.trim());
}

function updateAlert(newMessage) {
    if (newMessage !== lastAlertMessage) {
        alertMessage = newMessage;
        lastAlertMessage = newMessage;
    }
}

function draw() {
    image(capture, 0, 0);
    drawBoundingBox();
    fill(255, 0, 0);
    textSize(24);
    text(alertMessage, 20, height - 30);

    if (showResults) {
        displayResults();
    }
}

function displayResults() {
    textSize(14);
    fill(255);
    text(`Total time: ${totalSessionTime.toFixed(2)} s`, 10, 20);
    text(`Good posture time: ${goodPostureTime.toFixed(2)} s`, 10, 40);
    text(`No person: ${(detectionDurations.noPerson / 1000).toFixed(2)} s`, 10, 60);
    text(`Phone use: ${(detectionDurations.phoneUse / 1000).toFixed(2)} s`, 10, 80);
    text(`Looking right: ${(detectionDurations.lookingRight / 1000).toFixed(2)} s`, 10, 100);
    text(`Looking left: ${(detectionDurations.lookingLeft / 1000).toFixed(2)} s`, 10, 120);
    text(`Slouching: ${(detectionDurations.slouching / 1000).toFixed(2)} s`, 10, 140);
}

function drawBoundingBox() {
    const margin = 10;  // Margin from the edges of the canvas
    const bboxWidth = width - 20 * margin;  // Width of the bounding box
    const bboxHeight = height - 17;  // Height of the bounding box

    stroke(0, 255, 0);  // Green color for visibility
    noFill();
    strokeWeight(2);
    rect(margin, margin, bboxWidth, bboxHeight);  // Draw bounding box with margins
}
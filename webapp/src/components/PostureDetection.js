import React, { useEffect } from 'react';

function PostureDetection() {
  useEffect(() => {

    // function loadScript(url, callback) { 
    //     var script = document.createElement('script'); 
    //     script.type = 'text/javascript'; script.src = url; 
    //     script.onload = callback; 
    //     document.head.appendChild(script); 
    //   } 
    // loadScript('https://unpkg.com/ml5@0.12.2/dist/ml5.min.js', function() { 
    //     console.log('ml5 loaded'); 
    // });
    
    // loadScript('https://cdn.jsdelivr.net/npm/p5@latest/lib/p5.js', function() { 
    //     console.log('p5 loaded'); 
    // });

    // Check if p5.js and ml5.js are loaded from the CDN
    if (window.p5 && window.ml5) {
      // Create a p5 instance using the sketch function
      const sketch = (p) => {
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

        p.setup = () => {
          let canvas = p.createCanvas(800, 500);
          canvas.parent('posture-detection-container'); // Attach canvas to the div

          capture = p.createCapture(p.VIDEO);
          capture.hide();

          // Initialize ml5.js models
          capture.elt.onloadedmetadata = () => {
            // console.log("Capture video ready:", capture.loadedmetadata);
            // console.log(capture);
            posenet = window.ml5.poseNet(capture, modelLoaded);
            posenet.on('pose', receivedPoses);
            cocossd = window.ml5.objectDetector('cocossd', modelLoaded);
          };
        //   posenet = window.ml5.poseNet(capture, modelLoaded);
        //   posenet.on('pose', receivedPoses);
        //   cocossd = window.ml5.objectDetector('cocossd', modelLoaded);

          // Add buttons
          let startButton = p.createButton('Start Lecture');
          startButton.position(canvas.position().x, canvas.position().y + canvas.height); // 20 pixels below the canvas
          startButton.mousePressed(startTiming);
        
          let stopButton = p.createButton('End Lecture');
          stopButton.position(canvas.position().x + 100, canvas.position().y + canvas.height); // 100 pixels to the right of the start button
          stopButton.mousePressed(stopTiming);
        };

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
          sessionStartTime = p.millis();
          timing = true;
          showResults = false;
          alertMessage = "";
        }

        function stopTiming() {
          if (timing) {
            // Finalize all ongoing detections
            let currentTime = p.millis();
            Object.keys(detectionStartTimes).forEach((key) => {
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
          totalSessionTime = (p.millis() - sessionStartTime) / 1000;
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
              detectionDurations.noPerson += p.millis() - detectionStartTimes.noPerson;
              detectionStartTimes.noPerson = undefined;
            }
            singlePose = poses[0].pose;
            evaluatePosture(singlePose);
          } else {
            if (!detectionStartTimes.noPerson) {
              detectionStartTimes.noPerson = p.millis();
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
          let phoneDetectedInFrame = results.some(
            (obj) => obj.label === 'cell phone' && obj.confidence > detectionThreshold
          );
          phoneDetectionFrames = phoneDetectedInFrame ? phoneDetectionFrames + 1 : Math.max(0, phoneDetectionFrames - 1);

          if (phoneDetectionFrames >= detectionConsistency) {
            if (!detectionStartTimes.phoneUse) {
              detectionStartTimes.phoneUse = p.millis();
            }
            phoneDetected = true;
            phoneDetectionFrames = 0;  // Reset after consistent detection
          }

          if (phoneDetected) {
            cooldown--;
            if (cooldown <= 0) {
              if (detectionStartTimes.phoneUse) {
                detectionDurations.phoneUse += p.millis() - detectionStartTimes.phoneUse;
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
          const maxX = p.width - margin;
          const minY = margin;
          const maxY = p.height - margin;

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
          let shoulders = pose.keypoints.filter((k) => k.part === 'leftShoulder' || k.part === 'rightShoulder');
          let eyes = pose.keypoints.filter((k) => k.part === 'leftEye' || k.part === 'rightEye');

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
              detectionStartTimes.slouching = p.millis();
            }
          } else if (detectionStartTimes.slouching) {
            detectionDurations.slouching += p.millis() - detectionStartTimes.slouching;
            detectionStartTimes.slouching = undefined;
          }

          if (eyeLine < shoulderMidpointX - (shoulderWidth * lookThreshold)) {
            message += "You are not attentive: Looking right. ";
            if (!detectionStartTimes.lookingRight) {
              detectionStartTimes.lookingRight = p.millis();
            }
          } else if (detectionStartTimes.lookingRight) {
            detectionDurations.lookingRight += p.millis() - detectionStartTimes.lookingRight;
            detectionStartTimes.lookingRight = undefined;
          }

          if (eyeLine > shoulderMidpointX + (shoulderWidth * lookThreshold)) {
            message += "You are not attentive: Looking left. ";
            if (!detectionStartTimes.lookingLeft) {
              detectionStartTimes.lookingLeft = p.millis();
            }
          } else if (detectionStartTimes.lookingLeft) {
            detectionDurations.lookingLeft += p.millis() - detectionStartTimes.lookingLeft;
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

        p.draw = () => {
          p.image(capture, 0, 0);
          drawBoundingBox();
          p.fill(255, 0, 0);
          p.textSize(24);
          p.text(alertMessage, 20, p.height - 30);

          if (showResults) {
            displayResults();
          }
        };

        function displayResults() {
          p.textSize(14);
          p.fill(255);
          p.text(`Total time: ${totalSessionTime.toFixed(2)} s`, 10, 20);
          p.text(`Good posture time: ${goodPostureTime.toFixed(2)} s`, 10, 40);
          p.text(`No person: ${(detectionDurations.noPerson / 1000).toFixed(2)} s`, 10, 60);
          p.text(`Phone use: ${(detectionDurations.phoneUse / 1000).toFixed(2)} s`, 10, 80);
          p.text(`Looking right: ${(detectionDurations.lookingRight / 1000).toFixed(2)} s`, 10, 100);
          p.text(`Looking left: ${(detectionDurations.lookingLeft / 1000).toFixed(2)} s`, 10, 120);
          p.text(`Slouching: ${(detectionDurations.slouching / 1000).toFixed(2)} s`, 10, 140);
        }

        function drawBoundingBox() {
        //   const margin = 10;  // Margin from the edges of the canvas
        //   const bboxWidth = p.width - 20 * margin;  // Width of the bounding box
        //   const bboxHeight = p.height - 17;  // Height of the bounding box
          const margin = 10;  // Margin from the edges of the canvas
          const bboxWidth = p.width - 18 * margin;  // Width of the bounding box
          const bboxHeight = p.height - 40;  // Height of the bounding box

          p.stroke(0, 255, 0);  // Green color for visibility
          p.noFill();
          p.strokeWeight(2);
          p.rect(margin, margin, bboxWidth, bboxHeight);  // Draw bounding box with margins
        }
      };

      // Create a new p5 instance with the sketch function
      let myp5 = new window.p5(sketch);

      // Cleanup the p5 instance on component unmount
      return () => {
        myp5.remove();
      };
    } else {
      console.error('p5.js or ml5.js is not loaded');
    }
  }, []);

  return (
    <div id="posture-detection-container" className="postureDetection">
      <h2>Posture Detection</h2>
    </div>
  );
}

export default PostureDetection;
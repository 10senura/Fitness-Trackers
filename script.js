// Camera and Pose Detection Setup
let video;
let detector;
let poses = [];
let moves = 0;
let calories = 0;
let lastPosition = { leftWrist: 0, rightWrist: 0 };

async function init() {
    try {
        // Camera access
        video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // Initialize Pose Detector
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
            enableTracking: true,
            trackerType: poseDetection.TrackerType.BoundingBox
        };
        
        detector = await poseDetection.createDetector(model, detectorConfig);
        
        // Start detection loop
        detectPose();
    } catch (error) {
        console.error('Error initializing:', error);
        document.getElementById('poseStatus').textContent = 'Error Initializing';
    }
}

async function detectPose() {
    try {
        poses = await detector.estimatePoses(video);
        updateUI();
        calculateMetrics();
        requestAnimationFrame(detectPose);
    } catch (error) {
        console.error('Detection error:', error);
        document.getElementById('poseStatus').textContent = 'Detection Failed';
    }
}

function updateUI() {
    // Update pose status
    const statusElement = document.getElementById('poseStatus');
    statusElement.textContent = poses.length > 0 ? 'Detected' : 'Not Detected';
    statusElement.style.color = poses.length > 0 ? '#2ecc71' : '#e74c3c';

    // Update moves counter
    document.getElementById('totalMoves').textContent = moves;
    
    // Update calories (simple calculation: 0.05 kcal per move)
    document.getElementById('calories').textContent = (moves * 0.05).toFixed(2);
}

function calculateMetrics() {
    if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
        const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');

        if (leftWrist && rightWrist) {
            // Detect movement threshold (10% of screen height)
            const threshold = video.videoHeight * 0.1;
            
            // Check vertical movement
            if (Math.abs(leftWrist.y - lastPosition.leftWrist) > threshold ||
                Math.abs(rightWrist.y - lastPosition.rightWrist) > threshold) {
                moves++;
            }
            
            // Store current positions
            lastPosition = {
                leftWrist: leftWrist.y,
                rightWrist: rightWrist.y
            };
        }
    }
}

// Initialize when page loads
window.addEventListener('load', init);
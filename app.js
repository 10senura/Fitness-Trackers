const video = document.getElementById('video');
const poseStatus = document.getElementById('poseStatus');
const caloriesDisplay = document.getElementById('calories');
const totalMovesDisplay = document.getElementById('totalMoves');

let caloriesBurned = 0;
let totalMoves = 0;

// Function to start the video stream automatically
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    });
    video.srcObject = stream;
}

// Function to load the Pose Detection model
async function loadPoseDetectionModel() {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    return detector;
}

// Function to detect poses and calculate results
async function detectPose(detector) {
    const poses = await detector.estimatePoses(video);
    if (poses.length > 0) {
        const pose = poses[0];
        const leftWrist = pose.keypoints.find((key) => key.name === 'left_wrist');
        const rightWrist = pose.keypoints.find((key) => key.name === 'right_wrist');

        if (leftWrist && rightWrist) {
            const leftConfidence = leftWrist.score;
            const rightConfidence = rightWrist.score;

            if (leftConfidence > 0.5 && rightConfidence > 0.5) {
                poseStatus.textContent = 'Detected!';
                caloriesBurned += 0.15; // Increment calorie count per move
                totalMoves += 1;
                caloriesDisplay.textContent = caloriesBurned.toFixed(2);
                totalMovesDisplay.textContent = totalMoves;
            } else {
                poseStatus.textContent = 'Not Detected';
            }
        }
    }
}

// Initialize the app
(async () => {
    await startCamera();
    const detector = await loadPoseDetectionModel();

    // Continuously detect poses
    setInterval(() => detectPose(detector), 100);
})();

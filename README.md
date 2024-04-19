# Webcam Image Uploader

This is a simple web application built with React that allows users to capture images from their webcam and upload them to Firebase storage. The uploaded images are associated with location metadata retrieved using the user's geolocation coordinates.

## Features

- Capture images from your webcam.
- Upload captured images to Firebase storage.
- Retrieve and display a list of uploaded images with associated location metadata.
- Ambient styling for a pleasant user experience.

## Installation

1. Clone the repository:

2. Set up Firebase:
Create a Firebase project and set up Firebase storage.
Copy the Firebase configuration object into firebase.js in the src directory.

3. Run the application:
    npm start

4. Open your web browser and navigate to http://localhost:3000


**Usage:**
  1. Click on the "Capture" button to capture an image from your webcam.
  2. Once the image is captured, click on the "Upload Image" button to upload it to Firebase storage.
  3. You can view the list of uploaded images along with their associated location metadata below the webcam area.

  
**Technologies Used:**
  1. React
  2. Firebase
  3. react-webcam

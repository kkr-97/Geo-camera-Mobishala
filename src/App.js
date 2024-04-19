import { useState, useEffect, useRef } from "react";
import { storage } from "./firebase";
import Webcam from "react-webcam";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  getMetadata,
  updateMetadata,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [coords, setCoordinates] = useState({ lat: null, long: null });
  const [showWebCam, updateWebCamStatus] = useState(true);
  const webcamRef = useRef(null);

  useEffect(() => {
    const getCoodinates = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setCoordinates({ lat: latitude, long: longitude });
      } catch (error) {
        console.error("Error getting location:", error.message);
      }
    };

    getCoodinates();
  }, []);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const byteCharacters = atob(imageSrc.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    updateWebCamStatus(false);
    setImage(blob);
  };

  const uploadImage = async () => {
    if (!image) {
      console.error("No image selected.");
      return;
    }

    if (!coords.lat || !coords.long) {
      console.error("Location coordinates not available.");
      return;
    }

    const imageRef = ref(storage, `files/${image.name + uuidv4()}`);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=b794cae794364b1fb1f15235241904&q=${coords.lat},${coords.long}&aqi=yes`
      );
      const data = await response.json();
      const { name, region, country } = data.location;
      const location = { name, region, country };

      const metadata = {
        customMetadata: {
          ...location,
          latitude: coords.lat,
          longitude: coords.long,
        },
      };

      const snapshot = await uploadBytes(imageRef, image);
      // Set metadata for the uploaded image
      await updateMetadata(snapshot.ref, metadata);

      const url = await getDownloadURL(snapshot.ref);
      setImageList([...imageList, { url, metadata }]);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    updateWebCamStatus(true);
  };

  useEffect(() => {
    const listRef = ref(storage, "files/");
    listAll(listRef)
      .then(async (response) => {
        const promises = response.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          return { url, metadata };
        });
        const results = await Promise.all(promises);
        setImageList(results);
      })
      .catch((error) => {
        console.error("Error listing files:", error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Upload Image from Webcam</h1>
      {showWebCam ? (
        <>
          <div className="webcam-container">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              className="webcam-in"
            />
          </div>
          <button className="capture-btn" onClick={captureImage}>
            Capture
          </button>
        </>
      ) : (
        <h2 className="capture-status">Image Captured, Now you can Upload</h2>
      )}
      <button className="upload-btn" onClick={uploadImage}>
        Upload Image
      </button>
      <ul className="image-list">
        {imageList.map((item, index) => {
          const { name, region, country } = item.metadata.customMetadata;
          return (
            <li className="list-item" key={index}>
              <img src={item.url} alt={`img-${index}`} />
              <div className="metadata">
                <h3>
                  City: <span>{name}</span>
                </h3>
                <h3>
                  State: <span>{region}</span>
                </h3>
                <h3>
                  Country: <span>{country}</span>
                </h3>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;

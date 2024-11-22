import { useState, useRef } from "react";
import axios from "axios";

export default function Microphone({ onStop }) {
  const [isRecording, setIsRecording] = useState(false); // Tracks if recording is in progress
  const [transcription, setTranscription] = useState(""); // Stores transcribed text
  const mediaRecorder = useRef(null); // Ref for MediaRecorder
  const audioChunks = useRef([]); // Ref to hold audio chunks during recording

  // Start recording when the user clicks the "Start Recording" button
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Access microphone
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" }); // Specify mimeType
      audioChunks.current = []; // Clear any existing audio chunks

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data); // Collect audio data
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" }); // Combine chunks into a Blob
        onStop(audioBlob); // Pass the Blob to the parent component (if needed)
        await transcribeAudio(audioBlob); // Send audio to Deepgram for transcription
      };

      mediaRecorder.current.start(); // Start the recording
      setIsRecording(true); // Set recording status
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording when the user clicks the "Stop Recording" button
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop(); // Stop the recording
      setIsRecording(false); // Update recording status
    }
  };

  // Send the audio file to Deepgram API for transcription
  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm"); // Append the audio blob to form data

    try {
      const response = await axios.post(
        "https://api.deepgram.com/v1/listen", // Deepgram API endpoint
        formData,
        {
          headers: {
            Authorization: `Token b0f6c83f0c19ea1afb2c520e141d82db1ca9e0fb`, // Replace with your Deepgram API key
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Extract transcript from the response and update state
      const transcript =
        response.data.results.channels[0].alternatives[0].transcript;
      setTranscription(transcript); // Update transcription state to display it
    } catch (error) {
      console.error("Error transcribing audio:", error); // Handle error
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Record/Stop button */}
      <button
        onClick={isRecording ? stopRecording : startRecording} // Toggle between start/stop recording
        className={`px-4 py-2 rounded ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {/* Display transcription */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Transcription:</h3>
        <p>{transcription || "No transcription yet..."}</p>
      </div>
    </div>
  );
}

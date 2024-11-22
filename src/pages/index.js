import Microphone from "@/components/Microphone";

export default function Home() {
  const handleStop = (audioBlob) => {
    console.log("Audio Blob:", audioBlob);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">Audio Recorder</h1>
      <Microphone onStop={handleStop} />
    </div>
  );
}
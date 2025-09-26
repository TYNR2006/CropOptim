import { useState } from "react";
import MultiStepForm from "@/components/MultiStepForm";
import { sendPredictionRequest } from "../api/api";

const Predict = () => {
  const [backendResult, setBackendResult] = useState(null);

  const handleSubmit = async () => {
    const data = {
      crop: "Millets",
      farmingType: "organic",
      region: "Kadapa, Andhra Pradesh",
      previousCrop: "Paddy",
      soil: "", // optional
    };

    const result = await sendPredictionRequest(data);
    console.log("Backend Response:", result);
    setBackendResult(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Crop <span className="bg-gradient-primary bg-clip-text text-transparent">Prediction</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get AI-powered crop yield predictions and optimization recommendations.
        </p>
      </div>

      {/* Form */}
      <div className="animate-fade-in">
        <MultiStepForm />
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Get Prediction
          </button>
        </div>
      </div>

      {backendResult && (
  <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4">Prediction Result</h2>
    <p><strong>Prediction:</strong> {backendResult.prediction}</p>
    <p><strong>Explanation:</strong> {backendResult.explanation}</p>
  </div>
)}

    </div>
  );
};

export default Predict;

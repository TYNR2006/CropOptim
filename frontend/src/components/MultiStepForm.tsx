import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ChevronLeft, ChevronRight, Upload, Send, Mic, MicOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Import backend call helper
import { sendPredictionRequest } from "../api/api";

interface FormData {
  crop: string;
  farmingType: string;
  state: string;
  district: string;
  previousCrop: string;
  soilTestFile?: File;
  soilParameters?: {
    ph: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    organicMatter: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface PredictionResponse {
  prediction: string;
  details: any;
  explanation: string;
  optimizedYield?: number;
  previousYield?: number;
}

const CROPS = ["Paddy", "Groundnut", "Millets"];
const STATES = {
  "Andhra Pradesh": ["Kadapa", "Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
};

const MultiStepForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    crop: "",
    farmingType: "",
    state: "Andhra Pradesh",
    district: "Kadapa",
    previousCrop: "",
  });

  // Add backend result state for direct fetch call
  const [backendResult, setBackendResult] = useState<PredictionResponse | null>(null);

  // Chat-related state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const totalSteps = 6;

  // Backend call helper using sendPredictionRequest
  const callBackendAPI = async (userMessage: string) => {
    try {
      const result = await sendPredictionRequest(userMessage, formData);
      return result;
    } catch (error) {
      console.error("Backend API Error:", error);
      throw error;
    }
  };

  // Corrected handleChatSubmit to update chatMessages and clear input
  const handleChatSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prevMessages) => [...prevMessages, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response: PredictionResponse = await callBackendAPI(message);

      const botContent = `**Prediction:** ${response.prediction}\n\n**Details:** ${JSON.stringify(
        response.details,
        null,
        2
      )}\n\n**Explanation:** ${response.explanation}`;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botContent,
        sender: "bot",
        timestamp: new Date(),
      };

      setChatMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
      toast({
        title: "Error",
        description: "Failed to get predictions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording functions remain unchanged
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setChatInput("Voice message recorded - implement speech-to-text with your backend");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 4 && formData.crop === formData.previousCrop) {
      setShowWarning(true);
      return;
    }
    setCurrentStep(Math.min(currentStep + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
    setShowWarning(false);
  };

  const handleContinueAnyway = () => {
    setShowWarning(false);
    setCurrentStep(5);
  };

  const handleStartPlanningAgain = () => {
    setFormData({
      crop: "",
      farmingType: "",
      state: "Andhra Pradesh",
      district: "Kadapa",
      previousCrop: "",
    });
    setChatMessages([]);
    setChatInput("");
    setCurrentStep(1);
    setShowWarning(false);
  };

  // Standard prediction request
  const handleSubmit = () => {
    handleChatSubmit("Please give prediction based on form data.");
  };

  // Direct fetch call alternative for testing
  const handleDirectBackendSubmit = async () => {
    const query = "Predict groundnut yield in Kadapa"; // or build dynamically from formData
    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

      setBackendResult({
        prediction: data.prediction,
        details: data.details,
        explanation: data.explanation,
      });
    } catch (error) {
      console.error("Backend fetch error:", error);
      toast({
        title: "Error",
        description: "Direct backend fetch failed.",
        variant: "destructive",
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.crop !== "";
      case 2:
        return formData.farmingType !== "";
      case 3:
        return formData.state !== "" && formData.district !== "";
      case 4:
        return formData.previousCrop !== "";
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select the crop to cultivate</h3>
            <Select
              value={formData.crop}
              onValueChange={(value) => setFormData({ ...formData, crop: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a crop" />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose farming type</h3>
            <RadioGroup
              value={formData.farmingType}
              onValueChange={(value) => setFormData({ ...formData, farmingType: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organic" id="organic" />
                <Label htmlFor="organic">Organic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inorganic" id="inorganic" />
                <Label htmlFor="inorganic">Inorganic</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enter region</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATES).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>District</Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES[formData.state as keyof typeof STATES]?.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select previous crop</h3>
            <Select
              value={formData.previousCrop}
              onValueChange={(value) => setFormData({ ...formData, previousCrop: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose previous crop" />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showWarning && (
              <Alert className="border-warning bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning-foreground">
                  <strong>Crop rotation is recommended.</strong> Growing the same crop repeatedly
                  reduces soil nutrients and increases pest risks. Do you still want to continue with
                  the same crop?
                  <div className="mt-3 space-x-2">
                    <Button variant="outline" size="sm" onClick={handleContinueAnyway}>
                      Continue
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleStartPlanningAgain}>
                      Start Planning Again
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Soil Health Parameters (Optional)</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Upload soil test file</p>
                <Input type="file" className="max-w-xs mx-auto" />
              </div>

              <div className="text-center text-muted-foreground">OR</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>pH Level</Label>
                  <Input placeholder="e.g., 6.5" />
                </div>
                <div>
                  <Label>Nitrogen (N)</Label>
                  <Input placeholder="e.g., 120 kg/ha" />
                </div>
                <div>
                  <Label>Phosphorus (P)</Label>
                  <Input placeholder="e.g., 30 kg/ha" />
                </div>
                <div>
                  <Label>Potassium (K)</Label>
                  <Input placeholder="e.g., 40 kg/ha" />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Ask for Predictions & Suggestions</h3>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="border rounded-lg p-8 flex flex-col justify-center items-center min-h-[180px]">
                <p className="text-center text-lg text-muted-foreground">
                  Ask me anything about your crop planning!
                </p>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  You can type your question or use the microphone to speak.
                </p>
              </div>
            </div>
            {/* Chat Messages */}
            <div className="bg-background border rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Ask me anything about your crop planning!</p>
                  <p className="text-sm mt-2">You can type your question or use the microphone to speak.</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground shadow-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Getting predictions...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Chat Input Area */}
            <div className="w-full flex justify-center">
              <div className="flex w-full max-w-xl items-end space-x-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about yield predictions, farming suggestions, or any crop-related questions..."
                  className="min-h-[44px] resize-none flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit(chatInput);
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => handleChatSubmit(chatInput)}
                  disabled={!chatInput.trim() || isLoading}
                  className="rounded-full"
                >
                  <Send className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="rounded-full"
                  disabled={isLoading}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            {isRecording && (
              <div className="text-sm text-primary flex items-center space-x-2 ml-2 mt-2">
                <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Recording... Click mic to stop</span>
              </div>
            )}
            {/* For debugging: Show Backend Result from fetch */}
            {backendResult && (
              <div className="mt-6 p-4 bg-slate-100 rounded-lg border">
                <div className="font-semibold mb-2">Direct Backend Response:</div>
                <div className="mb-1">Prediction: {backendResult.prediction}</div>
                <div className="mb-1">Explanation: {backendResult.explanation}</div>
                <div className="mb-1">Details: <pre>{JSON.stringify(backendResult.details, null, 2)}</pre></div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Crop Prediction Form</span>
          <span className="text-sm font-normal text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
        </CardTitle>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === totalSteps ? (
            <>
              <Button onClick={handleSubmit} className="bg-gradient-primary">
                Start Planning
              </Button>
              {/* For testing: you can show direct backend submit button */}
              <Button onClick={handleDirectBackendSubmit} className="bg-blue-400 ml-2">
                Direct Backend Submit
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} disabled={!isStepValid()} className="bg-gradient-primary">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiStepForm;

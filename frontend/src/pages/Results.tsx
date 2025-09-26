import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Leaf, BarChart3, ArrowLeft, Download } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const formData = location.state?.formData;

  // Placeholder results data
  const results = {
    previousYield: 45,
    optimizedYield: 55,
    improvement: 10,
    recommendations: [
      "Consider crop rotation with legumes to improve soil nitrogen",
      "Implement drip irrigation for water efficiency",
      "Apply organic compost 2 weeks before planting",
      "Monitor soil pH and maintain between 6.0-7.0"
    ],
    riskFactors: [
      { factor: "Weather Variability", risk: "Medium", description: "Monsoon patterns may affect yield" },
      { factor: "Soil Erosion", risk: "Low", description: "Current soil conditions are stable" },
      { factor: "Pest Infestation", risk: "Medium", description: "Regular monitoring recommended" }
    ]
  };

  if (!formData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
        <p className="text-muted-foreground mb-8">Please complete the prediction form first.</p>
        <Link to="/predict">
          <Button>Go to Prediction Form</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/predict" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            Your Crop <span className="bg-gradient-primary bg-clip-text text-transparent">Optimization Plan</span>
          </h1>
          <p className="text-muted-foreground">
            Based on your inputs for {formData.crop} farming in {formData.district}, {formData.state}
          </p>
        </div>
        <Button variant="outline" className="hidden md:flex">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Yield Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Previous Yield</p>
                <p className="text-3xl font-bold text-red-600">{results.previousYield}%</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Optimized Yield</p>
                <p className="text-3xl font-bold text-green-600">{results.optimizedYield}%</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Improvement</p>
                <p className="text-3xl font-bold">+{results.improvement}%</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommendations */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-green-600" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.riskFactors.map((risk, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{risk.factor}</span>
                  <Badge 
                    variant={risk.risk === "Low" ? "secondary" : risk.risk === "Medium" ? "default" : "destructive"}
                  >
                    {risk.risk} Risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
                <Progress 
                  value={risk.risk === "Low" ? 25 : risk.risk === "Medium" ? 50 : 75} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Farming Input Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Your Input Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Crop Selection</p>
              <p className="font-semibold">{formData.crop}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Farming Type</p>
              <p className="font-semibold capitalize">{formData.farmingType}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="font-semibold">{formData.district}, {formData.state}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Previous Crop</p>
              <p className="font-semibold">{formData.previousCrop}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Link to="/predict">
          <Button variant="outline" size="lg">
            New Prediction
          </Button>
        </Link>
        <Link to="/contact">
          <Button size="lg" className="bg-gradient-primary">
            Get Expert Consultation
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Results;
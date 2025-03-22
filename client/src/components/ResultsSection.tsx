import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Info, Check, X } from "lucide-react";
import { Analysis, Website } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface ResultsSectionProps {
  analysis: Analysis;
  uploadedImage: string;
  onResetAnalysis: () => void;
}

export default function ResultsSection({ analysis, uploadedImage, onResetAnalysis }: ResultsSectionProps) {
  // Fetch identified website data if available
  const { data: website } = useQuery({
    queryKey: ['/api/websites', analysis.identifiedWebsiteId],
    enabled: !!analysis.identifiedWebsiteId,
  });
  
  const isLegitimate = !analysis.isPhishing;
  const confidencePercent = analysis.confidenceScore;
  
  return (
    <section id="results-section" className="mb-8">
      {/* Verdict Banner */}
      <div 
        className={`mb-6 p-4 rounded-lg flex items-center border-l-4 ${
          isLegitimate 
            ? "border-l-success bg-success/10" 
            : "border-l-secondary bg-secondary/10"
        }`}
      >
        <div className="mr-4">
          {isLegitimate ? (
            <Shield className="w-10 h-10 text-success" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-secondary" />
          )}
        </div>
        <div>
          <h3 className={`text-xl font-semibold font-ibm ${
            isLegitimate ? "text-success" : "text-secondary"
          }`}>
            {isLegitimate ? "Legitimate Login Page" : "Suspicious Login Page Detected"}
          </h3>
          <p className="text-gray-700 font-ibm">
            {isLegitimate 
              ? `This appears to be the authentic ${website?.name || 'website'} login page.`
              : `This page appears to be imitating ${website?.name || 'a legitimate website'} but doesn't match the official login page.`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Results Card */}
        <Card className="bg-white rounded-lg shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-medium mb-4 font-ibm">Analysis Results</h3>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium font-ibm">Identified as</span>
                <span className="font-semibold font-ibm">{website?.name || 'Unknown Website'}</span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium font-ibm">Confidence Score</span>
                  <span className="font-semibold font-ibm">{confidencePercent}%</span>
                </div>
                <div className="confidence-meter bg-gray-200 h-2 rounded-full">
                  <div 
                    className={`h-full rounded-full ${
                      confidencePercent > 70 ? "bg-success" : 
                      confidencePercent > 40 ? "bg-yellow-400" : "bg-secondary"
                    }`} 
                    style={{ width: `${confidencePercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 font-ibm">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-neutral rounded-lg">
                <h4 className="font-medium mb-2 font-ibm">Key Analysis Factors</h4>
                <ul className="text-sm space-y-2 font-ibm">
                  {analysis.analysisFactors.map((factor: any, index: number) => (
                    <li key={index} className="flex items-start">
                      {factor.isPositive ? (
                        <Check className="w-5 h-5 text-success mr-2 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-secondary mr-2 flex-shrink-0" />
                      )}
                      <span>{factor.name}: {factor.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="p-4 border border-secondary rounded-lg bg-secondary/5">
              <h4 className="font-medium text-secondary flex items-center mb-2 font-ibm">
                <Info className="w-5 h-5 mr-2" />
                Recommended Action
              </h4>
              <p className="text-sm text-gray-700 font-ibm">
                {isLegitimate 
                  ? "This appears to be the legitimate website. Always ensure you're accessing it through secure methods." 
                  : `Do not enter your login credentials. Always navigate to ${website?.name || 'websites'} directly by typing ${website?.domain || 'the official domain'} in your browser.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Visual Comparison Card */}
        <Card className="bg-white rounded-lg shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-medium mb-4 font-ibm">Visual Comparison</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium mb-2 text-center font-ibm">Your Screenshot</p>
                <img 
                  className="comparison-image mx-auto rounded border max-h-60 object-contain"
                  src={uploadedImage}
                  alt="User uploaded login page screenshot"
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-center font-ibm">
                  Official {website?.name || 'Website'} Login
                </p>
                <img 
                  className="comparison-image mx-auto rounded border max-h-60 object-contain"
                  src={website?.referenceImageUrl || '/placeholder-reference.svg'}
                  alt={`Official ${website?.name || 'website'} login page`}
                />
              </div>
            </div>
            
            {analysis.keyDifferences.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 font-ibm">Key Differences</h4>
                <ul className="text-sm space-y-2 font-ibm">
                  {analysis.keyDifferences.map((difference: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-secondary mr-2">•</span>
                      <span>{difference.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!isLegitimate && (
              <div className="mt-6">
                <a 
                  href="https://www.antiphishing.org/report-phishing/" 
                  className="flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 font-ibm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Report this phishing page
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-medium font-ibm"
          onClick={onResetAnalysis}
        >
          Analyze Another Screenshot
        </Button>
      </div>
    </section>
  );
}

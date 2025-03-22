import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IntroSection from "@/components/IntroSection";
import UploadSection from "@/components/UploadSection";
import ResultsSection from "@/components/ResultsSection";
import InfoSection from "@/components/InfoSection";
import { useState } from "react";
import { Analysis } from "@shared/schema";

export default function Home() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const handleResetAnalysis = () => {
    setAnalysis(null);
    setUploadedImage(null);
  };

  return (
    <div className="bg-neutral min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <IntroSection />
        
        {!analysis && (
          <UploadSection 
            onImageAnalyzed={setAnalysis} 
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
          />
        )}
        
        {analysis && (
          <ResultsSection 
            analysis={analysis} 
            uploadedImage={uploadedImage || ''}
            onResetAnalysis={handleResetAnalysis} 
          />
        )}
        
        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}

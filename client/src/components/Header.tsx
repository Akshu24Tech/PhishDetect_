import { Shield } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center">
          <Shield className="w-8 h-8 mr-2 text-primary" />
          <h1 className="text-2xl font-semibold text-primary font-ibm">PhishDetect</h1>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="text-sm bg-primary text-white px-3 py-1 rounded-full font-ibm">
            AI-Powered Anti-Phishing Tool
          </span>
        </div>
      </div>
    </header>
  );
}

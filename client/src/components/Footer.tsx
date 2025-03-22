import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-8 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              <span className="font-semibold font-ibm">PhishGuard</span>
            </div>
            <p className="text-sm mt-2 text-gray-300 font-ibm">
              Protecting users from phishing attempts with AI
            </p>
          </div>
          <div className="text-sm text-gray-300 font-ibm">
            <p>© {new Date().getFullYear()} PhishGuard. All rights reserved.</p>
            <div className="flex justify-center md:justify-end mt-2 space-x-4">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Info, Shield, Lock } from "lucide-react";

export default function InfoSection() {
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-4 font-ibm">How to Protect Yourself from Phishing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-neutral rounded-lg">
            <div className="text-primary mb-3">
              <Info className="w-8 h-8" />
            </div>
            <h4 className="font-medium mb-2 font-ibm">Check the URL</h4>
            <p className="text-sm text-gray-700 font-ibm">
              Always verify the website address. Legitimate sites use HTTPS and have the proper domain name without suspicious additions.
            </p>
          </div>
          
          <div className="p-4 bg-neutral rounded-lg">
            <div className="text-primary mb-3">
              <Shield className="w-8 h-8" />
            </div>
            <h4 className="font-medium mb-2 font-ibm">Don't Click Suspicious Links</h4>
            <p className="text-sm text-gray-700 font-ibm">
              Avoid clicking links in unsolicited emails or messages. Type the website address directly in your browser instead.
            </p>
          </div>
          
          <div className="p-4 bg-neutral rounded-lg">
            <div className="text-primary mb-3">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="font-medium mb-2 font-ibm">Use Strong, Unique Passwords</h4>
            <p className="text-sm text-gray-700 font-ibm">
              Create different passwords for each account and consider using a password manager to keep track of them securely.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { analyzeImage } from "./services/imageAnalysis";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Set up multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("File upload only supports image files of type jpeg, jpg, png, or gif"));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the website reference data
  await initializeWebsites();
  
  // Get all websites
  app.get("/api/websites", async (_req, res) => {
    try {
      const websites = await storage.getAllWebsites();
      res.json(websites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch websites" });
    }
  });
  
  // Get a specific website by ID
  app.get("/api/websites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const website = await storage.getWebsite(id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      res.json(website);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website" });
    }
  });
  
  // Analyze an uploaded screenshot
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      // Process the uploaded image
      const imageBuffer = req.file.buffer;
      
      // Call the analysis service
      const result = await analyzeImage(imageBuffer, storage);
      
      res.json(result);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize the websites database with some common examples
async function initializeWebsites() {
  const websites = await storage.getAllWebsites();
  
  if (websites.length === 0) {
    // Add some common websites
    await storage.createWebsite({
      name: "Facebook",
      domain: "facebook.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/240px-Facebook_f_logo_%282019%29.svg.png",
      referenceImageUrl: "https://about.fb.com/wp-content/uploads/2019/11/facebook-login.png?resize=720%2C487",
    });
    
    await storage.createWebsite({
      name: "Google",
      domain: "google.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/240px-Google_%22G%22_Logo.svg.png",
      referenceImageUrl: "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/google-signin.max-2000x2000.jpg",
    });
    
    await storage.createWebsite({
      name: "Amazon",
      domain: "amazon.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",
      referenceImageUrl: "https://m.media-amazon.com/images/G/01/VSEO/signin._CB1565291945_.jpeg",
    });
    
    await storage.createWebsite({
      name: "Microsoft",
      domain: "microsoft.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/320px-Microsoft_logo.svg.png",
      referenceImageUrl: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RWDeEK",
    });
    
    await storage.createWebsite({
      name: "Apple",
      domain: "apple.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/240px-Apple_logo_black.svg.png",
      referenceImageUrl: "https://support.apple.com/library/content/dam/edam/applecare/images/en_US/mac_apps/mac-sign-in-window-macos-monterey.png",
    });
    
    console.log("Initialized website reference database");
  }
}

import * as tf from 'tfjs';
import { createCanvas, loadImage } from 'canvas';
import { IStorage } from '../storage';
import { InsertAnalysis, Website, AnalysisFactor, KeyDifference } from '@shared/schema';

// Basic feature extractor simulation for login pages
// In a real implementation, this would use a pre-trained model
async function extractFeatures(imageBuffer: Buffer): Promise<number[]> {
  // Load image
  const image = await loadImage(imageBuffer);
  const canvas = createCanvas(224, 224); // Standard size
  const ctx = canvas.getContext('2d');
  
  // Draw image to canvas, resizing to 224x224
  ctx.drawImage(image, 0, 0, 224, 224);
  
  // Get pixel data
  const imageData = ctx.getImageData(0, 0, 224, 224);
  
  // Extract simple features (color distribution, etc.)
  // This is a very simplified feature extraction for illustration
  const features: number[] = [];
  
  // Calculate average RGB values for different regions
  // Top section (typically contains logo/header)
  const topSection = getRegionStats(imageData, 0, 0, 224, 75);
  features.push(...topSection.avgRGB);
  
  // Middle section (form fields)
  const middleSection = getRegionStats(imageData, 0, 75, 224, 75);
  features.push(...middleSection.avgRGB);
  
  // Bottom section (buttons, footer)
  const bottomSection = getRegionStats(imageData, 0, 150, 224, 74);
  features.push(...bottomSection.avgRGB);
  
  // Overall image stats
  features.push(
    calculateColorVariety(imageData),
    calculateEdgeRatio(imageData),
    calculateBrightness(imageData)
  );
  
  return features;
}

// Helper function to get stats for a region of the image
function getRegionStats(imageData: ImageData, x: number, y: number, width: number, height: number) {
  let totalR = 0, totalG = 0, totalB = 0;
  const pixels = width * height;
  
  for (let j = y; j < y + height; j++) {
    for (let i = x; i < x + width; i++) {
      const index = (j * imageData.width + i) * 4;
      totalR += imageData.data[index];
      totalG += imageData.data[index + 1];
      totalB += imageData.data[index + 2];
    }
  }
  
  return {
    avgRGB: [totalR / pixels, totalG / pixels, totalB / pixels]
  };
}

// Calculate color variety
function calculateColorVariety(imageData: ImageData): number {
  const colors = new Set();
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = Math.floor(imageData.data[i] / 10) * 10;
    const g = Math.floor(imageData.data[i + 1] / 10) * 10;
    const b = Math.floor(imageData.data[i + 2] / 10) * 10;
    colors.add(`${r},${g},${b}`);
  }
  return colors.size / 2000; // Normalized value
}

// Simplified edge detection
function calculateEdgeRatio(imageData: ImageData): number {
  let edges = 0;
  const threshold = 30;
  
  for (let y = 1; y < imageData.height - 1; y++) {
    for (let x = 1; x < imageData.width - 1; x++) {
      const idx = (y * imageData.width + x) * 4;
      const idxLeft = (y * imageData.width + (x-1)) * 4;
      const idxRight = (y * imageData.width + (x+1)) * 4;
      
      const redDiff = Math.abs(imageData.data[idx] - imageData.data[idxLeft]) + 
                      Math.abs(imageData.data[idx] - imageData.data[idxRight]);
      
      if (redDiff > threshold) {
        edges++;
      }
    }
  }
  
  return edges / (imageData.width * imageData.height);
}

// Calculate average brightness
function calculateBrightness(imageData: ImageData): number {
  let total = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Standard brightness formula
    const brightness = 0.299 * imageData.data[i] + 0.587 * imageData.data[i+1] + 0.114 * imageData.data[i+2];
    total += brightness;
  }
  return total / (imageData.width * imageData.height * 255); // Normalized to 0-1
}

// Compare feature vectors to determine similarity
function calculateSimilarity(featuresA: number[], featuresB: number[]): number {
  if (featuresA.length !== featuresB.length) {
    throw new Error('Feature vectors must have the same length');
  }
  
  // Calculate Euclidean distance (simplified)
  let distanceSum = 0;
  for (let i = 0; i < featuresA.length; i++) {
    distanceSum += Math.pow(featuresA[i] - featuresB[i], 2);
  }
  
  const distance = Math.sqrt(distanceSum);
  
  // Convert distance to similarity score (0-100)
  // Lower distance = higher similarity
  const maxDistance = Math.sqrt(featuresA.length * Math.pow(255, 2)); // Maximum possible distance
  const similarity = 100 - (distance / maxDistance) * 100;
  
  return Math.max(0, Math.min(100, Math.round(similarity)));
}

// Simulate stored website features
// In a real implementation, these would come from a model trained on actual login pages
const simulatedWebsiteFeatures: Record<string, number[]> = {
  'facebook.com': [59, 89, 152, 235, 235, 235, 240, 240, 240, 0.2, 0.12, 0.85],
  'google.com': [66, 133, 244, 255, 255, 255, 240, 240, 240, 0.1, 0.08, 0.92],
  'amazon.com': [254, 153, 0, 240, 240, 240, 240, 240, 240, 0.15, 0.1, 0.88],
  'microsoft.com': [0, 120, 215, 255, 255, 255, 242, 242, 242, 0.12, 0.09, 0.9],
  'apple.com': [50, 50, 50, 250, 250, 250, 245, 245, 245, 0.08, 0.07, 0.89]
};

// Analyze an image to determine if it's a phishing attempt
export async function analyzeImage(imageBuffer: Buffer, storage: IStorage) {
  try {
    // 1. Extract features from the uploaded image
    const features = await extractFeatures(imageBuffer);
    
    // 2. Compare with reference features of known websites
    const websites = await storage.getAllWebsites();
    let bestMatch: Website | null = null;
    let highestSimilarity = 0;
    
    for (const website of websites) {
      // Get the simulated features for this website
      const referenceFeatures = simulatedWebsiteFeatures[website.domain];
      if (referenceFeatures) {
        const similarity = calculateSimilarity(features, referenceFeatures);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = website;
        }
      }
    }
    
    // 3. Generate analysis factors
    const analysisFactors: AnalysisFactor[] = [];
    const keyDifferences: KeyDifference[] = [];
    
    // Determine if the screenshot is likely a phishing attempt
    // For demo purposes: if similarity score is below 70%, consider it suspicious
    const isPhishing = highestSimilarity < 70;
    
    // Add analysis factors based on the feature comparison
    if (bestMatch) {
      // Logo matching
      const logoSimilarity = Math.min(100, highestSimilarity + Math.floor(Math.random() * 15));
      analysisFactors.push({
        name: "Logo matching",
        value: `${logoSimilarity}% similarity`,
        isPositive: logoSimilarity > 75
      });
      
      // Color scheme
      const colorSimilarity = Math.min(100, highestSimilarity - Math.floor(Math.random() * 20));
      analysisFactors.push({
        name: "Color scheme",
        value: `${colorSimilarity}% similarity`,
        isPositive: colorSimilarity > 70
      });
      
      // Layout analysis
      const layoutDiscrepancies = isPhishing;
      analysisFactors.push({
        name: "Layout analysis",
        value: layoutDiscrepancies ? "Discrepancies detected" : "Matches reference",
        isPositive: !layoutDiscrepancies
      });
      
      // URL pattern (simulated)
      const suspiciousUrl = isPhishing;
      analysisFactors.push({
        name: "URL pattern",
        value: suspiciousUrl ? "Unusual pattern" : "Standard pattern",
        isPositive: !suspiciousUrl
      });
      
      // Generate key differences for suspicious sites
      if (isPhishing) {
        keyDifferences.push({ description: "Different button colors and shapes" });
        keyDifferences.push({ description: "Missing security footer elements" });
        keyDifferences.push({ description: "Unusual form field arrangement" });
      }
    }
    
    // 4. Create and store the analysis result
    const analysisData: InsertAnalysis = {
      uploadedImageUrl: "memory://uploaded-image", // In a real app, would store the image
      identifiedWebsiteId: bestMatch?.id,
      confidenceScore: highestSimilarity,
      isPhishing,
      analysisFactors,
      keyDifferences,
      timestamp: new Date().toISOString(),
    };
    
    const analysis = await storage.createAnalysis(analysisData);
    return analysis;
    
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze the image");
  }
}

import {
  type Website,
  type InsertWebsite,
  type Analysis,
  type InsertAnalysis,
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Website operations
  getWebsite(id: number): Promise<Website | undefined>;
  getWebsiteByDomain(domain: string): Promise<Website | undefined>;
  getAllWebsites(): Promise<Website[]>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  
  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private websites: Map<number, Website>;
  private analyses: Map<number, Analysis>;
  private websiteCurrentId: number;
  private analysisCurrentId: number;

  constructor() {
    this.websites = new Map();
    this.analyses = new Map();
    this.websiteCurrentId = 1;
    this.analysisCurrentId = 1;
  }

  // Website operations
  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }

  async getWebsiteByDomain(domain: string): Promise<Website | undefined> {
    return Array.from(this.websites.values()).find(
      (website) => website.domain === domain,
    );
  }

  async getAllWebsites(): Promise<Website[]> {
    return Array.from(this.websites.values());
  }

  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const id = this.websiteCurrentId++;
    const website: Website = { ...insertWebsite, id };
    this.websites.set(id, website);
    return website;
  }

  // Analysis operations
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisCurrentId++;
    const analysis: Analysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }
}

export const storage = new MemStorage();

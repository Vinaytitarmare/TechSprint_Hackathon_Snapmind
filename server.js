
import MistralClient from '@mistralai/mistralai';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Initialize Firebase (Placeholder for now)
// You MUST provide a serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS
// For this setup, we will check if SERVICE_ACCOUNT environment variable exists, otherwise warn.

let db;
try {
   // Use resolving path to be safe
   const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
   console.log("🔍 Checking for service account at:", serviceAccountPath);
   
   if (fs.existsSync(serviceAccountPath)) {
       const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
       initializeApp({
           credential: cert(serviceAccount)
       });
       db = getFirestore();
       console.log("🔥 Firebase Admin Initialized successfully.");
   } else {
       console.warn("⚠️  serviceAccountKey.json not found at " + serviceAccountPath);
   }
} catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
}

const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit just in case

// --- FIRECRAWL HELPER ---
async function scrapeWithFirecrawl(url) {
    console.log("🕷️  Starting Firecrawl Scrape for:", url);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("Missing FIRECRAWL_API_KEY");

    try {
        const response = await axios.post(
            'https://api.firecrawl.dev/v1/scrape',
            {
                url: url,
                formats: ['markdown'],
                onlyMainContent: true
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.success && response.data.data) {
            console.log("✅ Firecrawl Scrape Success. Length:", response.data.data.markdown.length);
            return response.data.data; // contains markdown, metadata, etc.
        } else {
            throw new Error("Firecrawl returned unsuccessful response");
        }
    } catch (error) {
        console.error("❌ Firecrawl Error:", error.response?.data || error.message);
        throw error;
    }
}

// --- MISTRAL ANALYSIS ---
async function analyzeContent(text) {
    console.log("🧠 Starting Mistral Analysis...");
    const todaysTimestamp = new Date().toISOString();
    const systemPrompt = `
        You are an expert data analysis engine. Your task is to analyze raw text and extract specific information.
        The output MUST be a valid JSON object and nothing else.
        The JSON object must have these keys: "title", "summary", "keywords" (an array), "emotions" (an array),
        "timestamp" (use ${todaysTimestamp} if none is found), and "source_url" (return null if not found).
    `;

    try {
        const completion = await mistral.chat({
            model: 'mistral-small-latest', 
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this text:\n---\n${text.substring(0, 50000)}... (truncated if too long)\n---` }
            ]
        });

        let jsonResponseText = completion.choices[0].message.content || '{}';
        // Cleanup markdown code blocks if any
        jsonResponseText = jsonResponseText.replace(/```json\n?|```/g, '').trim();
        const data = JSON.parse(jsonResponseText);
        console.log("✅ Mistral Analysis Complete. Emotions:", data.emotions);
        return data;

    } catch (error) {
        console.error("❌ Mistral Analysis Error:", error);
        throw error;
    }
}

// Helper to derive type (matches frontend logic)
function deriveTypeFromUrl(url) {
    if (!url) return 'text';
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('linkedin.com')) return 'linkedin';
    if (u.includes('x.com') || u.includes('twitter.com')) return 'twitter';
    if (u.includes('reddit.com')) return 'reddit';
    if (u.includes('quora.com')) return 'quora';
    if (u.includes('instagram.com')) return 'instagram';
    if (u.includes('github.com')) return 'github';
    if (u.endsWith('.pdf')) return 'pdf';
    return 'article';
}

app.post('/receive_data', async (req, res) => {
    // 1. Accept url, text, title from JSON body
    const { url, text, title } = req.body;
    
    console.log("-----------------------------------------");
    console.log(`📥 Received Request. URL: ${url || 'N/A'}, Title: ${title || 'N/A'}`);
    
    // 2. Validate: Need either URL or Text
    if (!url && !text) {
        return res.status(400).json({ error: "Either URL or text content is required" });
    }

    try {
        let contentToAnalyze = "";
        let finalUrl = url || null;
        let metadata = {};

        // 3. Scrape if URL is present and NOT local
        const isLocal = url && (url.includes('localhost') || url.includes('127.0.0.1'));
        
        if (url && !isLocal) {
            try {
                const scrapeResult = await scrapeWithFirecrawl(url);
                contentToAnalyze = scrapeResult.markdown || "";
                metadata = scrapeResult.metadata || {};
                
                // If text/title was also provided, prepend to scraped content for better context
                if (title || text) {
                    contentToAnalyze = `User Note/Title: ${title} ${text}\n\nScraped Content:\n${contentToAnalyze}`;
                }
            } catch (scrapeErr) {
               console.error("⚠️ Scraping failed, fallback to provided text if available", scrapeErr.message);
               // Fallback: if scrape fails but we have text, use text.
               if (text) {
                   contentToAnalyze = `(Scrape Failed for ${url}) User Note: ${title}\n\n${text}`;
               } else {
                   throw scrapeErr;
               }
            }
        } else {
            // 4. Use provided Text if no URL or if Localhost
            console.log("ℹ️ Skipping Firecrawl for Local/No-URL request. Using provided text.");
            contentToAnalyze = `Title: ${title || 'No Title'}\nContent: ${text || ''}`;
            if (!text && isLocal) contentToAnalyze += "\n(No text content provided for local URL)";
        }

        // 5. Analyze
        const analysisData = await analyzeContent(contentToAnalyze || "No content found");

        // 6. Construct Final Memory
        // User requested to remove unwanted raw data (metadata, full text) from DB storage.
        const finalMemory = {
            ...analysisData,
            title: analysisData.title || title || 'Untitled Memory', // Prefer AI title, fallback to user title
            url: finalUrl, // Storing as 'url' to match frontend MemoryItem interface
            original_url: finalUrl, 
            firecrawl_metadata: "", // Cleared as requested
            full_content: "", // Cleared as requested
            created_at: new Date().toISOString(),
            type: deriveTypeFromUrl(finalUrl) || 'note', 
            favorite: false 
        };

        // 7. Save to Firebase
        if (db) {
            console.log("💾 Saving to Firebase Firestore 'memories'...");
            const docRef = await db.collection('memories').add(finalMemory);
            console.log("✅ Saved to Firebase. ID:", docRef.id);
            res.json({ success: true, id: docRef.id, memory: finalMemory });
        } else {
             console.warn("⚠️  Database not initialized, returning result without saving.");
             res.json({ success: true, memory: finalMemory, warning: "Not saved to DB (Config missing)" });
        }

    } catch (error) {
        console.error("🚨 Process Failed:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 SnapMind Intelligence Service running at http://localhost:${port}`);
});

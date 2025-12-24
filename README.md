# TechSprint_Hackathon
# SnapMind - Your Intelligent Second Brain

## 📥 Downloading the Project from GitHub

### Prerequisites
Before you begin, ensure you have the following installed on your system:
- **Git** - [Download Git](https://git-scm.com/downloads)
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js and npm** - [Download Node.js](https://nodejs.org/)

### Step 1: Clone the Repository
Open your terminal/command prompt and run:

```bash
git clone <GITHUB_REPO_URL>
cd Hack2Skill_gdgc/Rag/Rag
```

*Replace `<GITHUB_REPO_URL>` with the actual GitHub repository URL*

---

## 🚀 Starting the Project

### Backend Setup

#### Step 1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 2: Create Virtual Environment (Recommended)
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Configure Environment Variables
Create a `.env` file in the `backend` directory with the following variables:
```env
# Supabase Configuration
SUPABASE_URL=<your_supabase_url>
SUPABASE_KEY=<your_supabase_key>

# Google Gemini API
GEMINI_API_KEY=<your_gemini_api_key>

# Mistral AI API
MISTRAL_API_KEY=<your_mistral_api_key>

# Optional: Firecrawl API
FIRECRAWL_API_KEY=<your_firecrawl_api_key>
```

#### Step 5: Start the Backend Server
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be running at `http://localhost:8000`

---

### Frontend Extension Setup

#### Step 1: Navigate to Extension Directory
```bash
cd ../extension
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Build the Extension
**For Development:**
```bash
npm run dev
```

**For Production Build:**
```bash
npm run build
```

#### Step 4: Load Extension in Browser

**For Chrome/Edge:**
1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension/dist` folder

**For Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Navigate to `extension/dist` and select `manifest.json`

---

## ✨ SnapMind Features

### 1. 🧠 **Contextual RAG Chat** ("Talk to Page" Engine)
**What it does:**  
Enables intelligent conversations with web content using Retrieval-Augmented Generation (RAG).

**Key Capabilities:**
- **Single-Page Mastery**: Instantly summarize articles, extract specific information, or explain complex content
- **Multi-Page Knowledge Base**: Query your entire saved library across multiple pages
- **Accurate & Grounded**: AI responses are strictly based on actual page content, preventing hallucinations
- **Context-Aware**: The AI reads the page with you, providing relevant answers to your queries

**How it works:**
1. Content is extracted and cleaned from the webpage
2. Content is chunked and embedded into vector representations
3. When you ask a question, relevant paragraphs are retrieved
4. AI constructs answers using only the retrieved context

---

### 2. 👁️ **Visual Intelligence** (Visual Scan)
**What it does:**  
Analyzes images, charts, graphs, and visual regions using Gemini Vision AI.

**Key Capabilities:**
- **Region-Specific Analysis**: Draw a box around any screen region for targeted analysis
- **Visual Data Extraction**: Interpret charts, graphs, tables, and infographics
- **OCR & Understanding**: Extract text and understand visual layouts
- **Perfect for**: Screenshots, complex dashboards, mathematical formulas, UI elements

**Use Cases:**
- Extract data from pricing tables
- Understand trend lines in graphs
- Analyze UI/UX designs
- Capture information from video frames or slides

---

### 3. 🔖 **Intelligent Memory** (AI-Powered Bookmarks)
**What it does:**  
Transforms simple bookmarks into a rich, searchable knowledge base.

**Automated Smart Capture Features:**
- **Smart Titles**: Auto-generates descriptive, searchable titles
- **Executive Summaries**: Creates concise summaries of content
- **Auto-Keywords**: Generates relevant tags for easy filtering
- **Emotion Analysis**: Detects emotional tone (Inspiring, Funny, Academic/Neutral)
- **Mood-Based Organization**: Filter your library by emotional context

**Benefits:**
- Never lose track of important information
- Search using natural language instead of exact keywords
- Organize by mood and context, not just folders

---

### 4. 🔍 **Hybrid Search with Reciprocal Rank Fusion (RRF)**
**What it does:**  
Combines Vector Search and Keyword Search for optimal retrieval accuracy.

**How it works:**
- **Vector Search**: Captures semantic meaning (e.g., "AI coding" matches "Machine Learning programming")
- **Keyword Search (BM25)**: Captures exact terminology and rare words
- **RRF Algorithm**: Intelligently fuses both approaches to surface the most relevant results

**Result:**  
Best-in-class search accuracy that doesn't miss important details

---

### 5. 📚 **Strict Citation Enforcement System**
**What it does:**  
Every AI-generated answer includes verifiable citations to source content.

**Key Features:**
- **Reference IDs**: Invisible block IDs (`[bi-block-12]`) injected into context
- **Clickable Citations**: UI renders citations as clickable links
- **Source Verification**: Users can instantly verify the exact source paragraph
- **Zero Hallucinations**: If information isn't on the page, SnapMind says so

---

### 6. 🧩 **Robust Ingestion Pipeline**
**What it does:**  
Ensures reliable content extraction from any webpage.

**Features:**
- **Firecrawl Integration**: Primary high-fidelity markdown extraction
- **Automatic Fallback**: BeautifulSoup fallback if advanced crawler fails
- **URL Normalization**: Prevents duplicate entries in database
- **Localhost Support**: Works with local development servers
- **Error-Free Experience**: Users never face "Failed to Index" errors

---

### 7. 🎯 **Smart Context Optimization**
**What it does:**  
Optimizes content processing for better AI understanding.

**Features:**
- **Semantic Chunking**: Keeps related ideas together instead of arbitrary splits
- **Token Management**: Efficient context window utilization
- **Lazy Loading**: Heavy models loaded only when necessary
- **Lightweight & Fast**: Responsive for standard queries

---

### 8. 🎨 **Premium User Experience**
**What it does:**  
Delivers a polished, intuitive interface.

**Features:**
- **Side Panel Chat**: Persistent chat alongside browsing
- **Context Menus**: Right-click to "Add to Knowledge Base" or "Ask SnapMind"
- **Visual Overlays**: Interactive region selection for screenshots
- **Dark Mode Dashboard**: Beautiful React-based dashboard
- **Pre-Chat Indexing Gate**: Prevents "I don't know" answers
- **Re-Index Capability**: Update AI knowledge when pages change

---

## 🛠️ Technical Architecture

### Backend
- **Framework**: FastAPI (High-performance Async Python)
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI Models**:
  - **Generation**: Mistral AI (`mistral-small-latest`) & Google Gemini
  - **Embeddings**: Google Gemini (`text-embedding-004`)
  - **Vision**: Google Gemini Vision
- **Search**: Custom Hybrid Search (Vector + Keyword) + RRF

### Frontend
- **Tech Stack**: React 19 + Vite + Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **Markdown Rendering**: React Markdown with syntax highlighting

### API Endpoints
- `POST /ingest` - Intelligence scraping and indexing
- `POST /chat` - Context-aware chat with history
- `POST /chat/stream` - Real-time streaming responses (NDJSON)
- `POST /analyze-image` - Server-side visual processing
- `GET /sites` - Manage indexed knowledge sources

---

## 💡 Why SnapMind?

**The Problem:**  
Information overload - we consume content but retain very little. Traditional bookmarks become "read-later graveyards."

**The Solution:**  
SnapMind is an **active intelligence layer** between you and the web, turning passive consumption into **active knowledge assets**.

**The Result:**  
An extension of your cognition that handles **Storage** (Memory), **Perception** (Visual Scan), and **Processing** (RAG Chat), leaving you free to focus on **Creativity and Application**.

---

## 📞 Support & Documentation

For additional help, refer to:
- `PROJECT_DETAILS.md` - Technical implementation details
- `SnapMind_Product_Overview.md` - Comprehensive product overview
- Backend API documentation at `http://localhost:8000/docs` (when server is running)

---

**Built with ❤️ for intelligent knowledge management**

# MedLens — AI-Powered Clinical Information Intelligence & Reference-Range Engine

MedLens is a client-side clinical information intelligence platform that ingests unstructured patient intake data and complex laboratory diagnostic reports. It structures health data chronologically, computes multi-visit analyte deltas, preserves source reference ranges verbatim, and provides clinician-in-the-loop verification drawers with audit logging.

---

## 🚀 How to Deploy to Vercel

### Method 1: Git Repository (Recommended)
1. Initialize a Git repository in this directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MedLens Clinical Intelligence Platform"
   ```
2. Create a new repository on [GitHub](https://github.com/new) and push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/medlens.git
   git branch -M main
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and click **"Add New Project"** → **"Import Git Repository"**.
4. Select your `medlens` repository and click **Deploy**. Vercel will automatically detect `vercel.json` and serve the application instantly.

### Method 2: Vercel CLI
1. Open PowerShell / terminal in this directory:
   ```bash
   npx vercel
   ```
2. Follow the prompt to link to your Vercel account and select default settings.
3. Deploy to production:
   ```bash
   npx vercel --prod
   ```

### Method 3: Vercel Web Dashboard (Drag & Drop)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Drag and drop the `medlens` folder directly into the browser window to deploy.

---

## 🌟 Key Architecture & Capabilities
1. **Verbatim Reference-Range Engine**: Extracts exact bounds printed on source reports without hallucinating or inventing defaults.
2. **Multi-Panel OCR Processor**: Intelligently extracts CBC, CMP, Lipid, Thyroid, and Metabolic panels from text or uploaded documents.
3. **Multi-Visit Delta Tracking**: Computes chronological analyte progression, trend arrows (`↑`, `↓`, `→`), and status transitions (`normal_to_high`, etc.).
4. **Interactive SVG Sparklines**: Visualizes historical laboratory values across time directly inside clinical data tables.
5. **Human Verification Drawer**: Side-by-side audit view allowing clinicians to Accept, Correct, or Flag extracted fields with complete audit history.
6. **Safety Guardrail Screener**: Enforces clinical safety by rewriting diagnostic claims, medication recommendations, or dosage advice.

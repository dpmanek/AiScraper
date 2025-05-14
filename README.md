# AI Scraper

A full-stack web application that extracts and analyzes content from websites using AI.

## Features

- **Content Extraction**:

  - Upload screenshots for OCR text extraction
  - Enter URLs for web scraping
  - Drag and drop image upload support

- **AI Analysis**:
  - Choose between multiple AI providers (OpenAI GPT and Google Gemini)
  - Summarize extracted content
  - Highlight key information

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **OCR**: Tesseract.js
- **Web Scraping**: Puppeteer
- **AI Integration**: OpenAI API and Google Gemini API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Google Gemini API key (optional)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/aiscraper.git
   cd aiscraper
   ```

2. Install dependencies:

   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the backend directory
   - Add your API keys:
     ```
     PORT=5000
     OPENAI_API_KEY=your_openai_api_key_here
     GEMINI_API_KEY=your_gemini_api_key_here
     DEFAULT_AI_PROVIDER=gemini
     ```

4. Start the application:

   ```
   # Start the backend server
   cd backend
   npm run dev

   # In a separate terminal, start the frontend
   cd frontend
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Choose your input method: Upload Screenshot or Enter URL
2. Upload an image or enter a website URL
3. View the extracted content
4. Select an AI provider for analysis
5. View the AI analysis results
6. Try different AI providers on the same content if desired

## License

MIT

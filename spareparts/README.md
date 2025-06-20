# Spare Parts Identification System

A web application that uses multimodal AI to identify spare parts from photos. This system allows warehouse workers and field technicians to quickly look up material numbers by taking photos of parts.

## Features

- 📸 **Photo Capture**: Take photos using device camera
- 🤖 **AI Recognition**: Multimodal image recognition using LLM
- 🔍 **Smart Search**: Find matching parts from database
- 📱 **Mobile-Friendly**: Responsive design for phones and tablets
- ⚡ **Fast Results**: Quick identification and display of matches

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: FastAPI (Python)
- **AI Model**: Ollama with multimodal capabilities
- **Database**: SQLite for parts storage
- **Styling**: Tailwind CSS

## Quick Start

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Start the Application**
   ```bash
   # Start backend (from backend directory)
   uvicorn main:app --reload
   
   # Start frontend (from frontend directory)
   npm start
   ```

3. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Usage

1. Open the web app on your phone or computer
2. Click "Take Photo" to capture an image of the spare part
3. The AI will analyze the image and search for matches
4. View the list of potential matches with material numbers and images
5. Select the correct match to view detailed information

## Project Structure

```
spareparts/
├── backend/           # FastAPI backend
│   ├── main.py       # Main application
│   ├── models.py     # Database models
│   ├── ai_service.py # AI recognition service
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── data/            # Sample data and images
```

## Configuration

- Set up Ollama with a multimodal model (e.g., llava)
- Configure database with your spare parts inventory
- Adjust AI recognition parameters as needed

## License

MIT License 
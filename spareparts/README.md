# Spare Parts Identification System

A web application that uses multimodal AI to identify spare parts from photos. This system allows warehouse workers and field technicians to quickly look up material numbers by taking photos of parts.

## Features

- 📸 **Photo Capture**: Take photos using device camera
- 🤖 **AI Recognition**: Multimodal image recognition using OpenAI GPT-4o
- 🔍 **Smart Search**: Find matching parts from database
- 📱 **Mobile-Friendly**: Responsive design for phones and tablets
- ⚡ **Fast Results**: Quick identification and display of matches

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: FastAPI (Python)
- **AI Model**: OpenAI GPT-4o API
- **Database**: SQLite for parts storage
- **Styling**: CSS with modern design

## Quick Start

### Option 1: Separate Servers (Recommended)

1. **Get OpenAI API Key**
   ```bash
   # Visit https://platform.openai.com/api-keys to get your API key
   # Or run the setup script:
   python3 setup_openai.py
   ```

2. **Start Backend Server**
   ```bash
   # In one terminal:
   ./start_backend.sh
   ```

3. **Start Frontend Server**
   ```bash
   # In another terminal:
   ./start_frontend.sh
   ```

4. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Option 2: Combined Startup

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your_api_key_here"

# Start both servers together
./start.sh
```

## Manual Setup

If you prefer to set up manually:

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   python sample_data.py
   ```

5. **Start backend server**
   ```bash
   python main.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start frontend server**
   ```bash
   npm start
   ```

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
├── start_backend.sh  # Backend startup script
├── start_frontend.sh # Frontend startup script
└── start.sh         # Combined startup script
```

## Configuration

- Set up OpenAI API key for AI recognition
- Configure database with your spare parts inventory
- Adjust AI recognition parameters as needed

## Cost Considerations

Using OpenAI's GPT-4o API incurs costs:
- **GPT-4o**: ~$0.005-0.015 per image analysis (more cost-effective than GPT-4 Vision)
- **Cost depends on**: Image size, token usage, and API tier
- **Monitoring**: Check your usage at https://platform.openai.com/usage

## Troubleshooting

### Common Issues

1. **"npm start" fails from root directory**
   - Make sure you're in the `frontend` directory: `cd frontend && npm start`
   - Or use the startup scripts: `./start_frontend.sh`

2. **Backend dependency installation fails**
   - Try updating pip: `pip install --upgrade pip`
   - Use the startup script: `./start_backend.sh`
   - Or reinstall dependencies: `cd backend && ./reinstall_deps.sh`

3. **OpenAI API errors**
   - Check your API key is correct
   - Verify you have sufficient credits
   - Run: `python3 setup_openai.py`

4. **Model deprecation errors**
   - The app now uses GPT-4o (latest model)
   - If you see deprecation warnings, restart the backend

## License

MIT License 
# Setup Guide - Spare Parts Identification System

This guide will help you set up and run the AI-powered spare parts identification system.

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 14+** - [Download here](https://nodejs.org/)
- **npm** - Usually comes with Node.js
- **Ollama** - [Installation guide](https://ollama.ai/download)

## Quick Start (Recommended)

1. **Clone or download the project**
   ```bash
   cd spareparts
   ```

2. **Run the startup script**
   ```bash
   ./start.sh
   ```

   This script will:
   - Install all dependencies
   - Set up the database with sample data
   - Start both backend and frontend servers

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Manual Setup

If you prefer to set up manually or the startup script doesn't work:

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

## Ollama Setup (Required for AI Features)

The application uses Ollama for AI-powered image recognition. Follow these steps:

1. **Install Ollama**
   - Visit [ollama.ai](https://ollama.ai/download)
   - Download and install for your operating system

2. **Pull the multimodal model**
   ```bash
   ollama pull llava
   ```

3. **Start Ollama service**
   ```bash
   ollama serve
   ```

4. **Verify installation**
   ```bash
   curl http://localhost:11434/api/tags
   ```

## Usage

### Basic Workflow

1. **Open the application** in your browser at http://localhost:3000

2. **Take a photo** of a spare part:
   - Click "Start Camera" to use your device's camera
   - Or upload an image file

3. **View results** - The AI will analyze the image and show potential matches

4. **Select a match** to view detailed information

### Adding Your Own Parts

You can add your own spare parts to the database:

1. **Via API** (for developers):
   ```bash
   curl -X POST "http://localhost:8000/spare-parts" \
     -H "Content-Type: application/json" \
     -d '{
       "material_number": "YOUR_PART_NUMBER",
       "description": "Part description",
       "category": "Category",
       "manufacturer": "Manufacturer",
       "specifications": "Technical specifications"
     }'
   ```

2. **Via the web interface** - Use the search and management features

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./spareparts.db

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llava

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
```

### Customizing AI Recognition

Edit `backend/ai_service.py` to:
- Change the AI model
- Modify recognition prompts
- Adjust confidence thresholds

## Troubleshooting

### Common Issues

1. **"AI model not available"**
   - Ensure Ollama is running: `ollama serve`
   - Check if llava model is installed: `ollama list`
   - Pull the model: `ollama pull llava`

2. **"Camera not working"**
   - Ensure you're using HTTPS or localhost
   - Check browser permissions for camera access
   - Try uploading an image file instead

3. **"Backend connection failed"**
   - Check if backend is running on port 8000
   - Verify no firewall blocking the port
   - Check backend logs for errors

4. **"Database errors"**
   - Delete `spareparts.db` and restart
   - Run `python sample_data.py` to recreate database

### Logs and Debugging

- **Backend logs**: Check terminal where backend is running
- **Frontend logs**: Open browser developer tools (F12)
- **Ollama logs**: Check `ollama logs` command

## Production Deployment

For production use, consider:

1. **Use a production database** (PostgreSQL, MySQL)
2. **Set up proper authentication**
3. **Use HTTPS**
4. **Configure proper logging**
5. **Set up monitoring and alerts**
6. **Use a production-grade AI service**

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the API documentation at http://localhost:8000/docs
3. Check the logs for error messages
4. Ensure all prerequisites are properly installed

## License

This project is licensed under the MIT License. 
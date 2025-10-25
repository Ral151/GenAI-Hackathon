# GenAI-Hackathon

## 🚀 Overview
MediBot is a comprehensive healthcare solution that leverages advanced AI technologies to assist users in managing their medical conditions and appointments. This project aims to streamline the healthcare experience by providing a user-friendly interface for booking appointments, tracking medical history, and interacting with a chatbot for real-time assistance. This project is made specially for the GenAI Hackathon 2025 in Hong Kong. 

## ✨ Features
- **Interactive Hospital Map**: Visualize all hospitals in Hong Kong on an interactive map.
- **Triage Helper**: Assess the urgency of medical conditions and schedule appointments.
- **Admin Helper**: Manage administrative tasks related to healthcare.
- **Appointment History**: View past appointments and their details.
- **Chatbot History**: Track past interactions with the chatbot.
- **Multi-language Support**: Supports English, Cantonese, and Mandarin.
- **Voice Recognition**: Enable voice-based interactions for a seamless user experience.

## 🛠️ Tech Stack
- **Frontend**: 
  - React
  - Vite
  - TailwindCSS
  - Leaflet
  - i18next & React-i18next
  - React-router & React-router-dom
  - SpeechRecognition API
- **Backend**:
  - FastAPI (for AI service API)
- **Database**:
  - Supabase (PostgreSQL)
- **AI/ML**:
  - Custom AI models for medical assistance (Jupyter Notebook File)
  - remove-markdown for text processing

## 📦 Installation

### Prerequisites
- Node.js (v14 or later)
- Python (v3.8 or later)
- Jupyter Notebook or you can run it in Google Collab as well
- Supabase account

### Quick Start

#### 1. Clone the repository
```bash
git clone https://github.com/Ral151/GenAI-Hackathon.git
cd GenAI-Hackathon
```

#### 2. Frontend Setup
```bash
cd Frontend
npm install
```

#### 3. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Additional packages for API
pip install fastapi uvicorn python-multipart
```

#### 4. Database Configuration
1. Create a Supabase project at https://supabase.com
2. Get your Supabase URL and API key
3. Create the necessary tables (see Database Setup section below)

#### 5. Environment Configuration
Create a `.env` file in the Frontend directory:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🗄️ Database Setup (Supabase)

### Required Tables

#### 1. Users Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text,
  dob date,
  sex text
);
```

#### 2. Appointments Table
```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text,
  dob date,
  sex text,
  id_number text,
  allergies text,
  current_conditions text,
  past_conditions text,
  appointment_date date,
  appointment_time time,
  share_hospital boolean,
  share_emergency boolean,
  created_at timestamp with time zone DEFAULT now()
  preferred_hospital text;
);
```

#### 3. Chat History Table
```sql
CREATE TABLE chatbot_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text,
  sender text,
  timestamp timestamp with time zone DEFAULT now()
  session_id text;
);
```

If an error occurs and says a particular column name does not exist, change the column name into camelCase format, for instance: appointmentDate

## 🔧 Backend API Setup

### Starting the AI Service API
Create a new file `api_server.py`:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import your_ai_model  # Import your AI model from the Jupyter notebook

app = FastAPI(title="MediBot AI API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: str = None
    language: str = "en"

class TriageRequest(BaseModel):
    symptoms: str
    user_id: str = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Process the message using your AI model
        response = your_ai_model.generate_response(
            request.message, 
            request.language
        )
        return {"response": response, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/triage")
async def triage_endpoint(request: TriageRequest):
    try:
        # Assess urgency using your AI model
        assessment = your_ai_model.assess_urgency(request.symptoms)
        return {"assessment": assessment, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "MediBot AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Running the API Server
```bash
python api_server.py
```

The API will be available at `http://localhost:8000`

## 🎯 Usage

### Starting the Application

#### 1. Start the Backend API
```bash
python api_server.py
```

#### 2. Start the Frontend Development Server
```bash
cd Frontend
npm run dev
```

### Basic Usage
1. Open your browser and navigate to `http://localhost:5173`
2. Set up your Supabase configuration in the application
3. Use the interactive map to find hospitals
4. Chat with MediBot for medical assistance
5. Schedule appointments through the triage system

### API Integration Example
```javascript
// Example of calling the AI API from your React components
const fetchAIResponse = async (message) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_AI_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        language: currentLanguage
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error calling AI API:', error);
    return { response: "I'm having trouble connecting right now.", success: false };
  }
};
```

## 📁 Project Structure
```
GenAI-Hackathon/
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── i18n.js
│   │   ├── locales/
│   │   ├── main.jsx
│   │   ├── pages/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── vite.config.js
│   └── .gitignore
├── Backend/
│   ├── api_server.py
│   ├── ai_models/
│   └── requirements.txt
├── MediBot_Version_2.ipynb
├── README.md
└── requirements.txt
```

## 🔌 API Endpoints

### AI Service Endpoints
- `POST /api/chat` - Get AI response for chat messages
- `POST /api/triage` - Assess medical urgency based on symptoms
- `GET /api/health` - Health check endpoint

### Supabase Tables Used
- `users` - User management
- `appointments` - Appointment scheduling and history
- `chat_history` - Storing chat conversations

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd Frontend
npm run build
```

### Backend Deployment
Deploy the FastAPI server to services like:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS EC2

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure the backend API includes proper CORS configuration
2. **Supabase Connection**: Verify your Supabase URL and API keys in the environment variables
3. **AI API Connection**: Check that the backend server is running on the correct port


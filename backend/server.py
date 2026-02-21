from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import aiofiles
import shutil


ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SportWissen Kugelstoßen API")

# Mount uploads directory for serving static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==== MODELS ====

class Phase(BaseModel):
    id: str
    name: str
    order: int
    description: Optional[str] = None

class PhasesData(BaseModel):
    phases: List[Phase]
    correct_order: List[str]

class TechnikMerkmal(BaseModel):
    id: str
    text: str
    image_id: Optional[str] = None

class TechnikBild(BaseModel):
    id: str
    url: str
    alt: str
    correct_merkmale: List[str]
    is_error_image: bool = False
    error_description: Optional[str] = None

class VideoItem(BaseModel):
    id: str
    title: str
    url: str
    thumbnail: Optional[str] = None
    description: Optional[str] = None
    category: str

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_index: int
    explanation: Optional[str] = None

class InfoCard(BaseModel):
    id: str
    title: str
    items: List[str]


# ==== STATIC DATA ====

PHASES_DATA = PhasesData(
    phases=[
        Phase(id="phase_1", name="Ausgangsstellung", order=1, description="Rücken zur Stoßrichtung, Kugel am Hals"),
        Phase(id="phase_2", name="Angleiten", order=2, description="Rückwärtige Bewegung in die Stoßauslage"),
        Phase(id="phase_3", name="Stoßauslage", order=3, description="Momentum des Übergangs vom Angleiten zum Abstoßen"),
        Phase(id="phase_4", name="Stoß", order=4, description="Hauptfunktionsphase"),
    ],
    correct_order=["phase_1", "phase_2", "phase_3", "phase_4"]
)

TECHNIK_MERKMALE = [
    TechnikMerkmal(id="m1", text="Oberkörper 90 Grad zur Stoßrichtung gedreht"),
    TechnikMerkmal(id="m2", text="Druckbein gebeugt"),
    TechnikMerkmal(id="m3", text="Körpergewicht vollständig auf dem Druckbein"),
    TechnikMerkmal(id="m4", text="Kugelhaltung - Oberarm in Verlängerung der Schulterachse"),
    TechnikMerkmal(id="m5", text="Schulterachsenneigung"),
    TechnikMerkmal(id="m6", text="Stemmbein - Druckbein leicht versetzt"),
]

TECHNIK_BILDER = [
    TechnikBild(
        id="b1", 
        url="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
        alt="Professionelle Stoßauslage",
        correct_merkmale=["m1", "m4", "m5"],
        is_error_image=False
    ),
    TechnikBild(
        id="b2",
        url="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400",
        alt="Schüler-Ausführung mit Fehler",
        correct_merkmale=["m2", "m3"],
        is_error_image=True,
        error_description="Oberkörper zu früh aufgerichtet"
    ),
    TechnikBild(
        id="b3",
        url="https://images.unsplash.com/photo-1461896836934- voices?w=400",
        alt="Stoßauslage Seitenansicht",
        correct_merkmale=["m1", "m2", "m6"],
        is_error_image=False
    ),
]

VIDEOS = [
    VideoItem(
        id="v1",
        title="Angleiten - Nachstellschritt",
        url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300",
        description="Das Angleiten mit Nachstellschritt-Technik",
        category="angleiten"
    ),
    VideoItem(
        id="v2",
        title="Angleiten - Impulsschritt",
        url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300",
        description="Das Angleiten mit Impulsschritt-Technik",
        category="angleiten"
    ),
    VideoItem(
        id="v3",
        title="Stoßauslage - Stoß",
        url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300",
        description="Von der Stoßauslage zum Stoß",
        category="stoss"
    ),
    VideoItem(
        id="v4",
        title="Gesamtbewegung (didaktisch reduziert)",
        url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300",
        description="Die Gesamtbewegung in Zeitlupe",
        category="gesamt"
    ),
]

QUIZ_QUESTIONS = [
    QuizQuestion(
        id="q1",
        question="Welche Aussage beschreibt die Stoßauslage korrekt?",
        options=[
            "Seitliche Ausgangsstellung",
            "Körper leicht versetzt zur Stoßrichtung ausrichten",
            "Oberkörper zur Stoßrichtung gedreht",
            "Stemmbein vollständig gestreckt"
        ],
        correct_index=1,
        explanation="In der Stoßauslage ist der Körper leicht versetzt zur Stoßrichtung ausgerichtet."
    ),
    QuizQuestion(
        id="q2",
        question="Was ist das Ziel des Angleitens?",
        options=[
            "Maximale Höhe erreichen",
            "In die optimale Stoßauslage gelangen",
            "Die Kugel beschleunigen",
            "Das Gleichgewicht verlieren"
        ],
        correct_index=1,
        explanation="Das Angleiten dient dazu, in die optimale Stoßauslage zu gelangen."
    ),
]

INFO_CARDS = [
    InfoCard(
        id="ic1",
        title="Wesentliche Aspekte der Stoßauslage",
        items=[
            "Kugelhaltung",
            "Fußaufsatz - Gleichgewicht",
            "Oberkörperdrehung",
            "Gewichtsverlagerung",
            "Schulterachsenneigung",
            "Druckbein",
            "Stemmbein"
        ]
    ),
    InfoCard(
        id="ic2",
        title="Wie gelange ich in die Stoßauslage?",
        items=[
            "Ausgangsstellung",
            "Angleiten",
            "Impulsschritt oder",
            "Nachstellschritt"
        ]
    ),
]


# ==== ROUTES ====

@api_router.get("/")
async def root():
    return {"message": "SportWissen Kugelstoßen API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

@api_router.get("/phases", response_model=PhasesData)
async def get_phases():
    """Get all phases for the drag & drop exercise"""
    return PHASES_DATA

@api_router.get("/technik/merkmale", response_model=List[TechnikMerkmal])
async def get_technik_merkmale():
    """Get all technique characteristics"""
    return TECHNIK_MERKMALE

@api_router.get("/technik/bilder", response_model=List[TechnikBild])
async def get_technik_bilder():
    """Get all technique images"""
    return TECHNIK_BILDER

@api_router.get("/videos", response_model=List[VideoItem])
async def get_videos():
    """Get all videos"""
    return VIDEOS

@api_router.get("/videos/{category}", response_model=List[VideoItem])
async def get_videos_by_category(category: str):
    """Get videos by category"""
    return [v for v in VIDEOS if v.category == category]

@api_router.get("/quiz", response_model=List[QuizQuestion])
async def get_quiz_questions():
    """Get all quiz questions"""
    return QUIZ_QUESTIONS

@api_router.get("/info-cards", response_model=List[InfoCard])
async def get_info_cards():
    """Get info cards"""
    return INFO_CARDS

@api_router.post("/validate-phases")
async def validate_phases(user_order: List[str]):
    """Validate user's phase ordering"""
    is_correct = user_order == PHASES_DATA.correct_order
    return {
        "is_correct": is_correct,
        "correct_order": PHASES_DATA.correct_order if not is_correct else None,
        "message": "Perfekt! Die Reihenfolge stimmt!" if is_correct else "Nicht ganz richtig. Versuche es noch einmal!"
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

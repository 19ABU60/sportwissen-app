from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import aiofiles
import shutil
import jwt
from passlib.context import CryptContext


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

# Auth config
JWT_SECRET = os.environ.get('JWT_SECRET', 'sportwissen-secret-key-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

def safe_hash(password: str) -> str:
    return pwd_context.hash(password[:72])

def safe_verify(password: str, hashed: str) -> bool:
    return pwd_context.verify(password[:72], hashed)

# Admin credentials
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@sport-wissen.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'SportWissen2026!')

async def ensure_admin():
    """Create admin user on startup if not exists"""
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": safe_hash(ADMIN_PASSWORD),
            "name": "Admin",
            "is_active": True,
            "is_admin": True,
            "allowed_apps": ["kugelstoessen", "speakly", "planed"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logging.info(f"Admin user created: {ADMIN_EMAIL}")

@app.on_event("startup")
async def startup_event():
    await ensure_admin()

def create_token(user_id: str, email: str, is_admin: bool = False):
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Nicht autorisiert")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user or not user.get("is_active"):
            raise HTTPException(status_code=401, detail="Account nicht aktiv")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token abgelaufen")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

async def get_admin_user(user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Nur für Administratoren")
    return user

# Mount uploads directory for serving static files (via /api/uploads path)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

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


# ==== MEDIA MODELS ====

class MediaItem(BaseModel):
    id: str
    page: str
    section: str
    media_type: str
    filename: str
    original_name: str
    url: str
    uploaded_at: str
    is_default: bool = False
    thumbnail_url: Optional[str] = None

class MediaUploadResponse(BaseModel):
    success: bool
    media: Optional[MediaItem] = None
    message: str


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

# ==== AUTH ENDPOINTS ====

@api_router.post("/auth/register")
async def register(email: str = Form(...), password: str = Form(...), name: str = Form("")):
    existing = await db.users.find_one({"email": email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert")
    user = {
        "id": str(uuid.uuid4()),
        "email": email.lower(),
        "password_hash": safe_hash(password),
        "name": name or email.split("@")[0],
        "is_active": False,
        "is_admin": False,
        "allowed_apps": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    return {"success": True, "message": "Registrierung erfolgreich! Warten Sie auf die Freischaltung durch den Administrator."}

@api_router.post("/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    user = await db.users.find_one({"email": email.lower()}, {"_id": 0})
    if not user or not safe_verify(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-Mail oder Passwort falsch")
    # Check temporary access expiration first
    access_expires = user.get("access_expires")
    if access_expires:
        try:
            from dateutil.parser import parse as parse_date
            exp = parse_date(access_expires) if isinstance(access_expires, str) else access_expires
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > exp:
                await db.users.update_one({"id": user["id"]}, {"$set": {"is_active": False}})
                raise HTTPException(status_code=403, detail="Ihr Zugang ist abgelaufen. Bitte wenden Sie sich an den Administrator.")
        except HTTPException:
            raise
        except Exception:
            pass
    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="Ihr Account wurde noch nicht freigeschaltet. Bitte warten Sie auf die Freigabe durch den Administrator.")
    # Update last_active
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_active": datetime.now(timezone.utc).isoformat()}})
    token = create_token(user["id"], user["email"], user.get("is_admin", False))
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "is_admin": user.get("is_admin", False),
            "allowed_apps": user.get("allowed_apps", [])
        }
    }

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    # Check temporary access expiration
    access_expires = user.get("access_expires")
    if access_expires:
        from dateutil.parser import parse as parse_date
        try:
            exp = parse_date(access_expires) if isinstance(access_expires, str) else access_expires
            if datetime.now(timezone.utc) > exp.replace(tzinfo=timezone.utc) if exp.tzinfo is None else exp:
                await db.users.update_one({"id": user["id"]}, {"$set": {"is_active": False}})
                raise HTTPException(status_code=403, detail="Ihr Zugang ist abgelaufen.")
        except (ValueError, TypeError):
            pass
    # Update last_active
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_active": datetime.now(timezone.utc).isoformat()}})
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "is_admin": user.get("is_admin", False),
        "allowed_apps": user.get("allowed_apps", [])
    }

# ==== ADMIN ENDPOINTS ====

@api_router.get("/admin/users")
async def list_users(admin=Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return {"users": users}

@api_router.put("/admin/users/{user_id}/activate")
async def activate_user(user_id: str, admin=Depends(get_admin_user)):
    result = await db.users.update_one({"id": user_id}, {"$set": {"is_active": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return {"success": True, "message": "Benutzer freigeschaltet"}

@api_router.put("/admin/users/{user_id}/deactivate")
async def deactivate_user(user_id: str, admin=Depends(get_admin_user)):
    result = await db.users.update_one({"id": user_id}, {"$set": {"is_active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return {"success": True, "message": "Benutzer gesperrt"}

class UpdateAppsRequest(BaseModel):
    apps: List[str]

@api_router.put("/admin/users/{user_id}/apps")
async def update_user_apps(user_id: str, request: UpdateAppsRequest, admin=Depends(get_admin_user)):
    result = await db.users.update_one({"id": user_id}, {"$set": {"allowed_apps": request.apps}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return {"success": True, "message": "App-Zugriff aktualisiert"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    if user.get("is_admin"):
        raise HTTPException(status_code=400, detail="Admin kann nicht gelöscht werden")
    await db.users.delete_one({"id": user_id})
    return {"success": True, "message": "Benutzer gelöscht"}

class ResetPasswordRequest(BaseModel):
    new_password: str

class SetAccessExpiresRequest(BaseModel):
    access_expires: Optional[str] = None  # ISO date string or null to remove

@api_router.put("/admin/users/{user_id}/access-expires")
async def set_access_expires(user_id: str, request: SetAccessExpiresRequest, admin=Depends(get_admin_user)):
    update = {"$set": {"access_expires": request.access_expires}} if request.access_expires else {"$unset": {"access_expires": ""}}
    result = await db.users.update_one({"id": user_id}, update)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    msg = f"Zugang befristet bis {request.access_expires}" if request.access_expires else "Befristung entfernt – unbegrenzter Zugang"
    return {"success": True, "message": msg}

@api_router.put("/admin/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str, request: ResetPasswordRequest, admin=Depends(get_admin_user)):
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Passwort muss mindestens 6 Zeichen lang sein")
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": safe_hash(request.new_password)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return {"success": True, "message": "Passwort wurde zurückgesetzt"}

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@api_router.put("/auth/change-password")
async def change_password(request: ChangePasswordRequest, user=Depends(get_current_user)):
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Neues Passwort muss mindestens 6 Zeichen lang sein")
    if not safe_verify(request.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Aktuelles Passwort ist falsch")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password_hash": safe_hash(request.new_password)}}
    )
    return {"success": True, "message": "Passwort wurde geändert"}

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


# ==== MEDIA ROUTES ====

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/ogg", "application/octet-stream"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB for videos

@api_router.post("/media/upload", response_model=MediaUploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    page: str = Form(...),
    section: str = Form(...),
    is_default: bool = Form(False),
    thumbnail: Optional[UploadFile] = File(None)
):
    """Upload a media file (image or video) for a specific page section"""
    try:
        # Determine media type
        content_type = file.content_type or ""
        filename_lower = (file.filename or "").lower()
        
        if content_type in ALLOWED_IMAGE_TYPES:
            media_type = "image"
        elif content_type in ALLOWED_VIDEO_TYPES or filename_lower.endswith(('.mp4', '.webm', '.mov', '.avi')):
            media_type = "video"
        elif content_type in ALLOWED_IMAGE_TYPES or filename_lower.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            media_type = "image"
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Nicht unterstützter Dateityp: {content_type}. Erlaubt: JPG, PNG, WebP, GIF, MP4, WebM"
            )
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix.lower() or ".jpg"
        unique_filename = f"{page}_{section}_{uuid.uuid4().hex[:8]}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file in chunks (handles large videos)
        async with aiofiles.open(file_path, 'wb') as out_file:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                await out_file.write(chunk)
        
        # Save thumbnail if provided (for videos)
        thumbnail_url = None
        if thumbnail and media_type == "video":
            thumb_filename = f"thumb_{unique_filename.rsplit('.', 1)[0]}.jpg"
            thumb_path = UPLOAD_DIR / thumb_filename
            async with aiofiles.open(thumb_path, 'wb') as out_file:
                while chunk := await thumbnail.read(1024 * 1024):
                    await out_file.write(chunk)
            thumbnail_url = f"/api/uploads/{thumb_filename}"
        
        # Create media record
        media_id = str(uuid.uuid4())
        media_item = {
            "id": media_id,
            "page": page,
            "section": section,
            "media_type": media_type,
            "filename": unique_filename,
            "original_name": file.filename,
            "url": f"/api/uploads/{unique_filename}",
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "is_default": is_default,
            "thumbnail_url": thumbnail_url
        }
        
        # Delete old media for this page/section if exists (replace functionality)
        old_media = await db.media.find_one({"page": page, "section": section})
        if old_media:
            # Delete old file
            old_file_path = UPLOAD_DIR / old_media.get("filename", "")
            if old_file_path.exists():
                old_file_path.unlink()
            # Remove from DB
            await db.media.delete_one({"page": page, "section": section})
        
        # Save to MongoDB
        await db.media.insert_one(media_item)
        
        return MediaUploadResponse(
            success=True,
            media=MediaItem(**media_item),
            message=f"{media_type.capitalize()} erfolgreich hochgeladen!"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload fehlgeschlagen: {str(e)}")


@api_router.get("/media/{page}", response_model=List[MediaItem])
async def get_media_for_page(page: str):
    """Get all media for a specific page"""
    media_list = await db.media.find({"page": page}, {"_id": 0}).to_list(100)
    return media_list


@api_router.get("/media/list/all")
async def get_all_media():
    """Get all media items for the media library"""
    media_list = await db.media.find({}, {"_id": 0}).to_list(1000)
    return {"media": media_list}


@api_router.get("/media/{page}/{section}")
async def get_media_for_section(page: str, section: str):
    """Get media for a specific page section"""
    media = await db.media.find_one({"page": page, "section": section}, {"_id": 0})
    return media


@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str):
    """Delete a media item"""
    media = await db.media.find_one({"id": media_id})
    if not media:
        raise HTTPException(status_code=404, detail="Medium nicht gefunden")
    
    # Delete file
    file_path = UPLOAD_DIR / media.get("filename", "")
    if file_path.exists():
        file_path.unlink()
    
    # Delete thumbnail if exists
    thumb_url = media.get("thumbnail_url", "")
    if thumb_url:
        thumb_filename = thumb_url.split("/")[-1]
        thumb_path = UPLOAD_DIR / thumb_filename
        if thumb_path.exists():
            thumb_path.unlink()
    
    # Remove from DB
    await db.media.delete_one({"id": media_id})
    
    return {"success": True, "message": "Medium erfolgreich gelöscht"}


class CopyMediaRequest(BaseModel):
    source_id: str
    target_page: str
    target_section: str


@api_router.post("/media/copy")
async def copy_media(request: CopyMediaRequest):
    """Copy a media item to a different page/section"""
    # Find source media
    source = await db.media.find_one({"id": request.source_id})
    if not source:
        raise HTTPException(status_code=404, detail="Quell-Medium nicht gefunden")
    
    # Check if target already has media
    existing = await db.media.find_one({
        "page": request.target_page, 
        "section": request.target_section
    })
    
    if existing:
        # Delete existing media at target
        old_file = UPLOAD_DIR / existing.get("filename", "")
        if old_file.exists():
            old_file.unlink()
        await db.media.delete_one({"id": existing["id"]})
    
    # Copy the file
    source_file = UPLOAD_DIR / source.get("filename", "")
    if not source_file.exists():
        raise HTTPException(status_code=404, detail="Quelldatei nicht gefunden")
    
    # Generate new filename
    ext = source_file.suffix
    new_filename = f"{request.target_page}_{request.target_section}_{uuid.uuid4().hex[:8]}{ext}"
    new_file = UPLOAD_DIR / new_filename
    
    shutil.copy2(source_file, new_file)
    
    # Create new media entry
    new_media = {
        "id": str(uuid.uuid4()),
        "page": request.target_page,
        "section": request.target_section,
        "media_type": source.get("media_type", "image"),
        "filename": new_filename,
        "original_name": source.get("original_name", ""),
        "url": f"/api/uploads/{new_filename}",
        "uploaded_at": datetime.now().isoformat(),
        "is_default": False
    }
    
    await db.media.insert_one(new_media)
    
    # Remove _id for response
    new_media.pop("_id", None)
    
    return {"success": True, "media": new_media, "message": "Medium erfolgreich kopiert"}


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

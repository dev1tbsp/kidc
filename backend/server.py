from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr, ConfigDict, BeforeValidator

from email_service import send_quote_notification
from storage_service import upload_image, is_configured as storage_is_configured


# ----- Config -----
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@kidsfeast.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Kids Feast Catering API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ----- Auth helpers -----
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(minutes=60)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ----- Pydantic Models -----
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class AgeGroup(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age_range: str
    description: str
    icon: str = "Cake"
    color: str = "sky"
    order: int = 0


class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str = "Sparkles"
    age_groups: List[str] = []
    image: Optional[str] = None
    order: int = 0


class Package(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tagline: str
    price_per_child: float
    min_guests: int = 10
    features: List[str] = []
    activities: List[str] = []
    popular: bool = False
    color: str = "sky"
    order: int = 0


class SnackBox(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    items: List[str] = []
    image: Optional[str] = None
    order: int = 0


class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_name: str
    child_name: str
    rating: int = 5
    message: str
    image: Optional[str] = None
    event_type: Optional[str] = None
    order: int = 0


class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: Optional[str] = None
    category: str = "party"
    order: int = 0


class QuoteRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_name: str
    email: EmailStr
    phone: str
    event_date: Optional[str] = None
    age_group_id: Optional[str] = None
    age_group_name: Optional[str] = None
    guest_count: int
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    activity_ids: List[str] = []
    snack_box_id: Optional[str] = None
    snack_box_name: Optional[str] = None
    add_on_snack_count: int = 0
    notes: Optional[str] = None
    estimated_total: float = 0
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class QuoteCreate(BaseModel):
    parent_name: str
    email: EmailStr
    phone: str
    event_date: Optional[str] = None
    age_group_id: Optional[str] = None
    age_group_name: Optional[str] = None
    guest_count: int
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    activity_ids: List[str] = []
    snack_box_id: Optional[str] = None
    snack_box_name: Optional[str] = None
    add_on_snack_count: int = 0
    notes: Optional[str] = None
    estimated_total: float = 0


# ----- Helpers -----
async def _fetch_list(collection: str, sort_field: str = "order"):
    items = await db[collection].find({}, {"_id": 0}).sort(sort_field, 1).to_list(1000)
    return items


# ----- AUTH ROUTES -----
@api.post("/auth/login")
async def login(body: LoginRequest, request: Request, response: Response):
    email = body.email.lower().strip()
    # X-Forwarded-For first (multi-IP ingress), else client IP. Throttle by email primarily.
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")
    identifier = f"email:{email}"

    # Brute force check
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        # increment attempts
        count = (attempt.get("count", 0) if attempt else 0) + 1
        update = {"count": count, "ip": ip, "updated_at": datetime.now(timezone.utc).isoformat()}
        if count >= 5:
            update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": {"identifier": identifier, **update}}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # success
    await db.login_attempts.delete_one({"identifier": identifier})
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"id": uid, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")}


@api.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")}


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ----- PUBLIC CONTENT ROUTES -----
@api.get("/age-groups")
async def list_age_groups():
    return await _fetch_list("age_groups")


@api.get("/activities")
async def list_activities():
    return await _fetch_list("activities")


@api.get("/packages")
async def list_packages():
    return await _fetch_list("packages")


@api.get("/snack-boxes")
async def list_snack_boxes():
    return await _fetch_list("snack_boxes")


@api.get("/testimonials")
async def list_testimonials():
    return await _fetch_list("testimonials")


@api.get("/gallery")
async def list_gallery():
    return await _fetch_list("gallery")


@api.get("/site-info")
async def site_info():
    info = await db.site_info.find_one({"_id": "main"}, {"_id": 0})
    return info or {}


# ----- QUOTES -----
@api.post("/quotes")
async def create_quote(body: QuoteCreate):
    # Recompute total server-side to prevent client tampering
    total = 0.0
    if body.package_id:
        pkg = await db.packages.find_one({"id": body.package_id}, {"_id": 0})
        if pkg:
            total += float(pkg["price_per_child"]) * int(body.guest_count)
    if body.snack_box_id and body.add_on_snack_count > 0:
        sb = await db.snack_boxes.find_one({"id": body.snack_box_id}, {"_id": 0})
        if sb:
            total += float(sb["price"]) * int(body.add_on_snack_count)
    payload = body.model_dump()
    payload["estimated_total"] = round(total, 2)
    obj = QuoteRequest(**payload)
    await db.quote_requests.insert_one(obj.model_dump())

    # Fire-and-forget email notification (non-blocking)
    try:
        email_result = await send_quote_notification(obj.model_dump())
        logger.info(f"Quote notification: {email_result}")
    except Exception as e:
        logger.error(f"Quote notification error (non-fatal): {e}")

    return {"id": obj.id, "estimated_total": obj.estimated_total, "status": obj.status}


@api.get("/admin/quotes")
async def list_quotes(_admin: dict = Depends(require_admin)):
    return await db.quote_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api.patch("/admin/quotes/{quote_id}")
async def update_quote_status(quote_id: str, body: dict, _admin: dict = Depends(require_admin)):
    status = body.get("status", "new")
    res = await db.quote_requests.update_one({"id": quote_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"ok": True}


@api.delete("/admin/quotes/{quote_id}")
async def delete_quote(quote_id: str, _admin: dict = Depends(require_admin)):
    await db.quote_requests.delete_one({"id": quote_id})
    return {"ok": True}


# ----- ADMIN CONTENT CRUD -----
def _make_admin_crud(name: str, model_cls):
    @api.post(f"/admin/{name}")
    async def create_item(body: dict, _admin: dict = Depends(require_admin)):
        obj = model_cls(**body)
        await db[name.replace("-", "_")].insert_one(obj.model_dump())
        return obj.model_dump()

    @api.put(f"/admin/{name}/{{item_id}}")
    async def update_item(item_id: str, body: dict, _admin: dict = Depends(require_admin)):
        body.pop("id", None)
        res = await db[name.replace("-", "_")].update_one({"id": item_id}, {"$set": body})
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"{name} not found")
        return {"ok": True}

    @api.delete(f"/admin/{name}/{{item_id}}")
    async def delete_item(item_id: str, _admin: dict = Depends(require_admin)):
        await db[name.replace("-", "_")].delete_one({"id": item_id})
        return {"ok": True}

    return create_item, update_item, delete_item


_make_admin_crud("age-groups", AgeGroup)
_make_admin_crud("activities", Activity)
_make_admin_crud("packages", Package)
_make_admin_crud("snack-boxes", SnackBox)
_make_admin_crud("testimonials", Testimonial)
_make_admin_crud("gallery", GalleryImage)


@api.put("/admin/site-info")
async def update_site_info(body: dict, _admin: dict = Depends(require_admin)):
    body.pop("_id", None)
    await db.site_info.update_one({"_id": "main"}, {"$set": body}, upsert=True)
    return {"ok": True}


# ----- ADMIN: IMAGE UPLOAD (Cloudflare R2) -----
@api.get("/admin/storage-status")
async def storage_status(_admin: dict = Depends(require_admin)):
    return {"configured": storage_is_configured()}


@api.post("/admin/upload/image")
async def upload_admin_image(file: UploadFile = File(...), _admin: dict = Depends(require_admin)):
    if not file.content_type:
        raise HTTPException(status_code=400, detail="Missing file content type")
    try:
        data = await file.read()
        result = await upload_image(data, file.content_type, file.filename or "")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


# ----- STARTUP: indexes + seed -----
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin user seeded.")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Admin password updated.")


async def seed_content():
    if await db.age_groups.count_documents({}) == 0:
        await db.age_groups.insert_many([
            AgeGroup(name="Tiny Tots", age_range="1-3 yrs", description="Soft play, sensory fun & gentle activities for our littlest guests.", icon="Baby", color="pink", order=1).model_dump(),
            AgeGroup(name="Little Stars", age_range="4-6 yrs", description="Magic shows, mascot meet-and-greets and themed adventures.", icon="Sparkles", color="amber", order=2).model_dump(),
            AgeGroup(name="Big Kids", age_range="7-9 yrs", description="Treasure hunts, slime labs, dance-offs and creative crafts.", icon="Rocket", color="sky", order=3).model_dump(),
            AgeGroup(name="Tweens", age_range="10-12 yrs", description="Movie nights, escape rooms and sports-style competitions.", icon="Trophy", color="emerald", order=4).model_dump(),
        ])

    if await db.activities.count_documents({}) == 0:
        await db.activities.insert_many([
            Activity(name="Magic Show", description="An interactive 30-min show by a professional magician.", icon="Wand2", order=1).model_dump(),
            Activity(name="Balloon Twisting", description="Balloon animals & sculptures made on the spot.", icon="PartyPopper", order=2).model_dump(),
            Activity(name="Face Painting", description="Glittery, kid-safe face paints with 20+ designs.", icon="Palette", order=3).model_dump(),
            Activity(name="Treasure Hunt", description="A custom-themed clue trail with prizes.", icon="Map", order=4).model_dump(),
            Activity(name="Slime Lab", description="Hands-on slime making — every kid takes one home.", icon="FlaskConical", order=5).model_dump(),
            Activity(name="Photo Booth", description="Props, backdrop & unlimited instant prints.", icon="Camera", order=6).model_dump(),
        ])

    if await db.packages.count_documents({}) == 0:
        await db.packages.insert_many([
            Package(name="Mini Bash", tagline="Sweet & simple", price_per_child=18, min_guests=10,
                    features=["Themed décor", "Snack box per child", "1 activity host", "Custom cake", "2-hour event"],
                    activities=["Balloon Twisting", "Face Painting"], color="pink", order=1).model_dump(),
            Package(name="Super Party", tagline="Most popular", price_per_child=32, min_guests=12,
                    features=["Premium themed décor", "Hot food + snack box", "2 activity hosts", "Custom cake", "Goodie bags", "3-hour event"],
                    activities=["Magic Show", "Balloon Twisting", "Face Painting", "Photo Booth"],
                    popular=True, color="sky", order=2).model_dump(),
            Package(name="Mega Blast", tagline="The ultimate", price_per_child=49, min_guests=15,
                    features=["Designer décor", "Full catering buffet", "3 activity hosts", "Custom themed cake", "Premium goodie bags", "Photographer", "4-hour event"],
                    activities=["Magic Show", "Treasure Hunt", "Slime Lab", "Photo Booth", "Face Painting", "Balloon Twisting"],
                    color="amber", order=3).model_dump(),
        ])

    if await db.snack_boxes.count_documents({}) == 0:
        await db.snack_boxes.insert_many([
            SnackBox(name="Rainbow Box", description="Cupcake, fruit cup, juice, mini sandwich, chocolate.", price=8,
                     items=["Mini sandwich", "Cupcake", "Fruit cup", "Apple juice", "Chocolate bar"],
                     image="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxraWRzJTIwcGFydHklMjBmb29kJTIwc25hY2tzJTIwY3VwY2FrZXN8ZW58MHx8fHwxNzc5NjE0NzE5fDA&ixlib=rb-4.1.0&q=85",
                     order=1).model_dump(),
            SnackBox(name="Superhero Box", description="Hero-themed wrap, popcorn, juice, cookies, fruit.", price=10,
                     items=["Hero wrap", "Popcorn", "Cookies", "Fruit", "Juice box"],
                     image="https://images.pexels.com/photos/9147799/pexels-photo-9147799.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                     order=2).model_dump(),
            SnackBox(name="Princess Box", description="Tea sandwiches, macarons, fruit skewers, lemonade.", price=12,
                     items=["Tea sandwiches", "Macarons", "Fruit skewers", "Lemonade", "Mini cupcake"],
                     image="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxraWRzJTIwcGFydHklMjBmb29kJTIwc25hY2tzJTIwY3VwY2FrZXN8ZW58MHx8fHwxNzc5NjE0NzE5fDA&ixlib=rb-4.1.0&q=85",
                     order=3).model_dump(),
        ])

    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([
            Testimonial(parent_name="Priya M.", child_name="Aarav (6)", rating=5, event_type="Super Party",
                        message="Best 6th birthday ever! The magic show had every kid on the edge of their seat. Food was fresh, hot and gorgeous.",
                        order=1).model_dump(),
            Testimonial(parent_name="Daniel R.", child_name="Maya (4)", rating=5, event_type="Mini Bash",
                        message="Stress-free from start to finish. The team arrived early, decorated everything beautifully, and the snack boxes were a HUGE hit.",
                        order=2).model_dump(),
            Testimonial(parent_name="Sarah K.", child_name="Leo (8)", rating=5, event_type="Mega Blast",
                        message="The treasure hunt was incredible — they themed it around Leo's favourite book. Worth every penny.",
                        order=3).model_dump(),
            Testimonial(parent_name="Anjali T.", child_name="Tara (3)", rating=5, event_type="Tiny Tots",
                        message="They handled toddlers so gently. The sensory play corner was perfect for that age. We are booking again.",
                        order=4).model_dump(),
        ])

    if await db.gallery.count_documents({}) == 0:
        gallery_urls = [
            ("https://images.unsplash.com/photo-1530104091755-015d31dfa0b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxraWRzJTIwYmlydGhkYXklMjBwYXJ0eSUyMHBsYXlpbmclMjBiYWxsb29uc3xlbnwwfHx8fDE3Nzk2MTQ3MTl8MA&ixlib=rb-4.1.0&q=85", "Balloon fun", "party"),
            ("https://images.unsplash.com/photo-1509666537727-9154b6962292?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxraWRzJTIwYmlydGhkYXklMjBwYXJ0eSUyMHBsYXlpbmclMjBiYWxsb29uc3xlbnwwfHx8fDE3Nzk2MTQ3MTl8MA&ixlib=rb-4.1.0&q=85", "Birthday joy", "party"),
            ("https://images.pexels.com/photos/8422098/pexels-photo-8422098.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "Cake time", "cake"),
            ("https://images.unsplash.com/photo-1627764927037-a4c3b80b6bb7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHw0fHxraWRzJTIwYmlydGhkYXklMjBwYXJ0eSUyMHBsYXlpbmclMjBiYWxsb29uc3xlbnwwfHx8fDE3Nzk2MTQ3MTl8MA&ixlib=rb-4.1.0&q=85", "Game time", "activity"),
            ("https://images.unsplash.com/photo-1486427944299-d1955d23e34d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxraWRzJTIwcGFydHklMjBmb29kJTIwc25hY2tzJTIwY3VwY2FrZXN8ZW58MHx8fHwxNzc5NjE0NzE5fDA&ixlib=rb-4.1.0&q=85", "Cupcake tower", "food"),
            ("https://images.pexels.com/photos/9147799/pexels-photo-9147799.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "Party snacks", "food"),
            ("https://images.pexels.com/photos/4868635/pexels-photo-4868635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "Happy families", "people"),
        ]
        await db.gallery.insert_many([
            GalleryImage(url=u, caption=c, category=cat, order=i).model_dump()
            for i, (u, c, cat) in enumerate(gallery_urls)
        ])

    if await db.site_info.count_documents({"_id": "main"}) == 0:
        await db.site_info.insert_one({
            "_id": "main",
            "brand_name": "Kids Feast Co.",
            "tagline": "Unforgettable Birthday Parties for Tiny Humans",
            "phone": "+1 (555) 123-KIDS",
            "email": "hello@kidsfeast.com",
            "address": "123 Party Lane, Funtown",
            "instagram": "https://instagram.com",
            "facebook": "https://facebook.com",
            "hero_image": "https://images.unsplash.com/photo-1530104091755-015d31dfa0b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxraWRzJTIwYmlydGhkYXklMjBwYXJ0eSUyMHBsYXlpbmclMjBiYWxsb29uc3xlbnwwfHx8fDE3Nzk2MTQ3MTl8MA&ixlib=rb-4.1.0&q=85",
        })


@app.on_event("startup")
async def startup_event():
    try:
        await db.users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
        await db.age_groups.create_index("id", unique=True)
        await db.activities.create_index("id", unique=True)
        await db.packages.create_index("id", unique=True)
        await db.snack_boxes.create_index("id", unique=True)
        await db.testimonials.create_index("id", unique=True)
        await db.gallery.create_index("id", unique=True)
        await db.quote_requests.create_index("id", unique=True)
    except Exception as e:
        logger.warning(f"Index creation issue: {e}")
    await seed_admin()
    await seed_content()


@app.on_event("shutdown")
async def shutdown_event():
    client.close()


@api.get("/")
async def root():
    return {"name": "Kids Feast Catering API", "ok": True}


app.include_router(api)

# CORS - cookie-based auth needs explicit origins
_frontend = os.environ.get("FRONTEND_URL", "")
_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
if _frontend and _frontend not in _origins:
    _origins.append(_frontend)
_origins += ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

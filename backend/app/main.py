from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import Base, engine, get_db
from app.models.user import User
from app.auth import hash_password, verify_password, create_access_token, get_current_user

app = FastAPI(title="csoc_api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    bio: str | None = None
    location: str | None = None
    course: str | None = None
    contact: str | None = None
    interests: str | None = None

@app.get("/")
async def health_check():
    return {"status": "ok"}

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": str(u.id), "username": u.username, "email": u.email} for u in users]

@app.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "location": current_user.location,
        "course": current_user.course,
        "contact": current_user.contact,
        "interests": current_user.interests,
    }

@app.patch("/me")
def update_profile(payload: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.bio:
        current_user.bio = payload.bio
    if payload.location:
        current_user.location = payload.location
    if payload.course:
        current_user.course = payload.course
    if payload.contact:
        current_user.contact = payload.contact
    if payload.interests:
        current_user.interests = payload.interests
    db.commit()
    db.refresh(current_user)
    return {
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "location": current_user.location,
        "course": current_user.course,
        "contact": current_user.contact,
        "interests": current_user.interests,
    }

@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"id": str(db_user.id), "username": db_user.username, "email": db_user.email}

@app.post("/login")
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user.id))
    return {"token": token}
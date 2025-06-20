from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Database URL
DATABASE_URL = "sqlite:///./spareparts.db"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    from models import Base
    Base.metadata.create_all(bind=engine) 
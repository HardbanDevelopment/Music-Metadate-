from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.types import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Example model for analysis history
class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    file_name = Column(String)
    result = Column(JSON)
    timestamp = Column(DateTime)

Base.metadata.create_all(bind=engine)

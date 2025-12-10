from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.types import JSON
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Use SQLAlchemy 2.0 DeclarativeBase instead of deprecated declarative_base
class Base(DeclarativeBase):
    pass


# Example model for analysis history
class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    file_name = Column(String)
    result = Column(JSON)
    timestamp = Column(DateTime)


Base.metadata.create_all(bind=engine)

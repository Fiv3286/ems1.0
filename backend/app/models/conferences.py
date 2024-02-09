from models.base import MongoBaseModelUUID
from typing import List, Optional
from pydantic import Field, BaseModel
from datetime import date


class ConferenceBase(MongoBaseModelUUID):
    year: int = Field(...)
    dates: List[date] = Field(...)
    committees: List[str] = Field(...)


class ConferenceUpdate(BaseModel):
    year: Optional[int] = None
    dates: Optional[List[date]] = None
    committees: Optional[List[str]] = None

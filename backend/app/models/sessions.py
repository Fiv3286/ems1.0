from models.base import MongoBaseModel, MongoBaseModelUUID
from models.program_types import ProgramType
from models.programs import ProgramBase, ProgramUpdate
from typing import List, Optional
from pydantic import EmailStr, Field, BaseModel, validator, HttpUrl
from datetime import date, time


class SessionBase(MongoBaseModelUUID):
    title: Optional[str] = None
    conference: Optional[str] = None
    conference_id: Optional[str] = None
    type: ProgramType = Field(...)
    description: Optional[str] = None
    session_order: int = Field(...)
    day: date = Field(...)
    year: int = Field(...)
    start_time: time = Field(...)
    end_time: time = Field(...)
    duration: int = Field(...)


class SessionView(SessionBase):
    presentations: Optional[List[str]] = None

    class Config:
        schema_extra = {
            "example": {
                "title": "Model Checking I",
                "conference": "TACAS",
                "conference_id": "6aec46ef-856b-4e3c-8815-d24ce8416273",
                "type": "CONFERENCE",
                "description": "description should be seen here",
                "session_order": 1,
                "day": "2023-04-24",
                "year": 2023,
                "start_time": "10:30:00",
                "end_time": "12:30:00",
                "duration": 120,
                "presentations": [
                    "6aec46ef-856b-4e3c-8815-d24ce8416273",
                    "0afedbb9-42c8-4c68-813d-613380932fc0",
                    "261c136f-84fe-407c-be34-a219b273d659",
                    "855354f0-466e-441b-aea8-f5c5d7b48bfb"
                ]
            }
        }


class SessionWithPrograms(SessionBase):
    presentations: Optional[List[ProgramUpdate]]


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    conference: Optional[str] = None
    conference_id: Optional[str] = None
    type: Optional[ProgramType] = None
    description: Optional[str] = None
    session_order: Optional[int] = None
    day: Optional[date] = None
    year: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration: Optional[int] = None
    presentations: Optional[List[str]] = None

    class Config:
        schema_extra = {
            "example": {
                "title": "Model Checking II",
                "conference": "TACAS",
                "type": "CONFERENCE",
                "presentations": [
                    "6aec46ef-856b-4e3c-8815-d24ce8416273",
                    "always include the presentation id's if you want to update them"
                    "0afedbb9-42c8-4c68-813d-613380932fc0"
                ]
            }
        }

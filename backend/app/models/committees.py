from models.base import MongoBaseModelUUID
from models.pcs import PcBase
from typing import List
from pydantic import Field, BaseModel


class CommitteeBase(MongoBaseModelUUID):
    conference: str = Field(...)
    year: int = Field(...)
    slots: int = Field(...)
    members: List[PcBase] = []


class CommitteeUpdate(BaseModel):
    conference: str = Field(...)
    year: int = Field(...)
    slots: int = Field(...)
    members: List[PcBase] = []

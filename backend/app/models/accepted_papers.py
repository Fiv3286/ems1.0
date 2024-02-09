from pydantic import Field
from .base import MongoBaseModelUUID
from typing import Optional, List


class Papers(MongoBaseModelUUID):
    title: str = Field(...)
    authors: str = Field(...)


class AcceptedPapers(MongoBaseModelUUID):
    year: int = Field(...)
    conference: str = Field(...)
    papers: List[Papers] = Field(...)

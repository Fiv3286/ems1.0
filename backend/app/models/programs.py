#from datetime import date, time
from pydantic import EmailStr, Field, BaseModel, validator, HttpUrl
from typing import List, Optional
from .base import MongoBaseModelUUID


class ProgramBase(MongoBaseModelUUID):
    conference: str = Field(..., max_length=20)
    session: str = Field(...)  # topic
    session_id: Optional[str] = None
    title: str = Field(...)  # paper title
    authors: str = Field(...)
    year: int = Field(...)
    day: str = Field(...)
    type: Optional[int] = None                              # type can be removed
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: int = Field(...)  # in minute, eg. 15,30

    '''@validator("title")
    def valid_title(cls):
        try: 
            titles = set(a.title for a in cls.authors)
            if len(titles) <= 1:
                return next(iter(titles))
            else:
                raise InvalidTitleException

        except InvalidTitleException:
            print("Exception occurred: Multiple titles")
'''


class ProgramDB(List[ProgramBase]):
    editor: str = Field(...)  # _id of the user


class ProgramUpdate(MongoBaseModelUUID):
    conference: Optional[str] = None
    session: Optional[str] = None
    session_id: Optional[str] = None
    title: Optional[str] = None
    authors: Optional[str] = None #Optional[List[str]] = None
    year: Optional[int] = None
    day: Optional[str] = None
    type: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[int] = None

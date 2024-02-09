from pydantic import Field, BaseModel, validator, HttpUrl
from .base import MongoBaseModelUUID
from models.pc_status import PcStatus
from email_validator import validate_email, EmailNotValidError
from typing import Optional


class PcBase(MongoBaseModelUUID):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str = Field(...)
    affiliation: str = Field(..., min_length=3)
    country: str = Field(...)
    status: PcStatus = Field(...)

    # status: int = Field(..., min_digits=-1, max_digits=1)

    '''@validator("email")
    def valid_email(cls, v):

        try:
            email = validate_email(v).email
            return email
        except EmailNotValidError as e:

            raise EmailNotValidError'''

    class Config:
        schema_extra = {
            "example": {
                "_id": "a55709b8-b062-49ac-9cb4-09436d17d318",
                "first_name": "First_name",
                "last_name": "Last_name",
                "email": "example@email.com",
                "affiliation": "University of Twente",
                "country": "NL",
            }
        }


class UpdatePcBase(BaseModel):
    _id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    affiliation: Optional[str] = None
    country: Optional[str] = None
    status: Optional[PcStatus]

    class Config:
        schema_extra = {
            "example": {
                "first_name": "modified_name",
                "last_name": "modified_name",
                "email": "differentemail@email.com",
                "country": "NL"
            }
        }

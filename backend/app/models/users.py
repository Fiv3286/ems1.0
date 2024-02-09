from pydantic import EmailStr, Field, BaseModel, validator
from typing import Optional
from email_validator import validate_email, EmailNotValidError
from .base import MongoBaseModel
from .roles import Role


class UserBase(MongoBaseModel):
    username: str = Field(..., min_length=3, max_length=15)
    email: str = Field(...)
    password: str = Field(...)
    role: Role

    @validator("email")
    def valid_email(cls, v):

        try:
            email = validate_email(v).email
            return email
        except EmailNotValidError as e:

            raise EmailNotValidError


    class Config:
        schema_extra = {
            "example": {
                "username": "sandra",
                "email": "sandra@etaps.org",
                "password": "T0t4llyS3cure!P4ssw0rd:-)",
                "role": "admin"
            }
        }


class UserUpdate(MongoBaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Role] = None

    @validator("email")
    def valid_email(cls, v):
        #if cls.email is not None:
        try:
            email = validate_email(v).email
            return email
        except EmailNotValidError as e:

            raise EmailNotValidError

class LoginBase(BaseModel):
    email: str = EmailStr(...)
    password: str = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "email": "sandra@etaps.org",
                "password": "T0t4llyS3cure!P4ssw0rd:-)",
            }
        }


class CurrentUser(BaseModel):
    email: str = EmailStr(...)
    username: str = Field(...)
    role: str = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "username": "sandra",
                "email": "sandra@etaps.org",
                "role": "admin"
            }
        }

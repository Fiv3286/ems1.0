import uuid

from bson import ObjectId

from pydantic import Field, BaseModel


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# Base model that enables to utilize mongo_db object uuid
class MongoBaseModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        json_encoders = {ObjectId: str}


class MongoBaseModelUUID(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias='_id')

    class Config:
        allow_population_by_field_name = True

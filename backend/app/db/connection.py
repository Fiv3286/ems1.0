"""
import logging

from motor.motor_asyncio import AsyncIOMotorClient
#from ..core.config import MONGODB_URL, MAX_CONNECTIONS_COUNT, MIN_CONNECTIONS_COUNT
from . import settings
#from .mongodb import db


async def connect_to_mongo():
    logging.info("Connecting to mongoDB...")
    client = AsyncIOMotorClient(str(settings.DB_URL))
    logging.info("Connected！")
    return client


client = AsyncIOMotorClient(str(settings.DB_URL))
db = client["etapsDB"]

async def close_mongo_connection():
    logging.info("Closing connection...")
    client.close()
    logging.info("Connection closed！")
    
"""


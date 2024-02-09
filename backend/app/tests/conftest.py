import pytest
import pytest_asyncio
import asyncio
import random
################################################################
#from fastapi.testclient import TestClient
from httpx import AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError

# this is to include backend dir in sys.path so that we can import from db,main.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from db import settings

@pytest.fixture(scope="session")
def event_loop():
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    try:
        yield loop
    finally:
        loop.close()
    policy.set_event_loop(loop)

@pytest.fixture(autouse=True, scope="session")
def mongo_client():
    #client = AsyncIOMotorClient("mongodb://localhost:27017")
    client = AsyncIOMotorClient(settings.DB_URL)
    try:
        client.server_info()
    except ServerSelectionTimeoutError:
        pytest.skip("MongoDB server is not available")
    yield client
    client.drop_database("testDB")


@pytest.fixture(autouse=True, scope="session")
def mock_db(mongo_client):
    db = mongo_client["testDB"]
    # Delete specified collections before each test
    collections = ["conferences_sess", "conferences_conf", "programs", "sessions", "committees"]
    for collection in collections:
        db[collection].delete_many({})
    yield db

@pytest_asyncio.fixture(scope="session")
async def test_client(mock_db):
    app.mongodb = mock_db
    async with AsyncClient(app=app, base_url="http://test") as client:
        print("Client is ready")
        yield client

@pytest_asyncio.fixture(scope="function")
async def access_token(test_client):
    # Generate a random number between 0 and 1
    wait_time = random.random()
    
    # Wait for the random amount of time
    await asyncio.sleep(wait_time)

    # Define admin user payload
    payload = {
        "email": "chair@gmail.com",
        "password": "chair123"
    }
    # Make a POST request to the /users/login endpoint with the login payload
    response = await test_client.post("/users/login", json=payload)
    assert response.status_code == 200
    # Get access token
    access_token = response.json()[0]
    headers = {"Authorization": f"Bearer {access_token}"}
    yield headers
    await test_client.post("/users/logout", headers=headers)

@pytest_asyncio.fixture(scope="function")
async def access_token02(test_client):
    # avoid concurrency: in case the test client logs in at the same time in different async functions
    # Generate a random number between 0 and 1
    wait_time = random.random()
    
    # Wait for the random amount of time
    await asyncio.sleep(wait_time)

    # Define admin user payload
    payload = {
        "email": "user@gmail.com",
        "password": "user123"
    }
    # Make a POST request to the /users/login endpoint with the login payload
    response = await test_client.post("/users/login", json=payload)
    # Get access token
    access_token = response.json()[0]
    headers = {"Authorization": f"Bearer {access_token}"}
    yield headers
    await test_client.post("/users/logout", headers=headers)
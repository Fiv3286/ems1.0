from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from motor.motor_asyncio import AsyncIOMotorClient

from db import settings

from routers.users import router as users_router
from routers.programs import router as programs_router
from routers.sessions import router as sessions_router
from routers.conferences import router as conferences_router
from routers.committees import router as committees_router
from routers.exports import router as exports_router
from routers.accepted_papers import router as accepted_papers_router
from core.superuser import superuser


# define origins
origins = [
    "http://127.0.0.1:3000",
    "http://10.10.73.120:3000"
]


# instantiate the app
app = FastAPI()

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
#    allow_origins=origins,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.debug = True

@app.on_event("startup")
async def startup_event():
    print("Connecting to mongoDB...")
    app.mongodb_client = AsyncIOMotorClient(settings.DB_URL)
    app.mongodb = app.mongodb_client[settings.DB_NAME]
    print("Connected！")
    print("Checking for Superuser...")
    status = await superuser(app)
    print(status)


@app.on_event("shutdown")
async def shutdown_event():
    print("Closing connection...")
    app.mongodb_client.close()
    print("Connection closed！")


# List of routers
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(conferences_router, prefix="/conferences", tags=["Conferences"])
app.include_router(committees_router, prefix="/committees", tags=["Committees"])
app.include_router(sessions_router, prefix="/sessions", tags=["Sessions"])
app.include_router(programs_router, prefix="/programs", tags=["Programs"])
app.include_router(exports_router, prefix="/exports", tags=["Exports"])
app.include_router(accepted_papers_router, prefix="/accepted_papers", tags=["Accepted Papers"])




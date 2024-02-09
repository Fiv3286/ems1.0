from authentication import AuthHandler
from models.users import UserBase
from fastapi.encoders import jsonable_encoder





auth_handler = AuthHandler()

SUPERUSER_NAME = 'superuser'
SUPERUSER_EMAIL = 'superuser@etaps.org'
SUPERUSER_PASSWORD = '1heW#46AfI*Psn*kC&'


async def superuser(app):
    uname = await app.mongodb['users'].find_one({"username": SUPERUSER_NAME})
    if uname is None:
        password = auth_handler.get_password_hash(SUPERUSER_PASSWORD)
        user = {
            "username": SUPERUSER_NAME,
            "email": SUPERUSER_EMAIL,
            "password": password,
            "role": "admin"
        }
        user = UserBase(**user)
        insert_user = jsonable_encoder(user)
        create = await app.mongodb["users"].insert_one(insert_user)
        created_user = await app.mongodb["users"].find_one({"_id": create.inserted_id})
        if created_user is not None:
            return "Created Superuser!"
    else:
        return "Superuser already active"

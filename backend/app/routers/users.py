from fastapi import APIRouter, Request, Body, status, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import List
# auth
from authentication import AuthHandler
# db
# from db import connection
# model
from models.users import *

# instantiate the Auth Handler and Router
auth_handler = AuthHandler()
router = APIRouter()

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=412,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# register user
# validate the data and create a user if the username and the email are valid and available


@router.post("/register", response_description="Register user")

async def register(request: Request, newUser: UserBase = Body(...), userId=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    """
    Register a new user with the following fields:
    - **username**: Each user must have a username
    - **email**: Each user must have a valid email
    - **password**: Each user must have a password
    - **role**: Each user must have either the role "admin" or "non-admin" depending on their assigned scope

    The API will return the created user with a status-code = 201 on success
    - NOTE: **this operation can only be performed by admin users**
    """
    # hash the password before inserting it into MongoDB
    user = await request.app.mongodb["users"].find_one({"_id": userId})
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="You are not an admin!")

    newUser.password = auth_handler.get_password_hash(newUser.password)

    newUser = jsonable_encoder(newUser)

    # check existing user or email 409 Conflict:
    if (
            existing_email := await request.app.mongodb["users"].find_one(
                {"email": newUser["email"]}  # ignore issue: "__getitem__" method not defined on type "UserBase"
            )
                              is not None
    ):
        raise HTTPException(
            status_code=409, detail=f"User with email {existing_email} already exists"
        )

    # check existing user or email 409 Conflict:
    if (
            existing_username := await request.app.mongodb["users"].find_one(
                {"username": newUser["username"]}  # ignore issue: "__getitem__" method not defined on type "UserBase"
            )
                                 is not None
    ):
        raise HTTPException(
            status_code=409,
            detail=f"User with username {existing_username} already exists",
        )

    user = await request.app.mongodb["users"].insert_one(newUser)
    created_user = await request.app.mongodb["users"].find_one(
        {"_id": user.inserted_id}
    )

    return JSONResponse(status_code=status.HTTP_201_CREATED,
                        content=created_user)


# post user
@router.post("/login", response_description="Login user")
async def login(request: Request, loginUser: LoginBase = Body(...)) -> JSONResponse:
    """
    Login with the following fields:
    - **email**: a valid user email
    - **password**: the corresponding user password

    The API will return:
    - **status-code = 200** on success
    - **bearer access token**
    - **user role**
    """
    # find the user by email
    user = await request.app.mongodb["users"].find_one({"email": loginUser.email})

    # check password
    if (user is None) or (not auth_handler.verify_password(loginUser.password, user["password"])):
        raise HTTPException(status_code=400, detail="Invalid email and/or password")
    
    token = auth_handler.encode_token(user["_id"], user['role'])
    refresh_token = auth_handler.encode_refresh_token(user["_id"], user['role'])
    res = (token, user['role'])
    # loggedinUser = LoginBase(**user).dict()
    response = JSONResponse(status_code=status.HTTP_200_OK, content=res)
    response.set_cookie(key="refresh_token", value=f"Bearer {refresh_token}", httponly=True, samesite="lax",
                        secure=False)
    return response


@router.post("/logout")

async def logout(request: Request, userId=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    """
    Logout a new user with the refresh token cookie:
    - **refresh_token**: The cookie assigned to the client browser

    The API will:
    - return **status-code = 200** on success
    - **revoke** the token
    - **blacklist** the token
    """
    currentUser = await request.app.mongodb["users"].find_one({"_id": userId})
    if currentUser is None:
         raise CREDENTIALS_EXCEPTION
    # res = (currentUser, {"message": "Token revoked"})
    username = currentUser["username"]
    blacklist = auth_handler.update_blacklist()
    #print(f"blacklist = {blacklist}")

    # revoke access token
    access_token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith("Bearer "):
        access_token = auth_header.split("Bearer ")[1]
    #print(f"access_token = {access_token}")
    access_is_revoked = auth_handler.revoke_token(access_token)  

    # revoke refresh token
    refresh_token = None
    refresh_cookie = request.cookies.get('refresh_token')
    if refresh_cookie and refresh_cookie.startswith("Bearer "):
        refresh_token = refresh_cookie.split("Bearer ")[1]
    if refresh_cookie and refresh_cookie.startswith("%22Bearer%20") and refresh_cookie.endswith('%22'):
        refresh_token = refresh_cookie[12:-3]
    refresh_is_revoked = auth_handler.revoke_token(refresh_token)

    if access_is_revoked > 0 and refresh_is_revoked > 0:
        response = JSONResponse(status_code=status.HTTP_200_OK, content=f"{username} has logged out successfully")
    # response.delete_cookie(key="refresh_token")
        response.set_cookie(key="refresh_token", value=f"", httponly=True, max_age=0, samesite="lax",
                        secure=False)
    else:
        response = JSONResponse(status_code=status.HTTP_409_CONFLICT, content=f"Token is not revoked")
    return response


@router.get('/refresh_token')
async def refresh_token(request: Request) -> JSONResponse:
    """
    Refresh your refresh_token cookie:
    - **refresh_token**: The cookie assigned to the client browser

    The API will:
    - return **status-code = 200** on success
    - **refresh** your token cookie
    """
    refresh_token = None
    refresh_cookie = request.cookies.get('refresh_token')
    if refresh_cookie and refresh_cookie.startswith("Bearer "):
        refresh_token = refresh_cookie.split("Bearer ")[1]
    if refresh_cookie and refresh_cookie.startswith("%22Bearer%20") and refresh_cookie.endswith('%22'):
        refresh_token = refresh_cookie[12:-3]
    #print(f"refresh_token = {refresh_token}")
    new_token, user_id = auth_handler.refresh_token(refresh_token)
    user = await request.app.mongodb["users"].find_one({"_id": user_id})
    res = {'access_token': new_token}
    res['role'] = user['role']
    return JSONResponse(status_code=status.HTTP_200_OK, content=res)


# Ref: Different benchmarking-PyMongo Vs. Motor:
# https://medium.com/fastapi-tutorials/benchmarking-fastapi-and-mongodb-options-277f02a80baa
@router.get("/all", response_description="List of users")
async def get_users(request: Request, userId=Depends(auth_handler.auth_wrapper)) -> List[UserBase]:
    """
    Get all users, requires:
    - **access_token**: In the request header,
    - **refresh_token**: The cookie assigned to the client browser
    - **this operation can only be performed by "admin" users**

    The API will:
    - return **status-code = 200** on success
    - a list of **users**
    """
    user = await request.app.mongodb["users"].find_one({"_id": userId})
    if user['role'] == 'admin':
        request = request.app.mongodb["users"].find()
        user_list = [UserBase(**user) async for user in request]
        return user_list
    raise HTTPException(status_code=403, detail="You are not an admin!")


@router.patch("/{u_id}")
async def update_user_by_id(
        request: Request,
        u_id: str,
        update_user: UserUpdate,
        userId=Depends(auth_handler.auth_wrapper)
) -> UserBase:
    """
    Get all users, requires:
    - **access_token**: In the request header,
    - **refresh_token**: The cookie assigned to the client browser
    - **this operation can only be performed by "admin" users**

    The API will:
    - return **status-code = 200** on success
    - the updated **user** object
    """
    user = await request.app.mongodb["users"].find_one({"_id": userId})
    if user['role'] == 'admin':
        if update_user.password:
            update_user.password = auth_handler.get_password_hash(update_user.password)
        user_to_update = update_user.dict(exclude_unset=True)
        user_to_update = jsonable_encoder(user_to_update)
        update = await request.app.mongodb["users"].update_one({"_id": u_id}, {"$set": user_to_update})
        updated_user = await request.app.mongodb["users"].find_one({"_id": u_id})
        if updated_user is not None:
            return UserBase(**updated_user)
    raise HTTPException(status_code=403, detail="You are not an admin!")


@router.delete("/{u_id}")
async def delete_user_by_id(
        request: Request,
        u_id: str,
        userId = Depends(auth_handler.auth_wrapper)
) -> JSONResponse:
    user = await request.app.mongodb["users"].find_one({"_id": userId})

    user_to_delete = await request.app.mongodb["users"].find_one({"_id": u_id})
    print(user_to_delete)
    if user['role'] == 'admin':
        if user_to_delete is not None:
            delete = await request.app.mongodb["users"].delete_one({"_id": u_id})
            if delete.deleted_count == 1:
                return JSONResponse(status_code=status.HTTP_200_OK, content=f"User: {u_id} has been deleted")
            else:
                raise HTTPException(status_code=404, detail=f"User: {u_id} could not be deleted")
        else:
            raise HTTPException(status_code=404, detail=f"User: {u_id} could not be found")

    raise HTTPException(status_code=403, detail="You are not an admin!")
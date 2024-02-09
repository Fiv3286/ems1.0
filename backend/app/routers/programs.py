from fastapi import APIRouter, Request, Body, status, HTTPException, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import Union, Annotated
from datetime import date, time, datetime
from bson.json_util import dumps

# auth
from authentication import AuthHandler
# model
from models.programs import *
from models.roles import Role

from duplicates import programs_check01

# instantiate the Auth Handler and Router
auth_handler = AuthHandler()
router = APIRouter()

db_name_programs = "programs"


# create new program(s)
@router.post("/", response_description="Add one or more new programs")
async def create_program(
        request: Request,
        programs: List[ProgramUpdate] = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> JSONResponse:
    """
    Create new programs

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Body (a list of Programs each containing):
    - **conference** (optional) that this program is associated with
    - **session** (optional) that this program is associated with
    - **session_id** (optional) of the session this program is associated with
    - **title** (optional) of the program
    - **authors** (optional) belonging to the program
    - **year** (optional) of the program
    - **day** (optional) of the program
    - **type** (optional) of the program [deprecated]
    - **start_time** (optional) of the program
    - **end_time** (optional) of the program
    - **duration** (optional) of the program in minutes

    The API will return:
    - a list of created **program** objects
    - **status-code = 201** on success

    *As can be seen below*
    """
    # check if the user trying to modify is an admin:
    user = await request.app.mongodb["users"].find_one({"_id": userId})

    if user is not None:
        programs = jsonable_encoder(programs)
        for p in programs:
            p["editor"] = userId  # ignore issue: "__setitem__" method not defined on type "ProgramBase"

        # TypeError: object AsyncIOMotorCursor can't be used in 'await' expression
        # Reference: https://motor.readthedocs.io/en/stable/tutorial-asyncio.html#querying-for-more-than-one-document
        new_programs = await request.app.mongodb[db_name_programs].insert_many(programs)
        cursor = request.app.mongodb[db_name_programs].find(
            {"_id": {"$in": new_programs.inserted_ids}}
        )
        created_programs = []
        for p in await cursor.to_list(length=500):
            created_programs.append(p)

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_programs)


# convert str into defined data type in database
def refactor_query(_id, conference, session, session_id, year, title,
                   authors, day, type, start_time,
                   end_time, duration) -> dict:
    query = {}
    if _id != None:
        query["_id"] = _id

    if conference != None:
        query["conference"] = conference

    if session != None:
        query["session"] = session

    if session_id != None:
        query["session_id"] = session_id

    if year != None:
        query["year"] = int(year)

    if title != None:
        query["title"] = title

    if authors != None:
        query["authors"] = authors

    if day != None:
        tmp = datetime.strptime(str(day), "%Y-%m-%d")
        query["day"] = tmp.strftime("%Y-%m-%d")

    if type != None:
        query["type"] = int(type)

    if start_time != None:
        tmp = datetime.strptime(str(start_time), "%H:%M:%S")
        query["start_time"] = tmp.strftime("%H:%M:%S")

    if end_time != None:
        tmp = datetime.strptime(str(end_time), "%H:%M:%S")
        query["end_time"] = tmp.strftime("%H:%M:%S")

    if duration != None:
        query["duration"] = int(duration)

    return query


@router.get("/duplicate", response_description="Get duplicate check by query")
async def get_duplicate(
        request: Request,
        year: str,
        day: str,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Get a list of duplicate objects by parameters

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **year** of the program
    - **day** of the program

    The API will return:
    - a list of created **duplicate** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    user = await request.app.mongodb["users"].find_one({"_id": userId})
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="You are not an admin!")

    query = refactor_query(None, None, None, None, year, None,
                           None, day, None, None,
                           None, None)
    if (search := request.app.mongodb[db_name_programs].find(query)) is not None:
        tmp = await search.to_list(100)
        tmp = dumps(tmp)
        result = programs_check01(tmp)
        # print(f"result = {result}")
        return result

    raise HTTPException(status_code=404, detail="No Programs matching your criteria were found")


@router.get("/", response_description="Get one or more programs")
async def get_program(
        request: Request,
        _id: Annotated[Union[str, None], Query] = None,
        conference: Annotated[Union[str, None], Query] = None,
        session: Annotated[Union[str, None], Query] = None,
        session_id: Annotated[Union[str, None], Query] = None,
        year: Annotated[Union[str, None], Query] = None,
        title: Annotated[Union[str, None], Query] = None,
        authors: Annotated[Union[str, None], Query] = None,
        day: Annotated[Union[str, None], Query] = None,
        type: Annotated[Union[str, None], Query] = None,
        start_time: Annotated[Union[str, None], Query] = None,
        end_time: Annotated[Union[str, None], Query] = None,
        duration: Annotated[Union[str, None], Query] = None,
        userId=Depends(auth_handler.auth_wrapper)
) -> List[ProgramBase]:
    """
    Get a program by query

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Request-query:
    - **id** of the program
    - **conference** (optional) that this program is associated with
    - **session** (optional) that this program is associated with
    - **session_id** (optional) of the session this program is associated with
    - **title** (optional) of the program
    - **authors** (optional) belonging to the program
    - **year** (optional) of the program
    - **day** (optional) of the program
    - **type** (optional) of the program [deprecated]
    - **start_time** (optional) of the program
    - **end_time** (optional) of the program
    - **duration** (optional) of the program in minutes

    The API will return:
    - a list of matching **program** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = refactor_query(_id, conference, session, session_id, year, title,
                           authors, day, type, start_time,
                           end_time, duration)

    full_query = (
        request.app.mongodb[db_name_programs]
        .find(query)
        .sort("_id", -1)
    )

    results = [ProgramBase(**raw_program) async for raw_program in full_query]

    return results


@router.patch("/update", response_description="Update a program by id")
async def update_program(
        request: Request,
        _id: Annotated[Union[str, None], Query] = None,
        program: ProgramUpdate = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Update a program by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **id** of the program

    Body:
    - any fields you want to update
    - do not include the **id** of the program in the body

    The API will return:
    - the updated **program**
    - **status-code = 200** on success

    *As can be seen below*
    """
    # check if the user trying to modify is an admin:
    user = await request.app.mongodb["users"].find_one({"_id": userId})

    query = refactor_query(_id, None, None, None, None, None,
                           None, None, None, None,
                           None, None)

    # check if the prgram(s) is/are owned by the user trying to modify it
    findEditors = await request.app.mongodb[db_name_programs].find(query).distinct("editor")

    if (any(eId != userId for eId in findEditors)) and user["role"] != Role.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only the editor or an admin can update the program"
        )

    exclude_keys = {'id': True}
    await request.app.mongodb[db_name_programs].update_one(
        query, {"$set": program.dict(exclude=exclude_keys, exclude_unset=True)}
    )

    if (program := await request.app.mongodb[db_name_programs].find_one({"_id": _id})) is not None:
        return ProgramDB(**program)

    raise HTTPException(status_code=404, detail=f"Program with {_id} not found")


@router.delete("/", response_description="Delete one or more programs")
async def delete_program(
        request: Request,
        _id: Annotated[Union[str, None], Query] = None,
        conference: Annotated[Union[str, None], Query] = None,
        session: Annotated[Union[str, None], Query] = None,
        session_id: Annotated[Union[str, None], Query] = None,
        year: Annotated[Union[str, None], Query] = None,
        title: Annotated[Union[str, None], Query] = None,
        authors: Annotated[Union[str, None], Query] = None,
        day: Annotated[Union[date, None], Query] = None,
        type: Annotated[Union[str, None], Query] = None,
        start_time: Annotated[Union[time, None], Query] = None,
        end_time: Annotated[Union[time, None], Query] = None,
        duration: Annotated[Union[str, None], Query] = None,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Delete a program by query

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Request-query:
    - **id** (optional) of the program
    - **conference** (optional) that this program is associated with
    - **session** (optional) that this program is associated with
    - **session_id** (optional) of the session this program is associated with
    - **title** (optional) of the program
    - **authors** (optional) belonging to the program
    - **year** (optional) of the program
    - **day** (optional) of the program
    - **type** (optional) of the program [deprecated]
    - **start_time** (optional) of the program
    - **end_time** (optional) of the program
    - **duration** (optional) of the program in minutes

    The API will return:
    - a count of deleted objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = refactor_query(_id, conference, session, session_id, year, title,
                           authors, day, type, start_time,
                           end_time, duration)

    # check if the user trying to modify is an admin:
    user = await request.app.mongodb["users"].find_one({"_id": userId})

    # check if the program is owned by the user trying to delete it
    findEditors = await request.app.mongodb[db_name_programs].find(query).distinct("editor")

    if (any(eId != userId for eId in findEditors)) and user["role"] != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only the admin and editors can delete the program")

    delete_result = await request.app.mongodb[db_name_programs].delete_many(query)

    if delete_result.deleted_count > 0:
        content = f"deletedCount: {delete_result.deleted_count}"
        return JSONResponse(status_code=status.HTTP_200_OK, content=content)

    raise HTTPException(status_code=404, detail=f"Program with {list(query.values())} not found")

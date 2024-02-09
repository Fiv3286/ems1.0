from fastapi import APIRouter, Request, Body, status, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from authentication import AuthHandler
from models.sessions import SessionBase, SessionUpdate, SessionView, SessionWithPrograms
from models.programs import ProgramBase
from models.program_types import ProgramType

from typing import List, Optional, Union
from datetime import date, datetime

# instantiate the Auth Handler and Router
auth_handler = AuthHandler()
router = APIRouter()

db_name_programs = "programs"
db_name_sessions = "sessions"


@router.get("/{s_id}", response_description="Get session by ID")
async def get_session_by_id(
        request: Request,
        s_id: str,
        full: bool = False,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Get a session by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **session_id** the session id

    The API will return:
    - the  **session** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    if (session := await request.app.mongodb[db_name_sessions].find_one({"_id": s_id})) is not None:
        if full:
            program_ids = session['presentations']
            if len(program_ids) > 0:
                query_programs = request.app.mongodb[db_name_programs].find({"_id": {"$in": program_ids}})
                session['presentations'] = [program async for program in query_programs]
                return session
        return session
    raise HTTPException(status_code=404, detail=f"Session with ID: {s_id} not found!")


@router.get("/", response_description="Get all sessions")
async def get_all_sessions(
        request: Request,
        conference: Optional[str] = None,
        conference_id: Optional[str] = None,
        s_type: Optional[ProgramType] = None,
        session_order: Optional[int] = None,
        day: Optional[date] = None,
        year: Optional[int] = date.today().year,
        full: bool = False,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Get a list of sessions by parameters

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **conference** (optional) the name of the conference that the session belongs to, e.g. "TACAS
    - **conference_id** (optional) the conference that the session belongs to
    - **s_type** (optional) the type of session, e.g. "BREAK", "CONFERENCE", "SPEAKER", "PLENARY", "TUTORIAL", "MISC"
    - **session_order** (optional) the order of the session
    - **day** (optional) the day of the session
    - **year** (optional) the year, by default the current year
    - **full** whether to return an array of nested objects or an array of references to IDs of programs, default = False

    The API will return:
    - a list of **session** objects matching the parameters
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = {"year": year}
    if conference:
        query["conference"] = conference
    if conference_id:
        query["conference_id"] = conference_id
    if session_order:
        query["session_order"] = session_order
    if day:
        tmp = datetime.strptime(str(day), "%Y-%m-%d")
        query["day"] = tmp.strftime("%Y-%m-%d")
    if s_type:
        query["type"] = s_type
    full_query = (
        request.app.mongodb[db_name_sessions]
        .find(query)
        .sort("_id", -1)
    )
    results = [raw_session async for raw_session in full_query]
    if full:
        for session in results:
            if len(session["presentations"]) >= 1:
                print(len(session["presentations"]))
                program_ids = session["presentations"]
                query_programs = request.app.mongodb[db_name_programs].find({"_id": {"$in": program_ids}})
                session["presentations"] = [program async for program in query_programs]
                print(session["presentations"])
        return results
    else:
        return results
    raise HTTPException(status_code=404, detail="something went wrong!")


@router.post("/", response_description="Created Session(s) with ID")
async def create_sessions(
        request: Request,
        sessions: List[SessionView] = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> List[SessionView]:
    """
    Create (multiple) session(s)

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Body (*a list of objects containing*):
    - **title** (optional) the title of the session
    - **conference** (optional) the conference this belongs to, e.g. "TACAS"
    - **conference_id** (optional) the id of the conference it belongs to
    - **type** the type of the session, e.g. "CONFERENCE"
    - **description** (optional) the description of the session,
    - **session_order** the order of the session, default = 1,
    - **day** the date of the session
    - **year** the year of the session
    - **start_time** the start time of the session
    - **end_time** the end time of the session
    - **duration** the duration of the session in minutes
    - **presentations** the list of presentation id's that were created, can be empty

    The API will return:
    - a list of created **session** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    # bulk insert the modified sessions (with array of IDs instead of objects)
    sessions_list = jsonable_encoder(sessions)
    new_sessions = await request.app.mongodb[db_name_sessions].insert_many(sessions_list)

    # now we reverse it to return the created session with program_id array, after querying for the program_ids
    # and inserting
    updated_session = request.app.mongodb[db_name_sessions].find({"_id": {"$in": new_sessions.inserted_ids}})
    updated_session = [SessionView(**sess) async for sess in updated_session]

    return updated_session


@router.patch("/{s_id}", response_description="Modified Session JSON")
async def update_session_by_id(
        request: Request,
        s_id: str,
        session: SessionUpdate = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> SessionView:
    """
    Update a session by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **committee_id** the committee id

    Body:
    - any fields you want to update
    - do **not** include the session_id

    The API will return:
    - the updated **session** object
    - **status-code = 200** on success

    *As can be seen below*
    """

    session_to_update = session.dict(exclude_unset=True)

    session_to_update = jsonable_encoder(session_to_update)

    await request.app.mongodb[db_name_sessions].update_one({"_id": s_id}, {"$set": session_to_update})

    results = await request.app.mongodb[db_name_sessions].find_one({"_id": s_id})
    if results is not None:
        return results
    raise HTTPException(status_code=404, detail=f"Session with ID: {s_id} not found")


@router.delete("/{s_id}", response_description="Delete Session by ID")
async def delete_session_by_id(
        request: Request,
        s_id: str,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Delete a session by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **session_id** the committee id

    The API will return:
    - the id of the deleted **session** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    if (session := await request.app.mongodb[db_name_sessions].find_one({"_id": s_id})) is not None:
        del_programs = session['presentations']
        del_programs_res = await request.app.mongodb[db_name_programs].delete_many({"_id": {"$in": del_programs}})
        del_session_res = await request.app.mongodb[db_name_sessions].delete_one({"_id": s_id})
        if del_session_res.deleted_count == 1:
            return JSONResponse(status_code=status.HTTP_200_OK,
                                content=f"session: {del_session_res.deleted_count} has been deleted, /n"
                                        f"programs: {del_programs_res.deleted_count} have been deleted")
    raise HTTPException(status_code=404,
                        detail=f"Session with ID: {s_id} not deleted correctly.")

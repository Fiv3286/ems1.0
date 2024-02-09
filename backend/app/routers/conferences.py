from datetime import date
from typing import Any, List

from fastapi import APIRouter, Request, Body, status, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from authentication import AuthHandler
from models.conferences import ConferenceBase, ConferenceUpdate

from typing import List, Optional

auth_handler = AuthHandler()
router = APIRouter()


@router.get("/sessions/{c_id}")
async def get_session_conference_by_id(
        request: Request,
        c_id: str,
        userId=Depends(auth_handler.auth_wrapper)
) -> ConferenceBase:
    """
    Get a conference related to session creation by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    The API will return:
    - the **conference** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    if (conference := await request.app.mongodb["conferences_sess"].find_one({"_id": c_id})) is not None:
        return conference
    raise HTTPException(status_code=404, detail=f"Conference with ID: {c_id} not found!")


@router.get("/sessions/")
async def get_all_session_conferences(
        request: Request,
        c_id: Optional[str] = None,
        year: Optional[int] = date.today().year,
        userId=Depends(auth_handler.auth_wrapper)

) -> List[ConferenceBase]:
    """
    Get all conferences related to the session creation

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **year** by default the current year
    - **conference_id** (optional) the conference id

    The API will return:
    - a list of  **conference** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = {"year": year}
    if c_id:
        query["_id"]: c_id

    if (search := request.app.mongodb["conferences_sess"].find(query)) is not None:
        results = [ConferenceBase(**raw_conf) async for raw_conf in search]
        return results

    raise HTTPException(status_code=404, detail="No Conferences matching your criteria were found")


@router.post("/sessions/")
async def create_session_conference(
        request: Request,
        conferences: ConferenceBase = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> List[ConferenceBase]:
    """
    Create a conference related to the session creation

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Body:
    - **year** by default the current year
    - **dates** a list of dates the conference will occur
    - **committees* a list of participating committees

    The API will return:
    - a list of  created  **session_conference** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    conference = jsonable_encoder(conferences)

    committee_list = conference['committees']
    replacement_list = []
    if len(committee_list) > 0:
        for committee in committee_list:
            replacement_list.append(committee.upper())
    conference['committees'] = replacement_list
    new_conferences = await request.app.mongodb['conferences_sess'].insert_one(conference)
    created_conferences = request.app.mongodb['conferences_sess'].find({"_id": new_conferences.inserted_id})
    updated_conferences = [ConferenceBase(**conf) async for conf in created_conferences]
    return updated_conferences


@router.patch("/sessions/{c_id}")
async def update_session_conference_by_id(
        request: Request,
        c_id: str,
        conference: ConferenceUpdate = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> ConferenceBase:
    """
    Update a conference related to the session creation

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Body:
    - any fields that you want to update
    - do **not** include the _id

    The API will return:
    - a list of updated  **session_conference** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    conference_to_update = conference.dict(exclude_unset=True)
    conference_to_update = jsonable_encoder(conference_to_update)
    committee_list = conference_to_update['committees']
    replacement_list = []
    if len(committee_list) > 0:
        for committee in committee_list:
            replacement_list.append(committee.upper())
    conference_to_update['committees'] = replacement_list
    update = await request.app.mongodb["conferences_sess"].update_one({"_id": c_id}, {"$set": conference_to_update})

    updated_conference = await request.app.mongodb['conferences_sess'].find_one({"_id": c_id})
    return ConferenceBase(**updated_conference)


@router.delete("/sessions/{c_id}")
async def delete_session_conference_by_id(
        request: Request,
        c_id: str,
        userId=Depends(auth_handler.auth_wrapper)
) -> JSONResponse:
    """
    Delete a conference related to session creation by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    The API will return:
    - the **conference_id** of deleted **conference** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    delete = await request.app.mongodb["conferences_sess"].delete_one({"_id": c_id})
    if delete.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_200_OK, content=f"Conference: {c_id} has been deleted")
    raise HTTPException(status_code=404, detail=f"Conference: {c_id} could not be deleted")


@router.get("/committees/{c_id}")
async def get_committee_conference_by_id(
        request: Request,
        c_id: str,
        userId=Depends(auth_handler.auth_wrapper)
) -> ConferenceBase:
    """
    Get a conference related to committee creation by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    The API will return:
    - the **conference** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    if (conference := await request.app.mongodb["conferences_conf"].find_one({"_id": c_id})) is not None:
        return conference
    raise HTTPException(status_code=404, detail=f"Conference with ID: {c_id} not found!")


@router.get("/committees/")
async def get_all_committee_conferences(
        request: Request,
        c_id: Optional[str] = None,
        year: Optional[int] = date.today().year,
        userId=Depends(auth_handler.auth_wrapper)
) -> List[ConferenceBase]:
    """
    Get all conferences related to the committee creation

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **year** by default the current year
    - **conference_id** (optional) the conference id

    The API will return:
    - a list of  **conference** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = {"year": year}
    if c_id:
        query["_id"]: c_id

    if (search := request.app.mongodb["conferences_conf"].find(query)) is not None:
        results = [ConferenceBase(**raw_conf) async for raw_conf in search]
        return results

    raise HTTPException(status_code=404, detail="No Conferences matching your criteria were found")


@router.post("/committees/")
async def create_committee_conference(
        request: Request,
        conferences: ConferenceBase = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> List[ConferenceBase]:
    """
    Create a conference related to the committee creation

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Body:
    - **year** by default the current year
    - **dates** a list of dates the conference will occur
    - **committees* a list of participating committees

    The API will return:
    - a list of  created  **committee_conference** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    conference = jsonable_encoder(conferences)

    committee_list = conference['committees']
    replacement_list = []
    if len(committee_list) > 0:
        for committee in committee_list:
            replacement_list.append(committee.upper())
    conference['committees'] = replacement_list
    new_conferences = await request.app.mongodb['conferences_conf'].insert_one(conference)
    created_conferences = request.app.mongodb['conferences_conf'].find({"_id": new_conferences.inserted_id})
    updated_conferences = [ConferenceBase(**conf) async for conf in created_conferences]
    return updated_conferences


@router.patch("/committees/{c_id}")
async def update_committee_conference_by_id(
        request: Request,
        c_id: str,
        conference: ConferenceUpdate = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> ConferenceBase:
    """
    Update a conference related to the committee creation

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Body:
    - any fields that you want to update
    - do **not** include the _id

    The API will return:
    - a list of updated  **committee_conference** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    conference_to_update = conference.dict(exclude_unset=True)
    conference_to_update = jsonable_encoder(conference_to_update)
    committee_list = conference_to_update['committees']
    replacement_list = []
    if len(committee_list) > 0:
        for committee in committee_list:
            replacement_list.append(committee.upper())
    conference_to_update['committees'] = replacement_list
    update = await request.app.mongodb["conferences_conf"].update_one({"_id": c_id}, {"$set": conference_to_update})

    updated_conference = await request.app.mongodb['conferences_conf'].find_one({"_id": c_id})
    return ConferenceBase(**updated_conference)


@router.delete("/committees/{c_id}")
async def delete_committee_conference_by_id(
        request: Request,
        c_id: str,
        userId=Depends(auth_handler.auth_wrapper)
) -> JSONResponse:
    """
    Delete a conference related to committee creation by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    The API will return:
    - the **conference_id** of deleted **conference** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    delete = await request.app.mongodb["conferences_conf"].delete_one({"_id": c_id})
    if delete.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_200_OK, content=f"Conference: {c_id} has been deleted")
    raise HTTPException(status_code=404, detail=f"Conference: {c_id} could not be deleted")

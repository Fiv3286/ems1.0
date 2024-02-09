from datetime import date
from typing import Any, List

from fastapi import APIRouter, Request, Body, status, HTTPException, Depends, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from authentication import AuthHandler
from duplicates import committees_check
from models.committees import CommitteeBase, CommitteeUpdate
from models.pcs import UpdatePcBase
from models.pcs import PcBase

from bson.json_util import dumps
from typing import List, Optional

auth_handler = AuthHandler()
router = APIRouter()

"""
convert str into defined data type in database
"""
def refactor_query(c_id, conference, year) -> dict:
    query = {}
    if c_id != None:
        query["_id"] = c_id

    if conference != None:
        query["conference"] = conference

    if year != None:
        query["year"] = int(year)

    return query

# This GET method should be put ahead GET /{c_id} in code, otherwise "duplicate" would be recognized as {c_id}
@router.get("/duplicate", response_description="Get duplicate check by query")
async def get_duplicate(
    request: Request,
    c_id: Optional[str] = None,
    conference: Optional[str] = None,
    year: Optional[str] = None,
    userId=Depends(auth_handler.auth_wrapper)
):
    """
    Get all duplicates in the committees according to the parameters

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **year** (optional) the year of the conference
    - **conference** (optional) the committee, e.g. "ETAPS"
    - **conference_id** (optional) the conference id

    The API will return:
    - a list of  **duplicate** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    user = await request.app.mongodb["users"].find_one({"_id": userId})
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="You are not an admin!")
    
    query = refactor_query(c_id, conference, year)
    if (search := request.app.mongodb["committees"].aggregate([{"$unwind": "$members"}, 
                                                                {"$match": query},
                                                                {"$project": {
                                                                    "_id": 1,
                                                                    "conference": 1,
                                                                    "year": 1,
                                                                    "mid": "$members.id",
                                                                    "mid0": "$members._id",
                                                                    "first_name": "$members.first_name",
                                                                    "last_name": "$members.last_name",
                                                                    "email": "$members.email",
                                                                    "status": "$members.status"
                                                                    }}]
                                                                )) is not None:
        tmp = await search.to_list(100) 
        for d in tmp:
            if 'mid0' in d:
                d['mid'] = d.pop('mid0')

        tmp = dumps(tmp) 
        result = committees_check(tmp)
        return result

    raise HTTPException(status_code=404, detail="No Committees matching your criteria were found")
    

@router.get("/{c_id}")
async def get_committee_by_id(
        request: Request,
        c_id: str,
        userId=Depends(auth_handler.auth_wrapper)
) -> CommitteeBase:
    """
    Get a committee by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **committee_id** the committee id

    The API will return:
    - the  **committee** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    if (committee := await request.app.mongodb["committees"].find_one({"_id": c_id})) is not None:
        return committee
    raise HTTPException(status_code=404, detail=f"Committee with ID: {c_id} not found!")


@router.get("/")
async def get_all_committees(
        request: Request,
        conference: Optional[str] = None,
        c_id: Optional[str] = None,
        year: Optional[int] = date.today().year,
        userId=Depends(auth_handler.auth_wrapper)
) -> List[CommitteeBase]:
    """
    Get a list of committees by parameters

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **committee_id** (optional) the committee id
    - **year** (optional) the year, by default the current year

    The API will return:
    - a list of **committee** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = {"year": year}
    if c_id:
        query["_id"] = c_id
    if conference:
        query["conference"] = conference

    if (search := request.app.mongodb["committees"].find(query)) is not None:
        results = [CommitteeBase(**raw_conf) async for raw_conf in search]
        return results

    raise HTTPException(status_code=404, detail="No Committees matching your criteria were found")

@router.post("/")
async def create_committees(
        request: Request,
        committees: List[CommitteeBase] = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> List[CommitteeBase]:
    """
    Create (multiple) committee(s)

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header

    Body (*a list of objects containing*):
    - **conference** the committee this belongs to
    - **year** the year
    - **slots** total number of available slots
    - **members** a list of members objects, by default can be empty

    The API will return:
    - a list of created **committee** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    committee_list = jsonable_encoder(committees)
    new_committees = await request.app.mongodb['committees'].insert_many(committee_list)
    created_committees = request.app.mongodb['committees'].find({"_id": {"$in": new_committees.inserted_ids}})
    updated_committees = [CommitteeBase(**conf) async for conf in created_committees]
    return updated_committees


@router.patch("/{c_id}")
async def update_committee_by_id(
        request: Request,
        c_id: str,
        committee: CommitteeUpdate = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> Any:
    """
    Update a committee by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **committee_id** the committee id

    Body:
    - any fields you want to update
    - do **not** include the committee_id

    The API will return:
    - the updated **committee** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    committee_to_update = committee.dict(exclude_unset=True)
    committee_to_update = jsonable_encoder(committee_to_update)

    update = await request.app.mongodb["committees"].update_one({"_id": c_id}, {"$set": committee_to_update})
    if update.modified_count == 1:
        updated_committee = await request.app.mongodb['committees'].find_one({"_id": c_id})
        return CommitteeBase(**updated_committee)

    raise HTTPException(status_code=404, detail=f"Patching Committee ID: {c_id} failed!")


@router.patch("/{c_id}/{m_id}")
async def update_committee_member_by_id(
        request: Request,
        c_id: str,
        m_id: str,
        member: UpdatePcBase = Body(...),
        userId=Depends(auth_handler.auth_wrapper)
) -> Any:
    """
    Update a committee member by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **committee_id** the committee id
    - **member_id** the member id

    Body:
    - any member fields you want to update
    - do **not** include the member_id

    The API will return:
    - the id of the updated **committee** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    member_to_update = jsonable_encoder(member)
    update = await request.app.mongodb["committees"].find_one({"_id": c_id})
    new_members = []
    try:
        for the_member in update['members']:
            if '_id' in the_member:
                if the_member['_id'] == m_id:
                    the_member = member_to_update
                    the_member['_id'] = m_id
                new_members.append(the_member)
            elif 'id' in the_member:
                if the_member['id'] == m_id:
                    the_member = member_to_update
                    the_member['_id'] = m_id
                new_members.append(the_member)
        update['members'] = new_members
        result = await request.app.mongodb['committees'].replace_one({"_id": c_id}, update)
        if result.modified_count == 1:
            return JSONResponse(status_code=status.HTTP_200_OK, content=f"Committee: {c_id} has been patched")
    except:
        raise HTTPException(status_code=404, detail=f"Patching Committee ID: {c_id} failed!")



@router.delete("/{c_id}")
async def delete_committee_by_id(
        request: Request,
        c_id: str,
        userId=Depends(auth_handler.auth_wrapper)
) -> JSONResponse:
    """
    Delete a committee by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **committee_id** the committee id

    The API will return:
    - the id of the deleted **committee** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    delete = await request.app.mongodb["committees"].delete_one({"_id": c_id})
    if delete.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_200_OK, content=f"Committee: {c_id} has been deleted")
    raise HTTPException(status_code=404, detail= f"Committee: {c_id} could not be deleted")
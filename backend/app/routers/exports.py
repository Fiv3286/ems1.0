from fastapi import APIRouter, Request, Body, status, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from authentication import AuthHandler

from export_files.schedule_yaml import generate_yaml_format

from typing import List, Optional, Union
from datetime import date

# instantiate the Auth Handler and Router
auth_handler = AuthHandler()
router = APIRouter()


@router.get("/conference")
async def get_conference_yaml(
        request: Request,
        year: Optional[int] = date.today().year,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Get a YAML object in the export format

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **year** (optional) the year, by default the current year

    The API will return:
    - a JSON structure according to the export format to be converted to YAML file in front-end
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = {"year": year}
    request_sessions = request.app.mongodb['sessions'].find(query)
    sessions = [raw_session async for raw_session in request_sessions]
    for session in sessions:
        program_ids = session["presentations"]
        query_programs = request.app.mongodb['programs'].find({"_id": {"$in": program_ids}})
        session["presentations"] = [program async for program in query_programs]

    try:
        struct = generate_yaml_format(sessions)
    except:
        raise HTTPException(status_code=404, detail="Could not re-structure the current conferences")

    return JSONResponse(status_code=status.HTTP_200_OK, content=struct)


@router.get("/committee")
async def get_accepted_committee_csv(
        request: Request,
        year: Optional[int] = date.today().year,
        conference: Optional[str] = None,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Get a string object in the export format

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **year** (optional) the year, by default the current year
    - **conference** (optional) the conference

    The API will return:
    - a string object according to the export format
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = {"year": year}
    if conference:
        query['conference'] = conference

    request = request.app.mongodb['committees'].find(query)
    committees = [comm async for comm in request]
    export_list = []

    for committee in committees:
        for member in committee['members']:
            if member['status'] == 'PENDING':
                first_name = member['first_name'] if len(member['first_name']) > 0 else ""
                last_name = member['last_name'] if len(member['last_name']) > 0 else ""
                email = member['email']
                string = f"\"{first_name}\" \"{last_name}\" {email}"

                export_list.append(string)
    return export_list

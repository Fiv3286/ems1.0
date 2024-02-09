from datetime import date

from fastapi import APIRouter, Request, Body, status, HTTPException, Depends, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from authentication import AuthHandler
from export_files.accepted_papers import parse_accepted_papers
from typing import List, Optional
from models.accepted_papers import Papers, AcceptedPapers

# instantiate the Auth Handler and Router
auth_handler = AuthHandler()
router = APIRouter()


@router.post("/")
async def post_accepted_papers(
        request: Request,
        file: UploadFile,
        year: int,
        conference: str,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Upload the accepted papers HTML File

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **year** the year of the conference to upload this for
    - **conference** the conference that this list belongs to, e.g. "TACAS"

    File:
    - Accepted Papers HTML File exported from the EasyChair website as Multipart/Form-data

    The API will return:
    - **string**  = "inserted new papers"
    - **status-code = 200** on success

    *As can be seen below*
    """
    conference = conference.upper()
    if file.content_type != 'text/html':
        raise HTTPException(status_code=418,
                            detail="The backend expects a text/HTML document!")
    res = parse_accepted_papers(await file.read())
    if len(res) == 0:
        raise HTTPException(status_code=420,
                            detail="The backend failed to extract any data!")

    papers = [Papers(**paper) for paper in res]

    existing_papers = await request.app.mongodb['accepted_papers'].find_one({"conference": conference, "year": year})
    if existing_papers is not None:

        existing_papers['papers'] = jsonable_encoder(papers)

        await request.app.mongodb['accepted_papers'].update_one({"conference": conference, "year": year},
                                                                {"$set": existing_papers})
        return JSONResponse(status_code=status.HTTP_200_OK, content="updated existing papers")
    else:

        accepted_papers = dict()
        accepted_papers['year'] = year
        accepted_papers['conference'] = conference
        accepted_papers['papers'] = papers
        acc_papers_obj = AcceptedPapers(**accepted_papers)
        # convert objects into database format (json)
        acc_papers_obj = jsonable_encoder(acc_papers_obj)
        await request.app.mongodb['accepted_papers'].insert_one(acc_papers_obj)
        return JSONResponse(status_code=status.HTTP_200_OK, content="inserted new papers")


@router.get("/")
async def get_all_accepted_papers(
        request: Request,
        conference: Optional[str] = None,
        year: Optional[int] = date.today().year,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Get a list of accepted papers by parameters

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **conference** (optional) the conference, e.g. "TACAS"
    - **year** (optional) the year, by default the current year

    The API will return:
    - a list of **accepted papers** objects
    - **status-code = 200** on success

    *As can be seen below*
    """
    query = {"year": year}
    if conference:
        query['conference'] = conference
    search = request.app.mongodb['accepted_papers'].find(query)
    if search is not None:
        results = [AcceptedPapers(**ap) async for ap in search]
        return results
    raise HTTPException(status_code=404, detail="No papers matching your criteria were found")


@router.delete("/{ap_id}")
async def delete_accepted_papers(
    request: Request,
    ap_id: str,
    userId=Depends(auth_handler.auth_wrapper)
):
    """
    Delete a list of accepted paper by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **accepted_paper_id** the accepted paper list id

    The API will return:
    - the id of the deleted **accepted paper list** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    delete = await request.app.mongodb["accepted_papers"].delete_one({"_id": ap_id})
    if delete.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_200_OK, content=f"Accepted Papers Object: {ap_id} has been deleted")
    raise HTTPException(status_code=404, detail= f"Accepted Papers Object: {ap_id} could not be deleted")


@router.delete("/{ap_id}/{p_id}")
async def delete_paper_from_accepted_papers(
        request: Request,
        ap_id: str,
        p_id: str,
        userId=Depends(auth_handler.auth_wrapper)
):
    """
    Delete a paper from the list of accepted papers by id

    Request:
    - **refresh_token Cookie** must be included and valid
    - **access_token** must be included in the header
    - **accepted_paper_id** the accepted paper list id
    - **paper id** the paper id

    The API will return:
    - the updated **accepted papers list** object
    - **status-code = 200** on success

    *As can be seen below*
    """
    update = await request.app.mongodb['accepted_papers'].update_one({"_id": ap_id},
                                                                     {"$pull": {"papers":
                                                                                    {"_id": p_id}}
                                                                      })
    if update.modified_count == 1:
        updated_accepted_papers = await request.app.mongodb['accepted_papers'].find_one({"_id": ap_id})
        return AcceptedPapers(**updated_accepted_papers)

    raise HTTPException(status_code=404, detail=f"Failed to delete Paper: {p_id} from Accepted Papers: {ap_id}")
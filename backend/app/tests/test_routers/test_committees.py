import pytest
from httpx import AsyncClient

data = [
{
  "conference": "ESOP",
  "year": 2023,
  "slots": 10,
  "members": [
    {
      "_id": "b3e7d68c-caa5-4f59-988f-dc5f291f77ea",
      "first_name": "Parosh",
      "last_name": "Abdulla",
      "email": "parosh@it.uu.se",
      "affiliation": "Uppsala University",
      "country": "Sweden",
      "status": "ACCEPTED"
    },
    {
      "_id": "9c0992ba-2371-469f-8bf2-17c22c2233c6",
      "first_name": "Elvira",
      "last_name": "Albert",
      "email": "elvira@sip.ucm.es",
      "affiliation": "University of Madrid",
      "country": "Spain",
      "status": "REJECTED"
    }
  ]
},{
  "conference": "FASE",
  "year": 2023,
  "slots": 10,
  "members": [
    {
      "_id": "c189abbe-0cba-4024-a7f6-d2dfc1ea2d39",
      "first_name": "P.",
      "last_name": "Abdulla",
      "email": "parosh@it.uu.se",
      "affiliation": "Uppsala University",
      "country": "Sweden",
      "status": "ACCEPTED"
    },{
      "_id": "9c0992ba-2371-we2f-8bf2-17c22c2233c6",
      "first_name": "John",
      "last_name": "Albert",
      "email": "john-a@sip.ucm.es",
      "affiliation": "University of Madrid",
      "country": "Spain",
      "status": "REJECTED"
    },{
      "_id": "9c0992ba-2371-sd6f-8bf2-17c22c2233c6",
      "first_name": "John",
      "last_name": "Aaseter",
      "email": "john-a@sip.ucm.es",
      "affiliation": "Radboud University",
      "country": "Netherlands",
      "status": "REJECTED"
    }
  ]
},{
  "conference": "TACAS",
  "year": 2023,
  "slots": 10,
  "members": [
    {
      "id": "a512a25d-9bc7-41cb-83ef-c86c71a1bdc1",
      "first_name": "Elvira",
      "last_name": "A.",
      "email": "elvira@sip.ucm.es",
      "affiliation": "University of Madrid",
      "country": "Spain",
      "status": "ACCEPTED"
    },
    {
      "id": "0416f64a-5f75-409b-90b0-ae73e1913820",
      "first_name": "Ahmed",
      "last_name": "Bouajjani",
      "email": "abou@irif.fr",
      "affiliation": "IRIF",
      "country": "France",
      "status": "RESERVED"
    },
    {
      "id": "506389b7-f49a-4b8f-9345-37ab245a876f",
      "first_name": "Ahmed",
      "last_name": "Cimatti",
      "email": "cimatti@fbk.eu",
      "affiliation": "FBK-IRST",
      "country": "Italy",
      "status": "PENDING"
    }
  ]
},{
  "conference": "FOSSACS",
  "year": 2023,
  "slots": 10,
  "members": [
    {
      "_id": "0342658a-dad1-4691-bbaa-22e3586da2ed",
      "first_name": "Ahmed",
      "last_name": "Bouajjani",
      "email": "abou@cs.ru.nl",
      "affiliation": "Radboud University",
      "country": "Netherlands",
      "status": "ACCEPTED"
    },{
      "_id": "9c0wet2ba-2371-sd6f-8bf2-17c22c2233c6",
      "first_name": "Alice",
      "last_name": "Cimatti",
      "email": "cimatti@fbk.eu",
      "affiliation": "FBK-IRST",
      "country": "Italy",
      "status": "REJECTED"
    },{
      "_id": "9c097t2ba-2371-sd6f-8bf2-17c22c2233c6",
      "first_name": "Bwrturt",
      "last_name": "Hetuowte",
      "email": "cimatti@fbk.eu",
      "affiliation": "FBK-IRST",
      "country": "Italy",
      "status": "REJECTED"
    }
  ]
}
]

fake_id = "thisisafakeid1234567"

@pytest.mark.asyncio
async def test_create_committees(test_client: AsyncClient,
                                 access_token: dict):
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert len(response.json()) == 4
    c_id_list = [d['_id'] for d in response.json()]
    assert response.status_code == 200
    #######################################################################
    for c_id in c_id_list:
        response = await test_client.delete(f"/committees/{c_id}", headers=access_token)


@pytest.mark.asyncio
async def test_get_committee_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=data)
    c_id_list = [d['_id'] for d in response.json()]
    c_id0 = c_id_list[0]
    response = await test_client.get(f"/committees/{c_id0}", headers=access_token)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert response.json()["_id"] == c_id0
    #######################################################################
    for c_id in c_id_list:
        response = await test_client.delete(f"/committees/{c_id}", headers=access_token)


@pytest.mark.asyncio
async def test_get_all_committees(test_client: AsyncClient,
                                  access_token: dict):
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=data)
    c_id_list = [d['_id'] for d in response.json()]
    c_id0 = c_id_list[0]
    get_params = {"year": 2023}
    response = await test_client.get("/committees/", headers=access_token, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 4
    #######################################################################
    get_params = {"conference": "TACAS"}
    response = await test_client.get("/committees/", headers=access_token, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    #######################################################################
    get_params = {"c_id": c_id0}
    response = await test_client.get("/committees/", headers=access_token, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    print(f"response = {response.json()}")
    assert len(response.json()) == 1
    #######################################################################
    for c_id in c_id_list:
        await test_client.delete(f"/committees/{c_id}", headers=access_token)


@pytest.mark.asyncio
async def test_get_duplicate(test_client: AsyncClient,
                            access_token: dict,
                            access_token02: dict):
    
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=data)
    c_id_list = [d['_id'] for d in response.json()]
    c_id0 = c_id_list[0]
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    params = {"year": 2023}
    # non_admin does not have permission to check duplicate programs
    response = await test_client.get("/committees/duplicate", headers=access_token02, params=params)
    # Check that the response status code is 403 (you are not an admin)
    assert response.status_code == 403
    #######################################################################
    response = await test_client.get("/committees/duplicate", headers=access_token, params=params)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    assert len(response.json()) == 5
    #######################################################################
    params["c_id"] = c_id0
    response = await test_client.get("/committees/duplicate", headers=access_token, params=params)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    assert response.json() is not None
    #######################################################################
    params = {"conference": "FOSSACS"}
    response = await test_client.get("/committees/duplicate", headers=access_token, params=params)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    assert len(response.json()) == 1
    #######################################################################
    for c_id in c_id_list:
        await test_client.delete(f"/committees/{c_id}", headers=access_token)


@pytest.mark.asyncio
async def test_update_committee_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=data)
    c_id_list = [d['_id'] for d in response.json()]
    c_id0 = c_id_list[0]
    #######################################################################
    comm_to_update = {
        "conference": "ESOP",
        "year": 2023,
        "slots": 10,
        "members": [
            {
            "_id": "b3e7d68c-caa5-4f59-988f-dc5f291f77ea",
            "first_name": "Parosh",
            "last_name": "Abdulla",
            "email": "parosh@it.uu.se",
            "affiliation": "Uppsala University",
            "country": "Sweden",
            "status": "ACCEPTED"
            },
            {
            "_id": "9c0992ba-2371-469f-8bf2-17c22c2233c6",
            "first_name": "Elvira",
            "last_name": "Albert",
            "email": "elvira@sip.ucm.es",
            "affiliation": "University of Madrid",
            "country": "Spain",
            "status": "REJECTED"
            }
        ]
    }
    response = await test_client.patch(f"/committees/{c_id0}", headers=access_token, json=comm_to_update)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    #######################################################################
    response = await test_client.patch(f"/committees/{fake_id}", headers=access_token, json=comm_to_update)
    assert response.status_code == 404
    #######################################################################
    for c_id in c_id_list:
        await test_client.delete(f"/committees/{c_id}", headers=access_token)


@pytest.mark.asyncio
async def test_update_committee_member_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=data)
    c_id_list = [d['_id'] for d in response.json()]
    c_id0 = c_id_list[0]
    m_id1 = response.json()[0]["members"][1]["_id"]
    #######################################################################
    member_to_update = {
      "_id": m_id1,
      "first_name": "Elvira",
      "last_name": "Albert",
      "email": "elvira@sip.ucm.es",
      "affiliation": "University of Madrid",
      "country": "Spain",
      "status": "ACCEPTED"
    }
    response = await test_client.patch(f"/committees/{c_id0}/{m_id1}", headers=access_token, json=member_to_update)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    #######################################################################
    response = await test_client.patch(f"/committees/{fake_id}/{m_id1}", headers=access_token, json=member_to_update)
    assert response.status_code == 404
    #######################################################################
    for c_id in c_id_list:
        await test_client.delete(f"/committees/{c_id}", headers=access_token)


@pytest.mark.asyncio
async def test_delete_committee_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=data)
    c_id_list = [d['_id'] for d in response.json()]
    #######################################################################
    for c_id in c_id_list:
        response = await test_client.delete(f"/committees/{c_id}", headers=access_token)
        assert response.status_code == 200
    #######################################################################
    response = await test_client.delete(f"/committees/{fake_id}", headers=access_token)
    assert response.status_code == 404
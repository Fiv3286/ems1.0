import pytest
from httpx import AsyncClient

# test_get_conference_yaml
#   Post conferences
#   Get conferences _id
# Post the corresponding sessions
# Get sessions _id
# Post a list of programs

# test_get_accepted_committee_csv
#   Post the committees


sess_data = [
    {
    "title": "Machine Learning",
    "conference": "TACAS",
    "conference_id": "abdbbb2c-a859-461c-9302-7c57ac2601ed",
    "type": "CONFERENCE",
    "description": "",
    "session_order": 2,
    "day": "2023-04-24",
    "year": 2023,
    "start_time": "10:30:00",
    "end_time": "12:30:00",
    "duration": 120,
    "presentations": [
        "5b58986c-7fa7-4727-b4b1-25dc6fd2ec39",
        "df4465c9-5d31-47e5-b49d-ee87a067d1eb",
        "e32c9ef9-3336-41f9-8a41-ebce2ea01aa2",
        "5f9d37e4-ad12-4796-a61b-f2c9f0cb99db"
    ]
    },{
        "title": "Model Checking I",
        "conference": "ESOP",
        "conference_id": "abdbbb2c-a859-461c-7685-7c57ac2601ed",
        "type": "CONFERENCE",
        "description": "",
        "session_order": 1,
        "day": "2023-04-25",
        "year": 2023,
        "start_time": "10:30:00",
        "end_time": "12:30:00",
        "duration": 120,
        "presentations": [
            "8d4d058b-c8bf-4023-870e-f6db18b21718",
            "d6abd175-964a-436b-bc12-d95b89f866db",
            "7d2d8421-afd6-45ee-a1a9-d4c3636f8491",
            "95e8dcad-e728-4007-8590-fd7179739d29"
    ]
    }
]

comm_data = [
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


@pytest.mark.asyncio
async def test_get_conference_yaml(test_client: AsyncClient,
                                access_token: dict):
    # Make a POST request to the /sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("/sessions/", headers=access_token, json=sess_data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    s_id_list = [d['_id'] for d in response.json()]

    response = await test_client.get("/exports/conference", headers=access_token)
    assert response.status_code == 200
    #######################################################################
    for s_id in s_id_list:
        await test_client.delete(f"/sessions/{s_id}", headers=access_token)


@pytest.mark.asyncio
async def test_get_accepted_committee_csv(test_client: AsyncClient,
                                access_token: dict):
    # Make a POST request to the /committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/committees/", headers=access_token, json=comm_data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert len(response.json()) == 4
    c_id_list = [d['_id'] for d in response.json()]

    params = {"conference": "FASE"}
    response = await test_client.get("/exports/committee", headers=access_token, params=params)
    assert response.status_code == 200
    #######################################################################
    for c_id in c_id_list:
        response = await test_client.delete(f"/committees/{c_id}", headers=access_token)

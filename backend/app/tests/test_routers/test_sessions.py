import pytest
from httpx import AsyncClient

# Define a user payload
data = [
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

fake_s_id = "thisisafakeid1234567"

@pytest.mark.asyncio
async def test_create_sessions(test_client: AsyncClient,
                                access_token02: dict):
    # Make a POST request to the /sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("/sessions/", headers=access_token02, json=data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    s_id_list = [d['_id'] for d in response.json()]
    assert response.status_code == 200
    #######################################################################
    for s_id in s_id_list:
        await test_client.delete(f"/sessions/{s_id}", headers=access_token02)

@pytest.mark.asyncio
async def test_get_sessions_by_id(test_client: AsyncClient,
                            access_token02: dict):
    # Make a POST request to the /sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("/sessions/", headers=access_token02, json=data)
    s_id_list = [d['_id'] for d in response.json()]
    s_id = s_id_list[0]
    get_params = {"full": True}
    response = await test_client.get(f"/sessions/{s_id}", headers=access_token02, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert response.json() is not None
    #######################################################################
    get_params = {"full": False}
    response = await test_client.get(f"/sessions/{s_id}", headers=access_token02, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert response.json() is not None
    #######################################################################
    response = await test_client.get(f"/sessions/{fake_s_id}", headers=access_token02, params=get_params)
    assert response.status_code == 404
    #######################################################################
    for s_id in s_id_list:
        await test_client.delete(f"/sessions/{s_id}", headers=access_token02)


@pytest.mark.asyncio
async def test_get_all_sessions(test_client: AsyncClient,
                            access_token02: dict):
    # Make a POST request to the /sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("/sessions/", headers=access_token02, json=data)
    s_id_list = [d['_id'] for d in response.json()]
    s_id = s_id_list[0]
    get_params = {"year": 2023, "full": True}
    response = await test_client.get("/sessions/", headers=access_token02, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 2
    #######################################################################
    get_params = {"conference": "TACAS", "full": True}
    response = await test_client.get("/sessions/", headers=access_token02, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    #######################################################################
    get_params = {"conference_id": "abdbbb2c-a859-461c-9302-7c57ac2601ed", "full": True}
    response = await test_client.get("/sessions/", headers=access_token02, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    #######################################################################
    get_params = {"session_order": 1, "full": True}
    response = await test_client.get("/sessions/", headers=access_token02, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    #######################################################################
    get_params = {"day": "2023-04-25", "full": True}
    response = await test_client.get("/sessions/", headers=access_token02, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    #######################################################################
    for s_id in s_id_list:
        await test_client.delete(f"/sessions/{s_id}", headers=access_token02)


@pytest.mark.asyncio
async def test_update_session_by_id(test_client: AsyncClient,
                            access_token02: dict):
    # Make a POST request to the /sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("/sessions/", headers=access_token02, json=data)
    s_id_list = [d['_id'] for d in response.json()]
    s_id = s_id_list[0]
    session_to_update = {
        "title": "Machine Learning",
        "conference": "TACAS",
        "conference_id": "abdbbb2c-a859-461c-9302-7c57ac2601ed",
        "type": "CONFERENCE",
        "description": "",
        "session_order": 2,
        "day": "2023-04-24",
        "year": 2023,
        "start_time": "15:30:00",
        "end_time": "17:30:00",
        "duration": 120,
        "presentations": [
            "5b58986c-7fa7-4727-b4b1-25dc6fd2ec39",
            "df4465c9-5d31-47e5-b49d-ee87a067d1eb",
            "e32c9ef9-3336-41f9-8a41-ebce2ea01aa2",
            "5f9d37e4-ad12-4796-a61b-f2c9f0cb99db"
        ]
    }
    response = await test_client.patch(f"/sessions/{s_id}", headers=access_token02, json=session_to_update)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    #######################################################################
    response = await test_client.patch(f"/sessions/{fake_s_id}", headers=access_token02, json=session_to_update)
    assert response.status_code == 404
    #######################################################################
    for s_id in s_id_list:
        await test_client.delete(f"/sessions/{s_id}", headers=access_token02)



@pytest.mark.asyncio
async def test_delete_session_by_id(test_client: AsyncClient,
                            access_token02: dict):
    # Make a POST request to the /sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("/sessions/", headers=access_token02, json=data)
    s_id_list = [d['_id'] for d in response.json()]
    for s_id in s_id_list:
        response = await test_client.delete(f"/sessions/{s_id}", headers=access_token02)
        # Check that the response status code is 200 (OK)
        assert response.status_code == 200
    #######################################################################
    response = await test_client.delete(f"/sessions/{fake_s_id}", headers=access_token02)
    assert response.status_code == 404


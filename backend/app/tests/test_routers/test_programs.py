import pytest
from httpx import AsyncClient

# Define a user payload
data = [{
    "conference": "TACAS",
    "session": "Model Checking I",
    "session_id": "fa258b98-ef37-4c7c-ab9a-8b6f993dc2dc",
    "title": " Bounded Model Checking for Asynchronous Hyperproperties ",
    "authors": "T. Hsu, B. Bonakdarpour, B. Finkbeiner, C. Sanchez",
    "year": 2023,
    "day": "2023-04-24",
    "type": 1,
    "start_time": "08:30:00",
    "end_time": "09:00:00",
    "duration": 30
}, {
    "conference": "ESOP",
    "session": "Static Analysis ",
    "session_id": "029b58d2-7317-40ab-bff3-57319bb25d25",
    "title": "Logics for extensional, locally complete analysis via domain refinements",
    "authors": "Flavio Ascari, Bob Bonakdarpour, Roberto Bruni and Roberta Gori ",
    "year": 2023,
    "day": "2023-04-24",
    "type": 1,
    "start_time": "09:30:00",
    "end_time": "11:00:00",
    "duration": 90
}, {
    "conference": "FOSSACS",
    "session": "Programming Languages ",
    "session_id": "85753110-5ee6-4e8c-8a74-53a114835b7d",
    "title": "When programs have to watch the paint dry ",
    "authors": "Danel Ahman and Daniel Hirschkoff",
    "year": 2023,
    "day": "2023-04-24",
    "type": 1,
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "duration": 60
}
]

@pytest.mark.asyncio
async def test_create_programs(test_client: AsyncClient,
                        access_token02: dict):
    # Make a POST request to the /programs endpoint with the non_admin authorization headers and data
    response = await test_client.post("/programs/", headers=access_token02, json=data)
    # Check that the response status code is 201 (Created)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 201
    #######################################################################
    del_params = {"year": 2023}
    await test_client.delete("/programs/", headers=access_token02, params=del_params)

@pytest.mark.asyncio
async def test_get_programs(test_client: AsyncClient,
                            access_token02: dict):
    # Make a POST request to the /programs endpoint with the non_admin authorization headers and data
    await test_client.post("/programs/", headers=access_token02, json=data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    params = {"year": 2023}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 3
    #######################################################################
    params = {"conference": "ESOP"}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["conference"] == "ESOP"
    #######################################################################
    params = {"session": "Model Checking I"}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["session"] == "Model Checking I"
    #######################################################################
    params = {"session_id": "85753110-5ee6-4e8c-8a74-53a114835b7d"}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["session_id"] == "85753110-5ee6-4e8c-8a74-53a114835b7d"
    #######################################################################
    params = {"title": "When programs have to watch the paint dry "}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "When programs have to watch the paint dry "
    #######################################################################
    params = {"authors": "Danel Ahman and Daniel Hirschkoff"}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["authors"] == "Danel Ahman and Daniel Hirschkoff"
    #######################################################################
    params = {"type": 1}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 3
    #######################################################################
    params = {"start_time": "09:30:00"}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["start_time"] == "09:30:00"
    #######################################################################
    params = {"end_time": "11:00:00"}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 2
    #######################################################################
    params = {"duration": 60}
    response = await test_client.get("/programs/", headers=access_token02, params=params)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["duration"] == 60
    #######################################################################
    params = {"year": 2023}
    await test_client.delete("/programs/", headers=access_token02, params=params)


@pytest.mark.asyncio
async def test_get_duplicate(test_client: AsyncClient,
                            access_token: dict,
                            access_token02: dict):
    
    # Define a user payload
    data = [{
        "conference": "TACAS",
        "session": "Model Checking I",
        "session_id": "fa258b98-ef37-4c7c-ab9a-8b6f993dc2dc",
        "title": " Bounded Model Checking for Asynchronous Hyperproperties ",
        "authors": "T. Hsu, B. Bonakdarpour, B. Finkbeiner, C. Sanchez",
        "year": 2022,
        "day": "2022-04-24",
        "type": 1,
        "start_time": "10:30:00",
        "end_time": "11:00:00",
        "duration": 30
    }, {
        "conference": "ESOP",
        "session": "Static Analysis ",
        "session_id": "029b58d2-7317-40ab-bff3-57319bb25d25",
        "title": "Logics for extensional, locally complete analysis via domain refinements",
        "authors": "Flavio Ascari, Bob Bonakdarpour, Roberto Bruni and Roberta Gori ",
        "year": 2022,
        "day": "2022-04-24",
        "type": 1,
        "start_time": "10:45:00",
        "end_time": "11:15:00",
        "duration": 30
    }, {
        "conference": "FOSSACS",
        "session": "Programming Languages ",
        "session_id": "85753110-5ee6-4e8c-8a74-53a114835b7d",
        "title": "When programs have to watch the paint dry ",
        "authors": "R. Gori, Danel Ahman and Daniel Hirschkoff",
        "year": 2022,
        "day": "2022-04-24",
        "type": 1,
        "start_time": "10:30:00",
        "end_time": "11:00:00",
        "duration": 30
    }
    ]
    # Make a POST request to the /programs endpoint with the non_admin authorization headers and data
    await test_client.post("/programs/", headers=access_token, json=data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    params = {"year": 2022, "day": "2022-04-24"}
    # non_admin does not have permission to check duplicate programs
    response = await test_client.get("/programs/duplicate", headers=access_token02, params=params)
    # Check that the response status code is 403 (you are not an admin)
    assert response.status_code == 403
    #######################################################################
    response = await test_client.get("/programs/duplicate", headers=access_token, params=params)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    assert len(response.json()) == 2
    #######################################################################
    await test_client.delete("/programs/", headers=access_token, params=params)
    
@pytest.mark.asyncio
async def test_update_programs(test_client: AsyncClient,
                            access_token: dict,
                            access_token02: dict):
    
    # Define a user payload
    data = [{
        "conference": "TACAS",
        "session": "Model Checking I",
        "session_id": "fa258b98-ef37-4c7c-ab9a-8b6f993dc2dc",
        "title": " Bounded Model Checking for Asynchronous Hyperproperties ",
        "authors": "T. Hsu, B. Bonakdarpour, B. Finkbeiner, C. Sanchez",
        "year": 2022,
        "day": "2022-04-24",
        "type": 1,
        "start_time": "10:30:00",
        "end_time": "11:00:00",
        "duration": 30
    }
    ]
    # Make a POST request to the /programs endpoint with the non_admin authorization headers and data
    response = await test_client.post("/programs/", headers=access_token, json=data)
    p_id = response.json()[0]["_id"]
    params = {"_id": p_id}
    data = {
        "conference": "TACAS",
        "session": "Model Checking I",
        "session_id": "fa258b98-ef37-4c7c-ab9a-8b6f993dc2dc",
        "title": " Bounded Model Checking for Asynchronous Hyperproperties ",
        "authors": "T. Hsu, B. Bonakdarpour, B. Finkbeiner, C. Sanchez",
        "year": 2022,
        "day": "2022-04-24",
        "type": 1,
        "start_time": "16:30:00",
        "end_time": "17:00:00",
        "duration": 30
    }
    # non_editor or non_admin does not have permission to update programs
    response = await test_client.patch("/programs/update", headers=access_token02, params=params, json=data)
    # Check that the response status code is 403 (you are not an admin or editor)
    assert response.status_code == 403
    #######################################################################
    response = await test_client.patch("/programs/update", headers=access_token, params=params, json=data)    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    #######################################################################
    fake_id = {"_id": "thisisafakeid1234567"}
    response = await test_client.patch("/programs/update", headers=access_token, params=fake_id, json=data)    # Check that the response status code is 200 (OK)
    assert response.status_code == 404
    #######################################################################
    await test_client.delete("/programs/", headers=access_token, params=params)
    
@pytest.mark.asyncio
async def test_delete_programs(test_client: AsyncClient,
                            access_token: dict,
                            access_token02: dict):
    
    # Define a user payload
    data = [{
        "conference": "TACAS",
        "session": "Model Checking I",
        "session_id": "fa258b98-ef37-4c7c-ab9a-8b6f993dc2dc",
        "title": " Bounded Model Checking for Asynchronous Hyperproperties ",
        "authors": "T. Hsu, B. Bonakdarpour, B. Finkbeiner, C. Sanchez",
        "year": 2022,
        "day": "2022-04-24",
        "type": 1,
        "start_time": "10:30:00",
        "end_time": "11:00:00",
        "duration": 30
    }
    ]
    # Make a POST request to the /programs endpoint with the non_admin authorization headers and data
    response = await test_client.post("/programs/", headers=access_token, json=data)
    p_id = response.json()[0]["_id"]
    params = {"_id": p_id}
    # non_editor or non_admin does not have permission to delete programs
    response = await test_client.delete("/programs/", headers=access_token02, params=params)
    # Check that the response status code is 403 (you are not an admin or editor)
    assert response.status_code == 403
    #######################################################################
    response = await test_client.delete("/programs/", headers=access_token, params=params)    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    #######################################################################
    # Program has been deleted
    response = await test_client.delete("/programs/", headers=access_token, params=params)    # Check that the response status code is 200 (OK)
    assert response.status_code == 404
    
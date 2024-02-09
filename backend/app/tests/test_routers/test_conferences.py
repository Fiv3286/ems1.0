import pytest
from httpx import AsyncClient

cs_data = {
  "year": 2023,
  "dates": [
    "2023-04-24",
    "2023-04-25",
    "2023-04-26",
    "2023-04-27"
  ],
  "committees": [
    "TACAS",
    "ESOP",
    "FASE",
    "FOSSACS",
    "SPIN"
  ]
}

cc_data = {
  "year": 2023,
  "dates": [
    "2023-04-14"
  ],
  "committees": [
    "TACAS",
    "FOSSACS",
    "ESOP",
    "FASE"
  ]
}

fake_id = "thisisafakeid1234567"

@pytest.mark.asyncio
async def test_create_session_conference(test_client: AsyncClient,
                                access_token: dict):
    # Make a POST request to the conferences/sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("/conferences/sessions/", headers=access_token, json=cs_data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert len(response.json()) == 1
    conf_sess_id = response.json()[0]["_id"]
    assert response.status_code == 200
    #######################################################################
    await test_client.delete(f"conferences/sessions/{conf_sess_id}", headers=access_token)


@pytest.mark.asyncio
async def test_get_session_conference_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/sessions/", headers=access_token, json=cs_data)
    conf_sess_id = response.json()[0]["_id"]
    response = await test_client.get(f"conferences/sessions/{conf_sess_id}", headers=access_token)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert response.json() is not None
    #######################################################################
    
    response = await test_client.get(f"conferences/sessions/{fake_id}", headers=access_token)
    assert response.status_code == 404
    #######################################################################
    await test_client.delete(f"conferences/sessions/{conf_sess_id}", headers=access_token)

@pytest.mark.asyncio
async def test_get_all_session_conferences(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/sessions/", headers=access_token, json=cs_data)
    #######################################################################
    get_params = {"year": 2023}
    response = await test_client.get("conferences/sessions/", headers=access_token, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["year"] == 2023
    #######################################################################
    conf_sess_id = response.json()[0]["_id"]
    get_params = {"year": 2023, "c_id": conf_sess_id}
    response = await test_client.get("conferences/sessions/", headers=access_token, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["_id"] == conf_sess_id
    #######################################################################
    await test_client.delete(f"conferences/sessions/{conf_sess_id}", headers=access_token)


@pytest.mark.asyncio
async def test_update_session_conference_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/sessions/", headers=access_token, json=cs_data)
    conf_sess_id = response.json()[0]["_id"]
    #######################################################################
    conf_sess_to_update = {
        "year": 2023,
        "dates": [
            "2023-05-24",
            "2023-05-25",
            "2023-05-26",
            "2023-05-27"
        ],
        "committees": [
            "TACAS",
            "ESOP",
            "FASE",
            "FOSSACS",
            "SPIN"
        ]
    }
    response = await test_client.patch(f"conferences/sessions/{conf_sess_id}", headers=access_token, json=conf_sess_to_update)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    #######################################################################
    await test_client.delete(f"conferences/sessions/{conf_sess_id}", headers=access_token)


@pytest.mark.asyncio
async def test_delete_session_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/sessions/", headers=access_token, json=cs_data)
    conf_sess_id = response.json()[0]["_id"]
    #######################################################################
    response = await test_client.delete(f"conferences/sessions/{conf_sess_id}", headers=access_token)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    #######################################################################
    response = await test_client.delete(f"conferences/sessions/{fake_id}", headers=access_token)
    assert response.status_code == 404

######################################################################################

@pytest.mark.asyncio
async def test_create_committee_conference(test_client: AsyncClient,
                                access_token: dict):
    # Make a POST request to the conferences/committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("/conferences/committees/", headers=access_token, json=cc_data)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert len(response.json()) == 1
    conf_comm_id = response.json()[0]["_id"]
    assert response.status_code == 200
    #######################################################################
    await test_client.delete(f"conferences/committees/{conf_comm_id}", headers=access_token)


@pytest.mark.asyncio
async def test_get_committee_conference_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/committees/", headers=access_token, json=cc_data)
    conf_comm_id = response.json()[0]["_id"]
    response = await test_client.get(f"conferences/committees/{conf_comm_id}", headers=access_token)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert response.json() is not None
    #######################################################################
    response = await test_client.get(f"conferences/committees/{fake_id}", headers=access_token)
    assert response.status_code == 404
    #######################################################################
    await test_client.delete(f"conferences/committees/{conf_comm_id}", headers=access_token)


@pytest.mark.asyncio
async def test_get_all_committee_conferences(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/committees/", headers=access_token, json=cc_data)
    #######################################################################
    get_params = {"year": 2023}
    response = await test_client.get("conferences/committees/", headers=access_token, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["year"] == 2023
    #######################################################################
    conf_comm_id = response.json()[0]["_id"]
    get_params = {"year": 2023, "c_id": conf_comm_id}
    response = await test_client.get("conferences/committees/", headers=access_token, params=get_params)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["_id"] == conf_comm_id
    #######################################################################
    await test_client.delete(f"conferences/committees/{conf_comm_id}", headers=access_token)


@pytest.mark.asyncio
async def test_update_committee_conference_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/committees endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/committees/", headers=access_token, json=cc_data)
    conf_comm_id = response.json()[0]["_id"]
    #######################################################################
    conf_comm_to_update = {
        "year": 2023,
        "dates": [
            "2023-05-14"
        ],
        "committees": [
            "TACAS",
            "FOSSACS",
            "ESOP",
            "FASE"
        ]
    }
    response = await test_client.patch(f"conferences/committees/{conf_comm_id}", headers=access_token, json=conf_comm_to_update)
    # Check that the response status code is 200 (OK)
    #   If you encounter 307, please look into this troubleshooting: 
    #   https://docs.prefect.io/latest/contributing/common-mistakes/
    assert response.status_code == 200
    #######################################################################
    await test_client.delete(f"conferences/committees/{conf_comm_id}", headers=access_token)


@pytest.mark.asyncio
async def test_delete_committee_conference_by_id(test_client: AsyncClient,
                            access_token: dict):
    # Make a POST request to the conferences/sessions endpoint with the non_admin authorization headers and data
    response = await test_client.post("conferences/committees/", headers=access_token, json=cc_data)
    conf_comm_id = response.json()[0]["_id"]
    #######################################################################
    response = await test_client.delete(f"conferences/committees/{conf_comm_id}", headers=access_token)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    #######################################################################
    response = await test_client.delete(f"conferences/committees/{fake_id}", headers=access_token)
    assert response.status_code == 404

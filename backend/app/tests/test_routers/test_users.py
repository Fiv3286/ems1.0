import pytest
from httpx import AsyncClient
import asyncio

@pytest.mark.asyncio
async def test_register(test_client: AsyncClient, 
                        access_token: dict, 
                        access_token02: dict):
    # Define a user payload
    data = {
        "username": "Register User",
        "email": "registeruser@gmail.com",
        "password": "registeruser123",
        "role": "non_admin"
    }
    # Make a POST request to the /users/register endpoint with the non_admin authorization headers and register payload
    response = await test_client.post("/users/register", headers=access_token02, json=data)
    # Only admin can register a new user
    assert response.status_code == 403
    # Make a POST request to the /users/register endpoint with the admin authorization headers and register payload
    response = await test_client.post("/users/register", headers=access_token, json=data)
    # Check that the response body matches the expected user payload
    assert response.status_code == 201
    assert response.json()["email"] == data["email"]
    user_id = response.json()["_id"]
    #######################################################################
    # Define a user payload (duplicate email)
    data = {
        "username": "Register User01",
        "email": "registeruser@gmail.com",
        "password": "registeruser456",
        "role": "non_admin"
    }
    # Make a POST request to the /users/register endpoint with the authorization headers and register payload
    response = await test_client.post("/users/register", headers=access_token, json=data)
    # Check that the response body matches the expected user payload
    assert response.status_code == 409
    #######################################################################
    # Define a user payload (duplicate username)
    data = {
        "username": "Register User",
        "email": "registeruser-1@gmail.com",
        "password": "registeruser789",
        "role": "non_admin"
    }
    # Make a POST request to the /users/register endpoint with the authorization headers and register payload
    response = await test_client.post("/users/register", headers=access_token, json=data)
    # Check that the response body matches the expected user payload
    assert response.status_code == 409
    #######################################################################
    await test_client.delete(f"/users/{user_id}", headers=access_token)


@pytest.mark.asyncio
async def test_login(test_client: AsyncClient):
    # Define a user payload
    payload = {
        "email": "chair@gmail.com",
        "password": "chair123"
    }
    # Make a POST request to the /users/login endpoint with the login payload
    response = await test_client.post("/users/login", json=payload)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    # Get access token
    access_token = response.json()[0]
    headers = {"Authorization": f"Bearer {access_token}"}
    #######################################################################
    # Define a user payload
    payload = {
        "email": "chair01@gmail.com",
        "password": "chair123"
    }
    # Make a POST request to the /users/login endpoint with the login payload
    response = await test_client.post("/users/login", json=payload)
    # Check that the response status code is 400 (Invalid email)
    assert response.status_code == 400
    #######################################################################
    # Define a user payload
    payload = {
        "email": "chair@gmail.com",
        "password": "wrongpwd"
    }
    # Make a POST request to the /users/login endpoint with the login payload
    response = await test_client.post("/users/login", json=payload)
    # Check that the response status code is 400 (Invalid password)
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_logout(test_client: AsyncClient):
    # Define a user payload
    payload = {
        "email": "chair@gmail.com",
        "password": "chair123"
    }
    # Make a POST request to the /users/login endpoint with the login payload
    response = await test_client.post("/users/login", json=payload)
    # Check that the response status code is 200 (OK)
    assert response.status_code == 200
    # Get access token
    access_token = response.json()[0]
    headers = {"Authorization": f"Bearer {access_token}"}
    #######################################################################
    # Make a POST request to the /users/logout endpoint without the authorization headers
    response = await test_client.post("/users/logout")
    # Check that the response status code is 403 
    assert response.status_code == 403
    ###################################################################################
    # Make a POST request to the /users/logout endpoint with the authorization headers
    response = await test_client.post("/users/logout", headers=headers)
    # Check that the response status code is 200 
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_refresh_token(test_client: AsyncClient):
    # Define admin user payload
    payload = {
        "email": "chair@gmail.com",
        "password": "chair123"
    }
    # Make a POST request to the /users/login endpoint with the login payload
    await asyncio.sleep(1) # # avoid concurrency: in case the test client logs in at the same time in different async functions
    response = await test_client.post("/users/login", json=payload)
    assert response.status_code == 200
    # Get access token
    access_token = response.json()[0]
    headers = {"Authorization": f"Bearer {access_token}"}
    # Get refresh token
    refresh_token = response.cookies.get("refresh_token")
    cookies = {"refresh_token": refresh_token}
    ###################################################################################
    # Make a GET request to the /users/refresh_token endpoint with a refresh_token
    response = await test_client.get("/users/refresh_token", cookies=cookies)
    # Check that the response status code is 200 
    assert response.status_code == 200
    # Check that the response role is admin
    assert response.json()['role'] == "admin"
    ###################################################################################
    # Check whether the token has been revoked after loggout
    await test_client.post("/users/logout", headers=headers)
    response = await test_client.get("/users/refresh_token", cookies=cookies)
    # Check that the response status code is 401 (revoked) 
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_all(test_client: AsyncClient, 
                       access_token: dict, 
                       access_token02: dict):
    print(f"headers = {access_token}")
    # Make a GET request to the /users/refresh_token endpoint with a refresh_token
    response = await test_client.get("/users/all", headers=access_token)
    # Check that the response status code is 200 (OK) 
    assert response.status_code == 200
    # Check that the response content is not null 
    assert response.json() is not None
    ###################################################################################
    # Check whether a non_admin user can access user_list
    response = await test_client.get("/users/all", headers=access_token02)
    # Check that the response status code is 403 (not an admin) 
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_by_id(test_client: AsyncClient, 
                       access_token: dict, 
                       access_token02: dict):
    # Define a user payload
    data = {
        "username": "update user",
        "email": "updateuser@gmail.com",
        "password": "updateuser123",
        "role": "non_admin"
    }
    # Make a POST request to the /users/register endpoint with the admin authorization headers and register payload
    response = await test_client.post("/users/register", headers=access_token, json=data)
    u_id = response.json()["_id"]
    # Define a user payload
    updated_data = {
        "password": "updateuser123456"
    }
    # Check whether a non_admin user can update
    response = await test_client.patch(f"/users/{u_id}", headers=access_token02, json=updated_data)
    # Check that the response status code is 403 (not an admin) 
    assert response.status_code == 403
    ###################################################################################
    # Make a PATCH request to the /users/{u_id} endpoint with an updated_data payload
    response = await test_client.patch(f"/users/{u_id}", headers=access_token, json=updated_data)
    # Check that the response status code is 200 (OK) 
    assert response.status_code == 200
    #######################################################################
    await test_client.delete(f"/users/{u_id}", headers=access_token)
    

@pytest.mark.asyncio
async def test_delete_by_id(test_client: AsyncClient, 
                       access_token: dict, 
                       access_token02: dict):
    # Define a user payload
    data = {
        "username": "Delete User",
        "email": "deleteuser@gmail.com",
        "password": "deleteuser123",
        "role": "non_admin"
    }
    # Make a POST request to the /users/register endpoint with the admin authorization headers and register payload
    response = await test_client.post("/users/register", headers=access_token, json=data)
    u_id = response.json()["_id"]
    # Check whether a non_admin user can delete
    response = await test_client.delete(f"/users/{u_id}", headers=access_token02)
    # Check that the response status code is 403 (not an admin) 
    assert response.status_code == 403
    ###################################################################################
    # Make a DELETE request to the /users/{u_id} endpoint
    response = await test_client.delete(f"/users/{u_id}", headers=access_token)
    # Check that the response status code is 200 (OK) 
    assert response.status_code == 200
    ###################################################################################
    # Check whether a deleted u_id can be deleted
    response = await test_client.delete(f"/users/{u_id}", headers=access_token)
    # Check that the response status code is 404 
    assert response.status_code == 404
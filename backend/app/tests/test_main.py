# no root endpoint is used
'''import pytest

@pytest.mark.asyncio
async def test_read_items(test_client):
    response = await test_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}'''
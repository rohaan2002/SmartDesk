import requests

BASE_URL = "http://localhost:5000"

def test_get_status_endpoint_should_return_server_status():
    try:
        response = requests.get(f"{BASE_URL}/status", timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to /status failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        body = response.json()
    except ValueError:
        assert False, "Response body is not valid JSON"

    assert body == {"ok": True, "status": "UP"}, f"Expected body {{'ok': True, 'status': 'UP'}}, got {body}"

test_get_status_endpoint_should_return_server_status()
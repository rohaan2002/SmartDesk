import requests

BASE_URL = "http://localhost:5000"


def test_get_auth_me_should_return_401_without_session_cookie():
    try:
        # TC001: GET /status expect 200 with {"ok": true, "status": "UP"}
        status_resp = requests.get(f"{BASE_URL}/status", timeout=30)
        assert status_resp.status_code == 200, f"Expected 200, got {status_resp.status_code}"
        status_json = status_resp.json()
        assert status_json.get("ok") is True, f"Expected ok true, got {status_json}"
        assert status_json.get("status") == "UP", f"Expected status 'UP', got {status_json}"

        # TC004: GET /auth/me without a session cookie expect 401 with {"error": "Unauthenticated"}
        auth_me_resp = requests.get(f"{BASE_URL}/auth/me", timeout=30)
        assert auth_me_resp.status_code == 401, f"Expected 401, got {auth_me_resp.status_code}"
        auth_me_json = auth_me_resp.json()
        assert auth_me_json.get("error") == "Unauthenticated", f"Expected error 'Unauthenticated', got {auth_me_json}"

        # TC002: POST /auth/e2e/login with valid user, expect 200 with {"ok": true, "message": "E2E login successful"} and cookie set
        login_payload = {"id": "e2e_user_1", "email": "e2e@test.local", "name": "E2E User"}
        login_resp = requests.post(f"{BASE_URL}/auth/e2e/login", json=login_payload, timeout=30)
        assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}"
        login_json = login_resp.json()
        assert login_json.get("ok") is True, f"Expected ok true, got {login_json}"
        assert login_json.get("message") == "E2E login successful", f"Expected success message, got {login_json}"
        assert "set-cookie" in login_resp.headers or "Set-Cookie" in login_resp.headers, "Expected session cookie to be set"
        cookie_headers = login_resp.headers.get("set-cookie") or login_resp.headers.get("Set-Cookie")
        assert "httponly" in cookie_headers.lower(), "Expected httpOnly flag in cookie"

        # Extract session cookie
        session_cookie = login_resp.cookies.get_dict()
        assert session_cookie, "Expected cookies in response"

        # TC005: GET /auth/me with session cookie, expect 200 with user info
        auth_me_cookie_resp = requests.get(f"{BASE_URL}/auth/me", cookies=session_cookie, timeout=30)
        assert auth_me_cookie_resp.status_code == 200, f"Expected 200, got {auth_me_cookie_resp.status_code}"
        user_json = auth_me_cookie_resp.json()
        user = user_json.get("user")
        assert user is not None, f"Expected user object, got {user_json}"
        assert user.get("id") == "e2e_user_1", f"Expected id 'e2e_user_1', got {user.get('id')}"
        assert user.get("email") == "e2e@test.local", f"Expected email 'e2e@test.local', got {user.get('email')}"
        assert user.get("name") == "E2E User", f"Expected name 'E2E User', got {user.get('name')}"

    except requests.RequestException as e:
        assert False, f"Network or request error: {e}"


test_get_auth_me_should_return_401_without_session_cookie()

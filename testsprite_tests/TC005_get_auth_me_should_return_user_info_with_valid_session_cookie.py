import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_tc005_get_auth_me_should_return_user_info_with_valid_session_cookie():
    # TC001: GET /status expect 200 {"ok": true, "status": "UP"}
    resp_status = requests.get(f"{BASE_URL}/status", timeout=TIMEOUT)
    assert resp_status.status_code == 200, f"Expected 200 but got {resp_status.status_code}"
    json_status = resp_status.json()
    assert json_status.get("ok") is True, f"Expected ok=true but got {json_status.get('ok')}"
    assert json_status.get("status") == "UP", f"Expected status='UP' but got {json_status.get('status')}"

    # TC004: GET /auth/me without cookie expect 401 {"error": "Unauthenticated"}
    resp_auth_me_no_cookie = requests.get(f"{BASE_URL}/auth/me", timeout=TIMEOUT)
    assert resp_auth_me_no_cookie.status_code == 401, f"Expected 401 but got {resp_auth_me_no_cookie.status_code}"
    json_unauth = resp_auth_me_no_cookie.json()
    assert json_unauth.get("error") == "Unauthenticated", f"Expected error='Unauthenticated' but got {json_unauth.get('error')}"

    # TC002: POST /auth/e2e/login with body -> expect 200 with {"ok": true, "message": "E2E login successful"} and sets httpOnly session cookie
    login_payload = {
        "id": "e2e_user_1",
        "email": "e2e@test.local",
        "name": "E2E User"
    }
    resp_login = requests.post(f"{BASE_URL}/auth/e2e/login", json=login_payload, timeout=TIMEOUT)
    assert resp_login.status_code == 200, f"Login expected 200 but got {resp_login.status_code}"
    json_login = resp_login.json()
    assert json_login.get("ok") is True, f"Login expected ok=true but got {json_login.get('ok')}"
    assert json_login.get("message") == "E2E login successful", f"Login expected message='E2E login successful' but got {json_login.get('message')}"
    # Extract session cookie from response cookies
    cookies = resp_login.cookies
    assert cookies, "Login response did not set any cookies"
    session_cookie = None
    for cookie in cookies:
        if cookie.name and cookie.value:
            # We assume the session cookie is set as an httpOnly cookie; name is not provided, accept any
            session_cookie = cookie
            break
    assert session_cookie is not None, "Session cookie not found in login response"

    # TC005: GET /auth/me with cookie expect 200 with user info
    cookies_dict = {session_cookie.name: session_cookie.value}
    resp_auth_me = requests.get(f"{BASE_URL}/auth/me", cookies=cookies_dict, timeout=TIMEOUT)
    assert resp_auth_me.status_code == 200, f"Expected 200 but got {resp_auth_me.status_code}"
    json_auth_me = resp_auth_me.json()
    user = json_auth_me.get("user")
    assert user is not None, "Response JSON does not contain 'user'"
    assert user.get("id") == login_payload["id"], f"User id expected {login_payload['id']} but got {user.get('id')}"
    assert user.get("email") == login_payload["email"], f"User email expected {login_payload['email']} but got {user.get('email')}"
    assert user.get("name") == login_payload["name"], f"User name expected {login_payload['name']} but got {user.get('name')}"

test_tc005_get_auth_me_should_return_user_info_with_valid_session_cookie()
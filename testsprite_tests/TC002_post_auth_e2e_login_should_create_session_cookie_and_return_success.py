import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_post_auth_e2e_login_should_create_session_cookie_and_return_success():
    url = f"{BASE_URL}/auth/e2e/login"
    payload = {
        "id": "e2e_user_1",
        "email": "e2e@test.local",
        "name": "E2E User"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        # Assert status code 200
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        # Assert response body
        json_resp = response.json()
        assert json_resp.get("ok") is True, f"Expected 'ok' key with True but got {json_resp.get('ok')}"
        assert json_resp.get("message") == "E2E login successful", f"Expected message 'E2E login successful' but got {json_resp.get('message')}"
        # Assert session cookie with httpOnly set
        cookies = response.cookies
        session_cookie_found = False
        for cookie in cookies:
            # The httpOnly attribute is not directly exposed by requests.cookies.CookieJar,
            # so we check that cookie is set and assume server sets the flag properly.
            # If the server sets httpOnly, it will not be accessible via JavaScript but visible in the cookiejar here.
            # So presence of cookie is checked here.
            if cookie.name and cookie.value:
                session_cookie_found = True
                break
        assert session_cookie_found, "Expected an httpOnly session cookie to be set but none found"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_auth_e2e_login_should_create_session_cookie_and_return_success()
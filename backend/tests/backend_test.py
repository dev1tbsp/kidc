"""Backend API regression tests for Kids Feast catering app."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://kidz-feast.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@kidsfeast.com"
ADMIN_PASSWORD = "admin123"


# ----- Fixtures -----
@pytest.fixture(scope="session")
def public_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_client():
    """Authenticated admin session (cookie-based)."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return s


# ----- Public content -----
class TestPublicContent:
    def test_root(self, public_client):
        r = public_client.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_age_groups_seeded(self, public_client):
        r = public_client.get(f"{API}/age-groups")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4
        names = {x["name"] for x in data}
        assert {"Tiny Tots", "Little Stars", "Big Kids", "Tweens"}.issubset(names)
        # validate no _id leaked
        assert all("_id" not in x for x in data)

    def test_activities_seeded(self, public_client):
        r = public_client.get(f"{API}/activities")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 6
        assert any(a["name"] == "Magic Show" for a in data)

    def test_packages_seeded(self, public_client):
        r = public_client.get(f"{API}/packages")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 3
        names = {p["name"] for p in data}
        assert {"Mini Bash", "Super Party", "Mega Blast"}.issubset(names)
        super_party = next(p for p in data if p["name"] == "Super Party")
        assert super_party["popular"] is True
        assert super_party["price_per_child"] == 32

    def test_snack_boxes_seeded(self, public_client):
        r = public_client.get(f"{API}/snack-boxes")
        assert r.status_code == 200
        assert len(r.json()) >= 3

    def test_testimonials_seeded(self, public_client):
        r = public_client.get(f"{API}/testimonials")
        assert r.status_code == 200
        assert len(r.json()) >= 4

    def test_gallery_seeded(self, public_client):
        r = public_client.get(f"{API}/gallery")
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        assert all("url" in i for i in items)

    def test_site_info(self, public_client):
        r = public_client.get(f"{API}/site-info")
        assert r.status_code == 200
        info = r.json()
        assert info.get("brand_name")


# ----- Auth -----
class TestAuth:
    def test_login_wrong_password(self, public_client):
        # use unique email so we don't trigger lockout for admin
        r = public_client.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "wrong"})
        assert r.status_code == 401

    def test_login_success_sets_cookies(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        # Cookies set
        assert "access_token" in s.cookies
        assert "refresh_token" in s.cookies

    def test_me_with_cookies(self, admin_client):
        r = admin_client.get(f"{API}/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"

    def test_me_without_cookies(self, public_client):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ----- Admin protection -----
class TestAdminProtection:
    def test_quotes_requires_auth(self, public_client):
        r = requests.get(f"{API}/admin/quotes")
        assert r.status_code == 401

    def test_admin_quotes_with_auth(self, admin_client):
        r = admin_client.get(f"{API}/admin/quotes")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ----- Quote submission -----
class TestQuotes:
    @pytest.fixture(scope="class")
    def created_quote_id(self, admin_client):
        s = requests.Session()
        payload = {
            "parent_name": "TEST_Parent",
            "email": "TEST_parent@example.com",
            "phone": "+1-555-0100",
            "guest_count": 15,
            "package_name": "Super Party",
            "estimated_total": 480.0,
            "notes": "TEST quote",
        }
        r = s.post(f"{API}/quotes", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data
        assert data["estimated_total"] == 480.0
        assert data["status"] == "new"
        qid = data["id"]
        yield qid
        # cleanup
        try:
            admin_client.delete(f"{API}/admin/quotes/{qid}")
        except Exception:
            pass

    def test_quote_appears_in_admin_list(self, admin_client, created_quote_id):
        r = admin_client.get(f"{API}/admin/quotes")
        assert r.status_code == 200
        ids = [q["id"] for q in r.json()]
        assert created_quote_id in ids

    def test_update_quote_status(self, admin_client, created_quote_id):
        r = admin_client.patch(f"{API}/admin/quotes/{created_quote_id}", json={"status": "contacted"})
        assert r.status_code == 200
        # verify
        r2 = admin_client.get(f"{API}/admin/quotes")
        q = next(x for x in r2.json() if x["id"] == created_quote_id)
        assert q["status"] == "contacted"

    def test_update_quote_status_requires_admin(self, public_client, created_quote_id):
        r = requests.patch(f"{API}/admin/quotes/{created_quote_id}", json={"status": "contacted"})
        assert r.status_code == 401


# ----- Admin Packages CRUD -----
class TestAdminPackagesCRUD:
    def test_create_update_delete_package(self, admin_client):
        payload = {
            "name": "TEST_Package",
            "tagline": "test only",
            "price_per_child": 25.0,
            "min_guests": 10,
            "features": ["test feature"],
            "activities": ["Magic Show"],
            "color": "sky",
            "order": 99,
        }
        # CREATE
        r = admin_client.post(f"{API}/admin/packages", json=payload)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == "TEST_Package"
        pid = created["id"]

        # GET verify
        r2 = requests.get(f"{API}/packages")
        assert any(p["id"] == pid for p in r2.json())

        # UPDATE
        r3 = admin_client.put(f"{API}/admin/packages/{pid}", json={"tagline": "updated tagline", "price_per_child": 30.0})
        assert r3.status_code == 200
        r4 = requests.get(f"{API}/packages")
        updated = next(p for p in r4.json() if p["id"] == pid)
        assert updated["tagline"] == "updated tagline"
        assert updated["price_per_child"] == 30.0

        # DELETE
        r5 = admin_client.delete(f"{API}/admin/packages/{pid}")
        assert r5.status_code == 200
        r6 = requests.get(f"{API}/packages")
        assert not any(p["id"] == pid for p in r6.json())

    def test_create_package_requires_admin(self):
        r = requests.post(f"{API}/admin/packages", json={"name": "X", "tagline": "Y", "price_per_child": 1})
        assert r.status_code == 401


# ----- Brute force lockout -----
class TestBruteForce:
    def test_lockout_after_5_failed_attempts(self):
        unique_email = f"brute_{int(time.time())}@example.com"
        s = requests.Session()
        last = None
        for _ in range(5):
            last = s.post(f"{API}/auth/login", json={"email": unique_email, "password": "wrong"})
            assert last.status_code == 401
        # 6th attempt - should be locked
        r = s.post(f"{API}/auth/login", json={"email": unique_email, "password": "wrong"})
        assert r.status_code == 429, f"Expected 429 got {r.status_code}: {r.text}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

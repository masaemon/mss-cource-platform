"""
Integration tests for Auth API

These tests use SQL for data setup and verification,
matching the curl-based tests in the same directory.
"""

import pytest
import subprocess
import json
from pathlib import Path


class TestAuthAPI:
    """Auth API integration tests"""

    @classmethod
    def setup_class(cls):
        """Run setup SQL before all tests"""
        cls.base_dir = Path(__file__).parent
        setup_sql = cls.base_dir / "setup.sql"

        if setup_sql.exists():
            subprocess.run(
                ["docker-compose", "exec", "-T", "db",
                 "mysql", "-u", "mss_user", "-pmss_password", "mss_course_platform"],
                stdin=open(setup_sql),
                check=True,
                capture_output=True
            )

    def run_sql(self, sql_file: Path) -> str:
        """Execute SQL and return output"""
        result = subprocess.run(
            ["docker-compose", "exec", "-T", "db",
             "mysql", "-u", "mss_user", "-pmss_password", "mss_course_platform"],
            stdin=open(sql_file),
            check=True,
            capture_output=True,
            text=True
        )
        return result.stdout

    def run_curl(self, script_file: Path) -> dict:
        """Execute curl script and return parsed JSON response"""
        result = subprocess.run(
            ["bash", str(script_file)],
            capture_output=True,
            text=True
        )

        # Try to parse as JSON
        try:
            # Remove HTTP_STATUS line if present
            output = result.stdout
            if "HTTP_STATUS:" in output:
                output = output.split("HTTP_STATUS:")[0]
            return json.loads(output)
        except json.JSONDecodeError:
            return {"error": result.stdout, "stderr": result.stderr}

    def test_TC_AUTH_001_valid_signup(self):
        """TC-AUTH-001: Valid signup"""
        test_dir = self.base_dir / "TC-AUTH-001"

        # Execute API request
        response = self.run_curl(test_dir / "request.sh")

        # Validate response structure
        assert "access_token" in response, "access_token missing"
        assert "user" in response, "user object missing"
        assert response["user"]["email"] == "newuser@example.com"
        assert response["user"]["display_name"] == "New User"
        assert response["user"]["role"] == "user"
        assert "hashed_password" not in response["user"]

        # Verify database state
        verify_output = self.run_sql(test_dir / "verify.sql")
        assert "newuser@example.com" in verify_output
        assert "New User" in verify_output

    def test_TC_AUTH_010_duplicate_email(self):
        """TC-AUTH-010: Duplicate email signup"""
        test_dir = self.base_dir / "TC-AUTH-010"

        # Execute API request
        response = self.run_curl(test_dir / "request.sh")

        # Validate error response
        assert "detail" in response
        assert response["detail"] == "Email already registered"

    def test_TC_AUTH_012_valid_login(self):
        """TC-AUTH-012: Valid login"""
        test_dir = self.base_dir / "TC-AUTH-012"

        # Execute API request
        response = self.run_curl(test_dir / "request.sh")

        # Validate response
        assert "access_token" in response
        assert "token_type" in response
        assert response["token_type"] == "bearer"
        assert "user" in response
        assert response["user"]["email"] == "existing@example.com"

    def test_TC_AUTH_018_get_current_user(self):
        """TC-AUTH-018: Get current user with valid token"""
        test_dir = self.base_dir / "TC-AUTH-018"

        # Execute API request
        response = self.run_curl(test_dir / "request.sh")

        # Validate response
        assert "id" in response
        assert response["email"] == "existing@example.com"
        assert response["display_name"] == "Existing User"
        assert response["role"] == "user"
        assert "hashed_password" not in response


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

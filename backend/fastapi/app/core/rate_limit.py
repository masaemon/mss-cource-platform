from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict
import asyncio


class RateLimiter:
    def __init__(self):
        # {ip_address: {endpoint: [timestamps]}}
        self.requests: Dict[str, Dict[str, list]] = defaultdict(lambda: defaultdict(list))
        self.lock = asyncio.Lock()

    async def check_rate_limit(
        self,
        request: Request,
        max_requests: int,
        window_seconds: int,
        endpoint: str
    ) -> bool:
        """Check if request is within rate limit."""
        client_ip = request.client.host
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)

        async with self.lock:
            # Remove old requests
            self.requests[client_ip][endpoint] = [
                ts for ts in self.requests[client_ip][endpoint]
                if ts > window_start
            ]

            # Check current request count
            if len(self.requests[client_ip][endpoint]) >= max_requests:
                return False

            # Record new request
            self.requests[client_ip][endpoint].append(now)
            return True


rate_limiter = RateLimiter()


async def check_login_rate_limit(request: Request):
    """Login endpoint rate limit: 100 requests per 5 minutes (relaxed for testing)."""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=100, window_seconds=300, endpoint="login"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )


async def check_signup_rate_limit(request: Request):
    """Signup endpoint rate limit: 100 requests per 5 minutes (relaxed for testing)."""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=100, window_seconds=300, endpoint="signup"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many signup attempts. Please try again later."
        )


async def check_comment_rate_limit(request: Request):
    """Comment posting rate limit: 50 requests per minute (relaxed for testing)."""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=50, window_seconds=60, endpoint="comment"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many comments. Please slow down."
        )


async def check_instructor_reply_rate_limit(request: Request):
    """Instructor reply rate limit: 100 requests per minute (relaxed for testing)."""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=100, window_seconds=60, endpoint="instructor_reply"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many replies. Please slow down."
        )

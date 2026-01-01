from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.db.session import get_db
from app.models.profile import Profile, UserRole
from app.schemas.auth import (
    SignUpRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    ProfileUpdateRequest
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rate_limit import check_signup_rate_limit, check_login_rate_limit
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: Request,
    signup_data: SignUpRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_signup_rate_limit)
):
    """Register a new user."""
    # Check if email already exists
    result = await db.execute(select(Profile).where(Profile.email == signup_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = Profile(
        id=str(uuid.uuid4()),
        email=signup_data.email,
        display_name=signup_data.display_name,
        hashed_password=get_password_hash(signup_data.password),
        role=UserRole.USER
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Generate JWT token
    access_token = create_access_token(data={"sub": new_user.id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_login_rate_limit)
):
    """Login with email and password."""
    # Find user
    result = await db.execute(select(Profile).where(Profile.email == login_data.email))
    user = result.scalar_one_or_none()

    # Verify user and password
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token
    access_token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/logout")
async def logout():
    """Logout (client should delete the token)."""
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Profile = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile."""
    # Validate and update display_name
    if profile_data.display_name is not None:
        if not profile_data.display_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Display name cannot be empty"
            )
        current_user.display_name = profile_data.display_name.strip()

    # Update bio
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio.strip() if profile_data.bio else None

    await db.commit()
    await db.refresh(current_user)

    return UserResponse.model_validate(current_user)

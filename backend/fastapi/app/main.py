from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.courses import router as courses_router
from app.api.v1.categories import router as categories_router
from app.api.v1.videos import router as videos_router
from app.api.v1.progress import router as progress_router
from app.api.v1.comments import router as comments_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# UTF-8エンコーディングを明示的に設定
@app.middleware("http")
async def add_utf8_header(request: Request, call_next):
    response = await call_next(request)
    if isinstance(response, Response):
        response.headers["Content-Type"] = "application/json; charset=utf-8"
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)

# Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(courses_router, prefix="/api/v1")
app.include_router(categories_router, prefix="/api/v1")
app.include_router(videos_router, prefix="/api/v1")
app.include_router(progress_router, prefix="/api/v1")
app.include_router(comments_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.API_VERSION
    }


@app.get("/")
async def root():
    return {
        "message": "MSS Course Platform BFF API",
        "docs": "/api/docs"
    }

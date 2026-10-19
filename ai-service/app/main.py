from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import config
from app.api.health import router as health_router
from app.api.bias import router as bias_router
from app.api.matching import router as matching_router
from app.api.anonymize import router as anonymize_router

app = FastAPI(
    title="FairHire AI - AI/NLP Microservice",
    description="Dedicated microservice for job description bias analysis, inclusive rewrites, semantic matching, and resume anonymization.",
    version=config.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all service routers
app.include_router(health_router)
app.include_router(bias_router)
app.include_router(matching_router)
app.include_router(anonymize_router)


@app.get("/")
async def root():
    return {
        "service": config.SERVICE_NAME,
        "version": config.VERSION,
        "status": "UP",
        "docs": "/docs",
        "endpoints": [
            "/api/v1/health",
            "/api/bias/analyze",
            "/api/bias/rewrite",
            "/api/matching/score",
            "/api/anonymize"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=config.HOST, port=config.PORT, reload=config.DEBUG)

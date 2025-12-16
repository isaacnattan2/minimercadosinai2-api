from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.models import DeviceStatus, APIResponse
from app.device.idflex_client import IDFlexClient
from app.routers import access_logs, users

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    yield


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="""
    API for integrating with iDAccess iDFlex Pro access control devices.
    
    This API allows you to:
    - Retrieve access logs (user entries/exits)
    - Manage users on the device
    - Monitor device status
    
    ## Device Configuration
    
    Configure the device IP and credentials using environment variables:
    - DEVICE_IP: IP address of the iDFlex Pro device
    - DEVICE_LOGIN: Login username (default: admin)
    - DEVICE_PASSWORD: Login password (default: admin)
    """,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(access_logs.router)
app.include_router(users.router)


async def get_client():
    """Dependency to get iDFlex client."""
    client = IDFlexClient()
    try:
        yield client
    finally:
        await client.close()


@app.get("/", response_model=APIResponse)
async def root():
    """Root endpoint with API information."""
    return APIResponse(
        success=True,
        message="Mini Mercado Sinai - iDFlex Pro Integration API",
        data={
            "version": settings.api_version,
            "device_ip": settings.device_ip,
            "endpoints": {
                "access_logs": "/access-logs",
                "users": "/users",
                "status": "/status",
                "health": "/health"
            }
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/status", response_model=DeviceStatus)
async def get_device_status(client: IDFlexClient = Depends(get_client)):
    """
    Check the connection status with the iDFlex Pro device.
    
    Attempts to authenticate with the device and returns the connection status.
    """
    try:
        connected = await client.authenticate()
        return DeviceStatus(
            online=connected,
            device_ip=client.ip,
            session_active=client.session is not None,
            message="Connected to device" if connected else "Failed to connect to device"
        )
    except Exception as e:
        return DeviceStatus(
            online=False,
            device_ip=client.ip,
            session_active=False,
            message=f"Error connecting to device: {str(e)}"
        )


@app.post("/door/open", response_model=APIResponse)
async def open_door(
    door_number: int = 1,
    client: IDFlexClient = Depends(get_client)
):
    """
    Open a door/relay on the device.
    
    Args:
        door_number: The door/relay number to open (default: 1)
    """
    try:
        result = await client.open_door(door_number=door_number)
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        return APIResponse(
            success=True,
            message=f"Door {door_number} opened successfully",
            data={"door_number": door_number}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

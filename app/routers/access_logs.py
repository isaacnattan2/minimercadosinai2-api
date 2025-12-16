from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.models import AccessLogResponse, APIResponse
from app.device.idflex_client import IDFlexClient

router = APIRouter(prefix="/access-logs", tags=["Access Logs"])


async def get_client():
    """Dependency to get iDFlex client."""
    client = IDFlexClient()
    try:
        yield client
    finally:
        await client.close()


@router.get("", response_model=APIResponse)
async def get_access_logs(
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    client: IDFlexClient = Depends(get_client)
):
    """
    Get access logs from the iDFlex Pro device.
    
    Returns a list of all access events recorded by the device,
    including user identifications, denied access attempts, and door openings.
    """
    try:
        result = await client.get_access_logs(limit=limit, offset=offset)
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        access_logs = result.get("access_logs", [])
        return APIResponse(
            success=True,
            message=f"Retrieved {len(access_logs)} access logs",
            data={"access_logs": access_logs, "total": len(access_logs)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=APIResponse)
async def get_recent_access_logs(
    count: int = 10,
    client: IDFlexClient = Depends(get_client)
):
    """
    Get the most recent access logs from the device.
    
    Args:
        count: Number of recent logs to retrieve (default: 10)
    """
    try:
        result = await client.get_access_logs()
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        access_logs = result.get("access_logs", [])
        recent_logs = sorted(access_logs, key=lambda x: x.get("time", 0), reverse=True)[:count]
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(recent_logs)} recent access logs",
            data={"access_logs": recent_logs, "total": len(recent_logs)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-user/{user_id}", response_model=APIResponse)
async def get_access_logs_by_user(
    user_id: int,
    client: IDFlexClient = Depends(get_client)
):
    """
    Get access logs for a specific user.
    
    Args:
        user_id: The ID of the user to filter logs for
    """
    try:
        result = await client.get_access_logs()
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        access_logs = result.get("access_logs", [])
        user_logs = [log for log in access_logs if log.get("user_id") == user_id]
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(user_logs)} access logs for user {user_id}",
            data={"access_logs": user_logs, "total": len(user_logs)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

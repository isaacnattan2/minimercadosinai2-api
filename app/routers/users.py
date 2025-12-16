from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.models import UserCreate, UserUpdate, APIResponse
from app.device.idflex_client import IDFlexClient

router = APIRouter(prefix="/users", tags=["Users"])


async def get_client():
    """Dependency to get iDFlex client."""
    client = IDFlexClient()
    try:
        yield client
    finally:
        await client.close()


@router.get("", response_model=APIResponse)
async def get_users(client: IDFlexClient = Depends(get_client)):
    """
    Get all users registered on the iDFlex Pro device.
    
    Returns a list of all users with their IDs, names, and registration numbers.
    """
    try:
        result = await client.get_users()
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        users = result.get("users", [])
        return APIResponse(
            success=True,
            message=f"Retrieved {len(users)} users",
            data={"users": users, "total": len(users)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}", response_model=APIResponse)
async def get_user(user_id: int, client: IDFlexClient = Depends(get_client)):
    """
    Get a specific user by ID.
    
    Args:
        user_id: The unique identifier of the user
    """
    try:
        result = await client.get_users(user_id=user_id)
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        users = result.get("users", [])
        if not users:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        return APIResponse(
            success=True,
            message=f"Retrieved user {user_id}",
            data={"user": users[0]}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=APIResponse)
async def create_user(user: UserCreate, client: IDFlexClient = Depends(get_client)):
    """
    Create a new user on the iDFlex Pro device.
    
    Args:
        user: User data including id, name, and optional registration
    """
    try:
        result = await client.create_user(
            user_id=user.id,
            name=user.name,
            registration=user.registration or ""
        )
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        return APIResponse(
            success=True,
            message=f"User {user.id} created successfully",
            data={"user": {"id": user.id, "name": user.name, "registration": user.registration}}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}", response_model=APIResponse)
async def update_user(
    user_id: int,
    user: UserUpdate,
    client: IDFlexClient = Depends(get_client)
):
    """
    Update an existing user on the device.
    
    Args:
        user_id: The ID of the user to update
        user: Updated user data
    """
    try:
        result = await client.update_user(
            user_id=user_id,
            name=user.name,
            registration=user.registration
        )
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device or no changes provided")
        
        return APIResponse(
            success=True,
            message=f"User {user_id} updated successfully",
            data={"user_id": user_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}", response_model=APIResponse)
async def delete_user(user_id: int, client: IDFlexClient = Depends(get_client)):
    """
    Delete a user from the device.
    
    Args:
        user_id: The ID of the user to delete
    """
    try:
        result = await client.delete_user(user_id=user_id)
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        return APIResponse(
            success=True,
            message=f"User {user_id} deleted successfully",
            data={"user_id": user_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/cards", response_model=APIResponse)
async def get_user_cards(user_id: int, client: IDFlexClient = Depends(get_client)):
    """
    Get all cards associated with a user.
    
    Args:
        user_id: The ID of the user
    """
    try:
        result = await client.get_cards(user_id=user_id)
        if result is None:
            raise HTTPException(status_code=503, detail="Failed to connect to device")
        
        cards = result.get("cards", [])
        return APIResponse(
            success=True,
            message=f"Retrieved {len(cards)} cards for user {user_id}",
            data={"cards": cards, "total": len(cards)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

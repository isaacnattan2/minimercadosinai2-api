import httpx
from typing import Optional
from app.config import get_settings


class IDFlexClient:
    """Client for communicating with iDAccess iDFlex Pro devices via REST API."""

    def __init__(self, ip: Optional[str] = None, login: Optional[str] = None, password: Optional[str] = None):
        settings = get_settings()
        self.ip = ip or settings.device_ip
        self.login = login or settings.device_login
        self.password = password or settings.device_password
        self.session: Optional[str] = None
        self.base_url = f"http://{self.ip}"
        self._client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()

    async def authenticate(self) -> bool:
        """
        Authenticate with the device and obtain a session token.
        Returns True if authentication was successful.
        """
        try:
            response = await self._client.post(
                f"{self.base_url}/login.fcgi",
                json={"login": self.login, "password": self.password}
            )
            response.raise_for_status()
            data = response.json()
            self.session = data.get("session")
            return self.session is not None
        except httpx.HTTPError as e:
            print(f"Authentication error: {e}")
            return False

    async def _make_request(self, endpoint: str, data: dict) -> Optional[dict]:
        """Make an authenticated request to the device."""
        if not self.session:
            authenticated = await self.authenticate()
            if not authenticated:
                raise Exception("Failed to authenticate with device")

        try:
            response = await self._client.post(
                f"{self.base_url}/{endpoint}?session={self.session}",
                json=data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Request error: {e}")
            return None

    async def load_objects(self, object_type: str, where: Optional[dict] = None) -> Optional[dict]:
        """
        Load objects from the device.
        
        Args:
            object_type: Type of object to load (users, access_logs, cards, etc.)
            where: Optional filter conditions
        """
        data = {"object": object_type}
        if where:
            data["where"] = where
        return await self._make_request("load_objects.fcgi", data)

    async def create_objects(self, object_type: str, values: list[dict]) -> Optional[dict]:
        """
        Create new objects on the device.
        
        Args:
            object_type: Type of object to create
            values: List of objects to create
        """
        data = {"object": object_type, "values": values}
        return await self._make_request("create_objects.fcgi", data)

    async def modify_objects(self, object_type: str, values: dict, where: dict) -> Optional[dict]:
        """
        Modify existing objects on the device.
        
        Args:
            object_type: Type of object to modify
            values: New values to set
            where: Filter to identify objects to modify
        """
        data = {"object": object_type, "values": values, "where": where}
        return await self._make_request("modify_objects.fcgi", data)

    async def destroy_objects(self, object_type: str, where: Optional[dict] = None) -> Optional[dict]:
        """
        Delete objects from the device.
        
        Args:
            object_type: Type of object to delete
            where: Optional filter to identify objects to delete
        """
        data = {"object": object_type}
        if where:
            data["where"] = where
        return await self._make_request("destroy_objects.fcgi", data)

    async def get_access_logs(self, limit: Optional[int] = None, offset: Optional[int] = None) -> Optional[dict]:
        """
        Get access logs from the device.
        
        Args:
            limit: Maximum number of logs to return
            offset: Number of logs to skip
        """
        return await self.load_objects("access_logs")

    async def get_users(self, user_id: Optional[int] = None) -> Optional[dict]:
        """
        Get users from the device.
        
        Args:
            user_id: Optional specific user ID to retrieve
        """
        where = None
        if user_id is not None:
            where = {"users": {"id": user_id}}
        return await self.load_objects("users", where)

    async def create_user(self, user_id: int, name: str, registration: str = "") -> Optional[dict]:
        """
        Create a new user on the device.
        
        Args:
            user_id: Unique identifier for the user
            name: User's name
            registration: Optional registration number
        """
        values = [{"id": user_id, "name": name, "registration": registration}]
        return await self.create_objects("users", values)

    async def update_user(self, user_id: int, name: Optional[str] = None, registration: Optional[str] = None) -> Optional[dict]:
        """
        Update an existing user on the device.
        
        Args:
            user_id: ID of the user to update
            name: New name (optional)
            registration: New registration (optional)
        """
        values = {}
        if name is not None:
            values["name"] = name
        if registration is not None:
            values["registration"] = registration
        
        if not values:
            return None
            
        where = {"users": {"id": user_id}}
        return await self.modify_objects("users", values, where)

    async def delete_user(self, user_id: int) -> Optional[dict]:
        """
        Delete a user from the device.
        
        Args:
            user_id: ID of the user to delete
        """
        where = {"users": {"id": user_id}}
        return await self.destroy_objects("users", where)

    async def get_cards(self, user_id: Optional[int] = None) -> Optional[dict]:
        """
        Get cards from the device.
        
        Args:
            user_id: Optional user ID to filter cards
        """
        where = None
        if user_id is not None:
            where = {"cards": {"user_id": user_id}}
        return await self.load_objects("cards", where)

    async def create_card(self, card_id: int, value: int, user_id: int) -> Optional[dict]:
        """
        Create a new card on the device.
        
        Args:
            card_id: Unique identifier for the card
            value: Card value/number
            user_id: ID of the user this card belongs to
        """
        values = [{"id": card_id, "value": value, "user_id": user_id}]
        return await self.create_objects("cards", values)

    async def delete_card(self, card_id: int) -> Optional[dict]:
        """
        Delete a card from the device.
        
        Args:
            card_id: ID of the card to delete
        """
        where = {"cards": {"id": card_id}}
        return await self.destroy_objects("cards", where)

    async def execute_action(self, action: str, parameters: str) -> Optional[dict]:
        """
        Execute an action on the device (e.g., open door).
        
        Args:
            action: Action to execute (door, sec_box, etc.)
            parameters: Action parameters
        """
        data = {"actions": [{"action": action, "parameters": parameters}]}
        return await self._make_request("execute_actions.fcgi", data)

    async def open_door(self, door_number: int = 1) -> Optional[dict]:
        """
        Open a door/relay on the device.
        
        Args:
            door_number: Door/relay number to open (default: 1)
        """
        return await self.execute_action("door", f"door={door_number}")

    async def get_device_info(self) -> dict:
        """Get device connection information."""
        return {
            "ip": self.ip,
            "connected": self.session is not None,
            "session": self.session
        }

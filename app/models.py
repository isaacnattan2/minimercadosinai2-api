from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DeviceInfo(BaseModel):
    ip: str
    connected: bool
    session: Optional[str] = None


class AccessLog(BaseModel):
    id: int
    time: int
    event: int
    device_id: int
    identifier_id: Optional[int] = None
    user_id: Optional[int] = None
    portal_id: Optional[int] = None
    card_value: Optional[int] = None


class AccessLogResponse(BaseModel):
    access_logs: list[AccessLog]
    total: int


class User(BaseModel):
    id: int
    name: str
    registration: Optional[str] = None
    password: Optional[str] = None
    salt: Optional[str] = None
    begin_time: Optional[int] = None
    end_time: Optional[int] = None


class UserCreate(BaseModel):
    id: int
    name: str
    registration: Optional[str] = ""


class UserUpdate(BaseModel):
    name: Optional[str] = None
    registration: Optional[str] = None


class UsersResponse(BaseModel):
    users: list[User]
    total: int


class Card(BaseModel):
    id: int
    value: int
    user_id: int


class CardCreate(BaseModel):
    id: int
    value: int
    user_id: int


class CardsResponse(BaseModel):
    cards: list[Card]
    total: int


class DeviceStatus(BaseModel):
    online: bool
    device_ip: str
    session_active: bool
    message: str


class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

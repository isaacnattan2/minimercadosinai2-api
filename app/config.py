from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    device_ip: str = "192.168.0.1"
    device_login: str = "admin"
    device_password: str = "admin"
    api_title: str = "Mini Mercado Sinai - iDFlex Pro Integration"
    api_version: str = "0.1.0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

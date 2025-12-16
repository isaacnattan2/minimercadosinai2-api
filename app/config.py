from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Device connection - accepts IP address (e.g., 192.168.0.1) or full URL (e.g., https://abc123.ngrok.io)
    device_ip: str = "192.168.0.1"
    device_login: str = "admin"
    device_password: str = "admin"
    api_title: str = "Mini Mercado Sinai - iDFlex Pro Integration"
    api_version: str = "0.1.0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def get_device_base_url(self) -> str:
        """
        Get the normalized base URL for the device.
        Accepts either:
        - Plain IP/hostname: 192.168.0.1 -> http://192.168.0.1
        - Full URL: https://abc123.ngrok.io -> https://abc123.ngrok.io
        """
        value = self.device_ip.strip().rstrip("/")
        if value.startswith("http://") or value.startswith("https://"):
            return value
        return f"http://{value}"


@lru_cache
def get_settings() -> Settings:
    return Settings()

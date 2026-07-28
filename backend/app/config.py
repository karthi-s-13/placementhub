from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/placementhub"
    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    GMAIL_USER: str = ""
    GMAIL_APP_PASSWORD: str = ""

    FRONTEND_URL: str = "http://localhost:5173"
    BATCH_SIZE: int = 53
    APP_NAME: str = "PlacementHub"

    REGISTER_NUMBER_REGEX: str = r"^[a-zA-Z0-9-]{3,20}$"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

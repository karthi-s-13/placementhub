from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MySQL Database (Commented out)
    # DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/placementhub"

    # Supabase Configuration
    SUPABASE_URL: str = "https://peonzpcdvhymdtnhggeu.supabase.co"
    SUPABASE_KEY: str = "sb_publishable_hGAMrYFNJyrsHq4BYJ4bBg_eBPWPFuz"
    DATABASE_URL: str = "postgresql://postgres.peonzpcdvhymdtnhggeu:karthikeyan%4013@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = ""

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

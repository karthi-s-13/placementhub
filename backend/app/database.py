from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
# pyrefly: ignore [missing-import]
from supabase import create_client, Client
from app.config import settings

# Supabase Client setup
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# SQLAlchemy Engine connected via settings.DATABASE_URL (Supports MySQL & PostgreSQL)
connect_args = {}
if settings.DATABASE_URL.startswith("postgresql"):
    connect_args = {
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=20,
    max_overflow=30,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from sqlalchemy import text


def create_tables():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        # Alter users.role column (MySQL syntax)
        try:
            conn.execute(text("ALTER TABLE users MODIFY COLUMN role VARCHAR(30) NOT NULL DEFAULT 'student'"))
            conn.commit()
        except Exception:
            pass

        # Alter users.role column (PostgreSQL / Supabase syntax)
        try:
            conn.execute(text("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(30)"))
            conn.commit()
        except Exception:
            pass

        # Add target_role column to register_numbers table if not already present
        try:
            conn.execute(text("ALTER TABLE register_numbers ADD COLUMN target_role VARCHAR(20) NOT NULL DEFAULT 'student'"))
            conn.commit()
        except Exception:
            pass

        # Migrate legacy 'cr' roles to 'super_admin' if present
        try:
            conn.execute(text("UPDATE users SET role = 'super_admin' WHERE role = 'cr'"))
            conn.commit()
        except Exception:
            pass

        # Update application_statuses.status column (MySQL syntax)
        try:
            conn.execute(text("ALTER TABLE application_statuses MODIFY COLUMN status VARCHAR(30) NOT NULL"))
            conn.commit()
        except Exception:
            pass

        # Update application_statuses.status column (PostgreSQL / Supabase syntax)
        try:
            conn.execute(text("ALTER TABLE application_statuses ALTER COLUMN status TYPE VARCHAR(30)"))
            conn.commit()
        except Exception:
            pass

        # Add new columns to direct_messages
        for col_def in [
            "ADD COLUMN file_url VARCHAR(500) NULL",
            "ADD COLUMN file_name VARCHAR(255) NULL",
            "ADD COLUMN file_type VARCHAR(50) NULL",
            "ADD COLUMN is_edited BOOLEAN DEFAULT FALSE",
            "ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE",
        ]:
            try:
                conn.execute(text(f"ALTER TABLE direct_messages {col_def}"))
                conn.commit()
            except Exception:
                pass

        # Add new columns to chat_messages
        for col_def in [
            "ADD COLUMN file_url VARCHAR(500) NULL",
            "ADD COLUMN file_name VARCHAR(255) NULL",
            "ADD COLUMN file_type VARCHAR(50) NULL",
            "ADD COLUMN is_edited BOOLEAN DEFAULT FALSE",
            "ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE",
        ]:
            try:
                conn.execute(text(f"ALTER TABLE chat_messages {col_def}"))
                conn.commit()
            except Exception:
                pass



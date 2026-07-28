import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, RegisterNumber
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut, UserUpdateRequest
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Validate register number format
    if not re.match(settings.REGISTER_NUMBER_REGEX, payload.register_number):
        raise HTTPException(400, "Invalid register number format (must be 12 digits)")

    # Check if register number is pre-approved
    rn = db.query(RegisterNumber).filter(
        RegisterNumber.register_number == payload.register_number
    ).first()
    if not rn:
        raise HTTPException(400, "Register number not found. Contact Super Admin to get added.")
    if rn.is_used:
        raise HTTPException(400, "An account already exists for this register number.")

    # Check email uniqueness
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered.")

    # Assign role based on target_role of register number
    assigned_role = rn.target_role if hasattr(rn, 'target_role') and rn.target_role else "student"

    # Create user
    user = User(
        register_number=payload.register_number,
        name=payload.name,
        email=payload.email,
        department=payload.department,
        batch=payload.batch,
        password_hash=hash_password(payload.password),
        role=assigned_role,
    )
    db.add(user)
    rn.is_used = True
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

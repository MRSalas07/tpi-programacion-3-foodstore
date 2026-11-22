from typing import Annotated

from pydantic import EmailStr, StringConstraints
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=3, max_length=50)
    ]
    full_name: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
    ]
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class MensajeResponse(SQLModel):
    message: str

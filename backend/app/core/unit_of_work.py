from typing import Callable
from sqlmodel import Session
from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    
    def __init__(
        self, session_factory: Callable[[], Session] = default_session_factory
    ):
        self.session_factory = session_factory

    def __enter__(self):
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type is not None:                
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
            

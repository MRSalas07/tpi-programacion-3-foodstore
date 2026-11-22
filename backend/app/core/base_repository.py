from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    
    def __init__(self, session: Session, model_cls: type[T]):
        self.session = session
        self.model_cls = model_cls

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model_cls, entity_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model_cls)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()

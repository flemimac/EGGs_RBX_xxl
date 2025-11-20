from pydantic import BaseModel


class RouteBase(BaseModel):
    name: str


class RouteCreate(RouteBase):
    pass


class RouteRead(RouteBase):
    id: str
    user_id: str
    files: list[str] = []

    class Config:
        from_attributes = True


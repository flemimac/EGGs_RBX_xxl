from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.utils import generate_uuid
from app.models.route import Route


async def create_route(session: AsyncSession, name: str, user_id: str) -> Route:
    route = Route(
        id=generate_uuid(),
        name=name,
        user_id=user_id,
    )
    session.add(route)
    await session.commit()
    await session.refresh(route)
    return route


async def get_routes_by_user(session: AsyncSession, user_id: str) -> list[Route]:
    result = await session.execute(
        select(Route).where(Route.user_id == user_id)
    )
    return list(result.scalars().all())


async def get_route_by_id(session: AsyncSession, route_id: str, user_id: str) -> Route | None:
    result = await session.execute(
        select(Route).where(Route.id == route_id, Route.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def delete_route(session: AsyncSession, route_id: str, user_id: str) -> bool:
    route = await get_route_by_id(session, route_id, user_id)
    if route:
        await session.delete(route)
        await session.commit()
        return True
    return False


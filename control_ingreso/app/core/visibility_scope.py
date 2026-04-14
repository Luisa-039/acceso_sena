from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.users import UserOut

ROLE_ADMIN = 1
ROLE_SUBDIRECTOR = 2
ROLE_DINAMIZADOR = 3
ROLE_VIGILANTE = 4
ROLE_TECNICO = 5
ROLE_LIDER_TIC = 6

ROLES_ALL_CENTERS = {ROLE_ADMIN, ROLE_LIDER_TIC}
ROLES_CENTER_SCOPE = {ROLE_SUBDIRECTOR, ROLE_DINAMIZADOR}


def _get_centro_id_by_sede(db: Session, sede_id: int) -> int:
    row = db.execute(
        text("SELECT centro_id FROM sedes WHERE id_sede = :sede_id"),
        {"sede_id": sede_id},
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    return int(row["centro_id"])


def resolve_visibility_scope(
    db: Session,
    user_token: UserOut,
    requested_sede_id: int | None = None,
) -> dict:
    role_id = int(user_token.rol_id)

    if role_id in ROLES_ALL_CENTERS:
        return {
            "sede_id": requested_sede_id,
            "centro_id": None,
        }

    if role_id in ROLES_CENTER_SCOPE:
        user_centro_id = _get_centro_id_by_sede(db, int(user_token.sede_id))

        if requested_sede_id is None:
            return {
                "sede_id": None,
                "centro_id": user_centro_id,
            }

        requested_centro_id = _get_centro_id_by_sede(db, int(requested_sede_id))
        if requested_centro_id != user_centro_id:
            raise HTTPException(
                status_code=403,
                detail="No autorizado para consultar sedes de otro centro",
            )

        return {
            "sede_id": requested_sede_id,
            "centro_id": user_centro_id,
        }

    if requested_sede_id is not None and int(requested_sede_id) != int(user_token.sede_id):
        raise HTTPException(status_code=403, detail="No autorizado para consultar otra sede")

    return {
        "sede_id": int(user_token.sede_id),
        "centro_id": None,
    }


def resolve_write_sede_id(
    db: Session,
    user_token: UserOut,
    requested_sede_id: int | None = None,
) -> int:
    scope = resolve_visibility_scope(db, user_token, requested_sede_id)
    if scope["sede_id"] is not None:
        return int(scope["sede_id"])
    return int(user_token.sede_id)

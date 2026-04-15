from typing import List
from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy.orm import Session
from app.crud.permisos import verify_permissions
from app.router.dependencies import get_current_user
from app.core.database import get_db
from app.schemas.movements import MovementCreate, MovementUpdate, MovementOut, PaginatedMovements
from app.schemas.users import UserOut
from app.crud import movements as crud_movement
from app.core.visibility_scope import resolve_visibility_scope
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()
modulo = 11

@router.post("/crear-movimiento", status_code=status.HTTP_201_CREATED)
def create_movement(  
    movement: MovementCreate,
    db: Session = Depends(get_db),
    user_token: UserOut = Depends(get_current_user)
):
    try:
        id_rol = user_token.rol_id       
        if not verify_permissions(db, id_rol, modulo, 'insertar'):
            raise HTTPException(status_code=401, detail= 'Usuario no autorizado')
        crud_movement.create_movement(db, movement)
        return {"message": "Movimiento creado correctamente"}
    
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-id", response_model=MovementOut)
def get_movement_by_id(
    id_movimiento: int,
    db: Session = Depends(get_db),
    user_token: UserOut = Depends(get_current_user)
):
    try:
        id_rol=user_token.rol_id

        if not verify_permissions(db, id_rol, modulo, 'seleccionar'):
            raise HTTPException(status_code=401, detail="usuario no autorizado")

        scope = resolve_visibility_scope(db, user_token)
        movimiento = crud_movement.get_movement_by_id(
            db,
            id_movimiento,
            sede_id=scope["sede_id"],
            centro_id=scope["centro_id"],
        )
        if not movimiento:
            raise HTTPException(status_code=404, detail="Movimiento no encontrado")
        return movimiento
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.get("/all-movements",  response_model=List[MovementOut])
def all_movements(db: Session = Depends(get_db),
                   user_token: UserOut = Depends(get_current_user)):
    try:
        id_rol=user_token.rol_id

        if not verify_permissions(db, id_rol, modulo, 'seleccionar'):
            raise HTTPException(status_code=401, detail="Usuario no autorizado")
        
        scope = resolve_visibility_scope(db, user_token)
        movimiento = crud_movement.get_all_movements(
            db,
            sede_id=scope["sede_id"],
            centro_id=scope["centro_id"],
        )
        if not movimiento:
            raise HTTPException(status_code=404, detail="Movimientos no encontrados")
        return movimiento
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all-movements-history",  response_model=List[MovementOut])
def all_movements_history(
    db: Session = Depends(get_db),
    user_token: UserOut = Depends(get_current_user),
    search: str | None = None
):
    try:
        id_rol=user_token.rol_id

        if not verify_permissions(db, id_rol, modulo, 'seleccionar'):
            raise HTTPException(status_code=401, detail="Usuario no autorizado")
        scope = resolve_visibility_scope(db, user_token)
        movimiento = crud_movement.get_all_movements_history(
            db,
            sede_id=scope["sede_id"],
            centro_id=scope["centro_id"],
            search=search
        )  
        if not movimiento:
            raise HTTPException(status_code=404, detail="Movimientos no encontrados")
        return movimiento
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/by-serial",  response_model=List[MovementOut])
def movement_serial(
    serial: str,
    db: Session = Depends(get_db),
    user_token: UserOut = Depends(get_current_user)):
    try:
        id_rol=user_token.rol_id

        if not verify_permissions(db, id_rol, modulo, 'seleccionar'):
            raise HTTPException(status_code=401, detail="Usuario no autorizado")
        
        scope = resolve_visibility_scope(db, user_token)
        movimiento = crud_movement.get_movement_serial(
            db,
            serial,
            sede_id=scope["sede_id"],
            centro_id=scope["centro_id"],
        )
        if not movimiento:
            raise HTTPException(status_code=404, detail="Movimientos no encontrados")
        return movimiento
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/by-id/{id_movimiento}")
def update_movement_by_id(
    id_movimiento: int, 
    movement: MovementUpdate, 
    db: Session = Depends(get_db),
    user_token: UserOut = Depends(get_current_user)
):
    try:
        id_rol = user_token.rol_id
        if not verify_permissions(db, id_rol, modulo, 'actualizar'):
            raise HTTPException(status_code=401, detail="Usuario no autorizado")
        
        success = crud_movement.update_movement_by_id(
            db,
            id_movimiento,
            movement.tipo_id,
            usuario_registra=user_token.id_usuario,
            fecha_movimiento=movement.fecha_movimiento,
        )
        if not success:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el movimiento")
        return {"message": "Movimiento actualizado correctamente"}
    except ValueError as e:
        if str(e) == "movement_locked":
            raise HTTPException(status_code=409, detail="El movimiento está en 'Dado de baja' y no admite cambios")
        raise HTTPException(status_code=400, detail="Solicitud inválida")
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/historial/{autorizacion_id}", response_model=List[MovementOut])
def get_movements_history_by_autorizacion(
    autorizacion_id: int,
    db: Session = Depends(get_db),
    user_token: UserOut = Depends(get_current_user)
):
    id_rol = user_token.rol_id
    if not verify_permissions(db, id_rol, modulo, "seleccionar"):
        raise HTTPException(status_code=401, detail="Usuario no autorizado")

    historial = crud_movement.get_movements_by_autorizacion(db, autorizacion_id)
    if not historial:
        raise HTTPException(status_code=404, detail="Historial no encontrado")

    return historial

@router.get("/paginated", response_model=PaginatedMovements)
def get_movements_pag(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str = Query("", min_length=0),
    sede_id: int | None = Query(None, ge=1),
    db: Session = Depends(get_db),
    user_token: UserOut = Depends(get_current_user)
):

    id_rol = user_token.rol_id
    if not verify_permissions(db, id_rol, modulo, "seleccionar"):
        raise HTTPException(status_code=401, detail="Usuario no autorizado")

    skip = (page - 1) * page_size

    scope = resolve_visibility_scope(db, user_token, sede_id)
    data = crud_movement.get_all_movements_pag(
        db,
        skip=skip,
        limit=page_size,
        search=search,
        sede_id=scope["sede_id"],
        centro_id=scope["centro_id"],
    )

    total = data["total"]
    movements = data["movements"]

    return PaginatedMovements(
        page=page,
        page_size=page_size,
        total_movements=total,
        total_pages=(total + page_size - 1) // page_size,
        movements=movements,
    )
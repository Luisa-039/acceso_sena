from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
from app.schemas.areas import AreaCreate, AreaUpdate

import logging

logger = logging.getLogger(__name__)

def create_area(db: Session, area: AreaCreate) -> Optional[bool]:
    try:
        query = text("""
            INSERT INTO areas (
                nombre_area,
                estado
            ) VALUES (
                :nombre_area,
                :estado
            )
        """)
        db.execute(query, area.model_dump())
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al crear el area: {e}")
        raise Exception("Error de base de datos al crear el area")
    
def get_area_by_id(db: Session, id: int):
    try:
        query = text("""SELECT id_area, nombre_area, estado
                     FROM areas
                     WHERE id_area = :id
                """)
        
        result = db.execute(query, {"id": id}).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener área por id: {e}")
        raise Exception("Error de base de datos al obtener el área")

def get_all_areas(db: Session):
    try:
        query = text("""SELECT a.id_area, a.nombre_area, a.estado
                     FROM areas a
                     """)
        result = db.execute(query).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener los areas: {e}")
        raise Exception("Error de base de datos al obtener los areas")
    
def update_area_by_id(db: Session, id_area: int, area: AreaUpdate) -> Optional[bool]:
    try:
        area_data = area.model_dump(exclude_unset=True)
        if not area_data:
            raise Exception("No se enviaron campos para actualizar")

        set_clauses = ", ".join([f"{key} = :{key}" for key in area_data.keys()])
        sentencia = text(f"""
            UPDATE areas a
            SET {set_clauses}
            WHERE a.id_area = :id_area
        """)

        area_data["id_area"] = id_area

        result = db.execute(sentencia, area_data)
        db.commit()

        return result.rowcount > 0
    
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar el area {id_area}: {e}")
        raise Exception("Error de base de datos al actualizar el area")
    
def change_area_status(db: Session, id_area: int, nuevo_estado: bool) -> bool:
    try:
        sentencia = text("""
            UPDATE areas
            SET estado = :estado
            WHERE id_area = :id_area
        """)
        result = db.execute(sentencia, {"estado": nuevo_estado, "id_area": id_area})
        db.commit()

        return result.rowcount > 0

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al cambiar el estado del centro {id_area}: {e}")
        raise Exception("Error de base de datos al cambiar el estado del centro")

#Función para obtener todos las áreas haciendo uso de la paginación
def get_all_areas_pag(db: Session, skip:int = 0, limit = 10, search: str = ""):
    """
    Obtiene las áreas con paginación.
    También realizar una segunda consulta para contar total de areas.
    compatible con PostgreSQL, MySQL y SQLite 
    """
    try: 
        search = search.strip()
        query_params = {"skip": skip, "limit": limit}

        where_clause = ""
        if search:
            where_clause = """
                WHERE a.id_area LIKE :search
                   OR a.nombre_area LIKE :search
                   OR (CASE WHEN a.estado THEN 'activo' ELSE 'inactivo' END) LIKE :search
            """
            query_params["search"] = f"%{search}%"

        #Contamos la cantidad de areas existentes
        count_query = text(f"""SELECT COUNT(id_area) AS total 
                     FROM areas a
                     {where_clause}
                     """)
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar las áreas
        data_query = text(f"""SELECT a.id_area, a.nombre_area, a.estado
                    FROM areas a
                    {where_clause}
                     LIMIT :limit OFFSET :skip
        """)
        areas_list = db.execute(data_query, query_params).mappings().all()
        
        return {
                "total": total_result or 0,
                "areas": areas_list
            }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener las áreas: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener las áreas")
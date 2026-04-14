from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.sede import SedeCreate, SedeUpdate

import logging

logger = logging.getLogger(__name__)

def create_sede(db: Session, sede: SedeCreate) -> Optional[bool]:
    try:
        query = text("""
            INSERT INTO sedes (
                nombre, direccion, codigo_sede, centro_id,
                estado
            ) VALUES (
                :nombre, :direccion, :codigo_sede, :centro_id,
                :estado
            )
        """)
        db.execute(query, sede.model_dump())
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al crear la sede: {e}")
        raise Exception("Error de base de datos al crear la sede")
    
def get_sede_by_code(db: Session, codigo: str, sede_id: int | None = None, centro_id: int | None = None):
    try:
        filters = ["s.codigo_sede = :codigo"]
        params = {"codigo": codigo}
        if sede_id is not None:
            filters.append("s.id_sede = :sede_id")
            params["sede_id"] = sede_id
        if centro_id is not None:
            filters.append("s.centro_id = :centro_id")
            params["centro_id"] = centro_id
        where_clause = " AND ".join(filters)

        query = text("""SELECT s.id_sede, s.nombre, s.direccion, s.codigo_sede, s.centro_id, 
                     c.codigo_centro AS codigo_centro, c.nombre AS nombre_centro,
                     s.estado
                     FROM sedes as s
                     INNER JOIN centros c ON s.centro_id = c.id_centro
                     WHERE """ + where_clause)
        
        result = db.execute(query, params).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener sede por su código: {e}")
        raise Exception("Error de base de datos al obtener la sede")
    
def get_all_sedes(db: Session, sede_id: int | None = None, centro_id: int | None = None):
    try:
        filters = []
        params = {}
        if sede_id is not None:
            filters.append("s.id_sede = :sede_id")
            params["sede_id"] = sede_id
        if centro_id is not None:
            filters.append("s.centro_id = :centro_id")
            params["centro_id"] = centro_id
        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

        query = text("""
            SELECT s.id_sede, s.nombre, s.direccion, s.codigo_sede, s.centro_id,
            c.codigo_centro AS codigo_centro, c.nombre AS nombre_centro, 
            s.estado
            FROM sedes s
            INNER JOIN centros c ON s.centro_id = c.id_centro
            """ + where_clause)
        result = db.execute(query, params).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener el listado de sedes: {e}")
        raise Exception("Error de base de datos al obtener el listado de sedes")
    
def update_sede_by_code(db: Session, code: str, sede: SedeUpdate) -> Optional[bool]:
    try:
        sede_data = sede.model_dump(exclude_unset=True)
        if not sede_data:
            raise Exception("No se enviaron campos para actualizar")

        set_clauses = ", ".join([f"{key} = :{key}" for key in sede_data.keys()])
        sentencia = text(f"""
            UPDATE sedes
            SET {set_clauses}
            WHERE codigo_sede = :codigo_sede
        """)

        sede_data["codigo_sede"] = code

        result = db.execute(sentencia, sede_data)
        db.commit()

        return result.rowcount > 0
    
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar la sede {code}: {e}")
        raise Exception("Error de base de datos al actualizar la sede")
    
def change_sede_status(db: Session, id_sede: int, nuevo_estado: bool) -> bool:
    try:
        sentencia = text("""
            UPDATE sedes
            SET estado = :estado
            WHERE id_sede = :id_sede
        """)
        result = db.execute(sentencia, {"estado": nuevo_estado, "id_sede": id_sede})
        db.commit()

        return result.rowcount > 0

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al cambiar el estado de la sede {id_sede}: {e}")
        raise Exception("Error de base de datos al cambiar el estado de la sede")
    
def get_all_sede_pag(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    sede_id: int | None = None,
    centro_id: int | None = None,
):
    """
    Obtiene los usuarios con paginación.
    También realizar una segunda consulta para contar total de usuarios.
    compatible con PostgreSQL, MySQL y SQLite 
    """
    try: 
        search = search.strip()
        query_params = {"skip": skip, "limit": limit}

        where_clause = ""
        if search:
            where_clause = """
                WHERE s.codigo_sede LIKE :search
                   OR s.nombre LIKE :search
                   OR s.direccion LIKE :search
                   OR c.nombre LIKE :search
                   OR CAST(s.id_sede AS CHAR) LIKE :search
                   OR (CASE WHEN s.estado THEN 'activo' ELSE 'inactivo' END) LIKE :search
            """
            query_params["search"] = f"%{search}%"

        if sede_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} s.id_sede = :sede_id"
            query_params["sede_id"] = sede_id

        if centro_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} s.centro_id = :centro_id"
            query_params["centro_id"] = centro_id

        count_query = text(f"""
            SELECT COUNT(s.id_sede) AS total
            FROM sedes as s
            INNER JOIN centros as c ON s.centro_id = c.id_centro
            {where_clause}
        """)
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar sedes
        data_query = text(f"""
            SELECT s.id_sede, s.centro_id, s.codigo_sede, s.nombre, s.direccion, s.estado, c.nombre as nombre_centro
            FROM sedes as s
            INNER JOIN centros as c ON s.centro_id = c.id_centro
            {where_clause}
            LIMIT :limit OFFSET :skip
        """)

        cedes_list = db.execute(data_query, query_params).mappings().all()
        
        return {
                "total": total_result or 0,
                "sedes": cedes_list
            }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener las sedes: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener las sedes")

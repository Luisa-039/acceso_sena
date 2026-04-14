from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.encuestas import EncuestaCreate, EncuestaUpdate

import logging

logger = logging.getLogger(__name__)

def _scope_filter(sede_id: int | None, centro_id: int | None, alias: str = "ra", sede_alias: str = "se"):
    filters = []
    if sede_id is not None:
        filters.append(f"{alias}.sede_id = :sede_id")
    if centro_id is not None:
        filters.append(f"{sede_alias}.centro_id = :centro_id")
    if not filters:
        return ""
    return "AND " + " AND ".join(filters)

def create_encuesta(db: Session, encuesta: EncuestaCreate) -> Optional[bool]:
    try:
        # Una encuesta por acceso: evita error de llave unica y permite respuesta clara.
        duplicate_query = text("""
            SELECT id_encuesta
            FROM encuestas
            WHERE acceso_id = :acceso_id
        """)
        existing = db.execute(duplicate_query, {"acceso_id": encuesta.acceso_id}).mappings().first()
        if existing:
            raise ValueError("Ya existe una encuesta para este acceso")

        query = text("""
            INSERT INTO encuestas (
                acceso_id, calificacion, observacion, estado_encuesta
            ) VALUES (
                :acceso_id, :calificacion, :observacion, :estado_encuesta
            )
        """)
        db.execute(query, encuesta.model_dump())
        db.commit()
        return True
    except ValueError:
        db.rollback()
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al crear la encuesta: {e}")
        raise Exception("Error de base de datos al crear la encuesta")

def get_all_encuestas(db: Session, sede_id: int | None = None, centro_id: int | None = None):
    try:
        scope_filter = _scope_filter(sede_id, centro_id)
        query = text(f"""SELECT e.id_encuesta, e.acceso_id, e.calificacion, e.observacion, e.estado_encuesta,
                     p.nombre_completo, ar.nombre_area, se.nombre AS nombre_sede
                     FROM encuestas e
                     INNER JOIN registro_accesos ra ON e.acceso_id = ra.id_acceso
                     INNER JOIN personas p ON ra.persona_id = p.id_persona
                     LEFT JOIN areas ar ON ra.area_id = ar.id_area
                     LEFT JOIN sedes se ON ra.sede_id = se.id_sede
                     WHERE 1=1
                     {scope_filter}""")
        
        params = {}
        if sede_id is not None:
            params["sede_id"] = sede_id
        if centro_id is not None:
            params["centro_id"] = centro_id
        result = db.execute(query, params).mappings().all()
        
        return result
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al registrar la encuesta: {e}")
        raise Exception("Error de base de datos al registrar la encuesta")

def get_encuesta_by_id(db: Session, id: int, sede_id: int | None = None, centro_id: int | None = None):
    try:
        scope_filter = _scope_filter(sede_id, centro_id)
        query = text(f"""SELECT e.id_encuesta, e.acceso_id, e.calificacion, e.observacion, e.estado_encuesta,
                     p.nombre_completo, ar.nombre_area, se.nombre AS nombre_sede
                     FROM encuestas e
                     INNER JOIN registro_accesos ra ON e.acceso_id = ra.id_acceso
                     INNER JOIN personas p ON ra.persona_id = p.id_persona
                     LEFT JOIN areas ar ON ra.area_id = ar.id_area
                     LEFT JOIN sedes se ON ra.sede_id = se.id_sede
                     WHERE e.id_encuesta = :id
                     {scope_filter}
                """)
        
        params = {"id": id}
        if sede_id is not None:
            params["sede_id"] = sede_id
        if centro_id is not None:
            params["centro_id"] = centro_id
        result = db.execute(query, params).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener encuesta por su ID: {e}")
        raise Exception("Error de base de datos al obtener la encuesta")

def update_encuesta_by_id(db: Session, id: int, encuesta: EncuestaUpdate) -> Optional[bool]:
    try:
        encuesta_data = encuesta.model_dump(exclude_unset=True)
        if not encuesta_data:
            raise Exception("No se enviaron campos para actualizar")

        set_clauses = ", ".join([f"{key} = :{key}" for key in encuesta_data.keys()])
        sentencia = text(f"""
            UPDATE encuestas
            SET {set_clauses}
            WHERE id_encuesta = :id_encuesta
        """)

        encuesta_data["id_encuesta"] = id

        result = db.execute(sentencia, encuesta_data)
        db.commit()

        return result.rowcount > 0
    
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar la encuesta {id}: {e}")
        raise Exception("Error de base de datos al actualizar la encuesta")

def change_encuesta_status(db: Session, id_encuesta: int, nuevo_estado: bool) -> bool:
    try:
        sentencia = text("""
            UPDATE encuestas
            SET estado_encuesta = :estado_encuesta
            WHERE id_encuesta = :id_encuesta
        """)
        result = db.execute(sentencia, {"estado_encuesta": nuevo_estado, "id_encuesta": id_encuesta})
        db.commit()

        return result.rowcount > 0

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al cambiar el estado de la encuesta {id_encuesta}: {e}")
        raise Exception("Error de base de datos al cambiar el estado de la encuesta")

def get_all_encuestas_pag(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    sede_id: int | None = None,
    centro_id: int | None = None,
):
    """
    Obtiene las encuestas con paginación y búsqueda.
    También realiza una segunda consulta para contar total de encuestas.
    compatible con PostgreSQL, MySQL y SQLite 
    """
    try: 
        search = search.strip()
        query_params = {"skip": skip, "limit": limit}

        where_clause = ""
        if search:
            where_clause = """
                WHERE CAST(e.id_encuesta AS CHAR) LIKE :search
                   OR CAST(e.acceso_id AS CHAR) LIKE :search
                   OR CAST(e.calificacion AS CHAR) LIKE :search
                   OR e.observacion LIKE :search
                   OR p.nombre_completo LIKE :search
                   OR ar.nombre_area LIKE :search
                   OR se.nombre LIKE :search
                   OR (CASE WHEN e.estado_encuesta THEN 'enviado' ELSE 'pendiente' END) LIKE :search
            """
            query_params["search"] = f"%{search}%"

        if sede_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} ra.sede_id = :sede_id"
            query_params["sede_id"] = sede_id

        if centro_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} se.centro_id = :centro_id"
            query_params["centro_id"] = centro_id

        count_query = text(f"""
            SELECT COUNT(e.id_encuesta) AS total 
            FROM encuestas e
            INNER JOIN registro_accesos ra ON e.acceso_id = ra.id_acceso
            INNER JOIN personas p ON ra.persona_id = p.id_persona
            LEFT JOIN areas ar ON ra.area_id = ar.id_area
            LEFT JOIN sedes se ON ra.sede_id = se.id_sede
            {where_clause}
        """)
        
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar encuestas
        data_query = text(f"""
            SELECT e.id_encuesta, e.acceso_id, e.calificacion, e.observacion, e.estado_encuesta,
                   p.nombre_completo, ar.nombre_area, se.nombre AS nombre_sede
            FROM encuestas e
            INNER JOIN registro_accesos ra ON e.acceso_id = ra.id_acceso
            INNER JOIN personas p ON ra.persona_id = p.id_persona
            LEFT JOIN areas ar ON ra.area_id = ar.id_area
            LEFT JOIN sedes se ON ra.sede_id = se.id_sede
            {where_clause}
            LIMIT :limit OFFSET :skip
        """)
        
        encuestas_list = db.execute(data_query, query_params).mappings().all()
        
        return {
                "total": total_result or 0,
                "encuestas": encuestas_list
            }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener las encuestas: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener las encuestas")

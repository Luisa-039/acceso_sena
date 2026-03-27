from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.schemas.inv_consumibles import Inv_consumibleCreate, Inv_consumibleUpdate, Inv_consumibleEstado

logger = logging.getLogger(__name__)

def create_inv_consumible(db: Session, 
                     inv_consumible: Inv_consumibleCreate,
                     ) -> Optional[bool]:
    try:
        query = text("""
            INSERT INTO inv_consumibles (
                sede_id, categoria_id, placa, ubicacion, cantidad, porcentaje_toner,
                marca, modelo,
                fecha_registro, estado
            ) VALUES (
                :sede_id, :categoria_id, :placa, :ubicacion, :cantidad, :porcentaje_toner,
                :marca, :modelo, :fecha_registro, true
            )
        """)
        db.execute(query, inv_consumible.model_dump())
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al registrar el equipo de la sede: {e}")
        raise Exception("Error de base de datos al registrar el equipo de la sede") 

def get_inv_consumible_by_id(db: Session, id_consumible: int):
    try:
        query = text("""SELECT ic.id_consumible, ic.ubicacion, ic.placa, ic.categoria_id, ic.marca, 
                        ic.modelo, ic.sede_id, ic.fecha_registro, ic.cantidad, ic.porcentaje_toner,
                        ic.estado, s.nombre as nombre_sede, c.nombre_categoria
                        FROM inv_consumibles as ic
                        INNER JOIN sedes as s ON ic.sede_id = s.id_sede
                        INNER JOIN categorias as c ON ic.categoria_id = c.id_categoria
                        WHERE ic.id_consumible = :id_consumible""")
        result = db.execute(query, {"id_consumible": id_consumible}).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener consumible por ID: {e}")
        raise Exception("Error de base de datos al obtener el consumible por ID")

def get_all_inv_consumibles(db: Session):
    try:
        query = text("""SELECT ic.id_consumible, ic.ubicacion, ic.placa, ic.categoria_id, ic.marca, 
                        ic.modelo, ic.sede_id, ic.fecha_registro, ic.cantidad, ic.porcentaje_toner,
                        ic.estado, s.nombre as nombre_sede, c.nombre_categoria
                        FROM inv_consumibles as ic
                        INNER JOIN sedes as s ON ic.sede_id = s.id_sede
                        INNER JOIN categorias as c ON ic.categoria_id = c.id_categoria
                     """)
        result = db.execute(query).mappings().all()
        print([e.estado for e in result])
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener los datos de los consumibles: {e}")
        raise Exception("Error de base de datos al obtener los datos de los consumibles")

def update_inv_consumible_by_id(db: Session, id_consumible: int, consumible: Inv_consumibleUpdate) -> Optional[bool]:
    try:
        consumible_data = consumible.model_dump(exclude_unset=True)
        if not consumible_data:
            return False 

        set_clauses = ", ".join([f"{key} = :{key}" for key in consumible_data.keys()])
        sentencia = text(f"""
            UPDATE inv_consumibles 
            SET {set_clauses}
            WHERE id_consumible = :id_consumible
        """)

        consumible_data["id_consumible"] = id_consumible

        result = db.execute(sentencia, consumible_data)
        db.commit()

        return result.rowcount > 0
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar el equipo {id_consumible}: {e}")
        raise Exception("Error de base de datos al actualizar el equipo")
    
def update_estado_consumible(db:Session, id_consumible: int, estado_consumible: bool) -> bool:
    try:
        sentencia = text("""
            UPDATE inv_consumibles
            SET estado = :estado_consumible
            WHERE id_consumible = :id_consumible
        """)
        result = db.execute(sentencia, {"estado_consumible": estado_consumible, "id_consumible": id_consumible})
        db.commit()

        return result.rowcount > 0

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al cambiar el estado del consumible {id_consumible}: {e}")
        raise Exception("Error de base de datos al cambiar el estado del consumible")
    
def get_all_consumible_pag(db: Session, skip:int = 0, limit = 10, search: str = ""):
    """
    Obtiene los consumibles con paginación y búsqueda.
    También realizar una segunda consulta para contar total de consumibles.
    compatible con PostgreSQL, MySQL y SQLite 
    """
    try: 
        search = search.strip()
        query_params = {"skip": skip, "limit": limit}

        where_clause = ""
        if search:
            where_clause = """
                WHERE CAST(ic.id_consumible AS CHAR) LIKE :search
                   OR ic.placa LIKE :search
                   OR ic.ubicacion LIKE :search
                   OR ic.marca LIKE :search
                   OR ic.modelo LIKE :search
                   OR s.nombre LIKE :search
                   OR c.nombre_categoria LIKE :search
                   OR CAST(ic.cantidad AS CHAR) LIKE :search
                   OR CAST(ic.porcentaje_toner AS CHAR) LIKE :search
                   OR (CASE WHEN ic.estado THEN 'activo' ELSE 'inactivo' END) LIKE :search
            """
            query_params["search"] = f"%{search}%"

        count_query = text(f"""
            SELECT COUNT(ic.id_consumible) AS total 
            FROM inv_consumibles ic
            INNER JOIN sedes as s ON ic.sede_id = s.id_sede
            INNER JOIN categorias as c ON ic.categoria_id = c.id_categoria
            {where_clause}
        """)
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar consumibles
        data_query = text(f"""
            SELECT ic.id_consumible, ic.ubicacion, ic.placa, ic.categoria_id, ic.marca, 
                   ic.modelo, ic.sede_id, ic.fecha_registro, ic.cantidad, ic.porcentaje_toner,
                   ic.estado, s.nombre as nombre_sede, c.nombre_categoria
            FROM inv_consumibles as ic
            INNER JOIN sedes as s ON ic.sede_id = s.id_sede
            INNER JOIN categorias as c ON ic.categoria_id = c.id_categoria
            {where_clause}
            LIMIT :limit OFFSET :skip
        """)
        equipos_list = db.execute(data_query, query_params).mappings().all()
        
        return {
                "total": total_result or 0,
                "consumibles": equipos_list
            }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener los consumibles: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener los consumibles")


def get_dashboard_consumibles_summary(db: Session, sede_id: int):
    """
    Retorna un resumen para dashboard filtrado por sede:
    - total de consumibles
    - activos / inactivos
    - cantidades agrupadas por categoria
    """
    try:
        totales_query = text("""
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN estado = true THEN 1 ELSE 0 END), 0) AS activos,
                COALESCE(SUM(CASE WHEN estado = false THEN 1 ELSE 0 END), 0) AS inactivos
            FROM inv_consumibles
            WHERE sede_id = :sede_id
        """)
        totales = db.execute(totales_query, {"sede_id": sede_id}).mappings().first()

        categorias_query = text("""
            SELECT
                c.nombre_categoria AS categoria,
                COALESCE(SUM(ic.cantidad), 0) AS cantidad
            FROM categorias c
            LEFT JOIN inv_consumibles ic
                ON ic.categoria_id = c.id_categoria
                AND ic.sede_id = :sede_id
            GROUP BY c.id_categoria, c.nombre_categoria
            ORDER BY c.nombre_categoria ASC
        """)
        categorias = db.execute(categorias_query, {"sede_id": sede_id}).mappings().all()

        return {
            "total": int((totales or {}).get("total", 0) or 0),
            "activos": int((totales or {}).get("activos", 0) or 0),
            "inactivos": int((totales or {}).get("inactivos", 0) or 0),
            "por_categoria": [
                {
                    "categoria": item["categoria"],
                    "cantidad": int(item["cantidad"] or 0),
                }
                for item in categorias
            ],
        }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener resumen dashboard de consumibles: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener resumen de consumibles")

 

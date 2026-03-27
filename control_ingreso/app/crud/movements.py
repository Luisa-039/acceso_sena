from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

import logging

logger = logging.getLogger(__name__)

def get_movement_serial(db:Session, serial: str):
    try:
        query = text("""SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
                        m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo, 
                        e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
                        FROM movimientos_equipos_sede m
                        INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
                        INNER JOIN categorias c ON c.id_categoria = e.categoria_id
                        INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
                        INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
                        WHERE e.serial = :serial
                    """)
        result = db.execute(query, {"serial": serial}).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener movimiento por serial")
        raise Exception("Error de base de datos al obtener movimiento")
    
def get_all_movements(db: Session):
    try:
        query = text("""SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
                        m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo, 
                        e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
                        FROM movimientos_equipos_sede m
                        INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
                        INNER JOIN categorias c ON c.id_categoria = e.categoria_id
                        INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
                        INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
                    """)
        result = db.execute(query).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener el listado de movimientos: {e}")
        raise Exception("Error de base de datos al obtener el listado de movimientos")
    
def update_movement_by_id(db: Session, id_movimiento: int, tipo_id: int) -> bool:
    try:
        query = text("""
            UPDATE movimientos_equipos_sede
            SET tipo_id = :movimiento_eq
            WHERE id_movimiento_sede = :id_movimiento_sede
        """)
        result = db.execute(query, {"movimiento_eq": tipo_id, "id_movimiento_sede": id_movimiento})
        db.commit()

        return result.rowcount > 0

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar los movimientos: {e}")
        raise Exception("Error de base de datos al actualizar los movimientos")

def get_all_movements_pag(db: Session, skip:int = 0, limit = 10, search: str = ""):
    """
    Obtiene los usuarios con paginación.
    También realizar una segunda consulta para contar total de autorizaciones.
    compatible con PostgreSQL, MySQL y SQLite 
    """
    try: 
        search = search.strip()
        query_params = {"skip": skip, "limit": limit}

        where_clause = ""
        if search:
            where_clause = """
                WHERE CAST(m.id_movimiento_sede AS CHAR) LIKE :search
                OR CAST(m.autorizacion_id AS CHAR) LIKE :search
                OR e.serial LIKE :search
                OR u.nombre_usuario LIKE :search
                OR c.nombre_categoria LIKE :search
                OR tm.nombre_tipo LIKE :search
            """
            query_params["search"] = f"%{search}%"

        count_query = text(f"""
            SELECT COUNT(m.id_movimiento_sede) AS total
            FROM movimientos_equipos_sede m
            INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
            INNER JOIN categorias c ON c.id_categoria = e.categoria_id
            INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
            INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
            {where_clause}
        """)
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar movimientos
        data_query = text(f"""
            SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
            m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo,
            e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
            FROM movimientos_equipos_sede m
            INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
            INNER JOIN categorias c ON c.id_categoria = e.categoria_id
            INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
            INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
            {where_clause}
            ORDER BY m.fecha_movimiento DESC
            LIMIT :limit OFFSET :skip
        """)
        movements_list = db.execute(data_query, query_params).mappings().all()
        
        return {
                "total": total_result or 0,
                "movements": movements_list
            }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener las autorizaciones de salida: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener las autorizaciones de salida")

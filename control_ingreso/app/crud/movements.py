from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

import logging

logger = logging.getLogger(__name__)


def _normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return value.strip().lower().replace("_", " ")


def _latest_movements_from_clause() -> str:
    return """
        FROM movimientos_equipos_sede m
        INNER JOIN (
            SELECT MAX(id_movimiento_sede) AS id_movimiento_sede
            FROM movimientos_equipos_sede
            GROUP BY COALESCE(autorizacion_id, id_movimiento_sede)
        ) latest ON latest.id_movimiento_sede = m.id_movimiento_sede
        INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
        INNER JOIN sedes s ON e.sede_id = s.id_sede
        INNER JOIN categorias c ON c.id_categoria = e.categoria_id
        INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
        INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
    """

def get_movement_by_id(
    db: Session,
    id_movimiento: int,
    sede_id: int | None = None,
    centro_id: int | None = None,
):
    try:
        sede_filter = "AND e.sede_id = :sede_id" if sede_id is not None else ""
        centro_filter = "AND s.centro_id = :centro_id" if centro_id is not None else ""
        query = text(f"""SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
                        m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo, 
                        e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
                        FROM movimientos_equipos_sede m
                        INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
                        INNER JOIN sedes s ON e.sede_id = s.id_sede
                        INNER JOIN categorias c ON c.id_categoria = e.categoria_id
                        INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
                        INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
                        WHERE m.id_movimiento_sede = :id_movimiento {sede_filter} {centro_filter}
                    """)
        params = {"id_movimiento": id_movimiento}
        if sede_id is not None:
            params["sede_id"] = sede_id
        if centro_id is not None:
            params["centro_id"] = centro_id
        result = db.execute(query, params).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener movimiento por id")
        raise Exception("Error de base de datos al obtener movimiento")

def get_movement_serial(
    db: Session,
    serial: str,
    sede_id: int | None = None,
    centro_id: int | None = None,
):
    try:
        sede_filter = "AND e.sede_id = :sede_id" if sede_id is not None else ""
        centro_filter = "AND s.centro_id = :centro_id" if centro_id is not None else ""
        query = text(f"""SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
                        m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo, 
                        e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
                        FROM movimientos_equipos_sede m
                        INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
                        INNER JOIN sedes s ON e.sede_id = s.id_sede
                        INNER JOIN categorias c ON c.id_categoria = e.categoria_id
                        INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
                        INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
                        WHERE e.serial = :serial {sede_filter} {centro_filter}
                    """)
        params = {"serial": serial}
        if sede_id is not None:
            params["sede_id"] = sede_id
        if centro_id is not None:
            params["centro_id"] = centro_id
        result = db.execute(query, params).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener movimiento por serial")
        raise Exception("Error de base de datos al obtener movimiento")
    
def get_all_movements(db: Session, sede_id: int | None = None, centro_id: int | None = None):
    try:
        filters = []
        if sede_id is not None:
            filters.append("e.sede_id = :sede_id")
        if centro_id is not None:
            filters.append("s.centro_id = :centro_id")
        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        query = text(f"""SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
                        m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo, 
                        e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
                        {_latest_movements_from_clause()}
                        {where_clause}
                    """)
        params = {}
        if sede_id is not None:
            params["sede_id"] = sede_id
        if centro_id is not None:
            params["centro_id"] = centro_id
        result = db.execute(query, params).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener el listado de movimientos: {e}")
        raise Exception("Error de base de datos al obtener el listado de movimientos")
    
def get_movements_by_autorizacion(db: Session, autorizacion_id: int):
    try:
        query = text("""
            SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
                   m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo,
                   e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
            FROM movimientos_equipos_sede m
            INNER JOIN equipos_sede_inv e ON m.equipo_id = e.id_equipo_sede
            INNER JOIN sedes s ON e.sede_id = s.id_sede
            INNER JOIN categorias c ON c.id_categoria = e.categoria_id
            INNER JOIN usuarios as u ON u.id_usuario = m.usuario_registra
            INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
            WHERE m.autorizacion_id = :autorizacion_id
            ORDER BY m.fecha_movimiento ASC, m.id_movimiento_sede ASC
        """)
        result = db.execute(query, {"autorizacion_id": autorizacion_id}).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener historial del movimiento: {e}")
        raise Exception("Error de base de datos al obtener el historial del movimiento")


def update_movement_by_id(
    db: Session,
    id_movimiento: int,
    tipo_id: int,
    usuario_registra: int | None = None,
    fecha_movimiento: datetime | None = None,
) -> bool:
    try:
        current_query = text("""
            SELECT m.id_movimiento_sede, m.equipo_id, tm.nombre_tipo, m.usuario_registra
            FROM movimientos_equipos_sede m
            INNER JOIN tipo_movimientos tm ON tm.id_tipo = m.tipo_id
            WHERE m.id_movimiento_sede = :id_movimiento_sede
        """)
        current_movement = db.execute(
            current_query,
            {"id_movimiento_sede": id_movimiento},
        ).mappings().first()

        if not current_movement:
            return False

        if _normalize_text(current_movement.get("nombre_tipo")) == "dado de baja":
            raise ValueError("movement_locked")

        type_query = text("""
            SELECT nombre_tipo
            FROM tipo_movimientos
            WHERE id_tipo = :tipo_id
        """)
        target_type = db.execute(type_query, {"tipo_id": tipo_id}).mappings().first()
        if not target_type:
            return False

# Si el movimiento actual no es "Dado de baja" pero el nuevo tipo sí lo es, se debe actualizar el estado del equipo.

        movement_user = usuario_registra or current_movement["usuario_registra"]
        movement_time = fecha_movimiento or datetime.now(timezone.utc)
        insert_query = text("""
            INSERT INTO movimientos_equipos_sede (
                equipo_id, autorizacion_id, usuario_registra, fecha_movimiento, tipo_id
            )
            SELECT equipo_id, autorizacion_id, :usuario_registra, :fecha_movimiento, :tipo_id
            FROM movimientos_equipos_sede
            WHERE id_movimiento_sede = :id_movimiento_sede
        """)
        try:
            result = db.execute(insert_query, {
                "tipo_id": tipo_id,
                "id_movimiento_sede": id_movimiento,
                "usuario_registra": movement_user,
                "fecha_movimiento": movement_time,
            })
            # Confirmar primero el cambio de estado en movimientos.
            db.commit()
        except IntegrityError as insert_error:
            db.rollback()
            logger.warning(
                "No se pudo crear histórico para movimiento %s (posible restricción única). "
                "Se actualiza la fila actual. Error: %s",
                id_movimiento,
                insert_error,
            )
            update_current_query = text("""
                UPDATE movimientos_equipos_sede
                SET tipo_id = :tipo_id,
                    usuario_registra = :usuario_registra,
                    fecha_movimiento = :fecha_movimiento
                WHERE id_movimiento_sede = :id_movimiento_sede
            """)
            result = db.execute(update_current_query, {
                "tipo_id": tipo_id,
                "usuario_registra": movement_user,
                "fecha_movimiento": movement_time,
                "id_movimiento_sede": id_movimiento,
            })
            db.commit()

        if _normalize_text(target_type.get("nombre_tipo")) == "dado de baja":
            try:
                update_equipment_status = text("""
                    UPDATE equipos_sede_inv
                    SET estado = :estado
                    WHERE id_equipo_sede = :equipo_id
                """)
                db.execute(update_equipment_status, {
                    "estado": "Dado_de_baja",
                    "equipo_id": current_movement["equipo_id"],
                })
                db.commit()
            except SQLAlchemyError as state_error:
                db.rollback()
                logger.warning(
                    "No se pudo actualizar estado a 'Dado_de_baja' para equipo %s. "
                    "Se usa fallback a 'Inactivo'. Error: %s",
                    current_movement["equipo_id"],
                    state_error,
                )
                try:
                    fallback_status = text("""
                        UPDATE equipos_sede_inv
                        SET estado = :estado
                        WHERE id_equipo_sede = :equipo_id
                    """)
                    db.execute(fallback_status, {
                        "estado": "Inactivo",
                        "equipo_id": current_movement["equipo_id"],
                    })
                    db.commit()
                except SQLAlchemyError as fallback_error:
                    db.rollback()
                    logger.error(
                        "No se pudo aplicar fallback de estado para equipo %s: %s",
                        current_movement["equipo_id"],
                        fallback_error,
                    )

        return result.rowcount > 0

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar los movimientos: {e}", exc_info=True)
        raise Exception(f"Error de base de datos al actualizar los movimientos: {e}")

def get_all_movements_pag(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    sede_id: int | None = None,
    centro_id: int | None = None,
):
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

        if sede_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} e.sede_id = :sede_id"
            query_params["sede_id"] = sede_id

        if centro_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} s.centro_id = :centro_id"
            query_params["centro_id"] = centro_id

        count_query = text(f"""
            SELECT COUNT(m.id_movimiento_sede) AS total
            {_latest_movements_from_clause()}
            {where_clause}
        """)
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar movimientos
        data_query = text(f"""
            SELECT m.id_movimiento_sede, m.equipo_id, m.autorizacion_id,
            m.usuario_registra, m.tipo_id, m.fecha_movimiento, e.serial AS serial_equipo,
            e.categoria_id, u.nombre_usuario, c.nombre_categoria, tm.nombre_tipo
            {_latest_movements_from_clause()}
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

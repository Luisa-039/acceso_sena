from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.schemas.equipments_sede import Equipo_sedeCreate, Equipo_sedeUpdate, Estado_equip_sede

logger = logging.getLogger(__name__)

def create_equipment_sede(db: Session, 
                     equipo_sede: Equipo_sedeCreate,
                     ) -> Optional[bool]:
    try:
        query = text("""
            INSERT INTO equipos_sede_inv (
                sede_id, categoria_id, serial, codigo_barras_equipo, area_id,
                descripcion, marca, modelo,
                fecha_registro, estado
            ) VALUES (
                :sede_id, :categoria_id, :serial, :codigo_barras_equipo, :area_id,
                :descripcion, :marca, :modelo, :fecha_registro, :estado
            )
        """)
        db.execute(query, equipo_sede.model_dump())
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al registrar el equipo de la sede: {e}")
        raise Exception("Error de base de datos al registrar el equipo de la sede") 

def get_equipment_sede_by_cod_barras(
    db: Session,
    codigo_barras: str,
    sede_id: int | None = None,
    centro_id: int | None = None,
):
    try:
        sede_filter = "AND eq.sede_id = :sede_id" if sede_id is not None else ""
        centro_filter = "AND s.centro_id = :centro_id" if centro_id is not None else ""
        query = text(f"""SELECT eq.id_equipo_sede, eq.serial, eq.area_id,eq.codigo_barras_equipo, eq.descripcion,
                          eq.categoria_id, eq.marca, eq.modelo, eq.sede_id, eq.fecha_registro,a.nombre_area,
                          eq.estado, s.nombre as nombre_sede, c.nombre_categoria
                          FROM equipos_sede_inv as eq
                          INNER JOIN sedes as s ON eq.sede_id = s.id_sede
                          INNER JOIN categorias as c ON eq.categoria_id = c.id_categoria
                          INNER JOIN areas as a ON eq.area_id = a.id_area
                          WHERE codigo_barras_equipo = :codigo_barras {sede_filter} {centro_filter}""")
        params = {"codigo_barras": codigo_barras}
        if sede_id is not None:
            params["sede_id"] = sede_id
        if centro_id is not None:
            params["centro_id"] = centro_id
        result = db.execute(query, params).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener equipo por código de barras: {e}")
        raise Exception("Error de base de datos al obtener el equipo por código de barras")

def get_equipment_sede_by_serial(
    db: Session,
    serial_eq: str,
    sede_id: int | None = None,
    centro_id: int | None = None,
):
    try:
        sede_filter = "AND eq.sede_id = :sede_id" if sede_id is not None else ""
        centro_filter = "AND s.centro_id = :centro_id" if centro_id is not None else ""
        query = text(f"""SELECT eq.id_equipo_sede, eq.serial, eq.area_id,eq.codigo_barras_equipo, eq.descripcion,
                          eq.categoria_id, eq.marca, eq.modelo, eq.sede_id, eq.fecha_registro,
                          eq.estado, s.nombre as nombre_sede, c.nombre_categoria, a.nombre_area
                          FROM equipos_sede_inv as eq
                          INNER JOIN sedes as s ON eq.sede_id = s.id_sede
                          INNER JOIN categorias as c ON eq.categoria_id = c.id_categoria
                          INNER JOIN areas as a ON eq.area_id = a.id_area
                     WHERE serial = :equipo_serial {sede_filter} {centro_filter}""")
        params = {"equipo_serial": serial_eq}
        if sede_id is not None:
            params["sede_id"] = sede_id
        if centro_id is not None:
            params["centro_id"] = centro_id
        result = db.execute(query, params).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener equipo por id: {e}")
        raise Exception("Error de base de datos al obtener el equipo por id")

def get_all_equipments_sede(db: Session, sede_id: int | None = None, centro_id: int | None = None):
    try:
        filters = []
        if sede_id is not None:
            filters.append("eq.sede_id = :sede_id")
        if centro_id is not None:
            filters.append("s.centro_id = :centro_id")
        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        query = text(f"""SELECT eq.id_equipo_sede, eq.serial, eq.area_id,eq.codigo_barras_equipo, eq.descripcion,
                          eq.categoria_id, eq.marca, eq.modelo, eq.sede_id, eq.fecha_registro,
                          eq.estado, s.nombre as nombre_sede, c.nombre_categoria, a.nombre_area
                          FROM equipos_sede_inv as eq
                          INNER JOIN sedes as s ON eq.sede_id = s.id_sede
                          INNER JOIN categorias as c ON eq.categoria_id = c.id_categoria
                          INNER JOIN areas as a ON eq.area_id = a.id_area
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
        logger.error(f"Error al obtener los datos de los equipos: {e}")
        raise Exception("Error de base de datos al obtener los datos de los equipos")

def update_equip_sede_by_cod_barras(db: Session, cod_barras: str, equipment: Equipo_sedeUpdate) -> Optional[bool]:
    try:
        equipment_data = equipment.model_dump(exclude_unset=True)
        if not equipment_data:
            return False 

        set_clauses = ", ".join([f"{key} = :{key}" for key in equipment_data.keys()])
        sentencia = text(f"""
            UPDATE equipos_sede_inv 
            SET {set_clauses}
            WHERE codigo_barras_equipo = :codigo_barra
        """)

        equipment_data["codigo_barra"] = cod_barras

        result = db.execute(sentencia, equipment_data)
        db.commit()

        return result.rowcount > 0
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar el equipo {cod_barras}: {e}")
        raise Exception("Error de base de datos al actualizar el equipo")
    
def update_estado_equip_sede(db:Session, id_equip: int, estado_equipo: Estado_equip_sede):
    try:
        sentencia = text("""
            UPDATE equipos_sede_inv
            SET estado = :estado_eq
            WHERE id_equipo_sede = :equipo_id
        """)
        result = db.execute(sentencia, {"estado_eq": estado_equipo.value, "equipo_id": id_equip})
        db.commit()

        return result.rowcount > 0

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al cambiar el estado del equipo {id_equip}: {e}")
        raise Exception("Error de base de datos al cambiar el estado del equipo")
    
def update_equip_sede_by_id(db: Session, equipo_id: int, equipment: Equipo_sedeUpdate) -> Optional[bool]:
    try:
        equipment_data = equipment.model_dump(exclude_unset=True)
        if not equipment_data:
            return False 

        set_clauses = ", ".join([f"{key} = :{key}" for key in equipment_data.keys()])
        sentencia = text(f"""
            UPDATE equipos_sede_inv 
            SET {set_clauses}
            WHERE id_equipo_sede = :id_equip
        """)
        equipment_data["id_equip"] = equipo_id

        result = db.execute(sentencia, equipment_data)
        db.commit()

        return result.rowcount > 0
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al actualizar el id del equipo {equipo_id}: {e}")
        raise Exception("Error de base de datos al actualizar el id del equipo")
     
def get_all_equipements_sede_pag(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    sede_id: int | None = None,
    centro_id: int | None = None,
):
    """
    Obtiene los equipos con paginación.
    También realizar una segunda consulta para contar total de equipos.
    compatible con PostgreSQL, MySQL y SQLite 
    """
    try: 
        search = search.strip()
        query_params = {"skip": skip, "limit": limit}

        where_clause = ""
        if search:
            where_clause = """
                WHERE eq.serial LIKE :search
                   OR eq.codigo_barras_equipo LIKE :search
                   OR eq.descripcion LIKE :search
                   OR eq.marca LIKE :search
                   OR eq.modelo LIKE :search
                   OR s.nombre LIKE :search
                   OR c.nombre_categoria LIKE :search
                   OR a.nombre_area LIKE :search
                   OR CAST(eq.id_equipo_sede AS CHAR) LIKE :search
                   OR eq.estado LIKE :search
            """
            query_params["search"] = f"%{search}%"

        if sede_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} eq.sede_id = :sede_id"
            query_params["sede_id"] = sede_id

        if centro_id is not None:
            where_clause = f"{where_clause} {'AND' if where_clause else 'WHERE'} s.centro_id = :centro_id"
            query_params["centro_id"] = centro_id

        count_query = text(f"""
            SELECT COUNT(eq.id_equipo_sede) AS total
            FROM equipos_sede_inv as eq
            INNER JOIN sedes as s ON eq.sede_id = s.id_sede
            INNER JOIN categorias as c ON eq.categoria_id = c.id_categoria
            INNER JOIN areas as a ON eq.area_id = a.id_area
            {where_clause}
        """)
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar equipos
        data_query = text(f"""SELECT eq.id_equipo_sede, eq.serial, eq.area_id,eq.codigo_barras_equipo, eq.descripcion,
                            eq.categoria_id, eq.marca, eq.modelo, eq.sede_id, eq.fecha_registro,
                            eq.estado, s.nombre as nombre_sede, c.nombre_categoria, a.nombre_area
                            FROM equipos_sede_inv as eq
                            INNER JOIN sedes as s ON eq.sede_id = s.id_sede
                            INNER JOIN categorias as c ON eq.categoria_id = c.id_categoria
                            INNER JOIN areas as a ON eq.area_id = a.id_area
                            {where_clause}
                            LIMIT :limit OFFSET :skip
                            """)
        equipos_list = db.execute(data_query, query_params).mappings().all()
        
        return {
                "total": total_result or 0,
                "equipos": equipos_list
            }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener los equipos: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener los equipos")

 

from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.departments import DepartmentCreate

import logging

logger = logging.getLogger(__name__)

#Función para crear departamentos
def create_department(db: Session, department: DepartmentCreate) -> Optional[bool]:
    try:
        #Se realiza la consulta
        query = text("""
            INSERT INTO departamentos (
                nombre, codigo
            ) VALUES (
                :nombre, :codigo
            )
        """)
        db.execute(query, department.model_dump())
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error al crear el departamento: {e}")
        raise Exception("Error de base de datos al crear el departamento")
    
def get_department_by_code(db: Session, code: str):
    try:
        query = text("""SELECT id_departamento, nombre, codigo
                     FROM departamentos
                     WHERE codigo = :code
                """)
        
        result = db.execute(query, {"code": code}).mappings().first()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener departamento por código: {e}")
        raise Exception("Error de base de datos al obtener el departamento")

#Función para obtener el listado con todos los departamentos existentes
def get_all_departments(db: Session):
    try:
        query = text("""
            SELECT id_departamento, nombre, codigo
            FROM departamentos
        """)
        result = db.execute(query).mappings().all()
        return result
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener el listado de departamentos: {e}")
        raise Exception("Error de base de datos al obtener el listado de departamentos")

#Función para la paginación  
def get_all_departments_pag(db: Session, skip:int = 0, limit = 10, search: str = ""):
    """
    Obtiene los departamentos con paginación.
    También realizar una segunda consulta para contar total de departamentos.
    """
    try: 
        search = search.strip()
        query_params = {"skip": skip, "limit": limit}

        where_clause = ""
        if search:
            where_clause = """
                WHERE nombre LIKE :search
                   OR codigo LIKE :search
                   OR CAST(id_departamento AS CHAR) LIKE :search
            """
            query_params["search"] = f"%{search}%"

        #1 Contar el total de departamentos existentes
        count_query = text(f"""
            SELECT COUNT(id_departamento) AS total
            FROM departamentos
            {where_clause}
        """)
        total_result = db.execute(count_query, query_params).scalar()

        #2 Consultar departamentos
        data_query = text(f"""
            SELECT id_departamento, nombre, codigo
            FROM departamentos
            {where_clause}
            LIMIT :limit OFFSET :skip
        """)
        departments_list = db.execute(data_query, query_params).mappings().all()
        
        return {
                "total": total_result or 0,
            "departamentos": departments_list
            }
    except SQLAlchemyError as e:
        logger.error(f"Error al obtener los departamentos: {e}", exc_info=True)
        raise Exception("Error de base de datos al obtener los departamentos")
    

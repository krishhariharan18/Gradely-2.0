from flask import Blueprint, jsonify, request
from .database import get_db_connection

api_bp = Blueprint('api', __name__)

@api_bp.route('/api/programs', methods=['GET'])
def get_programs():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, program_name FROM programs ORDER BY id;")
            programs = cursor.fetchall()
        connection.close()
        return jsonify(programs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/api/semesters', methods=['GET'])
def get_semesters():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, semester_number, semester_name FROM semesters ORDER BY id;")
            semesters = cursor.fetchall()
        connection.close()
        return jsonify(semesters)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/api/courses', methods=['GET'])
def get_courses():
    program_id = request.args.get('program_id')
    semester_id = request.args.get('semester_id')
    
    if not program_id or not semester_id:
        return jsonify({"error": "Missing program_id or semester_id parameter"}), 400
        
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, course_name, credits FROM courses WHERE program_id = %s AND semester_id = %s ORDER BY id;",
                (program_id, semester_id)
            )
            courses = cursor.fetchall()
        connection.close()
        return jsonify(courses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/api/grade_scale', methods=['GET'])
def get_grade_scale():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT grade_letter, grade_point FROM grade_scale ORDER BY grade_point DESC;")
            grades = cursor.fetchall()
        connection.close()
        return jsonify(grades)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/api/semester_credits', methods=['GET'])
def get_semester_credits():
    program_id = request.args.get('program_id')
    if not program_id:
        return jsonify({"error": "Missing program_id"}), 400
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT semester_id, SUM(credits) as total_credits 
                FROM courses 
                WHERE program_id = %s 
                GROUP BY semester_id 
                ORDER BY semester_id;
            """, (program_id,))
            credits_data = cursor.fetchall()
        connection.close()
        return jsonify(credits_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import pymysql
from . import config

def get_db_connection():
    # ssl={"ssl": {}} enables SSL required by PlanetScale (and is harmless for other hosts)
    return pymysql.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME,
        ssl={"ssl": {}},
        cursorclass=pymysql.cursors.DictCursor
    )
import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("No DATABASE_URL found.")
else:
    engine = create_engine(db_url)
    inspector = inspect(engine)
    print("Tables:", inspector.get_table_names())

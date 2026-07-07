from sqlalchemy import create_engine, text

engine = create_engine('postgresql://neondb_owner:npg_Wo5NUKiJfb2C@ep-tiny-surf-at3uzeb0-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require')
conn = engine.connect()

conn.execute(text('DROP TABLE IF EXISTS "order" CASCADE;'))
conn.execute(text('DROP TABLE IF EXISTS order_item CASCADE;'))
conn.commit()
conn.close()

print('Cleaned up remaining obsolete tables successfully.')

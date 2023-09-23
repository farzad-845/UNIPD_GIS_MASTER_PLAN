CREATE DATABASE fastapi_db;
CREATE DATABASE celery_schedule_jobs;

CREATE EXTENSION postgis;

-- --- Preprocess previous data PRG Table
-- ALTER TABLE prg ADD COLUMN uuid_column UUID;
-- UPDATE prg SET uuid_column = uuid_generate_v4();
-- ALTER TABLE prg DROP COLUMN gid;
-- ALTER TABLE prg RENAME COLUMN id TO db_id;
-- ALTER TABLE prg RENAME COLUMN uuid_column TO id;
--
-- ALTER TABLE prg RENAME COLUMN creation_d TO created_at;
-- ALTER TABLE prg RENAME COLUMN creation_u TO user_id;
-- ALTER TABLE prg RENAME COLUMN modificati TO updated_at;
--
-- ALTER TABLE prg DROP COLUMN element_st;
-- ALTER TABLE prg DROP COLUMN element_ve;
-- ALTER TABLE prg DROP COLUMN modifica_1;
-- ALTER TABLE prg DROP COLUMN notes;
-- ALTER TABLE prg DROP COLUMN start_date;

-- ALTER TABLE prg ADD COLUMN status varchar;


-- --- Preprocess previous data Particelle Table
-- ALTER TABLE prg ADD COLUMN uuid_column UUID;
-- UPDATE prg SET uuid_column = uuid_generate_v4();
-- ALTER TABLE prg DROP COLUMN gid;
-- ALTER TABLE prg RENAME COLUMN uuid_column TO id;


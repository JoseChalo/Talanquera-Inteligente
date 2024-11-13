CREATE DATABASE Talanquera_Inteligente;
USE Talanquera_Inteligente;

USE rdsadmin;
-- ALTER DATABASE Talanquera_Inteligente SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
-- DROP DATABASE Talanquera_Inteligente;

CREATE TABLE vivienda (
    idVivienda INT IDENTITY(1,1),
    numCasa INT NOT NULL,
    cluster VARCHAR(100) NOT NULL,
    estado int CHECK (estado IN (0, 1)),    -- 1 enable y 0 disabled
    PRIMARY KEY (idVivienda)
);

CREATE TABLE residentes (
    dpi VARCHAR(15),
    nombre VARCHAR(100),
    numTelefono VARCHAR(9),
    datoBiometrico VARCHAR(MAX),
    idVivienda INT NOT NULL,
    estado int CHECK (estado IN (0, 1)),    -- 1 enable y 0 disabled
    PRIMARY KEY (dpi),
    FOREIGN KEY (idVivienda) REFERENCES vivienda(idVivienda)
);

CREATE TABLE visitas (
    dpiVisita VARCHAR(15),
    nombreVisita VARCHAR(60),
    idViviendaDestino INT NOT NULL,
    dpiResidente VARCHAR(15) NOT NULL,
    metodoIngreso VARCHAR(10) CHECK (metodoIngreso IN ('Peatonal', 'Vehicular')),
    datoBiometrico VARCHAR(MAX),
    matriculaVehiculo VARCHAR(12),
    numIngresos INT CHECK (numIngresos >= 0),
    estado Int CHECK (estado IN (0, 1)),    -- 1 enable y 0 disabled
    PRIMARY KEY (dpiVisita),
    FOREIGN KEY (idViviendaDestino) REFERENCES vivienda(idVivienda),
    FOREIGN KEY (dpiResidente) REFERENCES residentes(dpi)
);

CREATE TABLE automovil (
    matricula VARCHAR(7),
    modelo VARCHAR(30),
    color VARCHAR(30),
    credencialesVehiculo VARCHAR(MAX),
    estado Int CHECK (estado IN (0, 1)),    -- 1 enable y 0 disabled
    PRIMARY KEY (matricula)
);

CREATE TABLE residentes_automovil (
    idResidente VARCHAR(15),
    matricula VARCHAR(7),
    PRIMARY KEY (idResidente, matricula),
    FOREIGN KEY (idResidente) REFERENCES residentes(dpi),
    FOREIGN KEY (matricula) REFERENCES automovil(matricula)
);

CREATE TABLE usuarios (
    userDPI VARCHAR(15),
    contra VARCHAR(50),
    rol VARCHAR(9) CHECK (rol in ('admin', 'garita', 'residente')),
    PRIMARY KEY (userDPI),
);

CREATE TABLE historial_Entradas (
    id INT IDENTITY(1,1),    
    dpi VARCHAR(15),
    nombre VARCHAR(100),              
    fecha DATE,  
    hora DATETIME,      
    PRIMARY KEY (id)             
);

---------------------------------------------------------------- Insertar valores iniciales -------------------------------------------------------------------------------------------------

INSERT INTO vivienda (numCasa, cluster, estado) VALUES
(1, 'Alamos', 1),
(2, 'Alamos', 1),
(3, 'Alamos', 1),
(4, 'Alamos', 1),
(5, 'Alamos', 1),
(6, 'Alamos', 1),
(7, 'Alamos', 1),
(8, 'Alamos', 1),
(9, 'Alamos', 1),
(10, 'Alamos', 1),
(11, 'Alamos', 1),
(12, 'Alamos', 1),
(13, 'Alamos', 1),
(14, 'Alamos', 1),
(15, 'Alamos', 1),

(1, 'Robles', 1),
(2, 'Robles', 1),
(3, 'Robles', 1),
(4, 'Robles', 1),
(5, 'Robles', 1),
(6, 'Robles', 1),
(7, 'Robles', 1),
(8, 'Robles', 1),
(9, 'Robles', 1),
(10, 'Robles', 1),
(11, 'Robles', 1),
(12, 'Robles', 1),
(13, 'Robles', 1),
(14, 'Robles', 1),
(15, 'Robles', 1),

(1, 'Cedros', 1),
(2, 'Cedros', 1),
(3, 'Cedros', 1),
(4, 'Cedros', 1),
(5, 'Cedros', 1),
(6, 'Cedros', 1),
(7, 'Cedros', 1),
(8, 'Cedros', 1),
(9, 'Cedros', 1),
(10, 'Cedros', 1),
(11, 'Cedros', 1),
(12, 'Cedros', 1),
(13, 'Cedros', 1),
(14, 'Cedros', 1),
(15, 'Cedros', 1);


INSERT INTO usuarios (userDPI, contra, rol) VALUES 
('admin', 'admin337626', 'admin'),
('garita', 'garita1234', 'garita');

------------------------------------------------------------ Crear vistas y prototipos de consultas --------------------------------------------------------------------

CREATE VIEW Visitas_Residentes AS (
SELECT * FROM visitas V
INNER JOIN (
    SELECT V.idVivienda, R.dpi, R.estado AS EstadoResidente, V.cluster, V.numCasa 
    FROM residentes R 
    INNER JOIN vivienda V ON V.idVivienda = R.idVivienda) RV 
ON V.dpiResidente = RV.dpi
WHERE V.estado = 1 AND RV.EstadoResidente = 1);


USE Talanquera_Inteligente;

SELECT * FROM residentes;
SELECT * FROM vivienda;
SELECT * FROM automovil;
SELECT * FROM residentes_automovil;
SELECT * FROM visitas;
SELECT * FROM Visitas_Residentes;
SELECT * FROM usuarios;
SELECT * FROM historial_Entradas;

SELECT * FROM usuarios U INNER JOIN (
SELECT R.dpi, R.nombre, R.numTelefono, 
        R.datoBiometrico, R.estado, R.idVivienda, 
        V.cluster, V.numCasa, V.estado AS estadoVivienda  
FROM residentes R 
INNER JOIN vivienda V ON R.idVivienda = V.idVivienda 
WHERE R.estado = 1) 
RV ON RV.dpi = U.userDPI;


SELECT v.idVivienda, v.numCasa, v.cluster, r.dpi, r.nombre
FROM vivienda v
LEFT JOIN residentes r ON v.idVivienda = r.idVivienda;

SELECT v.idVivienda, v.numCasa, v.cluster
FROM vivienda v
LEFT JOIN residentes r ON v.idVivienda = r.idVivienda
WHERE r.dpi IS NULL;

SELECT * FROM automovil A 
INNER JOIN residentes_automovil RA 
ON A.matricula = RA.matricula;

SELECT R.dpi, R.nombre FROM residentes R INNER JOIN (
    SELECT A.matricula, RA.idResidente 
    FROM automovil A 
    INNER JOIN residentes_automovil RA 
    ON A.matricula = RA.matricula) AD 
ON AD.idResidente = R.dpi
WHERE R.estado = 1 AND AD.matricula = '';

SELECT dpiVisita, nombreVisita FROM visitas;

SELECT R.dpi, R.nombre, R.numTelefono, R.datoBiometrico, R.estado, R.idVivienda, V.cluster  
FROM residentes R 
INNER JOIN vivienda V ON R.idVivienda = V.idVivienda 
WHERE estado = 1;

SELECT v.idVivienda, v.numCasa, v.cluster, r.dpi, r.nombre
FROM vivienda v
LEFT JOIN residentes r 
ON v.idVivienda = r.idVivienda AND r.estado = 1
WHERE v.estado = 1

SELECT v.idVivienda, v.numCasa, v.cluster
FROM vivienda v
LEFT JOIN residentes r ON v.idVivienda = r.idVivienda
WHERE r.dpi IS NULL AND v.estado = 1;


SELECT V.idVivienda, V.numCasa, V.cluster, R.dpi, R.estado AS estadoResidente 
FROM vivienda V INNER JOIN residentes R 
ON V.idVivienda = R.idVivienda WHERE R.estado = 1;


SELECT V.idVivienda, V.numCasa, V.cluster, VS.dpiVisita, VS.estado AS estadoVisita 
FROM vivienda V INNER JOIN visitas VS
ON V.idVivienda = VS.idViviendaDestino WHERE VS.estado = 1;

----------------------------------------------------- Consulta para generar UML de entidad relacion en https://app.chartdb.io ---------------------------------------------------------------------------
WITH fk_info AS (
    SELECT
        JSON_QUERY(
            '[' + STRING_AGG(
                CONVERT(nvarchar(max),
                JSON_QUERY(N'{"schema": "' + COALESCE(REPLACE(tp_schema.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '", "table": "' + COALESCE(REPLACE(tp.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '", "column": "' + COALESCE(REPLACE(cp.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '", "foreign_key_name": "' + COALESCE(REPLACE(fk.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '", "reference_schema": "' + COALESCE(REPLACE(tr_schema.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '", "reference_table": "' + COALESCE(REPLACE(tr.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '", "reference_column": "' + COALESCE(REPLACE(cr.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '", "fk_def": "FOREIGN KEY (' + COALESCE(REPLACE(cp.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            ') REFERENCES ' + COALESCE(REPLACE(tr.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            '(' + COALESCE(REPLACE(cr.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                            ') ON DELETE ' + fk.delete_referential_action_desc COLLATE SQL_Latin1_General_CP1_CI_AS +
                            ' ON UPDATE ' + fk.update_referential_action_desc COLLATE SQL_Latin1_General_CP1_CI_AS + '"}')
                ), ','
            ) + N']'
        ) AS all_fks_json
    FROM sys.foreign_keys AS fk
    JOIN sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
    JOIN sys.tables AS tp ON fkc.parent_object_id = tp.object_id
    JOIN sys.schemas AS tp_schema ON tp.schema_id = tp_schema.schema_id
    JOIN sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    JOIN sys.tables AS tr ON fkc.referenced_object_id = tr.object_id
    JOIN sys.schemas AS tr_schema ON tr.schema_id = tr_schema.schema_id
    JOIN sys.columns AS cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
), pk_info AS (
    SELECT
        JSON_QUERY(
            '[' + STRING_AGG(
                CONVERT(nvarchar(max),
                JSON_QUERY(N'{"schema": "' + COALESCE(REPLACE(pk.TABLE_SCHEMA, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "table": "' + COALESCE(REPLACE(pk.TABLE_NAME, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "column": "' + COALESCE(REPLACE(pk.COLUMN_NAME, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "pk_def": "PRIMARY KEY (' + pk.COLUMN_NAME COLLATE SQL_Latin1_General_CP1_CI_AS + ')"}')
                ), ','
            ) + N']'
        ) AS all_pks_json
    FROM
        (
            SELECT
                kcu.TABLE_SCHEMA,
                kcu.TABLE_NAME,
                kcu.COLUMN_NAME
            FROM
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            JOIN
                INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
            WHERE
                tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ) pk
),
cols AS (
    SELECT
        JSON_QUERY(
            '[' + STRING_AGG(
                CONVERT(nvarchar(max),
                JSON_QUERY('{"schema": "' + COALESCE(REPLACE(cols.TABLE_SCHEMA, '"', ''), '') +
                '", "table": "' + COALESCE(REPLACE(cols.TABLE_NAME, '"', ''), '') +
                '", "name": "' + COALESCE(REPLACE(cols.COLUMN_NAME, '"', ''), '') +
                '", "ordinal_position": "' + CAST(cols.ORDINAL_POSITION AS NVARCHAR(MAX)) +
                '", "type": "' + LOWER(cols.DATA_TYPE) +
                '", "character_maximum_length": "' +
                    COALESCE(CAST(cols.CHARACTER_MAXIMUM_LENGTH AS NVARCHAR(MAX)), 'null') +
                '", "precision": ' +
                    CASE
                        WHEN cols.DATA_TYPE IN ('numeric', 'decimal') THEN
                            CONCAT('{"precision":', COALESCE(CAST(cols.NUMERIC_PRECISION AS NVARCHAR(MAX)), 'null'),
                            ',"scale":', COALESCE(CAST(cols.NUMERIC_SCALE AS NVARCHAR(MAX)), 'null'), '}')
                        ELSE
                            'null'
                    END +
                ', "nullable": "' +
                    CASE WHEN cols.IS_NULLABLE = 'YES' THEN 'true' ELSE 'false' END +
                '", "default": "' +
                    COALESCE(REPLACE(CAST(cols.COLUMN_DEFAULT AS NVARCHAR(MAX)), '"', '\"'), '') +
                '", "collation": "' +
                    COALESCE(cols.COLLATION_NAME, '') +
                '"}')
                ), ','
            ) + ']'
        ) AS all_columns_json
    FROM
        INFORMATION_SCHEMA.COLUMNS cols
    WHERE
        cols.TABLE_CATALOG = DB_NAME()
),
indexes AS (
    SELECT
        '[' + STRING_AGG(
            CONVERT(nvarchar(max),
            JSON_QUERY(
                N'{"schema": "' + COALESCE(REPLACE(s.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "table": "' + COALESCE(REPLACE(t.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "name": "' + COALESCE(REPLACE(i.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "column": "' + COALESCE(REPLACE(c.name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "index_type": "' + LOWER(i.type_desc) COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "unique": ' + CASE WHEN i.is_unique = 1 THEN 'true' ELSE 'false' END +
                ', "direction": "' + CASE WHEN ic.is_descending_key = 1 THEN 'desc' ELSE 'asc' END COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "column_position": ' + CAST(ic.key_ordinal AS nvarchar(max)) + N'}'
            )
            ), ','
        ) + N']' AS all_indexes_json
    FROM
        sys.indexes i
    JOIN
        sys.tables t ON i.object_id = t.object_id
    JOIN
        sys.schemas s ON t.schema_id = s.schema_id
    JOIN
        sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    JOIN
        sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE
        s.name LIKE '%'
        AND i.name IS NOT NULL
),
tbls AS (
    SELECT
        '[' + STRING_AGG(
            CONVERT(nvarchar(max),
            JSON_QUERY(
                N'{"schema": "' + COALESCE(REPLACE(aggregated.schema_name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "table": "' + COALESCE(REPLACE(aggregated.table_name, '"', ''), '') COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "row_count": "' + CAST(aggregated.row_count AS NVARCHAR(MAX)) +
                '", "table_type": "' + aggregated.table_type COLLATE SQL_Latin1_General_CP1_CI_AS +
                '", "creation_date": "' + CONVERT(NVARCHAR(MAX), aggregated.creation_date, 120) + '"}'
            )
            ), ','
        ) + N']' AS all_tables_json
    FROM
        (
            -- Select from tables
            SELECT
                COALESCE(REPLACE(s.name, '"', ''), '') AS schema_name,
                COALESCE(REPLACE(t.name, '"', ''), '') AS table_name,
                SUM(p.rows) AS row_count,
                t.type_desc AS table_type,
                t.create_date AS creation_date
            FROM
                sys.tables t
            JOIN
                sys.schemas s ON t.schema_id = s.schema_id
            JOIN
                sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
            WHERE
                s.name LIKE '%'
            GROUP BY
                s.name, t.name, t.type_desc, t.create_date

            UNION ALL

            -- Select from views
            SELECT
                COALESCE(REPLACE(s.name, '"', ''), '') AS table_name,
                COALESCE(REPLACE(v.name, '"', ''), '') AS object_name,
                0 AS row_count,  -- Views don't have row counts
                'VIEW' AS table_type,
                v.create_date AS creation_date
            FROM
                sys.views v
            JOIN
                sys.schemas s ON v.schema_id = s.schema_id
            WHERE
                s.name LIKE '%'
        ) AS aggregated
),
views AS (
    SELECT
        '[' + STRING_AGG(
            CONVERT(nvarchar(max),
            JSON_QUERY(
                N'{"schema": "' + STRING_ESCAPE(COALESCE(s.name, ''), 'json') +
                '", "view_name": "' + STRING_ESCAPE(COALESCE(v.name, ''), 'json') +
                '", "view_definition": "' +
                STRING_ESCAPE(
                    CAST(
                        '' AS XML
                    ).value(
                        'xs:base64Binary(sql:column("DefinitionBinary"))',
                        'VARCHAR(MAX)'
                    ), 'json') +
                '"}'
            )
            ), ','
        ) + N']' AS all_views_json
    FROM
        sys.views v
    JOIN
        sys.schemas s ON v.schema_id = s.schema_id
    JOIN
        sys.sql_modules m ON v.object_id = m.object_id
    CROSS APPLY
        (SELECT CONVERT(VARBINARY(MAX), m.definition) AS DefinitionBinary) AS bin
    WHERE
        s.name LIKE '%'
)
SELECT JSON_QUERY(
        N'{"fk_info": ' + ISNULL((SELECT cast(all_fks_json as nvarchar(max)) FROM fk_info), N'[]') +
        ', "pk_info": ' + ISNULL((SELECT cast(all_pks_json as nvarchar(max)) FROM pk_info), N'[]') +
        ', "columns": ' + ISNULL((SELECT cast(all_columns_json as nvarchar(max)) FROM cols), N'[]') +
        ', "indexes": ' + ISNULL((SELECT cast(all_indexes_json as nvarchar(max)) FROM indexes), N'[]') +
        ', "tables": ' + ISNULL((SELECT cast(all_tables_json as nvarchar(max)) FROM tbls), N'[]') +
        ', "views": ' + ISNULL((SELECT cast(all_views_json as nvarchar(max)) FROM views), N'[]') +
        ', "database_name": "' + DB_NAME() + '"' +
        ', "version": ""}'
) AS metadata_json_to_import;

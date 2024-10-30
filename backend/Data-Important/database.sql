CREATE DATABASE Talanquera_Inteligente;
use Talanquera_Inteligente;
use rdsadmin;

DROP DATABASE Talanquera_Inteligente;

CREATE TABLE vivienda (
    idVivienda INT IDENTITY(1,1),
    numCasa INT,
    cluster VARCHAR(100),
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
    dpiResidente VARCHAR(15),
    metodoIngreso VARCHAR(10) CHECK (metodoIngreso IN ('Peatonal', 'Vehicular')),
    datoBiometrico VARCHAR(MAX),
    matriculaVehiculo VARCHAR(12),
    numIngresos INT CHECK (numIngresos >= 0),
    estado Int CHECK (estado IN (0, 1)),    -- 1 enable y 0 disabled
    PRIMARY KEY (dpiVisita),
    FOREIGN KEY (idViviendaDestino) REFERENCES vivienda(idVivienda),
    FOREIGN KEY (dpiResidente) REFERENCES residentes(dpi),
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

---------------------------------------------------------------------------------------------

-- Insertar datos en la tabla vivienda sin especificar el valor de la columna autoincrementable
INSERT INTO vivienda (numCasa, cluster) VALUES
(1, 'Alamos'),
(2, 'Alamos'),
(3, 'Alamos'),
(4, 'Alamos'),
(5, 'Alamos'),
(6, 'Alamos'),
(7, 'Alamos'),
(8, 'Alamos'),
(9, 'Alamos'),
(10, 'Alamos'),
(11, 'Alamos'),
(12, 'Alamos'),
(13, 'Alamos'),
(14, 'Alamos'),
(15, 'Alamos'),

(1, 'Robles'),
(2, 'Robles'),
(3, 'Robles'),
(4, 'Robles'),
(5, 'Robles'),
(6, 'Robles'),
(7, 'Robles'),
(8, 'Robles'),
(9, 'Robles'),
(10, 'Robles'),
(11, 'Robles'),
(12, 'Robles'),
(13, 'Robles'),
(14, 'Robles'),
(15, 'Robles'),

(1, 'Cedros'),
(2, 'Cedros'),
(3, 'Cedros'),
(4, 'Cedros'),
(5, 'Cedros'),
(6, 'Cedros'),
(7, 'Cedros'),
(8, 'Cedros'),
(9, 'Cedros'),
(10, 'Cedros'),
(11, 'Cedros'),
(12, 'Cedros'),
(13, 'Cedros'),
(14, 'Cedros'),
(15, 'Cedros');

use Talanquera_Inteligente;

SELECT * FROM residentes;
SELECT * FROM vivienda;
SELECT * FROM automovil;
SELECT * FROM residentes_automovil;
SELECT * FROM visitas;

DROP TABLE visitas;


SELECT R.dpi, R.nombre, R.numTelefono, R.datoBiometrico, R.estado, R.idVivienda, V.cluster  FROM residentes R INNER JOIN vivienda V ON R.idVivienda = V.idVivienda WHERE estado = 1;

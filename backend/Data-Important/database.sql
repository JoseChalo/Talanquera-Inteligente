CREATE DATABASE Talanquera_Inteligente
use Talanquera_Inteligente


CREATE TABLE vivienda(
    numVivienda INT IDENTITY(1,1),
    PRIMARY KEY (numVivienda)
);



DROP TABLE residentes;
CREATE TABLE residentes(
    nombre VARCHAR(100),
    dpi VARCHAR(15),
    numTelefono VARCHAR(9),
    data_Biometrico VARCHAR(MAX),
    numVivienda INT NOT NULL,
    PRIMARY KEY (dpi),
    FOREIGN KEY (numVivienda) REFERENCES vivienda
);

CREATE TABLE visitas(
    idVisita int IDENTITY(1,1),
    dpi VARCHAR(15),
    nombre VARCHAR(100),
    biometricos VARCHAR(MAX),
    matricula VARCHAR(MAX),
    PRIMARY KEY (idVisita)
);

CREATE TABLE automovil(
    matricula VARCHAR(40),
    modelo VARCHAR(30),
    color VARCHAR(30),
    PRIMARY KEY (matricula)
);

CREATE table residentes_automovil(
    idResidente INT,
    matricula VARCHAR(40),
    PRIMARY KEY (idResidente),
    FOREIGN KEY (matricula) REFERENCES automovil
);

CREATE TABLE vivienda_visitas(
    numVivienda INT,
    idVisita INT, 
    PRIMARY KEY (numVivienda),
    FOREIGN KEY (idVisita) REFERENCES visitas
);


---------------------------------------------------------------------------------------------

-- Insertar datos en la tabla vivienda sin especificar el valor de la columna autoincrementable
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;
INSERT INTO vivienda
DEFAULT VALUES;

use Talanquera_Inteligente;
SELECT * FROM residentes;
SELECT * FROM vivienda;

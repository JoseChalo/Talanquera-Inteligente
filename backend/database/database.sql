CREATE DATABASE Talanquera_Inteligente
use Talanquera_Inteligente


CREATE TABLE vivienda(
    numVivienda INT IDENTITY(1,1),
    PRIMARY KEY (numVivienda)
);

CREATE TABLE residentes(
    idResidente INT IDENTITY(1,1),
    nombre VARCHAR(100),
    dpi VARCHAR(15),
    numTelefono VARCHAR(9),
    data_Biometrico VARCHAR(MAX),
    numVivienda INT NOT NULL,
    PRIMARY KEY (idResidente),
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

-- Insertar datos en la tabla residentes
INSERT INTO residentes (nombre, dpi, numTelefono, data_Biometrico, numVivienda)
VALUES
    ('Jose Chalo', '12345678901011', '12345678', NULL, 1),
    ('Nazareth Sosa', '98765432101011', '87654321', NULL, 2),
    ('Carlos Lopez', '12345098761011', '12312312', NULL, 3),
    ('Ana Perez', '45678912341011', '98765432', NULL, 4),
    ('Mario Gomez', '78945612301011', '76543210', NULL, 5),
    ('Luis Fernandez', '65432198711011', '12345679', NULL, 6),
    ('Carla Mendoza', '32165498711011', '45678910', NULL, 7),
    ('Lucia Suarez', '95135785201011', '85296374', NULL, 8),
    ('Andrea Lopez', '74185296301011', '96385274', NULL, 9),
    ('Juan Morales', '85296374101011', '15935748', NULL, 10);

-- Insertar datos en la tabla visitas
INSERT INTO visitas (dpi, nombre, biometricos, matricula)
VALUES
    ('96385274101011', 'Sofia Ortega', NULL, 'ABC123'),
    ('75315945601011', 'Miguel Torres', NULL, 'XYZ789'),
    ('45632178901011', 'Carmen Ruiz', NULL, 'DEF456'),
    ('85214796301011', 'Pedro Sanchez', NULL, 'LMN321'),
    ('95175385201011', 'Roberto Ramirez', NULL, 'GHI987');

-- Insertar datos en la tabla automovil
INSERT INTO automovil (matricula, modelo, color)
VALUES
    ('ABC123', 'Toyota Corolla', 'Rojo'),
    ('XYZ789', 'Honda Civic', 'Azul'),
    ('DEF456', 'Nissan Sentra', 'Blanco'),
    ('LMN321', 'Chevrolet Spark', 'Negro'),
    ('GHI987', 'Ford Fiesta', 'Gris');

-- Insertar datos en la tabla residentes_automovil
INSERT INTO residentes_automovil (idResidente, matricula)
VALUES
    (1, 'ABC123'),
    (2, 'XYZ789'),
    (3, 'DEF456'),
    (4, 'LMN321'),
    (5, 'GHI987');

-- Insertar datos en la tabla vivienda_visitas
INSERT INTO vivienda_visitas (numVivienda, idVisita)
VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5);

SELECT * FROM residentes;
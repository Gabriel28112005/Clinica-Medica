CREATE DATABASE IF NOT EXISTS ClinicaMedica;

USE ClinicaMedica;

-- Tabla Paciente:
CREATE TABLE Paciente (
    idPaciente INT AUTO_INCREMENT PRIMARY KEY,
    nombrePaciente VARCHAR(100) NOT NULL,
    telefonoPaciente VARCHAR (20) NOT NULL
);

-- Tabla Medico
CREATE TABLE Medico (
    idMedico INT AUTO_INCREMENT PRIMARY KEY,
    nombreMedico VARCHAR(100) NOT NULL,
    telefonoMedico VARCHAR(20) NOT NULL,
    nombreUsuario VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    nivel INT NOT NULL
);

-- Tabla Especialidad
CREATE TABLE Especialidad (
    idEspecialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombreEspecialidad VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla relacional de Medico y Especialidad
CREATE TABLE Medico_Especialidad (
    idMedico INT NOT NULL, -- Se usa como FK
    idEspecialidad INT NOT NULL, -- Se usa como FK
    PRIMARY KEY (idMedico, idEspecialidad),
    FOREIGN KEY (idMedico) REFERENCES Medico(idMedico) ON DELETE CASCADE,
    FOREIGN KEY (idEspecialidad) REFERENCES Especialidad(idEspecialidad) ON DELETE CASCADE
);

-- Tabla Cita
CREATE TABLE Cita (
    idCita INT AUTO_INCREMENT PRIMARY KEY,
    fechaIngreso DATETIME NOT NULL,
    estado ENUM('Pendiente', 'Completada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    diagnostico TEXT,
    idPaciente INT NOT NULL, -- Se usa como FK
    idMedico INT NOT NULL, -- Se usa como FK
    FOREIGN KEY (idPaciente) REFERENCES Paciente(idPaciente) ON DELETE RESTRICT,
    FOREIGN KEY (idMedico) REFERENCES Medico(idMedico) ON DELETE RESTRICT
);

-- Tabla Tratamiento
CREATE TABLE Tratamiento (
    idTratamiento INT AUTO_INCREMENT PRIMARY KEY,
    recomendacion TEXT,
    medicamento VARCHAR(100) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    idCita INT NOT NULL, -- Se usa como FK
    idPaciente INT NOT NULL, -- Se usa como FK
    FOREIGN KEY (idCita) REFERENCES Cita(idCita) ON DELETE CASCADE,
    FOREIGN KEY (idPaciente) REFERENCES Paciente(idPaciente) ON DELETE RESTRICT
);

-- Tabla Prueba
CREATE TABLE Prueba (
    idPrueba INT AUTO_INCREMENT PRIMARY KEY,
    nombrePrueba VARCHAR(100) NOT NULL,
    resultadoPrueba TEXT,
    fechaPrueba DATE NOT NULL,
    idCita INT NOT NULL, -- Se usa como FK
    idPaciente INT NOT NULL, -- Se usa como FK
    FOREIGN KEY (idCita) REFERENCES Cita(idCita) ON DELETE CASCADE,
    FOREIGN KEY (idPaciente) REFERENCES Paciente(idPaciente) ON DELETE RESTRICT
);

-- Tabla Clinica (que está en FNBC)
CREATE TABLE Clinica (
    idPaciente INT NOT NULL,
    idMedico INT NOT NULL,
    idCita INT NOT NULL,
    idTratamiento INT NOT NULL,
    idPrueba INT NOT NULL,
    PRIMARY KEY (idCita, idTratamiento, idPrueba),

    FOREIGN KEY (idPaciente) REFERENCES Paciente(idPaciente) ON DELETE RESTRICT,
    FOREIGN KEY (idMedico) REFERENCES Medico(idMedico) ON DELETE RESTRICT,
    FOREIGN KEY (idCita) REFERENCES Cita(idCita) ON DELETE CASCADE,
    FOREIGN KEY (idTratamiento) REFERENCES Tratamiento(idTratamiento) ON DELETE CASCADE,
    FOREIGN KEY (idPrueba) REFERENCES Prueba(idPrueba) ON DELETE CASCADE
);


INSERT INTO Especialidad(nombreEspecialidad) VALUES
('Cardiología'), -- ID = 1
('Neurología'), -- ID = 2
('Pediatría'), -- ID = 3
('Traumatología'), -- ID = 4
('Dermatología'); -- ID = 5

INSERT INTO Medico(nombreMedico, telefonoMedico, nombreUsuario, contrasena, nivel) VALUES
('Dr. García López',     '600111222', 'admin',  'admin123',  0),
('Dra. Martínez Ruiz',   '600333444', 'nivel1', 'nivel1123', 1),
('Dr. Sánchez Pérez',    '600555666', 'nivel2', 'nivel2123', 2),
('Dra. López Fernández', '600777888', 'nivel3', 'nivel3123', 3);

INSERT INTO Medico_Especialidad(idMedico, idEspecialidad) VALUES
(1,1),
(1,2),
(2,3),
(3,4),
(4,5);

INSERT INTO Paciente (nombrePaciente, telefonoPaciente) VALUES
('Juan Pérez', '611000001'),
('María Gómez', '611000002'),
('Carlos Ruiz', '611000003'),
('Ana Fernández', '611000004');

INSERT INTO Cita (fechaIngreso, estado, diagnostico, idPaciente, idMedico) VALUES
('2026-04-01 09:00:00', 'Completada', 'Arritmia leve',1,1),
('2026-04-02 10:30:00', 'Completada', 'Migraña crónica',2,2),
('2026-04-03 11:00:00', 'Pendiente', NULL,3,3),
('2026-04-04 12:00:00', 'Cancelada', NULL,4,4);

INSERT INTO Tratamiento (recomendacion, medicamento, dosis, idCita, idPaciente) VALUES
('Reposo y dieta baja en sal', 'Bisoprolol', '5mg cada 24h',1,1),
('Evitar pantallas y ruido', 'Ibuprofeno', '400mg cada 8h',2,2),
('Reposo absoluto 3 días', 'Omeprazol', '20mg cada 24h',2,2);

INSERT INTO Prueba (nombrePrueba, resultadoPrueba, fechaPrueba, idCita, idPaciente) VALUES
('Electrocardiograma', 'Ritmo sinusal con extrasístoles ocasionales', '2026-04-01',1,1),
('Resonancia magnética', 'Sin lesiones estructurales visibles', '2026-04-02',2,2),
('Análisis de sangre', 'Valores dentro del rango normal', '2026-04-02',2,2);

INSERT INTO Clinica (idPaciente, idMedico, idCita, idTratamiento, idPrueba) VALUES
(1,1,1,1,1),
(2,2,2,2,2),
(2,2,2,3,3);
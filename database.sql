-- =====================================================
-- CREACIÓN DE BASE DE DATOS
-- PROYECTO: SMART TOURISM
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DB_SmartTourism')
BEGIN
    CREATE DATABASE DB_SmartTourism;
END
GO

USE DB_SmartTourism;
GO

-- =====================================================
-- MÓDULO 1: INFRAESTRUCTURA Y AFORO
-- =====================================================

CREATE TABLE Sedes (
    IdSede              INT             PRIMARY KEY IDENTITY(1,1),
    Nombre              VARCHAR(100)    NOT NULL,
    EstadoSemaforo      VARCHAR(20)     NOT NULL
        CHECK (EstadoSemaforo IN ('Verde','Amarillo','Rojo')),
    CapacidadMaximaDiaria INT           NOT NULL
);
GO

CREATE TABLE Circuitos (
    IdCircuito              INT             PRIMARY KEY IDENTITY(1,1),
    IdSede                  INT             NOT NULL,
    NombreCircuito          VARCHAR(100)    NOT NULL,
    AforoMaximoSimultaneo   INT             NOT NULL,

    CONSTRAINT FK_Circuitos_Sedes
        FOREIGN KEY (IdSede)
        REFERENCES Sedes(IdSede)
);
GO

CREATE TABLE Horarios_Cupos (
    IdHorario           INT         PRIMARY KEY IDENTITY(1,1),
    IdCircuito          INT         NOT NULL,
    Fecha               DATE        NOT NULL,
    HoraInicio          TIME        NOT NULL,
    CuposTotales        INT         NOT NULL,
    CuposDisponibles    INT         NOT NULL,

    CONSTRAINT FK_Horarios_Circuitos
        FOREIGN KEY (IdCircuito)
        REFERENCES Circuitos(IdCircuito)
);
GO

-- =====================================================
-- MÓDULO 2: SEGURIDAD Y VISITANTES
-- =====================================================

CREATE TABLE Visitantes (
    IdVisitante                 INT             PRIMARY KEY IDENTITY(1,1),
    TipoDocumento               VARCHAR(20)     NOT NULL,
    NroDocumento                VARCHAR(20)     NOT NULL UNIQUE,
    NombreCompleto              VARCHAR(150)    NOT NULL,
    EsReincidente               BIT             DEFAULT 0,
    EnListaNegra                BIT             DEFAULT 0,
    ValidacionBiometrica_Token  VARCHAR(MAX)
);
GO

-- =====================================================
-- MÓDULO 3: CANALES Y FINANZAS
-- =====================================================

CREATE TABLE CanalesVenta (
    IdCanal         INT             PRIMARY KEY IDENTITY(1,1),
    NombreCanal     VARCHAR(50)     NOT NULL
);
GO

CREATE TABLE MetodosPago (
    IdMetodo        INT             PRIMARY KEY IDENTITY(1,1),
    NombreMetodo    VARCHAR(50)     NOT NULL,
    TipoMetodo      VARCHAR(30)     NOT NULL,
    Estado          BIT             DEFAULT 1,
    Descripcion     VARCHAR(200),
    FechaRegistro   DATETIME        DEFAULT GETDATE()
);
GO

CREATE TABLE Ventas_Cabecera (
    IdVenta                 INT             PRIMARY KEY IDENTITY(1,1),
    IdVisitanteComprador    INT             NOT NULL,
    IdCanal                 INT             NOT NULL,
    IdMetodo                INT             NOT NULL,
    FechaTransaccion        DATETIME        DEFAULT GETDATE(),
    Total                   DECIMAL(10,2)   NOT NULL,
    HashBlockchain          UNIQUEIDENTIFIER DEFAULT NEWID(),

    CONSTRAINT FK_Ventas_Visitantes
        FOREIGN KEY (IdVisitanteComprador)
        REFERENCES Visitantes(IdVisitante),

    CONSTRAINT FK_Ventas_Canales
        FOREIGN KEY (IdCanal)
        REFERENCES CanalesVenta(IdCanal),

    CONSTRAINT FK_Ventas_MetodosPago
        FOREIGN KEY (IdMetodo)
        REFERENCES MetodosPago(IdMetodo)
);
GO

-- =====================================================
-- MÓDULO 4: TICKETERÍA E INTERACCIÓN
-- =====================================================

CREATE TABLE Tickets_Generados (
    IdTicket            INT             PRIMARY KEY IDENTITY(1,1),
    IdVenta             INT             NOT NULL,
    IdVisitanteFinal    INT             NOT NULL,
    IdHorario           INT             NOT NULL,
    CodigoQR_Dinamico   UNIQUEIDENTIFIER DEFAULT NEWID(),
    PrecioFinal         DECIMAL(10,2)   NOT NULL,
    EstadoTicket        VARCHAR(20)     DEFAULT 'Pendiente'
        CHECK (EstadoTicket IN ('Pendiente','Usado','Expirado')),

    CONSTRAINT FK_Tickets_Ventas
        FOREIGN KEY (IdVenta)
        REFERENCES Ventas_Cabecera(IdVenta),

    CONSTRAINT FK_Tickets_Visitantes
        FOREIGN KEY (IdVisitanteFinal)
        REFERENCES Visitantes(IdVisitante),

    CONSTRAINT FK_Tickets_Horarios
        FOREIGN KEY (IdHorario)
        REFERENCES Horarios_Cupos(IdHorario)
);
GO

-- =====================================================
-- MÓDULO 5: OPERACIÓN EN SITIO
-- =====================================================

CREATE TABLE Registro_Accesos (
    IdAcceso            INT         PRIMARY KEY IDENTITY(1,1),
    IdTicket            INT         NOT NULL,
    IdSede              INT         NOT NULL,
    FechaHoraIngreso    DATETIME    DEFAULT GETDATE(),
    DispositivoID       VARCHAR(50),
    SincronizadoOffline BIT         DEFAULT 0,

    CONSTRAINT FK_Accesos_Tickets
        FOREIGN KEY (IdTicket)
        REFERENCES Tickets_Generados(IdTicket),

    CONSTRAINT FK_Accesos_Sedes
        FOREIGN KEY (IdSede)
        REFERENCES Sedes(IdSede)
);
GO

-- =====================================================
-- DATOS INICIALES - CANALES DE VENTA
-- =====================================================

INSERT INTO CanalesVenta (NombreCanal)
VALUES
    (CAST('Web'         AS VARCHAR(50))),
    (CAST('Taquilla'    AS VARCHAR(50))),
    (CAST('Agencia'     AS VARCHAR(50))),
    (CAST('Marketplace' AS VARCHAR(50)));
GO

-- =====================================================
-- DATOS INICIALES - MÉTODOS DE PAGO
-- NombreMetodo VARCHAR(50) | TipoMetodo VARCHAR(30) | Descripcion VARCHAR(200)
-- =====================================================

INSERT INTO MetodosPago (NombreMetodo, TipoMetodo, Descripcion)
VALUES
--  NombreMetodo               TipoMetodo                        Descripcion
--  VARCHAR(50)                VARCHAR(30)                       VARCHAR(200)
    (CAST('Yape'        AS VARCHAR(50)), CAST('Billetera Digital' AS VARCHAR(30)), CAST('Pago mediante aplicación Yape'         AS VARCHAR(200))),
    (CAST('Plin'        AS VARCHAR(50)), CAST('Billetera Digital' AS VARCHAR(30)), CAST('Pago mediante aplicación Plin'         AS VARCHAR(200))),
    (CAST('Visa'        AS VARCHAR(50)), CAST('Tarjeta'           AS VARCHAR(30)), CAST('Pago con tarjeta Visa'                 AS VARCHAR(200))),
    (CAST('Mastercard'  AS VARCHAR(50)), CAST('Tarjeta'           AS VARCHAR(30)), CAST('Pago con tarjeta Mastercard'           AS VARCHAR(200))),
    (CAST('BCP'         AS VARCHAR(50)), CAST('Transferencia'     AS VARCHAR(30)), CAST('Transferencia bancaria BCP'            AS VARCHAR(200))),
    (CAST('Interbank'   AS VARCHAR(50)), CAST('Transferencia'     AS VARCHAR(30)), CAST('Transferencia bancaria Interbank'      AS VARCHAR(200))),
    (CAST('Efectivo'    AS VARCHAR(50)), CAST('Efectivo'          AS VARCHAR(30)), CAST('Pago realizado en ventanilla'          AS VARCHAR(200)));
GO

-- =====================================================
-- CONSULTA PARA VERIFICAR TABLAS CREADAS
-- =====================================================

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
GO

-- =====================================================
-- CONSULTA PARA VERIFICAR MÉTODOS DE PAGO
-- =====================================================

SELECT 
    IdMetodo,
    NombreMetodo,
    TipoMetodo,
    Descripcion,
    Estado,
    FechaRegistro
FROM MetodosPago;
GO
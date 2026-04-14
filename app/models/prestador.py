from datetime import datetime, timezone
from app import db


class Prestador(db.Model):
    __tablename__ = 'prestadores'

    id = db.Column(db.Integer, primary_key=True)
    matricula = db.Column(db.String(30), unique=True, nullable=False, index=True)
    cuit = db.Column(db.String(15), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100))
    razon_social = db.Column(db.String(200))
    tipo = db.Column(db.String(30), nullable=False)  # medico, clinica, laboratorio, farmacia, etc.
    especialidad = db.Column(db.String(100))
    direccion = db.Column(db.String(200))
    localidad = db.Column(db.String(100))
    provincia = db.Column(db.String(100))
    telefono = db.Column(db.String(30))
    email = db.Column(db.String(120))
    estado = db.Column(db.String(20), default='activo')  # activo, suspendido, baja
    fecha_convenio = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    prestaciones = db.relationship('Prestacion', backref='prestador', lazy='dynamic')
    facturas = db.relationship('Factura', backref='prestador', lazy='dynamic')

    @property
    def nombre_completo(self):
        if self.razon_social:
            return self.razon_social
        return f'{self.apellido}, {self.nombre}'

    def __repr__(self):
        return f'<Prestador {self.matricula} - {self.nombre_completo}>'

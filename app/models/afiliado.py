from datetime import datetime, timezone
from app import db


class Afiliado(db.Model):
    __tablename__ = 'afiliados'

    id = db.Column(db.Integer, primary_key=True)
    numero_afiliado = db.Column(db.String(20), unique=True, nullable=False, index=True)
    dni = db.Column(db.String(15), unique=True, nullable=False, index=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    sexo = db.Column(db.String(1), nullable=False)  # M, F, X
    direccion = db.Column(db.String(200))
    localidad = db.Column(db.String(100))
    provincia = db.Column(db.String(100))
    codigo_postal = db.Column(db.String(10))
    telefono = db.Column(db.String(30))
    email = db.Column(db.String(120))
    plan_id = db.Column(db.Integer, db.ForeignKey('planes.id'), nullable=False)
    fecha_alta = db.Column(db.Date, nullable=False)
    fecha_baja = db.Column(db.Date)
    estado = db.Column(db.String(20), default='activo')  # activo, suspendido, baja
    titular_id = db.Column(db.Integer, db.ForeignKey('afiliados.id'))
    parentesco = db.Column(db.String(30))  # titular, conyuge, hijo, etc.
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    grupo_familiar = db.relationship('Afiliado', backref=db.backref('titular', remote_side=[id]),
                                     lazy='dynamic')
    prestaciones = db.relationship('Prestacion', backref='afiliado', lazy='dynamic')

    @property
    def nombre_completo(self):
        return f'{self.apellido}, {self.nombre}'

    @property
    def edad(self):
        today = datetime.now(timezone.utc).date()
        return today.year - self.fecha_nacimiento.year - (
            (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )

    def __repr__(self):
        return f'<Afiliado {self.numero_afiliado} - {self.nombre_completo}>'

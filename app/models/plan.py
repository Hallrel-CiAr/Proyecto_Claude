from datetime import datetime, timezone
from app import db


class Plan(db.Model):
    __tablename__ = 'planes'

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    cobertura_porcentaje = db.Column(db.Float, default=80.0)
    cuota_mensual = db.Column(db.Float, default=0.0)
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    afiliados = db.relationship('Afiliado', backref='plan', lazy='dynamic')

    def __repr__(self):
        return f'<Plan {self.codigo} - {self.nombre}>'

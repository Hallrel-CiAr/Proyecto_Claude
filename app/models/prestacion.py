from datetime import datetime, timezone
from app import db


class Prestacion(db.Model):
    __tablename__ = 'prestaciones'

    id = db.Column(db.Integer, primary_key=True)
    numero_orden = db.Column(db.String(20), unique=True, nullable=False, index=True)
    afiliado_id = db.Column(db.Integer, db.ForeignKey('afiliados.id'), nullable=False)
    prestador_id = db.Column(db.Integer, db.ForeignKey('prestadores.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    codigo_practica = db.Column(db.String(20), nullable=False)
    descripcion = db.Column(db.String(300), nullable=False)
    cantidad = db.Column(db.Integer, default=1)
    monto_total = db.Column(db.Float, nullable=False)
    cobertura_porcentaje = db.Column(db.Float, nullable=False)
    monto_cobertura = db.Column(db.Float, nullable=False)
    monto_coseguro = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(20), default='pendiente')  # pendiente, autorizada, rechazada, facturada
    diagnostico = db.Column(db.String(300))
    observaciones = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def calcular_montos(self):
        self.monto_cobertura = round(self.monto_total * (self.cobertura_porcentaje / 100), 2)
        self.monto_coseguro = round(self.monto_total - self.monto_cobertura, 2)

    def __repr__(self):
        return f'<Prestacion {self.numero_orden}>'

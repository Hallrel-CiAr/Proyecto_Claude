from datetime import datetime, timezone
from app import db


class Factura(db.Model):
    __tablename__ = 'facturas'

    id = db.Column(db.Integer, primary_key=True)
    numero_factura = db.Column(db.String(30), unique=True, nullable=False, index=True)
    prestador_id = db.Column(db.Integer, db.ForeignKey('prestadores.id'), nullable=False)
    fecha_emision = db.Column(db.Date, nullable=False)
    fecha_vencimiento = db.Column(db.Date)
    periodo = db.Column(db.String(7), nullable=False)  # YYYY-MM
    monto_total = db.Column(db.Float, nullable=False, default=0.0)
    estado = db.Column(db.String(20), default='pendiente')  # pendiente, aprobada, pagada, rechazada
    observaciones = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    detalles = db.relationship('FacturaDetalle', backref='factura', lazy='dynamic',
                               cascade='all, delete-orphan')

    def recalcular_total(self):
        self.monto_total = sum(d.monto for d in self.detalles)

    def __repr__(self):
        return f'<Factura {self.numero_factura}>'


class FacturaDetalle(db.Model):
    __tablename__ = 'factura_detalles'

    id = db.Column(db.Integer, primary_key=True)
    factura_id = db.Column(db.Integer, db.ForeignKey('facturas.id'), nullable=False)
    prestacion_id = db.Column(db.Integer, db.ForeignKey('prestaciones.id'))
    descripcion = db.Column(db.String(300), nullable=False)
    cantidad = db.Column(db.Integer, default=1)
    monto_unitario = db.Column(db.Float, nullable=False)
    monto = db.Column(db.Float, nullable=False)

    prestacion = db.relationship('Prestacion', backref='factura_detalle_ref',
                                 foreign_keys=[prestacion_id])

    def __repr__(self):
        return f'<FacturaDetalle {self.id} - Factura {self.factura_id}>'

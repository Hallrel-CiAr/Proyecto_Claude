from flask import Blueprint, render_template
from flask_login import login_required
from app import db
from app.models.afiliado import Afiliado
from app.models.prestador import Prestador
from app.models.prestacion import Prestacion
from app.models.factura import Factura

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
@login_required
def dashboard():
    stats = {
        'total_afiliados': Afiliado.query.filter_by(estado='activo').count(),
        'total_prestadores': Prestador.query.filter_by(estado='activo').count(),
        'prestaciones_pendientes': Prestacion.query.filter_by(estado='pendiente').count(),
        'prestaciones_autorizadas': Prestacion.query.filter_by(estado='autorizada').count(),
        'facturas_pendientes': Factura.query.filter_by(estado='pendiente').count(),
        'total_afiliados_all': Afiliado.query.count(),
        'total_prestadores_all': Prestador.query.count(),
        'total_prestaciones': Prestacion.query.count(),
        'total_facturas': Factura.query.count(),
    }

    ultimas_prestaciones = Prestacion.query.order_by(
        Prestacion.created_at.desc()
    ).limit(10).all()

    ultimas_facturas = Factura.query.order_by(
        Factura.created_at.desc()
    ).limit(5).all()

    return render_template('main/dashboard.html',
                           stats=stats,
                           ultimas_prestaciones=ultimas_prestaciones,
                           ultimas_facturas=ultimas_facturas)

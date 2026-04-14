from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from app import db
from app.models.factura import Factura, FacturaDetalle
from app.models.prestador import Prestador
from app.models.prestacion import Prestacion
from app.forms.factura import FacturaForm
from app.utils.decorators import role_required

facturacion_bp = Blueprint('facturacion', __name__)


@facturacion_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    estado = request.args.get('estado', '', type=str)

    query = Factura.query

    if search:
        query = query.filter(
            db.or_(
                Factura.numero_factura.ilike(f'%{search}%'),
                Factura.periodo.ilike(f'%{search}%'),
            )
        )

    if estado:
        query = query.filter_by(estado=estado)

    facturas = query.order_by(Factura.fecha_emision.desc()).paginate(
        page=page, per_page=20, error_out=False
    )

    return render_template('facturacion/index.html', facturas=facturas,
                           search=search, estado=estado)


@facturacion_bp.route('/nueva', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def create():
    form = FacturaForm()
    form.prestador_id.choices = [
        (p.id, f'{p.matricula} - {p.nombre_completo}')
        for p in Prestador.query.filter_by(estado='activo').order_by(Prestador.nombre).all()
    ]

    if form.validate_on_submit():
        factura = Factura(
            numero_factura=form.numero_factura.data,
            prestador_id=form.prestador_id.data,
            fecha_emision=form.fecha_emision.data,
            fecha_vencimiento=form.fecha_vencimiento.data,
            periodo=form.periodo.data,
            estado=form.estado.data,
            observaciones=form.observaciones.data,
        )
        db.session.add(factura)
        db.session.commit()
        flash('Factura creada exitosamente.', 'success')
        return redirect(url_for('facturacion.detail', id=factura.id))

    return render_template('facturacion/form.html', form=form, title='Nueva Factura')


@facturacion_bp.route('/<int:id>')
@login_required
def detail(id):
    factura = db.get_or_404(Factura, id)
    prestaciones_disponibles = Prestacion.query.filter_by(
        prestador_id=factura.prestador_id,
        estado='autorizada'
    ).all()
    return render_template('facturacion/detail.html', factura=factura,
                           prestaciones_disponibles=prestaciones_disponibles)


@facturacion_bp.route('/<int:id>/editar', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def edit(id):
    factura = db.get_or_404(Factura, id)
    form = FacturaForm(obj=factura)
    form.prestador_id.choices = [
        (p.id, f'{p.matricula} - {p.nombre_completo}')
        for p in Prestador.query.filter_by(estado='activo').order_by(Prestador.nombre).all()
    ]

    if form.validate_on_submit():
        factura.numero_factura = form.numero_factura.data
        factura.prestador_id = form.prestador_id.data
        factura.fecha_emision = form.fecha_emision.data
        factura.fecha_vencimiento = form.fecha_vencimiento.data
        factura.periodo = form.periodo.data
        factura.estado = form.estado.data
        factura.observaciones = form.observaciones.data
        db.session.commit()
        flash('Factura actualizada exitosamente.', 'success')
        return redirect(url_for('facturacion.detail', id=factura.id))

    return render_template('facturacion/form.html', form=form,
                           title='Editar Factura', factura=factura)


@facturacion_bp.route('/<int:id>/agregar_prestacion', methods=['POST'])
@login_required
@role_required('admin', 'operador')
def agregar_prestacion(id):
    factura = db.get_or_404(Factura, id)
    prestacion_id = request.form.get('prestacion_id', type=int)

    if not prestacion_id:
        flash('Debe seleccionar una prestación.', 'warning')
        return redirect(url_for('facturacion.detail', id=id))

    prestacion = db.get_or_404(Prestacion, prestacion_id)

    if prestacion.estado != 'autorizada':
        flash('Solo se pueden facturar prestaciones autorizadas.', 'warning')
        return redirect(url_for('facturacion.detail', id=id))

    detalle = FacturaDetalle(
        factura_id=factura.id,
        prestacion_id=prestacion.id,
        descripcion=f'{prestacion.codigo_practica} - {prestacion.descripcion}',
        cantidad=prestacion.cantidad,
        monto_unitario=prestacion.monto_cobertura,
        monto=prestacion.monto_cobertura * prestacion.cantidad,
    )
    db.session.add(detalle)

    prestacion.estado = 'facturada'
    factura.recalcular_total()
    db.session.commit()

    flash('Prestación agregada a la factura.', 'success')
    return redirect(url_for('facturacion.detail', id=id))


@facturacion_bp.route('/<int:id>/eliminar', methods=['POST'])
@login_required
@role_required('admin')
def delete(id):
    factura = db.get_or_404(Factura, id)
    for detalle in factura.detalles:
        if detalle.prestacion:
            detalle.prestacion.estado = 'autorizada'
    db.session.delete(factura)
    db.session.commit()
    flash('Factura eliminada.', 'info')
    return redirect(url_for('facturacion.index'))

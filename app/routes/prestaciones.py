from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from app import db
from app.models.prestacion import Prestacion
from app.models.afiliado import Afiliado
from app.models.prestador import Prestador
from app.forms.prestacion import PrestacionForm
from app.utils.decorators import role_required

prestaciones_bp = Blueprint('prestaciones', __name__)


@prestaciones_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    estado = request.args.get('estado', '', type=str)

    query = Prestacion.query

    if search:
        query = query.filter(
            db.or_(
                Prestacion.numero_orden.ilike(f'%{search}%'),
                Prestacion.descripcion.ilike(f'%{search}%'),
                Prestacion.codigo_practica.ilike(f'%{search}%'),
            )
        )

    if estado:
        query = query.filter_by(estado=estado)

    prestaciones = query.order_by(Prestacion.fecha.desc()).paginate(
        page=page, per_page=20, error_out=False
    )

    return render_template('prestaciones/index.html', prestaciones=prestaciones,
                           search=search, estado=estado)


@prestaciones_bp.route('/nueva', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def create():
    form = PrestacionForm()
    form.afiliado_id.choices = [
        (a.id, f'{a.numero_afiliado} - {a.nombre_completo}')
        for a in Afiliado.query.filter_by(estado='activo').order_by(Afiliado.apellido).all()
    ]
    form.prestador_id.choices = [
        (p.id, f'{p.matricula} - {p.nombre_completo}')
        for p in Prestador.query.filter_by(estado='activo').order_by(Prestador.nombre).all()
    ]

    if form.validate_on_submit():
        prestacion = Prestacion(
            numero_orden=form.numero_orden.data,
            afiliado_id=form.afiliado_id.data,
            prestador_id=form.prestador_id.data,
            fecha=form.fecha.data,
            codigo_practica=form.codigo_practica.data,
            descripcion=form.descripcion.data,
            cantidad=form.cantidad.data,
            monto_total=form.monto_total.data,
            cobertura_porcentaje=form.cobertura_porcentaje.data,
            estado=form.estado.data,
            diagnostico=form.diagnostico.data,
            observaciones=form.observaciones.data,
        )
        prestacion.calcular_montos()
        db.session.add(prestacion)
        db.session.commit()
        flash('Prestación creada exitosamente.', 'success')
        return redirect(url_for('prestaciones.detail', id=prestacion.id))

    return render_template('prestaciones/form.html', form=form, title='Nueva Prestación')


@prestaciones_bp.route('/<int:id>')
@login_required
def detail(id):
    prestacion = db.get_or_404(Prestacion, id)
    return render_template('prestaciones/detail.html', prestacion=prestacion)


@prestaciones_bp.route('/<int:id>/editar', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def edit(id):
    prestacion = db.get_or_404(Prestacion, id)
    form = PrestacionForm(obj=prestacion)
    form.afiliado_id.choices = [
        (a.id, f'{a.numero_afiliado} - {a.nombre_completo}')
        for a in Afiliado.query.filter_by(estado='activo').order_by(Afiliado.apellido).all()
    ]
    form.prestador_id.choices = [
        (p.id, f'{p.matricula} - {p.nombre_completo}')
        for p in Prestador.query.filter_by(estado='activo').order_by(Prestador.nombre).all()
    ]

    if form.validate_on_submit():
        prestacion.numero_orden = form.numero_orden.data
        prestacion.afiliado_id = form.afiliado_id.data
        prestacion.prestador_id = form.prestador_id.data
        prestacion.fecha = form.fecha.data
        prestacion.codigo_practica = form.codigo_practica.data
        prestacion.descripcion = form.descripcion.data
        prestacion.cantidad = form.cantidad.data
        prestacion.monto_total = form.monto_total.data
        prestacion.cobertura_porcentaje = form.cobertura_porcentaje.data
        prestacion.estado = form.estado.data
        prestacion.diagnostico = form.diagnostico.data
        prestacion.observaciones = form.observaciones.data
        prestacion.calcular_montos()
        db.session.commit()
        flash('Prestación actualizada exitosamente.', 'success')
        return redirect(url_for('prestaciones.detail', id=prestacion.id))

    return render_template('prestaciones/form.html', form=form,
                           title='Editar Prestación', prestacion=prestacion)


@prestaciones_bp.route('/<int:id>/autorizar', methods=['POST'])
@login_required
@role_required('admin', 'operador')
def autorizar(id):
    prestacion = db.get_or_404(Prestacion, id)
    if prestacion.estado == 'pendiente':
        prestacion.estado = 'autorizada'
        db.session.commit()
        flash('Prestación autorizada.', 'success')
    else:
        flash('Solo se pueden autorizar prestaciones pendientes.', 'warning')
    return redirect(url_for('prestaciones.detail', id=prestacion.id))


@prestaciones_bp.route('/<int:id>/rechazar', methods=['POST'])
@login_required
@role_required('admin', 'operador')
def rechazar(id):
    prestacion = db.get_or_404(Prestacion, id)
    if prestacion.estado == 'pendiente':
        prestacion.estado = 'rechazada'
        db.session.commit()
        flash('Prestación rechazada.', 'info')
    else:
        flash('Solo se pueden rechazar prestaciones pendientes.', 'warning')
    return redirect(url_for('prestaciones.detail', id=prestacion.id))

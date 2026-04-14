from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from app import db
from app.models.afiliado import Afiliado
from app.models.plan import Plan
from app.forms.afiliado import AfiliadoForm
from app.utils.decorators import role_required

afiliados_bp = Blueprint('afiliados', __name__)


@afiliados_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    estado = request.args.get('estado', '', type=str)

    query = Afiliado.query

    if search:
        query = query.filter(
            db.or_(
                Afiliado.nombre.ilike(f'%{search}%'),
                Afiliado.apellido.ilike(f'%{search}%'),
                Afiliado.dni.ilike(f'%{search}%'),
                Afiliado.numero_afiliado.ilike(f'%{search}%'),
            )
        )

    if estado:
        query = query.filter_by(estado=estado)

    afiliados = query.order_by(Afiliado.apellido).paginate(
        page=page, per_page=20, error_out=False
    )

    return render_template('afiliados/index.html', afiliados=afiliados,
                           search=search, estado=estado)


@afiliados_bp.route('/nuevo', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def create():
    form = AfiliadoForm()
    form.plan_id.choices = [(p.id, f'{p.codigo} - {p.nombre}') for p in Plan.query.filter_by(activo=True).all()]
    form.titular_id.choices = [(0, 'Ninguno (es titular)')] + [
        (a.id, f'{a.numero_afiliado} - {a.nombre_completo}')
        for a in Afiliado.query.filter_by(parentesco='titular', estado='activo').all()
    ]

    if form.validate_on_submit():
        afiliado = Afiliado(
            numero_afiliado=form.numero_afiliado.data,
            dni=form.dni.data,
            nombre=form.nombre.data,
            apellido=form.apellido.data,
            fecha_nacimiento=form.fecha_nacimiento.data,
            sexo=form.sexo.data,
            direccion=form.direccion.data,
            localidad=form.localidad.data,
            provincia=form.provincia.data,
            codigo_postal=form.codigo_postal.data,
            telefono=form.telefono.data,
            email=form.email.data,
            plan_id=form.plan_id.data,
            fecha_alta=form.fecha_alta.data,
            estado=form.estado.data,
            parentesco=form.parentesco.data,
            titular_id=form.titular_id.data if form.titular_id.data != 0 else None,
        )
        db.session.add(afiliado)
        db.session.commit()
        flash('Afiliado creado exitosamente.', 'success')
        return redirect(url_for('afiliados.detail', id=afiliado.id))

    return render_template('afiliados/form.html', form=form, title='Nuevo Afiliado')


@afiliados_bp.route('/<int:id>')
@login_required
def detail(id):
    afiliado = db.get_or_404(Afiliado, id)
    return render_template('afiliados/detail.html', afiliado=afiliado)


@afiliados_bp.route('/<int:id>/editar', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def edit(id):
    afiliado = db.get_or_404(Afiliado, id)
    form = AfiliadoForm(obj=afiliado)
    form.plan_id.choices = [(p.id, f'{p.codigo} - {p.nombre}') for p in Plan.query.filter_by(activo=True).all()]
    form.titular_id.choices = [(0, 'Ninguno (es titular)')] + [
        (a.id, f'{a.numero_afiliado} - {a.nombre_completo}')
        for a in Afiliado.query.filter(
            Afiliado.parentesco == 'titular',
            Afiliado.estado == 'activo',
            Afiliado.id != id
        ).all()
    ]

    if form.validate_on_submit():
        afiliado.numero_afiliado = form.numero_afiliado.data
        afiliado.dni = form.dni.data
        afiliado.nombre = form.nombre.data
        afiliado.apellido = form.apellido.data
        afiliado.fecha_nacimiento = form.fecha_nacimiento.data
        afiliado.sexo = form.sexo.data
        afiliado.direccion = form.direccion.data
        afiliado.localidad = form.localidad.data
        afiliado.provincia = form.provincia.data
        afiliado.codigo_postal = form.codigo_postal.data
        afiliado.telefono = form.telefono.data
        afiliado.email = form.email.data
        afiliado.plan_id = form.plan_id.data
        afiliado.fecha_alta = form.fecha_alta.data
        afiliado.estado = form.estado.data
        afiliado.parentesco = form.parentesco.data
        afiliado.titular_id = form.titular_id.data if form.titular_id.data != 0 else None
        db.session.commit()
        flash('Afiliado actualizado exitosamente.', 'success')
        return redirect(url_for('afiliados.detail', id=afiliado.id))

    if not form.titular_id.data:
        form.titular_id.data = 0

    return render_template('afiliados/form.html', form=form,
                           title='Editar Afiliado', afiliado=afiliado)


@afiliados_bp.route('/<int:id>/eliminar', methods=['POST'])
@login_required
@role_required('admin')
def delete(id):
    afiliado = db.get_or_404(Afiliado, id)
    db.session.delete(afiliado)
    db.session.commit()
    flash('Afiliado eliminado.', 'info')
    return redirect(url_for('afiliados.index'))

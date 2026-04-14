from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from app import db
from app.models.prestador import Prestador
from app.forms.prestador import PrestadorForm
from app.utils.decorators import role_required

prestadores_bp = Blueprint('prestadores', __name__)


@prestadores_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    tipo = request.args.get('tipo', '', type=str)

    query = Prestador.query

    if search:
        query = query.filter(
            db.or_(
                Prestador.nombre.ilike(f'%{search}%'),
                Prestador.apellido.ilike(f'%{search}%'),
                Prestador.razon_social.ilike(f'%{search}%'),
                Prestador.matricula.ilike(f'%{search}%'),
                Prestador.cuit.ilike(f'%{search}%'),
            )
        )

    if tipo:
        query = query.filter_by(tipo=tipo)

    prestadores = query.order_by(Prestador.nombre).paginate(
        page=page, per_page=20, error_out=False
    )

    return render_template('prestadores/index.html', prestadores=prestadores,
                           search=search, tipo=tipo)


@prestadores_bp.route('/nuevo', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def create():
    form = PrestadorForm()
    if form.validate_on_submit():
        prestador = Prestador(
            matricula=form.matricula.data,
            cuit=form.cuit.data,
            nombre=form.nombre.data,
            apellido=form.apellido.data,
            razon_social=form.razon_social.data,
            tipo=form.tipo.data,
            especialidad=form.especialidad.data,
            direccion=form.direccion.data,
            localidad=form.localidad.data,
            provincia=form.provincia.data,
            telefono=form.telefono.data,
            email=form.email.data,
            estado=form.estado.data,
            fecha_convenio=form.fecha_convenio.data,
        )
        db.session.add(prestador)
        db.session.commit()
        flash('Prestador creado exitosamente.', 'success')
        return redirect(url_for('prestadores.detail', id=prestador.id))

    return render_template('prestadores/form.html', form=form, title='Nuevo Prestador')


@prestadores_bp.route('/<int:id>')
@login_required
def detail(id):
    prestador = db.get_or_404(Prestador, id)
    return render_template('prestadores/detail.html', prestador=prestador)


@prestadores_bp.route('/<int:id>/editar', methods=['GET', 'POST'])
@login_required
@role_required('admin', 'operador')
def edit(id):
    prestador = db.get_or_404(Prestador, id)
    form = PrestadorForm(obj=prestador)

    if form.validate_on_submit():
        form.populate_obj(prestador)
        db.session.commit()
        flash('Prestador actualizado exitosamente.', 'success')
        return redirect(url_for('prestadores.detail', id=prestador.id))

    return render_template('prestadores/form.html', form=form,
                           title='Editar Prestador', prestador=prestador)


@prestadores_bp.route('/<int:id>/eliminar', methods=['POST'])
@login_required
@role_required('admin')
def delete(id):
    prestador = db.get_or_404(Prestador, id)
    db.session.delete(prestador)
    db.session.commit()
    flash('Prestador eliminado.', 'info')
    return redirect(url_for('prestadores.index'))

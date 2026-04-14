from flask_wtf import FlaskForm
from wtforms import (StringField, DateField, SelectField, SubmitField,
                     TextAreaField, IntegerField)
from wtforms.validators import DataRequired, Length, Email, Optional


class AfiliadoForm(FlaskForm):
    numero_afiliado = StringField('N° Afiliado', validators=[DataRequired(), Length(max=20)])
    dni = StringField('DNI', validators=[DataRequired(), Length(max=15)])
    nombre = StringField('Nombre', validators=[DataRequired(), Length(max=100)])
    apellido = StringField('Apellido', validators=[DataRequired(), Length(max=100)])
    fecha_nacimiento = DateField('Fecha de Nacimiento', validators=[DataRequired()])
    sexo = SelectField('Sexo', choices=[('M', 'Masculino'), ('F', 'Femenino'), ('X', 'No binario')],
                       validators=[DataRequired()])
    direccion = StringField('Dirección', validators=[Optional(), Length(max=200)])
    localidad = StringField('Localidad', validators=[Optional(), Length(max=100)])
    provincia = SelectField('Provincia', validators=[Optional()], choices=[
        ('', 'Seleccionar...'),
        ('Buenos Aires', 'Buenos Aires'),
        ('CABA', 'Ciudad Autónoma de Buenos Aires'),
        ('Catamarca', 'Catamarca'),
        ('Chaco', 'Chaco'),
        ('Chubut', 'Chubut'),
        ('Córdoba', 'Córdoba'),
        ('Corrientes', 'Corrientes'),
        ('Entre Ríos', 'Entre Ríos'),
        ('Formosa', 'Formosa'),
        ('Jujuy', 'Jujuy'),
        ('La Pampa', 'La Pampa'),
        ('La Rioja', 'La Rioja'),
        ('Mendoza', 'Mendoza'),
        ('Misiones', 'Misiones'),
        ('Neuquén', 'Neuquén'),
        ('Río Negro', 'Río Negro'),
        ('Salta', 'Salta'),
        ('San Juan', 'San Juan'),
        ('San Luis', 'San Luis'),
        ('Santa Cruz', 'Santa Cruz'),
        ('Santa Fe', 'Santa Fe'),
        ('Santiago del Estero', 'Santiago del Estero'),
        ('Tierra del Fuego', 'Tierra del Fuego'),
        ('Tucumán', 'Tucumán'),
    ])
    codigo_postal = StringField('Código Postal', validators=[Optional(), Length(max=10)])
    telefono = StringField('Teléfono', validators=[Optional(), Length(max=30)])
    email = StringField('Email', validators=[Optional(), Email()])
    plan_id = SelectField('Plan', coerce=int, validators=[DataRequired()])
    fecha_alta = DateField('Fecha de Alta', validators=[DataRequired()])
    estado = SelectField('Estado', choices=[
        ('activo', 'Activo'), ('suspendido', 'Suspendido'), ('baja', 'Baja')
    ], validators=[DataRequired()])
    parentesco = SelectField('Parentesco', choices=[
        ('titular', 'Titular'),
        ('conyuge', 'Cónyuge'),
        ('hijo', 'Hijo/a'),
        ('otro', 'Otro'),
    ], validators=[DataRequired()])
    titular_id = SelectField('Titular (si es familiar)', coerce=int, validators=[Optional()])
    submit = SubmitField('Guardar')

from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, DateField, SubmitField
from wtforms.validators import DataRequired, Length, Email, Optional


class PrestadorForm(FlaskForm):
    matricula = StringField('Matrícula', validators=[DataRequired(), Length(max=30)])
    cuit = StringField('CUIT', validators=[DataRequired(), Length(max=15)])
    nombre = StringField('Nombre', validators=[DataRequired(), Length(max=100)])
    apellido = StringField('Apellido', validators=[Optional(), Length(max=100)])
    razon_social = StringField('Razón Social', validators=[Optional(), Length(max=200)])
    tipo = SelectField('Tipo', choices=[
        ('medico', 'Médico'),
        ('clinica', 'Clínica'),
        ('sanatorio', 'Sanatorio'),
        ('laboratorio', 'Laboratorio'),
        ('farmacia', 'Farmacia'),
        ('centro_diagnostico', 'Centro de Diagnóstico'),
        ('kinesiologo', 'Kinesiólogo'),
        ('odontologo', 'Odontólogo'),
        ('optica', 'Óptica'),
        ('otro', 'Otro'),
    ], validators=[DataRequired()])
    especialidad = StringField('Especialidad', validators=[Optional(), Length(max=100)])
    direccion = StringField('Dirección', validators=[Optional(), Length(max=200)])
    localidad = StringField('Localidad', validators=[Optional(), Length(max=100)])
    provincia = StringField('Provincia', validators=[Optional(), Length(max=100)])
    telefono = StringField('Teléfono', validators=[Optional(), Length(max=30)])
    email = StringField('Email', validators=[Optional(), Email()])
    estado = SelectField('Estado', choices=[
        ('activo', 'Activo'), ('suspendido', 'Suspendido'), ('baja', 'Baja')
    ], validators=[DataRequired()])
    fecha_convenio = DateField('Fecha de Convenio', validators=[Optional()])
    submit = SubmitField('Guardar')

from flask_wtf import FlaskForm
from wtforms import (StringField, DateField, SelectField, FloatField,
                     IntegerField, TextAreaField, SubmitField)
from wtforms.validators import DataRequired, Length, Optional, NumberRange


class PrestacionForm(FlaskForm):
    numero_orden = StringField('N° Orden', validators=[DataRequired(), Length(max=20)])
    afiliado_id = SelectField('Afiliado', coerce=int, validators=[DataRequired()])
    prestador_id = SelectField('Prestador', coerce=int, validators=[DataRequired()])
    fecha = DateField('Fecha', validators=[DataRequired()])
    codigo_practica = StringField('Código de Práctica', validators=[DataRequired(), Length(max=20)])
    descripcion = StringField('Descripción', validators=[DataRequired(), Length(max=300)])
    cantidad = IntegerField('Cantidad', default=1, validators=[DataRequired(), NumberRange(min=1)])
    monto_total = FloatField('Monto Total', validators=[DataRequired(), NumberRange(min=0)])
    cobertura_porcentaje = FloatField('% Cobertura', validators=[DataRequired(), NumberRange(min=0, max=100)])
    estado = SelectField('Estado', choices=[
        ('pendiente', 'Pendiente'),
        ('autorizada', 'Autorizada'),
        ('rechazada', 'Rechazada'),
        ('facturada', 'Facturada'),
    ], validators=[DataRequired()])
    diagnostico = StringField('Diagnóstico', validators=[Optional(), Length(max=300)])
    observaciones = TextAreaField('Observaciones', validators=[Optional()])
    submit = SubmitField('Guardar')

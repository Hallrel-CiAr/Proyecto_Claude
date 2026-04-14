from flask_wtf import FlaskForm
from wtforms import (StringField, DateField, SelectField, FloatField,
                     TextAreaField, SubmitField)
from wtforms.validators import DataRequired, Length, Optional


class FacturaForm(FlaskForm):
    numero_factura = StringField('N° Factura', validators=[DataRequired(), Length(max=30)])
    prestador_id = SelectField('Prestador', coerce=int, validators=[DataRequired()])
    fecha_emision = DateField('Fecha Emisión', validators=[DataRequired()])
    fecha_vencimiento = DateField('Fecha Vencimiento', validators=[Optional()])
    periodo = StringField('Período (YYYY-MM)', validators=[DataRequired(), Length(min=7, max=7)])
    estado = SelectField('Estado', choices=[
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('pagada', 'Pagada'),
        ('rechazada', 'Rechazada'),
    ], validators=[DataRequired()])
    observaciones = TextAreaField('Observaciones', validators=[Optional()])
    submit = SubmitField('Guardar')

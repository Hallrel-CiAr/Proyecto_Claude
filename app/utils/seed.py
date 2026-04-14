from app import db
from app.models.usuario import Usuario
from app.models.plan import Plan


def create_admin_user():
    admin = Usuario.query.filter_by(username='admin').first()
    if admin is None:
        admin = Usuario(
            username='admin',
            email='admin@obrasocial.local',
            nombre='Administrador',
            apellido='Sistema',
            rol='admin',
            activo=True
        )
        admin.set_password('admin123')
        db.session.add(admin)

    if Plan.query.count() == 0:
        planes = [
            Plan(codigo='PMO', nombre='Plan Médico Obligatorio',
                 descripcion='Cobertura básica obligatoria según PMO',
                 cobertura_porcentaje=100.0, cuota_mensual=0),
            Plan(codigo='PB100', nombre='Plan Básico 100',
                 descripcion='Plan básico con 100% de cobertura en consultas',
                 cobertura_porcentaje=100.0, cuota_mensual=5000),
            Plan(codigo='PB80', nombre='Plan Básico 80',
                 descripcion='Plan básico con 80% de cobertura',
                 cobertura_porcentaje=80.0, cuota_mensual=3000),
            Plan(codigo='PB60', nombre='Plan Básico 60',
                 descripcion='Plan básico con 60% de cobertura',
                 cobertura_porcentaje=60.0, cuota_mensual=1500),
        ]
        db.session.add_all(planes)

    db.session.commit()

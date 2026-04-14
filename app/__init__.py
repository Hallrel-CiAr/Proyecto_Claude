from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from config import Config

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Debe iniciar sesión para acceder a esta página.'
login_manager.login_message_category = 'warning'
migrate = Migrate()
csrf = CSRFProtect()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.main import main_bp
    from app.routes.afiliados import afiliados_bp
    from app.routes.prestadores import prestadores_bp
    from app.routes.prestaciones import prestaciones_bp
    from app.routes.facturacion import facturacion_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(afiliados_bp, url_prefix='/afiliados')
    app.register_blueprint(prestadores_bp, url_prefix='/prestadores')
    app.register_blueprint(prestaciones_bp, url_prefix='/prestaciones')
    app.register_blueprint(facturacion_bp, url_prefix='/facturacion')

    with app.app_context():
        db.create_all()
        from app.utils.seed import create_admin_user
        create_admin_user()

    return app

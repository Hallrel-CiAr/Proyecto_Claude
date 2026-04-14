# Sistema de Gestión de Obra Social

Aplicación web para la gestión integral de obras sociales. Permite administrar afiliados, prestadores, prestaciones médicas y facturación.

## Características

- **Gestión de Afiliados**: Alta, baja, modificación. Grupo familiar, planes de cobertura.
- **Gestión de Prestadores**: Médicos, clínicas, laboratorios, farmacias y más.
- **Prestaciones**: Registro, autorización y seguimiento de prestaciones médicas.
- **Facturación**: Generación de facturas, asociación de prestaciones, control de estados.
- **Dashboard**: Vista general con estadísticas y accesos rápidos.
- **Autenticación**: Sistema de login con roles (admin, operador, consulta).
- **Multiplataforma**: Funciona en Linux y Windows, accesible desde cualquier navegador.

## Requisitos

- Python 3.9 o superior
- Navegador web moderno (Chrome, Firefox, Edge)

## Instalación y Ejecución

### Linux

```bash
chmod +x scripts/iniciar.sh
./scripts/iniciar.sh
```

### Windows

```
scripts\iniciar.bat
```

### Manual

```bash
python -m venv venv
source venv/bin/activate        # Linux
# venv\Scripts\activate.bat     # Windows
pip install -r requirements.txt
python run.py
```

## Acceso

Una vez iniciado, abra su navegador en: **http://localhost:5000**

- **Usuario**: `admin`
- **Contraseña**: `admin123`

> Cambie la contraseña del administrador luego del primer acceso.

## Estructura del Proyecto

```
├── app/
│   ├── __init__.py          # Factory de la aplicación Flask
│   ├── models/              # Modelos de base de datos
│   │   ├── usuario.py       # Usuarios y autenticación
│   │   ├── afiliado.py      # Afiliados
│   │   ├── prestador.py     # Prestadores de salud
│   │   ├── prestacion.py    # Prestaciones médicas
│   │   ├── factura.py       # Facturas y detalles
│   │   └── plan.py          # Planes de cobertura
│   ├── routes/              # Rutas/controladores
│   ├── templates/           # Templates HTML (Jinja2)
│   ├── static/              # CSS, JS, imágenes
│   ├── forms/               # Formularios WTForms
│   └── utils/               # Utilidades y decoradores
├── scripts/
│   ├── iniciar.sh           # Script de inicio Linux
│   └── iniciar.bat          # Script de inicio Windows
├── config.py                # Configuración
├── run.py                   # Punto de entrada
└── requirements.txt         # Dependencias Python
```

## Tecnologías

- **Backend**: Python 3 + Flask
- **Frontend**: Bootstrap 5 + Bootstrap Icons
- **Base de datos**: SQLite (sin necesidad de servidor de BD)
- **ORM**: SQLAlchemy
- **Autenticación**: Flask-Login
- **Formularios**: Flask-WTF / WTForms

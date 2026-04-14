@echo off
REM Script de inicio para Windows
REM Sistema de Gestion de Obra Social

cd /d "%~dp0\.."

echo ==========================================
echo   Sistema de Gestion de Obra Social
echo ==========================================
echo.

REM Verificar Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado.
    echo Instale Python 3.9+ desde: https://www.python.org/downloads/
    echo Asegurese de marcar "Add Python to PATH" durante la instalacion.
    pause
    exit /b 1
)

python --version

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual
call venv\Scripts\activate.bat

REM Instalar dependencias
echo Verificando dependencias...
pip install -r requirements.txt --quiet

REM Crear directorio instance si no existe
if not exist "instance" mkdir instance

REM Copiar .env si no existe
if not exist ".env" (
    copy .env.example .env
    echo Archivo .env creado. Editelo para configuracion personalizada.
)

echo.
echo Iniciando servidor...
echo Acceda al sistema en: http://localhost:5000
echo Usuario: admin ^| Clave: admin123
echo.
echo Presione Ctrl+C para detener el servidor
echo ==========================================

python run.py
pause

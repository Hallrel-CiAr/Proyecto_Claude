#!/bin/bash
# Script de inicio para Linux
# Sistema de Gestión de Obra Social

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=========================================="
echo "  Sistema de Gestión de Obra Social"
echo "=========================================="
echo ""

# Verificar Python
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "ERROR: Python no está instalado."
    echo "Instale Python 3.9+ desde: https://www.python.org/downloads/"
    exit 1
fi

echo "Usando: $($PYTHON --version)"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    $PYTHON -m venv venv
fi

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
echo "Verificando dependencias..."
pip install -r requirements.txt --quiet

# Crear directorio instance si no existe
mkdir -p instance

# Copiar .env si no existe
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Archivo .env creado. Edítelo para configuración personalizada."
fi

echo ""
echo "Iniciando servidor..."
echo "Acceda al sistema en: http://localhost:5000"
echo "Usuario: admin | Clave: admin123"
echo ""
echo "Presione Ctrl+C para detener el servidor"
echo "=========================================="

python run.py

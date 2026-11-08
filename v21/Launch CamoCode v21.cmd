@echo off
cd /d "%~dp0"
python -c "import numpy, PIL, cryptography" >nul 2>nul
if errorlevel 1 python -m pip install -r "opticipher_vendor\requirements.txt"
python server.py
pause

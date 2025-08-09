@echo off
echo Updating JAVA_HOME to Java 17...

REM Check if Java 17 is installed
if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot" (
    setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot"
    echo JAVA_HOME updated to Java 17
) else if exist "C:\Program Files\Eclipse Adoptium\jdk-17*" (
    for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
        setx JAVA_HOME "%%i"
        echo JAVA_HOME updated to: %%i
        goto :found
    )
) else (
    echo Java 17 not found. Please install it first.
    echo Download from: https://adoptium.net/temurin/releases/?version=17
    pause
    exit /b 1
)

:found
echo.
echo Please restart your terminal/command prompt for changes to take effect.
echo Then run: java -version
pause

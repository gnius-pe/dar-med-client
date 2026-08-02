# Requisitos para ejecutar el proyecto

Asegúrate de que tu entorno cumpla con las siguientes versiones para ejecutar correctamente este proyecto:

## 1. Angular

- **CLI de Angular**: `15.1.6`
- **Versión de Angular**: `15.2.10`
  - Incluye los siguientes paquetes:
    - `@angular/animations`
    - `@angular/common`
    - `@angular/compiler`
    - `@angular/compiler-cli`
    - `@angular/core`
    - `@angular/forms`
    - `@angular/platform-browser`
    - `@angular/platform-browser-dynamic`
    - `@angular/router`

## 2. Node.js

- **Versión de Node.js**: `16.20.2`

## 3. Gestor de paquetes (NPM)

- **Versión de NPM**: `6.14.18`

## 4. Sistema Operativo

- **Sistema Operativo**: `Windows 64-bit`

## Instrucciones

1. Instala [Node.js](https://nodejs.org/) y asegúrate de que esté en la versión especificada.
2. Instala la CLI de Angular globalmente:
   ```bash
   npm install -g @angular/cli@15.1.6
   ```
3. Verifica las versiones instaladas:
   ```bash
   node -v   # Debería mostrar 16.20.2
   npm -v    # Debería mostrar 6.14.18
   ng version # Debería mostrar Angular CLI 15.1.6 y Angular 15.2.10
   ```
4. Clona el repositorio del proyecto y navega al directorio.
5. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
6. Ejecuta el proyecto localmente:
   ```bash
   ng serve
   ```

## Nota

Es importante mantener las versiones indicadas para garantizar la compatibilidad con las dependencias y el funcionamiento correcto del proyecto.

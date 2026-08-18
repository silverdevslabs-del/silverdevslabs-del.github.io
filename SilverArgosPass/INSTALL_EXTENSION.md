# Instalación de la Extensión del Navegador y Servicio de Accesibilidad

## Extensión del Navegador (Chrome / Firefox)

### Instalación en Chrome

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa "Modo desarrollador" (esquina superior derecha)
3. Haz clic en "Cargar extensión sin empaquetar"
4. Selecciona la carpeta `windows/extension/` de SilverArgosPass
5. La extensión aparecerá en la barra de herramientas

### Instalación en Firefox

1. Abre Firefox y ve a `about:debugging#/runtime/this-firefox`
2. Haz clic en "Cargar complemento temporal..."
3. Selecciona el archivo `manifest.json` dentro de `windows/extension/`
4. Acepta los permisos

### Configuración del Host Nativo

La extensión necesita un host nativo para comunicarse con la app de escritorio.

1. Abre SilverArgosPass en Windows
2. Ve a Configuración → Extensión del Navegador
3. Haz clic en "Instalar Host Nativo"
4. Reinicia el navegador

### Uso

1. Navega a cualquier página de inicio de sesión
2. Ingresa tu usuario y contraseña
3. Al enviar el formulario, la extensión detectará las credenciales
4. Aparecerá una notificación: "¿Guardar credenciales para [sitio]?"
5. Haz clic en "Guardar" para agregar al vault

## Servicio de Accesibilidad (Android)

### Habilitar

1. Abre SilverArgosPass en Android
2. Ve a Configuración → Detección Automática
3. Haz clic en "Habilitar detección automática"
4. Serás redirigido a los Ajustes de Accesibilidad del sistema
5. Busca "SilverArgosPass" y actívalo
6. Confirma el permiso

### Uso

1. Abre cualquier app con campo de contraseña (Instagram, Chrome, etc.)
2. Escribe tu contraseña
3. Aparecerá un botón flotante "🔐 Guardar"
4. Toca el botón para guardar en tu vault
5. Se abrirá SilverArgosPass con los datos pre-llenados
6. Confirma y guarda

### Notas

- El servicio de accesibilidad NO envía tus contraseñas a ningún servidor
- Todo se almacena localmente y se cifra antes de sincronizar
- Puedes desactivar el servicio en cualquier momento desde Configuración
- El botón flotante desaparece automáticamente después de 10 segundos

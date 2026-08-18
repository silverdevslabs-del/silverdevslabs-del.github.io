# Protocolo de Intercambio de Llaves: Windows ↔ Android

## Resumen

El cliente Windows necesita recibir la llave maestra del usuario desde el dispositivo Android.  
**No** se envía la llave en el QR directamente (como hace el flujo Android↔Android con prefijo `SAP:`).  
En su lugar, el QR contiene un **UUID de solicitud** y la transferencia real se hace vía **Firestore**.

---

## Flujo General

```
┌──────────┐         QR (UUID)        ┌──────────┐
│  Windows │ ◄─────────────────────── │ Android  │
│ (Tauri)  │                          │  (App)   │
└────┬─────┘                          └────┬─────┘
     │                                      │
     │  1. Escanea QR, obtiene UUID         │
     │  2. Muestra dialog de autorización   │
     │  3. Usuario aprueba                  │
     │  4. Cifra llave maestra con UUID     │
     │  5. Sube a Firestore                 │
     │                                      │
     │         Firestore                    │
     │  ┌─────────────────────────────┐     │
     │  │ keyExchange/{uuid}          │     │
     │  │   - encryptedKey: Base64    │     │
     │  │   - iv: Base64              │     │
     │  │   - deviceName: String      │     │
     │  │   - createdAt: Timestamp    │     │
     │  │   - expiresAt: Timestamp    │     │
     │  └─────────────────────────────┘     │
     │                                      │
     │  6. Polls Firestore cada 2s          │
     │  7. Descarga encryptedKey            │
     │  8. Descifra con UUID                │
     │  9. Almacena llave maestra           │
     │ 10. Limpia documento de Firestore    │
     │                                      │
     ▼                                      ▼
  [Windows tiene     ←  Llave Maestra →    [Android tiene
   las contraseñas]                         las contraseñas]
```

---

## Paso 1: Windows Genera QR

El QR contiene un JSON con los siguientes campos:

```json
{
  "v": 1,
  "type": "sap_key_request",
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "deviceName": "Escritorio de Luis",
  "createdAt": "2026-07-21T15:30:00Z",
  "expiresAt": "2026-07-21T15:35:00Z"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `v` | int | Versión del protocolo (1) |
| `type` | string | Identificador fijo: `"sap_key_request"` |
| `requestId` | UUID v4 | Identificador único de esta solicitud |
| `deviceName` | string | Nombre del dispositivo Windows (configurable) |
| `createdAt` | ISO 8601 | Fecha/hora de creación |
| `expiresAt` | ISO 8601 | Expiración (5 minutos) |

---

## Paso 2: Android Escanea y Autoriza

Al escanear un QR con `"type": "sap_key_request"`:

1. **Verificar expiración**: Si `expiresAt < now`, rechazar.
2. **Mostrar dialog**:
   ```
   ┌─────────────────────────────────┐
   │  Solicitud de acceso            │
   │                                 │
   │  Nombre: Escritorio de Luis     │
   │  Hace: 2 min                    │
   │                                 │
   │  ¿Autorizar acceso a tus        │
   │  contraseñas?                   │
   │                                 │
   │  [Cancelar]    [Autorizar]      │
   └─────────────────────────────────┘
   ```
3. **Requerir autenticación biométrica** antes de proceder.

---

## Paso 3: Android Transfiere Llave

Al autorizar:

1. **Obtener llave maestra** de `KeystoreManager.getMasterKeyBytes()`.
2. **Generar IV aleatorio** (12 bytes para AES-GCM).
3. **Cifrar llave maestra** con AES-256-GCM usando una clave derivada del `requestId`:
   - Clave derivada: `HKDF-SHA256(requestId, salt="SAPv1", length=32)`
4. **Subir a Firestore** en `users/{uid}/keyExchange/{requestId}`:
   ```json
   {
     "encryptedKey": "Base64(ciphertext + tag)",
     "iv": "Base64(iv)",
     "deviceName": "Samsung Galaxy S24",
     "createdAt": "2026-07-21T15:30:05Z",
     "expiresAt": "2026-07-21T15:35:00Z",
     "status": "pending"
   }
   ```
5. **Actualizar status** a `"delivered"` después de 30 segundos o cuando Windows confirme recepción.
6. **Eliminar documento** después de 5 minutos.

---

## Paso 4: Windows Descarga Llave

1. **Poll Firestore** cada 2 segundos en `users/{uid}/keyExchange/{requestId}`.
2. **Verificar status** == `"pending"`.
3. **Descargar** `encryptedKey` e `iv`.
4. **Derivar misma clave** con `HKDF-SHA256(requestId, salt="SAPv1", length=32)`.
5. **Descifrar** con AES-256-GCM → obtener `masterKeyBytes`.
6. **Almacenar** en el vault local de Windows (Windows DPAPI o similar).
7. **Actualizar status** a `"delivered"` o eliminar documento.

---

## Seguridad

| Aspecto | Implementación |
|---------|----------------|
| **Cifrado en tránsito** | Firestore maneja TLS automáticamente |
| **Cifrado en reposo** | La llave maestra nunca se almacena en texto plano |
| **Derivación de clave** | HKDF-SHA256 con salt fijo por versión |
| **Autenticación** | Requiere biometría en Android para autorizar |
| **Expiración** | QR y Firestore document expiran en 5 minutos |
| **Prevención de replay** | requestId es UUID único, documento se elimina después de usar |
| **Zero-Knowledge** | Firestore solo ve la llave cifrada, nunca la llave real |

---

## Cambios Requeridos en Android

### Archivos a modificar:

| Archivo | Cambio |
|---------|--------|
| `QrGenerateScreen.kt` | Agregar modo "Windows" que genere QR de solicitud |
| `QrScanScreen.kt` | Detectar `"type": "sap_key_request"` y manejar transferencia |
| `SyncManager.kt` | Agregar métodos `uploadKeyExchange()` y `deleteKeyExchange()` |
| `KeystoreManager.kt` | Agregar `encryptWithKey()` y `decryptWithKey()` |
| `Navigation.kt` | Agregar ruta `QrGenerateWindows` |

### Nuevo archivo:
| Archivo | Descripción |
|---------|-------------|
| `KeyExchangeManager.kt` | Lógica central del intercambio de llaves |

---

## Cambios Requeridos en Windows (Tauri)

### Estructura del proyecto:

```
windows/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          # Entry point Tauri
│   │   ├── commands.rs      # Comandos IPC
│   │   ├── firebase.rs      # Cliente Firestore
│   │   ├── key_exchange.rs  # Lógica de intercambio
│   │   └── vault.rs         # Almacenamiento seguro local
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── App.tsx              # Componente principal React
│   ├── components/
│   │   ├── QrGenerator.tsx  # Generador de QR
│   │   ├── KeyPoller.tsx    # Polling de Firestore
│   │   └── PasswordList.tsx # Lista de contraseñas
│   └── index.html
└── package.json
```

### Dependencias Rust (Cargo.toml):

```toml
[dependencies]
tauri = { version = "2", features = ["shell-open"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
qrcode = "0.14"           # Generación de QR
uuid = { version = "1", features = ["v4"] }  # UUIDs
reqwest = { version = "0.11", features = ["json"] }  # HTTP a Firestore
tokio = { version = "1", features = ["full"] }  # Async runtime
aes-gcm = "0.10"          # Cifrado AES-GCM
hkdf = "0.12"             # Derivación de clave
sha2 = "0.10"              # SHA-256
base64 = "0.21"            # Encoding
chrono = { version = "0.4", features = ["serde"] }  # Timestamps
```

---

## Estados del Protocolo

```
[Windows] UUID_GENERADO
    │
    ▼ (muestra QR)
[Android] QR_ESCANEADO
    │
    ▼ (biometría)
[Android] AUTORIZADO
    │
    ▼ (sube a Firestore)
[Firestore] PENDING
    │
    ▼ (Windows descarga)
[Windows] KEY_RECEIVED
    │
    ▼ (descifra y almacena)
[Windows] COMPLETED
    │
    ▼ (elimina de Firestore)
[Firestore] DELETED
```

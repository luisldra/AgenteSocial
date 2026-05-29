# ALEX — Entrenador de Habilidades Sociales
**Agente Social Interactivo — Grupo 2 — Ingeniería de Usabilidad — Universidad de Caldas**

Población objetivo: Personas con Síndrome de Asperger  
Objetivo: Entrenamiento en habilidades sociales mediante simulación de situaciones cotidianas colombianas.

---

## Configuración rápida

### 1. Obtener API Key de Groq (gratis, sin tarjeta de crédito)
1. Ir a [console.groq.com](https://console.groq.com)
2. Crear cuenta con Google o GitHub
3. Menú lateral → **API Keys** → **Create API Key**
4. Copiar la key (formato: `gsk_...`) — se muestra solo una vez

### 2. Ejecutar la aplicación
**Local:** Abrir `index.html` en Chrome o Edge  
**GitHub Pages:** Settings → Pages → Deploy from branch: `main` / `root`

### 3. Usar
1. Pegar la API Key en la pantalla inicial
2. Leer y aceptar el aviso de ética
3. Seleccionar un escenario en el panel izquierdo
4. Escribir o hablar cómo responderías
5. Leer la tarjeta de retroalimentación de ALEX

---

## Archivos
| Archivo | Descripción |
|---|---|
| `index.html` | Estructura y pantalla ética |
| `styles.css` | Estilos, layout avatar-centric, tarjeta feedback |
| `avatar.js` | Robot Cartoon Canvas 2D — 6 emociones |
| `agent.js` | Groq API, system prompt, memoria Summary Buffer Hybrid |
| `scenarios.js` | 7 escenarios de práctica social colombiana |
| `speech.js` | TTS + STT Web Speech API |
| `app.js` | Orquestación principal |

## Modelo LLM
- Proveedor: Groq | Modelo: `llama-3.3-70b-versatile`
- Temperature: 0.65 | Max tokens: 650

## Memoria
Summary Buffer Hybrid: últimos 6 mensajes íntegros + resumen comprimido ≤400 chars en localStorage.

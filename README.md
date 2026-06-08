# ALEX — Entrenador de Habilidades Sociales
<<<<<<< HEAD
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
=======

**Agente Social Interactivo — Grupo 2 — Ingeniería de Usabilidad — Universidad de Caldas**

**Población objetivo:** Personas con Síndrome de Asperger  
**Objetivo:** Entrenamiento en habilidades sociales mediante la simulación de situaciones cotidianas colombianas, brindando retroalimentación explícita y adaptativa.

---

## 🚀 Funcionamiento del Proyecto

ALEX es un agente conversacional interactivo (no un chatbot genérico) que asume el rol de "entrenador" en simulaciones sociales. Se comunica con modelos de lenguaje de última generación (LLMs) para procesar el lenguaje natural y evaluar al usuario. 

**Características principales:**
- **Evaluación y Retroalimentación (Feedback):** ALEX evalúa las respuestas del usuario con base en habilidades sociales (cortesía, claridad, empatía, etc.) otorgando un puntaje (0-10) y entregando retroalimentación en un formato estructurado (Fortalezas 🟢, Aspectos aceptables 🟡, Por mejorar 🔴, y Sugerencias 💡).
- **Adaptabilidad:** Ajusta su nivel de complejidad según la confianza y frustración detectada en el usuario mediante análisis de sentimiento del texto ingresado.
- **Memoria "Summary Buffer Hybrid":** Retiene los últimos 6 mensajes íntegros y genera un resumen comprimido de los anteriores para mantener contexto sin exceder el límite de tokens.
- **Voz y Avatar:** Usa Web Speech API nativa del navegador para TTS (Text-to-Speech) y STT (Speech-to-Text), y un avatar dibujado en Canvas 2D que cambia de expresión emocional según la evaluación del desempeño.
- **Multimodelo:** Soporta las APIs de **Groq** y **Google Gemini**, alternando automáticamente entre ellas como mecanismo de respaldo si una falla (por cuota de uso o error temporal).

---

## 🔑 Cómo obtener las API Keys (Gratis)

El proyecto requiere al menos una API Key de Groq o Gemini para funcionar. Se recomienda obtener ambas para asegurar alta disponibilidad.

### Opción 1: Obtener API Key de Groq (Recomendado, respuesta más rápida)
1. Ve a [console.groq.com](https://console.groq.com/keys).
2. Inicia sesión o crea una cuenta usando Google o GitHub.
3. Haz clic en el botón **Create API Key**.
4. Ponle un nombre de referencia (ej. `AgenteSocial`).
5. **Copia la clave** que se genera (empieza con `gsk_...`).  
   *Ojo: La clave solo se muestra una vez por seguridad. Guárdala bien.*

### Opción 2: Obtener API Key de Google Gemini
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Inicia sesión con tu cuenta de Google.
3. En el menú superior o lateral, haz clic en **Get API key** o **Create API key**.
4. Selecciona un proyecto de Google Cloud existente o deja que se cree uno nuevo automáticamente.
5. **Copia la clave** generada (empieza por `AIza...`).

> **Nota:** Cuando abras la aplicación, pega las API Keys obtenidas en los campos de la pantalla inicial.

---

## 💻 Ejecución de la aplicación

1. **Clonar o descargar:** Descarga o clona este repositorio en tu computadora.
2. **Ejecución local:** Solo necesitas abrir el archivo `index.html` en tu navegador web moderno preferido (Google Chrome, Microsoft Edge, etc.). *No requiere instalación de Node.js, librerías, ni servidores externos; funciona completamente del lado del cliente.*
3. **Uso de la herramienta:**
   - En la pantalla de bienvenida, ingresa la API Key de Groq y/o la de Gemini.
   - Lee y acepta el aviso de ética de la aplicación.
   - En el panel principal, chatea o selecciona un **Escenario** en la barra izquierda (ej. "Comprar en la tienda de barrio", "Saludar a un conocido").
   - Escribe tu respuesta en el chat o usa el botón de micrófono para hablar.
   - Recibe la respuesta de ALEX y presta atención a la tarjeta de retroalimentación a la derecha.

---

## 📁 Organización de Archivos

El proyecto utiliza una arquitectura Vanilla (HTML, CSS y JS puro) para máxima compatibilidad, sin requerir frameworks pesados.

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura principal de la interfaz web. Contiene las ventanas modales de configuración ética y la disposición del chat interactivo. |
| `styles.css` | Hoja de estilos. Define el diseño responsivo, la paleta de colores, la tarjeta de evaluación (feedback) y el layout general enfocado en el avatar. |
| `app.js` | Archivo orquestador. Conecta la interfaz de usuario con la lógica de negocio, maneja los eventos de clics, la renderización de mensajes en el DOM y la transición de pantallas. |
| `agent.js` | Núcleo de Inteligencia Artificial. Contiene el *System Prompt* detallado para moldear la personalidad de ALEX, se conecta vía HTTP (Fetch) a los proveedores LLM (Groq/Gemini) y gestiona la memoria y perfiles de progreso. |
| `avatar.js` | Renderizado del avatar robótico usando Canvas 2D. Controla las formas y colores para expresar 6 diferentes emociones en pantalla. |
| `scenarios.js` | Base de datos interna con 7 escenarios estructurados de práctica social con contexto netamente colombiano. |
| `speech.js` | Control de accesibilidad por voz (micrófono y altavoz) utilizando la `Web Speech API` estándar del navegador. |

---

## 🧠 Modelos de Lenguaje Configurables
- **Groq:** Configurado para utilizar `llama-3.3-70b-versatile` (Temperatura: 0.65 | Max tokens: 650)
- **Gemini:** Configurado para utilizar `gemini-2.5-flash` (Temperatura: 0.65 | Max tokens: 650)
>>>>>>> 9d23b85877eba386e465996d00eb4fdba8330038

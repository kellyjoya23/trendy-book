# Blind date with a book · Trendy Book

Formulario web para que las clientas cuenten cómo es la persona que va a recibir su cita a ciegas con un libro (o cómo son ellas, si es un autorregalo). Cada ficha se guarda en **Supabase** y además se envía por **WhatsApp** con un código (`TB-XXXXX`) para ubicarla después en el CRM interno.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `index.html` | La página del formulario |
| `styles.css` | Estilos con la línea gráfica de Trendy Book (Peach Editorial, Cormorant Garamond y Montserrat) |
| `app.js` | Pasos del formulario, mensaje de WhatsApp y guardado en Supabase |
| `config.js` | Conexión con Supabase y número de WhatsApp |
| `logo.png`, `icons/` | Logo oficial e íconos (isotipo sobre peach) |
| `vercel.json` | Encabezados de seguridad (política de contenido, bloqueo de iframes) |
| `supabase/schema.sql` | Tabla `fichas` y reglas de seguridad de la base de datos |

No hay que instalar nada ni compilar.

## 1. Base de datos en Supabase

Proyecto: **trendy-book** (dentro de la organización de Katana's Grooming).

La tabla `fichas` ya está creada con sus reglas de seguridad. `supabase/schema.sql` es la copia de esa estructura: sirve para revisarla o recrearla en otro proyecto (en **SQL Editor → New query → Run**). Se puede volver a ejecutar sin perder datos.

Qué puede hacer cada quien:

- **Cualquier persona con el enlace:** solo enviar fichas nuevas. No puede leer, cambiar ni borrar ninguna.
- **Cuentas marcadas como equipo:** ver, editar y borrar fichas (lo usará el CRM interno).

Para ver las fichas mientras tanto: **Table Editor → fichas**.

## 2. Número de WhatsApp

El número está en `config.js` (`whatsappNumero: '50360830130'`), en formato internacional y sin espacios. Para cambiarlo, edita esa línea. Si se deja vacío, WhatsApp se abre y la clienta elige a quién mandar la ficha.

## 3. Publicar en Vercel

1. En vercel.com, **Add New → Project** e importa el repositorio `trendy-book`.
2. En *Framework Preset* elige **Other**. Deja vacíos el comando de build y la carpeta de salida.
3. **Deploy.** El enlace queda como `https://trendy-book.vercel.app` (o el nombre que Vercel asigne).

Cada vez que se sube un cambio a GitHub, Vercel publica la nueva versión sola.

## Cómo funciona

1. Bienvenida con los tres pasos: nos cuentas, elegimos, la cita.
2. ¿Para quién es la cita? (para regalar / para mí). Si es para ella misma, todas las preguntas cambian a "tú".
3. Edad o etapa, qué tanto lee, géneros que le encantan, lo que no quiere recibir, la ocasión y notas libres.
4. Resumen de la ficha y botón **Enviar por WhatsApp**. Al tocarlo, la ficha se guarda en Supabase y se abre WhatsApp con el mensaje listo.

Si la clienta vuelve y edita la ficha después de enviarla, se guarda como ficha nueva con otro código.

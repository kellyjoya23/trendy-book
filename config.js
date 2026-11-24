/* Conexión con Supabase (proyecto trendy-book) y WhatsApp de Trendy Book.
 * La clave "anon" es pública y puede estar en el código: la seguridad la ponen
 * las reglas de la base (desde aquí solo se pueden ENVIAR fichas, nunca leerlas).
 * Nunca pongas aquí la clave "service_role" ni una clave "secret".
 */
window.TRENDY_CONFIG = {
  supabaseUrl: 'https://azvbfrvtfzonfzrcjgeu.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dmJmcnZ0ZnpvbmZ6cmNqZ2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0OTY3NTQsImV4cCI6MjExMTA3Mjc1NH0.nafK0ZIo8mIfbVap9uDYQcKTt7RduSoqkuS01HDWAMU',
  // Número de WhatsApp en formato internacional, sin + ni espacios. Ej: '50370001234'.
  // Vacío = WhatsApp se abre y la clienta elige a quién mandar la ficha.
  whatsappNumero: '50360830130'
};

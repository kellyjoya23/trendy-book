/* Conexión con Supabase (proyecto trendy-book) y WhatsApp de Trendy Book.
 * La clave "anon" es pública y puede estar en el código: la seguridad la ponen
 * las reglas de la base (desde aquí solo se pueden ENVIAR fichas, nunca leerlas).
 * Nunca pongas aquí la clave "service_role" ni una clave "secret".
 */
window.TRENDY_CONFIG = {
  supabaseUrl: 'https://ayqfgslathoryzwzvdnu.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWZnc2xhdGhvcnl6d3p2ZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0OTM5MDYsImV4cCI6MjExMTA2OTkwNn0.gnQTYcomWVF3kSUqxZggFuj_QPRsFNDT-HKid5rHSVQ',
  // Número de WhatsApp en formato internacional, sin + ni espacios. Ej: '50370001234'.
  // Vacío = WhatsApp se abre y la clienta elige a quién mandar la ficha.
  whatsappNumero: '50360830130'
};

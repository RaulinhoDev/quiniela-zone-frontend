<template>
  <div class="privacidad-page">
    <div class="container">
      <div class="doc-wrap">

        <div class="doc-header">
          <router-link to="/" class="doc-back">← Volver</router-link>
          <h1 class="doc-title">Política de Privacidad</h1>
          <p class="doc-meta">Última actualización: marzo 2026</p>
        </div>

        <div class="doc-body">

          <section>
            <h2>1. Quiénes somos</h2>
            <p>Quiniela Zone es una plataforma de quinielas deportivas para competiciones de América Central y Europa. Operamos en quinielazone.com.</p>
          </section>

          <section>
            <h2>2. Datos que recopilamos</h2>
            <p>Al registrarte y usar la plataforma recopilamos:</p>
            <ul>
              <li>Nombre de usuario y nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>País de residencia</li>
              <li>Predicciones y resultados dentro de la plataforma</li>
              <li>Información de pago procesada por Stripe (no almacenamos datos de tarjetas)</li>
            </ul>
          </section>

          <section>
            <h2>3. Cómo usamos tus datos</h2>
            <p>Utilizamos tu información para:</p>
            <ul>
              <li>Gestionar tu cuenta y autenticación</li>
              <li>Mostrar rankings y estadísticas dentro de las quinielas</li>
              <li>Enviarte correos de verificación y recuperación de contraseña</li>
              <li>Procesar pagos de la suscripción Premium</li>
              <li>Mejorar la plataforma</li>
            </ul>
          </section>

          <section>
            <h2>4. Compartición de datos</h2>
            <p>No vendemos ni compartimos tus datos personales con terceros, salvo con los siguientes proveedores de servicio necesarios para el funcionamiento de la plataforma:</p>
            <ul>
              <li><strong>Stripe</strong> — procesamiento de pagos</li>
              <li><strong>Resend</strong> — envío de correos transaccionales</li>
              <li><strong>Railway</strong> — infraestructura de servidor y base de datos</li>
            </ul>
          </section>

          <section>
            <h2>5. Seguridad</h2>
            <p>Protegemos tu información mediante contraseñas cifradas, tokens de acceso con expiración, comunicación cifrada vía HTTPS y cabeceras de seguridad HTTP.</p>
          </section>

          <section>
            <h2>6. Tus derechos</h2>
            <p>Podés en cualquier momento:</p>
            <ul>
              <li>Actualizar tu información desde tu perfil</li>
              <li>Cancelar tu suscripción Premium desde el portal de cliente</li>
              <li>Solicitar la eliminación de tu cuenta escribiéndonos a contacto@quinielazone.com</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>No utilizamos cookies de seguimiento ni publicidad. Solo almacenamos en tu navegador el token de sesión necesario para mantenerte autenticado.</p>
          </section>

          <section>
            <h2>8. Cambios a esta política</h2>
            <p>Podemos actualizar esta política ocasionalmente. Te notificaremos por correo en caso de cambios significativos.</p>
          </section>

          <section>
            <h2>9. Contacto</h2>
            <p>Para cualquier consulta sobre privacidad escríbenos a <strong>contacto@quinielazone.com</strong>.</p>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.privacidad-page {
  min-height: 100vh;
  padding: 4rem 0;
  background: var(--bg-base, #0d0f14);
}

.doc-wrap {
  max-width: 720px;
  margin: 0 auto;
}

.doc-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}

.doc-back {
  display: inline-block;
  font-size: 0.82rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.15s;
}
.doc-back:hover { color: var(--accent); }

.doc-title {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: 0.04em;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.doc-meta {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.doc-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

section h2 {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 0.85rem;
}

section p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.75;
}

section ul {
  margin-top: 0.6rem;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

section ul li {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

section strong {
  color: var(--text-primary);
  font-weight: 600;
}
</style>

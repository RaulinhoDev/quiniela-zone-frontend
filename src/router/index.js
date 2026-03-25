import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Configuración de NProgress
NProgress.configure({ showSpinner: false, speed: 400, trickleSpeed: 200 })

const routes = [
  // ── Públicas ──────────────────────────────────────────────────
  { path: '/',                component: () => import('@/views/LandingView.vue'),                    meta: { public: true } },
  { path: '/login',           component: () => import('@/views/auth/LoginView.vue'),                 meta: { public: true } },
  { path: '/registro',        component: () => import('@/views/auth/RegisterView.vue'),              meta: { public: true } },
  { path: '/verificar-email', component: () => import('@/views/auth/VerificarEmailView.vue'),        meta: { public: true } },
  { path: '/forgot-password', component: () => import('@/views/auth/ForgotPasswordView.vue'),       meta: { public: true } },
  { path: '/reset-password',  component: () => import('@/views/auth/ResetPasswordView.vue'),        meta: { public: true } },
  { path: '/q/:id',           component: () => import('@/views/quinielas/QuinielaPublicaView.vue'), meta: { public: true } },
  { path: '/privacidad',      component: () => import('@/views/PrivacidadView.vue'),                meta: { public: true } },

  // ── App usuario (requiere login) ──────────────────────────────
  {
    path: '/app',
    component: () => import('@/views/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',                                  redirect: '/app/dashboard' },
      { path: 'dashboard',                         component: () => import('@/views/DashboardView.vue') },
      { path: 'explorar',                          component: () => import('@/views/ExplorarView.vue') },
      { path: 'quinielas/:id',                     component: () => import('@/views/quinielas/QuinielaView.vue') },
      { path: 'quinielas/:id/historial',           component: () => import('@/views/quinielas/HistorialView.vue') },
      { path: 'quinielas/:id/predecir/:jornadaId', component: () => import('@/views/quinielas/PredecirView.vue') },
      { path: 'perfil',                            component: () => import('@/views/profile/PerfilView.vue') },
      { path: 'usuarios/:username',                component: () => import('@/views/profile/PerfilPublicoView.vue') },
      { path: 'premium',                           component: () => import('@/views/PremiumView.vue') },
      { path: 'premium/success',                   component: () => import('@/views/PremiumSuccessView.vue') },
      { path: 'premium/cancel',                    component: () => import('@/views/PremiumCancelView.vue') },
    ]
  },

  // ── Admin (requiere login + rol ADMIN) ────────────────────────
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '',           redirect: '/admin/dashboard' },
      { path: 'dashboard',  component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'sync',       component: () => import('@/views/admin/SyncView.vue') },
      { path: 'jornadas',   component: () => import('@/views/admin/JornadasView.vue') },
      { path: 'partidos',   component: () => import('@/views/admin/PartidosView.vue') },
      { path: 'resultados', component: () => import('@/views/admin/ResultadosView.vue') },
      { path: 'usuarios',   component: () => import('@/views/admin/UsuariosView.vue') },
    ]
  },

  { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// NProgress en navegación
router.beforeEach((to) => {
  NProgress.start()

  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !token) { NProgress.done(); return '/login' }
  if ((to.path === '/login' || to.path === '/registro') && token) { NProgress.done(); return '/app/dashboard' }
  if (to.meta.requiresAdmin && user?.role !== 'ADMIN') { NProgress.done(); return '/app/dashboard' }
})

router.afterEach(() => {
  NProgress.done()
})

export default router

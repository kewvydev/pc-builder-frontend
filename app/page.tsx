import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PC</span>
              </div>
              <span className="text-white text-2xl font-bold">Builder+</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">Características</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition">Cómo Funciona</a>
              <a href="#categories" className="text-gray-300 hover:text-white transition">Componentes</a>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full">
              <span className="text-purple-300 text-sm font-medium">🚀 Backend 100% Funcional - Listo para usar</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Construye tu PC
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Perfecta</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Sistema inteligente de ensamblaje de PCs con validación de compatibilidad en tiempo real. 
              Crea, valida y optimiza tu build con recomendaciones automáticas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/build" 
                className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
              >
                Crear Mi Build
              </Link>
              <Link 
                href="/components" 
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Explorar Componentes
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">27+</div>
                <div className="text-gray-400 text-sm">Endpoints API</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">7</div>
                <div className="text-gray-400 text-sm">Categorías</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-gray-400 text-sm">Validación</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">∞</div>
                <div className="text-gray-400 text-sm">Posibilidades</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative bg-slate-900/50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Características Principales</h2>
            <p className="text-gray-400 text-lg">Todo lo que necesitas para construir tu PC ideal</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-linear-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Validación Automática</h3>
              <p className="text-gray-400">
                Verifica la compatibilidad entre CPU, motherboard, RAM y más. Socket, tipo de RAM, consumo de energía, todo validado en tiempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-linear-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Recomendaciones Inteligentes</h3>
              <p className="text-gray-400">
                Sistema de recomendaciones basado en tu presupuesto, componentes seleccionados y balance de configuración.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-linear-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm p-8 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Búsqueda Avanzada</h3>
              <p className="text-gray-400">
                Filtra por marca, precio, especificaciones técnicas. Encuentra exactamente lo que necesitas entre miles de componentes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Categories */}
      <div id="categories" className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Categorías de Componentes</h2>
            <p className="text-gray-400 text-lg">Explora y selecciona componentes de todas las categorías</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-7xl mx-auto">
            {[
              { name: 'CPU', icon: '🔲', color: 'from-red-500 to-orange-500', link: '/cpu' },
              { name: 'GPU', icon: '🎮', color: 'from-green-500 to-emerald-500', link: '/components/gpu' },
              { name: 'Motherboard', icon: '📟', color: 'from-blue-500 to-cyan-500', link: '/motherboard' },
              { name: 'RAM', icon: '💾', color: 'from-purple-500 to-pink-500', link: '/components/ram' },
              { name: 'Storage', icon: '💿', color: 'from-yellow-500 to-orange-500', link: '/components/storage' },
              { name: 'PSU', icon: '⚡', color: 'from-indigo-500 to-purple-500', link: '/components/psu' },
              { name: 'Case', icon: '📦', color: 'from-pink-500 to-rose-500', link: '/components/case' },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.link}
                className="group bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105 text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-linear-to-br ${category.color} rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <div className="text-white font-semibold">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="relative bg-slate-900/50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cómo Funciona</h2>
            <p className="text-gray-400 text-lg">Construye tu PC en 4 simples pasos</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                { step: '01', title: 'Explora Componentes', desc: 'Navega por nuestra base de datos de componentes y filtra por tus necesidades' },
                { step: '02', title: 'Crea tu Build', desc: 'Selecciona componentes y añádelos a tu configuración personalizada' },
                { step: '03', title: 'Valida Compatibilidad', desc: 'El sistema verifica automáticamente la compatibilidad entre componentes' },
                { step: '04', title: 'Recibe Recomendaciones', desc: 'Obtén sugerencias inteligentes para optimizar tu build' },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="shrink-0 w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <div className="flex-1 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center bg-linear-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-12 rounded-3xl border border-purple-500/30">
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para construir tu PC ideal?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Comienza ahora y crea la configuración perfecta para tus necesidades
            </p>
            <Link 
              href="/build" 
              className="inline-block px-12 py-5 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              Empezar Ahora →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">PC</span>
              </div>
              <span className="text-white font-bold text-xl">Builder+</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 PCBuilder+. Sistema inteligente de ensamblaje de PCs.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
import Image from "next/image";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800">
			{/* Header */}
			<header className="container mx-auto px-6 py-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Logo">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Punto de Agua</h1>
					</div>
					<nav className="hidden md:flex space-x-8">
						<a href="#servicios" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Servicios</a>
						<a href="#comunidades" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Comunidades</a>
						<a href="#contacto" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contacto</a>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<main className="container mx-auto px-6 py-16">
				<div className="text-center max-w-4xl mx-auto">
					<h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
						Gestión Inteligente del
						<span className="text-blue-600 dark:text-blue-400"> Agua</span>
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
						Transformamos la gestión del agua en las comunidades del noroeste de España. 
						Tecnología avanzada para un recurso vital, garantizando eficiencia, 
						sostenibilidad y transparencia en cada gota.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors shadow-lg">
							Conoce Nuestros Servicios
						</button>
						<button type="button" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-4 px-8 rounded-lg transition-colors">
							Ver Demo
						</button>
					</div>
				</div>
			</main>

			{/* Features Section */}
			<section id="servicios" className="py-20 bg-white dark:bg-slate-800">
				<div className="container mx-auto px-6">
					<h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
						¿Por qué elegir Punto de Agua?
					</h3>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center p-6">
							<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Monitoreo">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Monitoreo en Tiempo Real</h4>
							<p className="text-gray-600 dark:text-gray-300">
								Seguimiento continuo del consumo, calidad y estado de la infraestructura hídrica
							</p>
						</div>
						<div className="text-center p-6">
							<div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Eficiencia">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Eficiencia Energética</h4>
							<p className="text-gray-600 dark:text-gray-300">
								Optimización del consumo energético y reducción de costes operativos
							</p>
						</div>
						<div className="text-center p-6">
							<div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Seguridad">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
							</div>
							<h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Seguridad y Cumplimiento</h4>
							<p className="text-gray-600 dark:text-gray-300">
								Cumplimiento normativo y protección de datos con máxima seguridad
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Communities Section */}
			<section id="comunidades" className="py-20 bg-gray-50 dark:bg-slate-900">
				<div className="container mx-auto px-6">
					<h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
						Comunidades del Noroeste
					</h3>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{['Galicia', 'Asturias', 'Cantabria', 'León'].map((region) => (
							<div key={region} className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
								<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Ubicación">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{region}</h4>
								<p className="text-gray-600 dark:text-gray-300 text-sm">
									Comunidades de agua gestionadas con tecnología avanzada
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-blue-600 dark:bg-blue-700">
				<div className="container mx-auto px-6 text-center">
					<h3 className="text-3xl font-bold text-white mb-6">
						¿Listo para transformar la gestión del agua?
					</h3>
					<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
						Únete a las comunidades que ya están aprovechando la tecnología 
						para una gestión más eficiente y sostenible del agua.
					</p>
					<button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors shadow-lg">
						Contacta con Nosotros
					</button>
				</div>
			</section>

			{/* Footer */}
			<footer id="contacto" className="bg-gray-900 text-white py-12">
				<div className="container mx-auto px-6">
					<div className="grid md:grid-cols-3 gap-8">
						<div>
							<h4 className="text-xl font-semibold mb-4">Punto de Agua</h4>
							<p className="text-gray-400">
								Transformando la gestión del agua en el noroeste de España con tecnología innovadora.
							</p>
						</div>
						<div>
							<h4 className="text-xl font-semibold mb-4">Contacto</h4>
							<p className="text-gray-400 mb-2">info@puntodeagua.es</p>
							<p className="text-gray-400">+34 900 000 000</p>
						</div>
						<div>
							<h4 className="text-xl font-semibold mb-4">Síguenos</h4>
							<div className="flex space-x-4">
								<a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
									</svg>
								</a>
								<a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
									</svg>
								</a>
								<a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
									</svg>
								</a>
							</div>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
						<p>&copy; 2024 Punto de Agua. Todos los derechos reservados.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

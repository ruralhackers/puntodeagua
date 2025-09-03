export default function MasPage() {
	const menuItems = [
		{
			title: "Tareas",
			description: "Gestionar tareas y recordatorios",
			href: "/dashboard/tareas",
			icon: "📋",
		},
		{
			title: "Incidencias",
			description: "Ver y reportar incidencias",
			href: "/dashboard/incidencias",
			icon: "⚠️",
		},
		{
			title: "Usuarios",
			description: "Gestión de usuarios del sistema",
			href: "/dashboard/usuarios",
			icon: "👥",
		},
		{
			title: "Puntos de Agua",
			description: "Administrar puntos de agua",
			href: "/dashboard/puntos-agua",
			icon: "💧",
		},
		{
			title: "Configuración",
			description: "Ajustes del sistema",
			href: "/dashboard/configuracion",
			icon: "⚙️",
		},
		{
			title: "Ayuda",
			description: "Soporte y documentación",
			href: "/dashboard/ayuda",
			icon: "❓",
		},
	];

	return (
		<div className="p-4 pb-20">
			<h1 className="text-xl font-bold mb-6">Más opciones</h1>

			<div className="space-y-3">
				{menuItems.map((item, index) => (
					<a
						key={index}
						href={item.href}
						className="block p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<div className="flex items-center space-x-3">
							<span className="text-2xl">{item.icon}</span>
							<div className="flex-1">
								<h3 className="font-medium text-gray-900">{item.title}</h3>
								<p className="text-sm text-gray-500">{item.description}</p>
							</div>
							<span className="text-gray-400">›</span>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

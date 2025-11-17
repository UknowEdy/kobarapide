export default function MaintenanceMode() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Logo ou Titre */}
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-white mb-4">🔧</h1>
                    <h2 className="text-4xl font-bold text-white mb-2">
                        Kobarapide
                    </h2>
                    <p className="text-xl text-gray-400">
                        En maintenance
                    </p>
                </div>

                {/* Message principal */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 mb-8 border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-4">
                        Maintenance en cours
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                        Notre plateforme est actuellement en maintenance pour améliorer votre expérience.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        Nous serons de retour très bientôt. Merci pour votre patience.
                    </p>
                </div>

                {/* Informations de contact */}
                <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-lg p-6 border border-gray-800">
                    <p className="text-gray-400 text-sm mb-3">
                        Pour toute urgence, contactez-nous :
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="mailto:contactkobarapide@gmail.com"
                            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                        >
                            <span>📧</span>
                            <span>contactkobarapide@gmail.com</span>
                        </a>
                    </div>
                </div>

                {/* Animation de chargement */}
                <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-gray-500 text-sm">
                    <p>© 2025 Kobarapide - Plateforme d'entraide sociale</p>
                </div>
            </div>
        </div>
    );
}

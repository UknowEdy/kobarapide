// ================================
// API UTILITY - Appels au Backend
// ================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://kobarapide.onrender.com';

/**
 * Fonction réutilisable pour tous les appels API
 * @param endpoint - Ex: '/api/users', '/api/loans'
 * @param options - Méthode, body, headers additionnels
 * @returns Promise avec les données ou l'erreur
 */
export const fetchAPI = async (
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  } = {}
) => {
  try {
    // Récupérer le token JWT du localStorage
    const token = localStorage.getItem('token');

    // Configuration par défaut
    const method = options.method || 'GET';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Ajouter le token si disponible
    if (token) {
      headers['x-auth-token'] = token;
    }

    // Configuration de la requête
    const config: RequestInit = {
      method,
      headers,
    };

    // Ajouter le body si présent
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    // Faire l'appel
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Vérifier le statut
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || `Erreur ${response.status}`,
        data: errorData,
      };
    }

    // Retourner les données
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Erreur API:', error);
    return {
      success: false,
      error: error.message || 'Erreur de connexion au backend',
      details: error,
    };
  }
};

/**
 * Alias spécifique pour les appels GET
 */
export const fetchGET = (endpoint: string) =>
  fetchAPI(endpoint, { method: 'GET' });

/**
 * Alias spécifique pour les appels POST
 */
export const fetchPOST = (endpoint: string, body: any) =>
  fetchAPI(endpoint, { method: 'POST', body });

/**
 * Alias spécifique pour les appels PUT
 */
export const fetchPUT = (endpoint: string, body: any) =>
  fetchAPI(endpoint, { method: 'PUT', body });

/**
 * Alias spécifique pour les appels DELETE
 */
export const fetchDELETE = (endpoint: string) =>
  fetchAPI(endpoint, { method: 'DELETE' });

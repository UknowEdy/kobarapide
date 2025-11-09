require('dotenv').config({ path: '.env.local' });
const http = require('http');

const API_URL = 'http://localhost:3001';
let adminToken = '';
let clientToken = '';

// Utilitaire pour faire des requêtes HTTP
const makeRequest = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['x-auth-token'] = token;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const test = async () => {
    try {
        console.log('\n🧪 DÉBUT DES TESTS DU BACKEND\n');

        // TEST 1: LOGIN ADMIN
        console.log('📝 TEST 1: Login ADMIN');
        let res = await makeRequest('POST', '/api/auth/login', {
            email: 'edemkukuz@gmail.com',
            password: 'yaqGX8tf5ytsTAUaK74hkAzs+37XQ/uTxLSvKvqcRNU='
        });
        if (res.status === 200 && res.data.token) {
            adminToken = res.data.token;
            console.log('  ✅ Login admin succès');
            console.log(`  👑 Role: ${res.data.user.role}`);
        } else {
            console.log('  ❌ Login admin échoué');
            return;
        }

        // TEST 2: LOGIN CLIENT
        console.log('\n📝 TEST 2: Login CLIENT');
        res = await makeRequest('POST', '/api/auth/login', {
            email: 'client1@example.com',
            password: 'password123'
        });
        if (res.status === 200 && res.data.token) {
            clientToken = res.data.token;
            console.log('  ✅ Login client succès');
            console.log(`  👤 Role: ${res.data.user.role}`);
        } else {
            console.log('  ❌ Login client échoué');
        }

        // TEST 3: GET TOUS LES USERS (ADMIN only)
        console.log('\n📝 TEST 3: GET /api/users (admin only)');
        res = await makeRequest('GET', '/api/users', null, adminToken);
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`  ✅ Récupéré ${res.data.length} users`);
        } else {
            console.log(`  ❌ Erreur: ${res.status}`);
        }

        // TEST 4: CLIENT essaie GET /api/users (should fail)
        console.log('\n📝 TEST 4: CLIENT essaie GET /api/users (should fail)');
        res = await makeRequest('GET', '/api/users', null, clientToken);
        if (res.status === 403) {
            console.log(`  ✅ Accès refusé correctement (403)`);
        } else {
            console.log(`  ❌ Devrait être 403, reçu: ${res.status}`);
        }

        // TEST 5: CRÉATION DE PRÊT (client)
        console.log('\n📝 TEST 5: Création de prêt (CLIENT)');
        res = await makeRequest('POST', '/api/loans', {
            requestedAmount: 5000,
            loanPurpose: 'Test prêt'
        }, clientToken);
        if (res.status === 200) {
            console.log('  ✅ Prêt créé avec succès');
            console.log(`  💰 Montant: ${res.data.requestedAmount}F`);
            console.log(`  📊 Statut: ${res.data.status}`);
        } else {
            console.log(`  ❌ Erreur: ${res.status}`);
        }

        // TEST 6: GET WAITING LIST
        console.log('\n📝 TEST 6: GET /api/waiting-list');
        res = await makeRequest('GET', '/api/waiting-list', null, adminToken);
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`  ✅ Récupéré ${res.data.length} items en attente`);
        } else {
            console.log(`  ❌ Erreur: ${res.status}`);
        }

        // TEST 7: GET DUPLICATES
        console.log('\n📝 TEST 7: GET /api/duplicates');
        res = await makeRequest('GET', '/api/duplicates', null, adminToken);
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`  ✅ Récupéré ${res.data.length} doublons potentiels`);
        } else {
            console.log(`  ❌ Erreur: ${res.status}`);
        }

        // TEST 8: DÉTECTION DE DOUBLON (register avec données similaires)
        console.log('\n📝 TEST 8: Détection de doublon (REGISTER)');
        res = await makeRequest('POST', '/api/auth/register', {
            email: 'testdoublon@example.com',
            password: 'password123',
            nom: 'Petit',
            prenom: 'Luc',
            telephone: '0683960869',
            pieceIdentite: 'ID515490',
            dateDeNaissance: '1990-01-01'
        });
        if (res.status === 400 && res.data.msg.includes('vérification')) {
            console.log('  ✅ Doublon détecté correctement');
            console.log(`  📌 Raison: ${res.data.msg}`);
        } else {
            console.log(`  ❌ Doublon non détecté (status: ${res.status})`);
        }

        // TEST 9: MODIFICATION STATUS USER (admin)
        console.log('\n📝 TEST 9: Modification status USER');
        // D'abord récupérer l'ID d'un user
        res = await makeRequest('GET', '/api/users', null, adminToken);
        if (res.data.length > 0) {
            const userId = res.data[0]._id;
            res = await makeRequest('PUT', `/api/users/${userId}/status`, {
                status: 'ACTIF'
            }, adminToken);
            if (res.status === 200) {
                console.log(`  ✅ Status mis à jour à: ${res.data.status}`);
            } else {
                console.log(`  ❌ Erreur: ${res.status}`);
            }
        }

        // TEST 10: INVALID TOKEN
        console.log('\n📝 TEST 10: Requête avec token invalide');
        res = await makeRequest('GET', '/api/users', null, 'INVALID_TOKEN_HERE');
        if (res.status === 401) {
            console.log('  ✅ Token invalide rejeté (401)');
        } else {
            console.log(`  ❌ Devrait être 401, reçu: ${res.status}`);
        }

        // TEST 11: NO TOKEN
        console.log('\n📝 TEST 11: Requête sans token');
        res = await makeRequest('GET', '/api/users', null);
        if (res.status === 401) {
            console.log('  ✅ Pas de token rejeté (401)');
        } else {
            console.log(`  ❌ Devrait être 401, reçu: ${res.status}`);
        }

        // TEST 12: HEALTH CHECK
        console.log('\n📝 TEST 12: Health check (route /)');
        res = await makeRequest('GET', '/');
        if (res.status === 200) {
            console.log('  ✅ API en bonne santé');
        } else {
            console.log(`  ❌ Erreur: ${res.status}`);
        }

        console.log('\n✅ TOUS LES TESTS TERMINÉS !\n');
        process.exit(0);

    } catch (err) {
        console.error('❌ Erreur lors des tests:', err.message);
        process.exit(1);
    }
};

test();

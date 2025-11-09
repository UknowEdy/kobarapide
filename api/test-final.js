require('dotenv').config({ path: '.env.local' });
const http = require('http');

const API_URL = 'http://localhost:3001';
let adminToken = '';
const EXEC_ID = Date.now();

const getRandomClient = (allUsers) => allUsers[Math.floor(Math.random() * allUsers.length)];
const generateUniquePhone = (i) => `06${String(EXEC_ID % 10000).padStart(4, '0')}${String(i).padStart(4, '0')}`;
const generateUniqueId = (i) => `UID_${EXEC_ID}_${i}`;

const makeRequest = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['x-auth-token'] = token;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
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
        console.log('\n🧪 TEST EXHAUSTIF 500 DOUBLONS - VERSION ROBUSTE\n');
        console.log(`📌 Execution ID: ${EXEC_ID}\n`);

        let res = await makeRequest('POST', '/api/auth/login', {
            email: 'edemkukuz@gmail.com',
            password: 'yaqGX8tf5ytsTAUaK74hkAzs+37XQ/uTxLSvKvqcRNU='
        });
        adminToken = res.data.token;
        console.log('✅ Admin connecté\n');

        res = await makeRequest('GET', '/api/users', null, adminToken);
        const allUsers = res.data.filter(u => u.role === 'CLIENT');
        console.log(`✅ ${allUsers.length} clients chargés\n`);

        let stats = { passed: 0, failed: 0, duplicatesDetected: 0, failures: [] };

        console.log('🎯 Lancement de 500 tests...\n');

        for (let i = 0; i < 500; i++) {
            const testType = i % 5;
            let testData = {};
            let expectedStatus = 400;
            let typeName = '';

            switch (testType) {
                case 0:
                    const c1 = getRandomClient(allUsers);
                    const c2 = getRandomClient(allUsers);
                    testData = {
                        email: `dup_${EXEC_ID}_${i}@test.com`,
                        password: 'pass123',
                        nom: c2.nom,
                        prenom: `P${i}`,
                        telephone: c1.telephone,
                        pieceIdentite: generateUniqueId(i),
                        dateDeNaissance: '1995-05-15'
                    };
                    typeName = 'TEL+NOM';
                    break;

                case 1:
                    const c3 = getRandomClient(allUsers);
                    const c4 = getRandomClient(allUsers);
                    testData = {
                        email: `dup_${EXEC_ID}_${i}@test.com`,
                        password: 'pass123',
                        nom: `N${i}`,
                        prenom: c4.prenom,
                        telephone: generateUniquePhone(i),
                        pieceIdentite: c3.pieceIdentite,
                        dateDeNaissance: '1996-05-15'
                    };
                    typeName = 'PIECE+PRENOM';
                    break;

                case 2:
                    const c5 = getRandomClient(allUsers);
                    testData = {
                        email: `dup_${EXEC_ID}_${i}@test.com`,
                        password: 'pass123',
                        nom: c5.nom,
                        prenom: c5.prenom,
                        telephone: generateUniquePhone(i),
                        pieceIdentite: generateUniqueId(i),
                        dateDeNaissance: c5.dateDeNaissance
                    };
                    typeName = 'IDENTITÉ';
                    break;

                case 3:
                    const c6 = getRandomClient(allUsers);
                    const c7 = getRandomClient(allUsers);
                    testData = {
                        email: `dup_${EXEC_ID}_${i}@test.com`,
                        password: 'pass123',
                        nom: `MixN${i}`,
                        prenom: `MixP${i}`,
                        telephone: c6.telephone,
                        pieceIdentite: c7.pieceIdentite,
                        dateDeNaissance: '1997-05-15'
                    };
                    typeName = 'TEL+PIECE';
                    break;

                case 4:
                    testData = {
                        email: `clean_${EXEC_ID}_${i}@test.com`,
                        password: 'pass123',
                        nom: `CleanN${i}`,
                        prenom: `CleanP${i}`,
                        telephone: generateUniquePhone(i),
                        pieceIdentite: generateUniqueId(i),
                        dateDeNaissance: '1998-05-15'
                    };
                    typeName = 'CLEAN';
                    expectedStatus = 201;
                    break;
            }

            res = await makeRequest('POST', '/api/auth/register', testData);

            if (res.status === expectedStatus) {
                stats.passed++;
                if (expectedStatus === 400) stats.duplicatesDetected++;
            } else {
                stats.failed++;
                stats.failures.push({
                    test: i + 1,
                    type: typeName,
                    expected: expectedStatus,
                    received: res.status,
                    msg: res.data.msg
                });
            }

            if ((i + 1) % 50 === 0) {
                console.log(`  ⏳ ${i + 1}/500 tests...`);
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 RÉSULTATS FINAUX:\n`);
        console.log(`   ✅ Tests passés: ${stats.passed}/500 (${((stats.passed/500)*100).toFixed(2)}%)`);
        console.log(`   ❌ Tests échoués: ${stats.failed}/500 (${((stats.failed/500)*100).toFixed(2)}%)`);
        console.log(`   🎯 Doublons détectés: ${stats.duplicatesDetected}/400`);

        if (stats.failed > 0) {
            console.log(`\n❌ FAILURES:`);
            stats.failures.forEach((f, idx) => {
                console.log(`   ${idx + 1}. Test #${f.test} [${f.type}]: Attendu ${f.expected}, reçu ${f.received}`);
                console.log(`      → ${f.msg}`);
            });
        }

        console.log('\n' + '='.repeat(80));
        
        if (stats.failed === 0) {
            console.log('\n🎉 SUCCÈS 100% ! LE BACKEND EST PRODUCTION-READY !\n');
        }

        process.exit(0);

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
};

test();

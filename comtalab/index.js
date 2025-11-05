// index.js (Version PostgreSQL pour Render/Neon)
// index.js (ZONE DE DÉFINITIONS GLOBALES - À INSÉRER)

const PRIX_WILAYAS = {
  'adrar': { names: ['adrar', 'أدرار'], prices: { 'a domicile': 1400, 'bureau': 970, 'autre': 970 } },
  'chlef': { names: ['chlef', 'الشلف'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'laghouat': { names: ['laghouat', 'الأغواط'], prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 } },
  'oumelbouaghi': { names: ['oumelbouaghi', 'أم البواقي'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'batna': { names: ['batna', 'باتنة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'bejaia': { names: ['bejaia', 'بجاية'], prices: { 'a domicile': 750, 'bureau': 520, 'autre': 520 } },
  'biskra': { names: ['biskra', 'بسكرة'], prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 } },
  'bechar': { names: ['bechar', 'بشار'], prices: { 'a domicile': 1100, 'bureau': 720, 'autre': 720 } },
  'blida': { names: ['blida', 'البليدة'], prices: { 'a domicile': 750, 'bureau': 470, 'autre': 470 } },
  'bouira': { names: ['bouira', 'البويرة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'tamanrasset': { names: ['tamanrasset', 'تمنراست'], prices: { 'a domicile': 1500, 'bureau': 1120, 'autre': 1120 } },
  'tebessa': { names: ['tebessa', 'تبسة'], prices: { 'a domicile': 900, 'bureau': 520, 'autre': 520 } },
  'tlemcen': { names: ['tlemcen', 'تلمسان'], prices: { 'a domicile': 850, 'bureau': 570, 'autre': 570 } },
  'tiaret': { names: ['tiaret', 'تيارت'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'tiziouzou': { names: ['tiziouzou', 'tizi ouzou', 'تيزي وزو'], prices: { 'a domicile': 500, 'bureau': 370, 'autre': 370 } },
  'alger': { names: ['alger', 'الجزائر'], prices: { 'a domicile': 700, 'bureau': 470, 'autre': 470 } },
  'djelfa': { names: ['djelfa', 'الجلفة'], prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 } },
  'jijel': { names: ['jijel', 'جيجل'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'setif': { names: ['setif', 'سطيف'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'saida': { names: ['saida', 'سعيدة'], prices: { 'a domicile': 850, 'bureau': 570, 'autre': 570 } },
  'skikda': { names: ['skikda', 'سكيكدة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'sidibelabbes': { names: ['sidibelabbes', 'sidi bel abbes', 'سيدي بلعباس'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'annaba': { names: ['annaba', 'عنابة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'guelma': { names: ['guelma', 'قالمة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'constantine': { names: ['constantine', 'قسنطينة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'medea': { names: ['medea', 'المدية'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'mostaganem': { names: ['mostaganem', 'مستغانم'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'msila': { names: ['msila', 'المسيلة'], prices: { 'a domicile': 850, 'bureau': 570, 'autre': 570 } },
  'mascara': { names: ['mascara', 'معسكر'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'ouargla': { names: ['ouargla', 'ورقلة'], prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 } },
  'oran': { names: ['oran', 'وهران'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'elbayadh': { names: ['elbayadh', 'البيض'], prices: { 'a domicile': 1050, 'bureau': 670, 'autre': 670 } },
  'illizi': { names: ['illizi', 'إليزي'], prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 } },
  'bordjbouarreridj': { names: ['bordjbouarreridj', 'bordj bou arreridj', 'برج بوعريريج'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'boumerdes': { names: ['boumerdes', 'بومرداس'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'eltarf': { names: ['eltarf', 'الطارف'], prices: { 'a domicile': 850, 'bureau': 520, 'autre': 520 } },
  'tindouf': { names: ['tindouf', 'تندوف'], prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 } },
  'tissemsilt': { names: ['tissemsilt', 'تيسمسيلت'], prices: { 'a domicile': 900, 'bureau': 520, 'autre': 520 } },
  'eloued': { names: ['eloued', 'el oued', 'الوادي'], prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 } },
  'khenchela': { names: ['khenchela', 'خنشلة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'soukahras': { names: ['soukahras', 'souk ahras', 'سوق أهراس'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'tipaza': { names: ['tipaza', 'تيبازة'], prices: { 'a domicile': 850, 'bureau': 520, 'autre': 520 } },
  'mila': { names: ['mila', 'ميلة'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'aindefla': { names: ['aindefla', 'ain defla', 'عين الدفلى'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'naama': { names: ['naama', 'النعامة'], prices: { 'a domicile': 1100, 'bureau': 670, 'autre': 670 } },
  'aintemouchent': { names: ['aintemouchent', 'ain temouchent', 'عين تموشنت'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'ghardaia': { names: ['ghardaia', 'غرداية'], prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 } },
  'relizane': { names: ['relizane', 'غليزان'], prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 } },
  'timimoun': { names: ['timimoun', 'تيميمون'], prices: { 'a domicile': 1400, 'bureau': 0, 'autre': 0 } },
  'bordjbadjimokhtar': { names: ['bordjbadjimokhtar', 'برج باجي مختار'], prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 } },
  'ouleddjellal': { names: ['ouleddjellal', 'أولاد جلال'], prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 } },
  'beniabbes': { names: ['beniabbes', 'بني عباس'], prices: { 'a domicile': 1000, 'bureau': 970, 'autre': 970 } },
  'insalah': { names: ['insalah', 'عين صالح'], prices: { 'a domicile': 1500, 'bureau': 0, 'autre': 0 } },
  'inguezzam': { names: ['inguezzam', 'عين قزام'], prices: { 'a domicile': 1500, 'bureau': 0, 'autre': 0 } },
  'touggourt': { names: ['touggourt', 'تقرت'], prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 } },
  'djanet': { names: ['djanet', 'جانت'], prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 } },
  'mghair': { names: ['mghair', 'المغير'], prices: { 'a domicile': 950, 'bureau': 0, 'autre': 0 } },
  'meniaa': { names: ['meniaa', 'المنيعة'], prices: { 'a domicile': 1000, 'bureau': 0, 'autre': 0 } },
  'defaut': { names: [], prices: { 'a domicile': 650, 'bureau': 600, 'autre': 600 } }
};

const BUNDLES = {
  'ensemble_premium': { names: ['ensemble premium', 'pack premium'], cost: 1650 + 1200 },
  'ensemble_standard': { names: ['ensemble', 'pack standard', 'ensemble standard'], cost: 1260 + 1200 }
};

const articleDetails = {
  'tshirt': { display: 'T-shirt', aliases: ['t shirt', 't-shirt'], styles: ['oversize', 'oversize premium', 'regular', 'enfant'], prix: { 'oversize': 950, 'oversize premium': 1150, 'regular': 790, 'enfant': 620 } },
  'hoodie': { display: 'Hoodie', aliases: ['sweat'], styles: ['premium', 'enfant', 'standard', 'oversize'], prix: { 'premium': 1650, 'enfant': 1300, 'standard': 1260,'oversize': 1600 } },
  'jogging': { display: 'Jogging', aliases: [], styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } },
  'sac a dos': { display: 'Sac à dos', aliases: ['sacados', 'sac à dos'], styles: ['standard', 'premium'], prix: { 'standard': 1150, 'premium': 1220 } },
  'autre': { display: 'Autre', aliases: [], styles: [], prix: {} }
};


// --- FONCTIONS UTILITAIRES DE CALCUL ---
/**
 * Normalise l'état d'une commande pour les comparaisons en base de données.
 */
function normalizeStatus(status) {
    if (!status) return '';
    return status.toLowerCase()
                 .replace(/[\s\t\-]/g, '') // Supprime les espaces et tirets
                 .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
}

/**
 * Calcule le coût total des articles (coût de revient) d'une commande.
 */
function parseArticleCost(articlesJsonText) {
    let totalCost = 0;
    let articles;
    
    try {
        articles = JSON.parse(articlesJsonText);
        if (!Array.isArray(articles)) {
            return 0; 
        }
    } catch (e) {
        return 0; 
    }

    for (const item of articles) {
        const itemNom = (item.nom || '').toLowerCase().trim();
        const itemStyle = (item.style || '').toLowerCase().trim();
        const quantite = parseInt(item.quantite, 10) || 0;

        if (quantite <= 0) continue; 

        let itemCost = 0;

        // 1. Vérification des Bundles
        const bundleKey = Object.keys(BUNDLES).find(key => {
            return BUNDLES[key].names.some(name => itemNom.includes(name));
        });

        if (bundleKey) {
            itemCost = BUNDLES[bundleKey].cost;
        } 
        // 2. Vérification des Articles Individuels
        else {
            const articleKey = Object.keys(articleDetails).find(key => {
                const details = articleDetails[key];
                return key === itemNom || details.aliases.some(alias => itemNom.includes(alias));
            });

            if (articleKey && articleKey !== 'autre') {
                const details = articleDetails[articleKey];
                
                if (details.prix && details.prix[itemStyle] !== undefined) {
                    itemCost = details.prix[itemStyle];
                }
            } 
        }
        totalCost += itemCost * quantite;
    }
    return totalCost;
}

// --- Fin des fonctions utilitaires de calcul ---


// --- Début du code des APIs ---
// 1. IMPORTS
require('dotenv').config(); // CHARGE LES VARIABLES D'ENVIRONNEMENT
const express = require('express');
const { Client } = require('pg'); // NOUVEAU: Driver PostgreSQL
const cors = require('cors'); // <-- IMPORTÉ UNE SEULE FOIS ICI
const { google } = require('googleapis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 2. CRÉER LE SERVEUR WEB
const app = express();
// La variable port sera déclarée dans l'écoute (app.listen) pour éviter les problèmes de portée

// --- Configuration ---
const KEY_FILE_PATH = './google-credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// SECRET pour les tokens JWT (Utilisation de la variable d'environnement)
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const saltRounds = 10; 


// Lettre de la colonne "etat de livraison" (c'est la 9ème, donc 'I')
const STATUS_COLUMN_LETTER = 'I';

// -----------------------------------------------------------------------
// CORRECTION CRITIQUE CORS : Autorise le frontend local
// -----------------------------------------------------------------------
const allowedOrigins = [
    'http://localhost:3000',  
    'http://localhost:5173',  
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); 
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); 
        } else {
            console.warn(`CORS Error: Origin ${origin} not allowed.`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};


// --- Initialisation Google Sheets API Client (Corrigé pour lire les variables d'env) ---
let sheets;

async function initializeSheetsClient() {
    console.log('Tentative d\'initialisation du client Google Sheets...');
    try {
        // VÉRIFICATION CRITIQUE : Lire le JSON directement depuis la variable d'environnement
        const credentialsJSON = process.env.GOOGLE_CREDENTIALS; 
        
        if (!credentialsJSON) {
            console.error('*** ERREUR CRITIQUE: GOOGLE_CREDENTIALS non défini dans les variables d\'environnement.');
            sheets = null;
            return;
        }
        
        // Convertir la chaîne JSON en objet
        const credentials = JSON.parse(credentialsJSON);

        const auth = new google.auth.GoogleAuth({
            credentials: credentials, // Utilisation de l'objet credentials directement
            scopes: SCOPES,
        });
        const authClient = await auth.getClient();
        sheets = google.sheets({ version: 'v4', auth: authClient });
        console.log('Client Google Sheets initialisé avec succès.');
    } catch (err) {
        console.error('*** ERREUR CRITIQUE: Initialisation du client Google Sheets échouée:');
        console.error(err);
        sheets = null;
    }
}
// --- FIN Google Sheets ---

// 3. Middlewares
app.use(express.json());
// ATTENTION: Remplace la configuration CORS initiale par la configuration corrigée ci-dessus
app.use(cors(corsOptions)); 


// 4. Connexion à la base de données PostgreSQL (Neon)
let db;

try {
    if (!process.env.DB_CONNECTION_STRING) {
        throw new Error("DB_CONNECTION_STRING non défini. Impossible de se connecter à PostgreSQL.");
    }
    
    db = new Client({
        connectionString: process.env.DB_CONNECTION_STRING, // Lit depuis le .env
        ssl: { rejectUnauthorized: false } // Nécessaire pour Render/Neon
    });

    db.connect(async (err) => {
        if (err) {
            console.error('*** ERREUR CRITIQUE: Échec de la connexion à PostgreSQL:', err.stack);
        } else {
            console.log('Connecté à la base de données PostgreSQL (Neon).');

            // --- CRÉATION / VÉRIFICATION DES TABLES EN POSTGRESQL ---
            console.log('Début de la vérification des créations de table (PostgreSQL)...');
            
            const createTable = async (sql, tableName) => {
                // Nettoyage de la chaîne pour éviter les erreurs de syntaxe dues aux espaces/retours à la ligne
                const cleanSql = sql.replace(/\s+/g, ' ').trim(); 
                await db.query(cleanSql);
                console.log(`Table '${tableName}' prête.`);
            };

            try {
                // 1. Transactions
                await createTable(`
                    CREATE TABLE IF NOT EXISTS transactions (
                        id SERIAL PRIMARY KEY,
                        date TEXT NOT NULL,
                        description TEXT,
                        montant REAL NOT NULL,
                        type TEXT NOT NULL,
                        categorie TEXT NOT NULL,
                        user_id INTEGER NOT NULL
                    );
                `, 'transactions');

                // 2. Stock Items
                await createTable(`
                    CREATE TABLE IF NOT EXISTS stock_items (
                        id SERIAL PRIMARY KEY,
                        nom TEXT NOT NULL,
                        article_type TEXT,
                        taille TEXT,
                        couleur TEXT,
                        style TEXT,
                        quantite INTEGER NOT NULL DEFAULT 0,
                        prix REAL,
                        user_id INTEGER NOT NULL
                    );
                `, 'stock_items');
                
                // 3. Stock Retours
                await createTable(`
                    CREATE TABLE IF NOT EXISTS stock_retours (
                        id SERIAL PRIMARY KEY,
                        nom TEXT NOT NULL,
                        taille TEXT,
                        couleur TEXT,
                        style TEXT,
                        description TEXT, 
                        user_id INTEGER NOT NULL,
                        date_ajout TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `, 'stock_retours');
                
                // 4. Commandes
                await createTable(`
                    CREATE TABLE IF NOT EXISTS commandes (
                        id SERIAL PRIMARY KEY,
                        telephone TEXT,
                        nom_prenom TEXT,
                        adresse TEXT,
                        type_livraison TEXT,
                        articles TEXT,
                        prix_total REAL NOT NULL DEFAULT 0,
                        date_commande TEXT NOT NULL,
                        date_livraison TEXT,
                        etat TEXT NOT NULL DEFAULT 'en preparation',
                        commentaire TEXT,
                        user_id INTEGER NOT NULL
                    );
                `, 'commandes');
                
                // 5. Utilisateurs
                await createTable(`
                    CREATE TABLE IF NOT EXISTS utilisateurs (
                        id SERIAL PRIMARY KEY,
                        username TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        google_sheet_url TEXT NULL
                    );
                `, 'utilisateurs');
                
                // --- Logique d'insertion de l'admin par défaut (PostgreSQL) ---
                const { rows: userCount } = await db.query(`SELECT COUNT(id) AS count FROM utilisateurs`);
                if (parseInt(userCount[0].count) === 0) {
                     const defaultPassword = 'password'; 
                     
                     bcrypt.hash(defaultPassword, saltRounds, async (errHash, hash) => {
                        if (errHash) {
                            return console.error("Erreur lors du hashage de l'admin:", errHash.message);
                        }
                        
                        try {
                            await db.query(
                                `INSERT INTO utilisateurs (username, password) VALUES ($1, $2)`, 
                                ['admin', hash]
                            );
                            console.log("Utilisateur 'admin' créé avec succès. Mot de passe par défaut: 'password'.");
                        } catch (insertErr) {
                            console.error("Erreur d'insertion de l'admin:", insertErr.message);
                        }
                     });
                     
                } else {
                    console.log("Utilisateurs déjà présents.");
                }
                
            } catch (queryErr) {
                console.error("Erreur critique lors de la création des tables:", queryErr.message);
            }
        }
    }); // Fin db.connect
} catch (dbError) {
    console.error('*** ERREUR CRITIQUE: Configuration PostgreSQL échouée:', dbError.message);
    process.exit(1);
}
// --- FIN Connexion DB ---

// --- API AUTHENTIFICATION (Login et Register) ---

// POST /api/register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`--- POST /api/register pour ${username} ---`);

    if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    try {
        // 1. Vérifier si l'utilisateur existe déjà
        const { rowCount: existingCount } = await db.query('SELECT id FROM utilisateurs WHERE username = $1', [username]);
        if (existingCount > 0) {
            return res.status(409).json({ message: 'Ce nom d\'utilisateur existe déjà.' });
        }

        // 2. Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Insérer le nouvel utilisateur (google_sheet_url est optionnel/null)
        const sql = `INSERT INTO utilisateurs (username, password, google_sheet_url) VALUES ($1, $2, NULL) RETURNING id, username`;
        const { rows } = await db.query(sql, [username, hashedPassword]);

        const newUser = rows[0];
        console.log(`Utilisateur créé (ID: ${newUser.id}, Username: ${newUser.username})`);

        // Pas besoin de générer un token ici, le front va basculer en mode login.
        res.status(201).json({ message: 'Compte créé avec succès. Veuillez vous connecter.' });

    } catch (err) {
        console.error("Erreur DB POST /api/register:", err.message);
        res.status(500).json({ message: 'Erreur serveur lors de la création du compte.' });
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`--- POST /api/login pour ${username} ---`);

    if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    try {
        // 1. Rechercher l'utilisateur (PostgreSQL)
        const { rows } = await db.query('SELECT * FROM utilisateurs WHERE username = $1', [username]);
        const user = rows[0];

        if (!user) {
            console.warn(`Tentative de connexion échouée: utilisateur ${username} non trouvé.`);
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        // 2. Comparer le mot de passe hashé
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.warn(`Tentative de connexion échouée: mot de passe incorrect pour ${username}.`);
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        // 3. Générer le Token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            TOKEN_SECRET, 
            { expiresIn: '24h' }
        );

        console.log(`Connexion réussie pour ${username}.`);
        // Retourne le token ET les infos utilisateur (sans le hash du mot de passe)
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                google_sheet_url: user.google_sheet_url 
            } 
        });

    } catch (err) {
        console.error("Erreur DB POST /api/login:", err.message);
        res.status(500).json({ message: 'Erreur serveur interne lors de la connexion.' });
    }
});
// --- FIN API AUTHENTIFICATION ---
// --- Middleware d'authentification ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        console.warn("Auth: Token manquant.");
        return res.sendStatus(401); // Unauthorized
    }

   jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) {
        console.warn("Auth: Token invalide.", err.message);
        // MODIFICATION CRITIQUE : Envoyer un JSON pour que le front puisse le lire
        // Le front renvoie 403 Forbidden
        return res.status(403).json({ message: "Forbidden: Token invalide ou expiré." }); 
    }

    req.user = user; 
    console.log(`Auth: Requête OK pour user ID ${user.id}`);
    next(); 
});
}

// --- API Transactions (CONVERTI en PG) ---

app.get('/', (req, res) => { res.send('API Comptalab (PostgreSQL) fonctionne !'); });

app.get('/api/transactions', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    // ...
    try {
        const { rows } = await db.query(`SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC`, [userId]);
        
        console.log(`GET /api/transactions: ${rows ? rows.length : 0} transactions trouvées.`);
        res.json(rows || []); // ⬅️ Doit renvoyer les données
    } catch (err) {
        console.error("Erreur DB GET /api/transactions:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    console.log(`--- POST /api/transactions (User ${userId}) ---`, req.body);
    
    // Fonction utilitaire pour s'assurer que les chaînes vides sont converties en NULL (pour les champs optionnels)
    const cleanValue = (val) => {
        // Retourne null si la valeur est '', undefined, ou null
        if (val === '' || val === undefined || val === null) {
            return null;
        }
        // Pour les autres types (nombres, dates non vides), on les retourne.
        return val;
    };
    
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    const { date, description, montant, type, categorie } = req.body;
    
    if (!date || !montant || !type || !categorie) { 
        console.warn("POST /api/transactions: Données invalides reçues."); 
        return res.status(400).json({ error: 'Données invalides : date, montant, type et categorie sont requis.' }); 
    }
    
    try {
        const sql = `INSERT INTO transactions (date, description, montant, type, categorie, user_id) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
        
        const { rows } = await db.query(sql, [
            cleanValue(date), 
            cleanValue(description), 
            // Assurez-vous que montant est bien un nombre, car c'est 'montant REAL NOT NULL' dans la table
            parseFloat(montant), 
            cleanValue(type), 
            cleanValue(categorie), 
            userId
        ]);
        
        const newId = rows[0].id;
        console.log(`POST /api/transactions: Nouvelle transaction insérée (ID: ${newId}).`); 
        
        // Retourne les données insérées, y compris le nouvel ID
        res.status(201).json({ id: newId, date, description, montant, type, categorie, user_id: userId });
        
    } catch (err) { 
        console.error("Erreur DB POST /api/transactions:", err.message); 
        // Si l'erreur est liée à la syntaxe, elle sera loguée ci-dessus
        res.status(500).json({ error: err.message }); 
    }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const transactionId = req.params.id;
    console.log(`--- PUT /api/transactions/${transactionId} (User ${userId}) ---`, req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { date, description, montant, type, categorie } = req.body;
    
    if (!date || !montant || !type || !categorie) { 
        console.warn(`PUT /api/transactions/${transactionId}: Données invalides reçues.`); 
        return res.status(400).json({ error: 'Données invalides : date, montant, type et categorie sont requis.' }); 
    }
    
    try {
        const sql = `UPDATE transactions SET date = $1, description = $2, montant = $3, type = $4, categorie = $5 WHERE id = $6 AND user_id = $7 RETURNING id`;
        
        const { rowCount } = await db.query(sql, [
            date, 
            description || null, 
            parseFloat(montant), 
            type, 
            categorie, 
            transactionId, 
            userId
        ]);
        
        if (rowCount === 0) { 
            console.warn(`PUT /api/transactions/${transactionId}: Transaction non trouvée ou non autorisée.`); 
            return res.status(404).json({ message: "Transaction non trouvée ou non autorisée" }); 
        }
        
        console.log(`PUT /api/transactions/${transactionId}: Transaction mise à jour.`); 
        res.json({ id: transactionId, date, description, montant, type, categorie });
        
    } catch (err) { 
        console.error(`Erreur DB PUT /api/transactions/${transactionId}:`, err.message); 
        res.status(500).json({ error: err.message }); 
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const transactionId = req.params.id;
    console.log(`--- DELETE /api/transactions/${transactionId} (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    try {
        const { rowCount } = await db.query(`DELETE FROM transactions WHERE id = $1 AND user_id = $2`, [transactionId, userId]);
        
        if (rowCount === 0) { 
            console.warn(`DELETE /api/transactions/${transactionId}: Transaction non trouvée ou non autorisée.`); 
            return res.status(404).json({ message: "Transaction non trouvée ou non autorisée" }); 
        }
        
        console.log(`DELETE /api/transactions/${transactionId}: Transaction supprimée.`); 
        res.status(200).json({ message: "Transaction supprimée" });
        
    } catch (err) { 
        console.error(`Erreur DB DELETE /api/transactions/${transactionId}:`, err.message); 
        res.status(500).json({ error: err.message }); 
    }
});


// --- API STOCK (SÉCURISÉE) ---

// POST /api/stock (Ajouter/Mettre à jour un article)
app.post('/api/stock', authenticateToken, async (req, res) => {
    const { nom, article_type, taille, couleur, style, quantite, prix } = req.body;
    const userId = req.user.id;
    const quantiteNum = parseInt(quantite, 10);
    const prixNum = parseFloat(prix);

    if (!nom || quantiteNum <= 0 || isNaN(quantiteNum) || isNaN(prixNum)) {
        return res.status(400).json({ error: "Données de stock invalides." });
    }

    try {
        // 1. Vérifier si l'article existe déjà pour cette combinaison (PostgreSQL)
        const sqlCheck = `
            SELECT id, quantite FROM stock_items 
            WHERE nom = $1 AND article_type = $2 AND taille = $3 AND couleur = $4 AND style = $5 AND user_id = $6`;
        
        const { rows } = await db.query(sqlCheck,
            [nom, article_type || null, taille || null, couleur || null, style || null, userId]
        );

        const existingItem = rows[0];

        if (existingItem) {
            // 2. Mettre à jour la quantité et le prix (PostgreSQL)
            const newQuantite = existingItem.quantite + quantiteNum;
            await db.query(
                `UPDATE stock_items SET quantite = $1, prix = $2 WHERE id = $3`, 
                [newQuantite, prixNum, existingItem.id]
            );
            res.json({ message: "Quantité de l'article mise à jour.", id: existingItem.id, newQuantite: newQuantite });

        } else {
            // 3. Insérer un nouvel article (PostgreSQL)
            const insertSql = `
                INSERT INTO stock_items (nom, article_type, taille, couleur, style, quantite, prix, user_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id`; 
            
            const insertResult = await db.query(insertSql, 
                [nom, article_type || null, taille || null, couleur || null, style || null, quantiteNum, prixNum, userId]
            );

            res.status(201).json({ message: "Nouvel article ajouté au stock.", id: insertResult.rows[0].id });
        }

    } catch (err) {
        console.error("Erreur DB POST /api/stock:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/stock (Récupérer tout le stock)
app.get('/api/stock', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Utilise la syntaxe PostgreSQL
        const { rows } = await db.query(`SELECT * FROM stock_items WHERE user_id = $1 ORDER BY nom, style, couleur, taille`, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Erreur DB GET /api/stock:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/stock/:id (Modifier quantité individuelle)
app.put('/api/stock/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { quantite } = req.body;
    const userId = req.user.id;

    if (quantite === undefined || isNaN(parseInt(quantite)) || parseInt(quantite) < 0) {
        return res.status(400).json({ error: 'Quantité invalide (doit être >= 0).' });
    }
    const quantiteParsed = parseInt(quantite);

    try {
        const sql = `UPDATE stock_items SET quantite = $1 WHERE id = $2 AND user_id = $3 RETURNING id`;
        const { rowCount } = await db.query(sql, [quantiteParsed, id, userId]);
        
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Article non trouvé ou non autorisé.' });
        }
        
        res.json({ id: parseInt(id), quantite: quantiteParsed });

    } catch (err) {
        console.error("Erreur DB PUT /api/stock:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/stock/group (Supprimer un groupe)
app.delete('/api/stock/group', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { nom, couleur, style } = req.query;

    if (!nom) { return res.status(400).json({ error: "Le paramètre 'nom' est requis." }); }

    try {
        let sqlParts = [`"user_id" = $1`, `"nom" = $2`];
        let params = [userId, nom];
        
        // Helper pour ajouter les conditions de style/couleur avec gestion NULL
        const addNullableCondition = (field, value, index) => {
            // Gère le cas où le frontend envoie 'null' ou ''
            const cleanValue = (value === 'null' || value === '') ? null : value;
            
            if (cleanValue === null) {
                 // Gère NULL ou chaîne vide dans la DB
                 sqlParts.push(`("${field}" IS NULL OR "${field}" = '')`);
            } else {
                 sqlParts.push(`"${field}" = $${index}`);
                 params.push(cleanValue);
            }
        };

        // PostgreSQL utilise $1, $2, $3, etc. pour les paramètres.
        // Nous gérons les deux premiers ($1=userId, $2=nom), donc nous commençons à $3
        let paramIndex = 3; 

        // Couleur
        addNullableCondition('couleur', couleur, paramIndex++);

        // Style
        addNullableCondition('style', style, paramIndex++);
        
        const sql = `DELETE FROM stock_items WHERE ` + sqlParts.join(' AND ') + ` RETURNING id`;
        
        // Execute la suppression
        const { rowCount } = await db.query(sql, params);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Aucun article correspondant trouvé.' });
        }

        res.status(200).json({ message: `${rowCount} article(s) supprimé(s).` });

    } catch (err) {
        console.error("Erreur DB DELETE /api/stock/group:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/stock/:id (Supprimer article individuel)
app.delete('/api/stock/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { rowCount } = await db.query(`DELETE FROM stock_items WHERE id = $1 AND user_id = $2`, [id, userId]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Article non trouvé ou non autorisé.' });
        }
        
        res.status(200).json({ message: 'Article supprimé avec succès.' });

    } catch (err) {
        console.error("Erreur DB DELETE /api/stock/:id:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// index.js (AJOUTER CETTE ROUTE)

// PUT /api/user/sheet-link (Mettre à jour le lien Google Sheet)
app.put('/api/user/sheet-link', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { googleSheetUrl } = req.body; 
    console.log(`--- PUT /api/user/sheet-link (User ${userId}) ---`);

    if (!googleSheetUrl) {
        return res.status(400).json({ message: 'Le lien Google Sheet est requis.' });
    }

    try {
        const sql = `UPDATE utilisateurs SET google_sheet_url = $1 WHERE id = $2 RETURNING username, google_sheet_url`;
        const { rows } = await db.query(sql, [googleSheetUrl, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        console.log(`Lien Google Sheet mis à jour pour ${rows[0].username}.`);
        
        // Retourne les infos mises à jour (optionnel, mais propre)
        res.json({ 
            message: 'Lien Google Sheet enregistré avec succès.',
            user: { username: rows[0].username, google_sheet_url: rows[0].google_sheet_url } 
        });

    } catch (err) {
        console.error("Erreur DB PUT /api/user/sheet-link:", err.message);
        res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du lien.' });
    }
});

// index.js (Remplacer la fonction readSheetData)

async function readSheetData(spreadsheetId) {
    if (!sheets) {
        throw new Error("Client Google Sheets non initialisé.");
    }

    let sheetName;
    
    try {
        // 1. Récupérer les métadonnées pour trouver le nom de la première feuille
        const metaResponse = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
            fields: 'sheets.properties.title'
        });
        
        // Assumer que la première feuille (index 0) contient les commandes
        sheetName = metaResponse.data.sheets[0].properties.title;
        console.log(`Lecture à partir de la feuille: "${sheetName}"`);

    } catch (error) {
        console.error("Erreur de récupération du nom de la feuille:", error.message);
        // Solution de secours : Utiliser le nom codé en dur si la récupération échoue
        sheetName = 'Feuille 2'; 
    }

    // Le Range DOIT inclure le nom de la feuille
    const RANGE = `'${sheetName}'!A:J`;

    const params = {
        spreadsheetId: spreadsheetId,
        range: RANGE,
    };
    
    try {
        // 2. Lire les données
        const response = await sheets.spreadsheets.values.get(params);
        return response.data.values || [];
    } catch (error) {
        // C'est ici que votre ancienne erreur se produisait
        console.error("Erreur de lecture Google Sheet:", error.message);
        throw new Error(`Erreur lors de la lecture du Google Sheet: ${error.message}.`);
    }
}

// --- ROUTE GOOGLE SHEETS : Récupération des données ---
app.get('/api/sheet-data', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    console.log(`--- GET /api/sheet-data (User ${userId}) ---`);

    try {
        const { rows } = await db.query('SELECT google_sheet_url FROM utilisateurs WHERE id = $1', [userId]);
        const userSheetUrl = rows[0]?.google_sheet_url;

        if (!userSheetUrl) {
            return res.status(404).json({ error: "Aucun lien Google Sheet n'est configuré pour ce compte." });
        }

        // Extraire l'ID du Spreadsheet de l'URL
        const match = userSheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if (!match) {
            return res.status(400).json({ error: "Lien Google Sheet invalide. Assurez-vous d'utiliser le format correct." });
        }
        const spreadsheetId = match[1];

        const data = await readSheetData(spreadsheetId);

        // La première ligne est l'en-tête. On envoie tout au front qui gère la transformation.
        res.json(data);

    } catch (err) {
        console.error("Erreur GET /api/sheet-data:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// --- ROUTE GOOGLE SHEETS : Mise à jour du statut ---
app.put('/api/sheet-data/update-status', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { rowIndex, newStatus } = req.body; // rowIndex est le numéro de ligne dans Sheet (ex: 2 pour la première commande)
    console.log(`--- PUT /api/sheet-data/update-status (Row: ${rowIndex}, Status: ${newStatus}) ---`);

    if (rowIndex === undefined || newStatus === undefined) {
        return res.status(400).json({ error: "rowIndex et newStatus sont requis." });
    }

    try {
        const { rows } = await db.query('SELECT google_sheet_url FROM utilisateurs WHERE id = $1', [userId]);
        const userSheetUrl = rows[0]?.google_sheet_url;

        if (!userSheetUrl) {
            return res.status(404).json({ error: "Aucun lien Google Sheet n'est configuré pour ce compte." });
        }

        const match = userSheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if (!match) {
            return res.status(400).json({ error: "Lien Google Sheet invalide." });
        }
        const spreadsheetId = match[1];

        // Déterminer la colonne d'état (basée sur l'ancienne constante STATUS_COLUMN_LETTER = 'I')
        const range = `${STATUS_COLUMN_LETTER}${rowIndex}`; 
        
        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: `${SHEET_NAME}!${range}`, // Ex: 'Feuille 2'!I2
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[newStatus]],
            },
        });

        res.json({ message: `Statut de la ligne ${rowIndex} mis à jour à '${newStatus}'` });

    } catch (err) {
        console.error("Erreur PUT /api/sheet-data/update-status:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTE RETOURS --- (Conversion complète)

// 1. DELETE GROUPE DE RETOURS (Par Modèle/Taille)
app.delete('/api/retours/group', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { nom, style, taille, description } = req.query;
    
    if (!nom || !description) { 
        return res.status(400).json({ error: "Les paramètres 'nom' et 'description' sont requis." }); 
    }

    try {
        let sqlParts = [`"user_id" = $1`, `"nom" = $2`];
        let params = [userId, nom];

        const cleanValue = (val) => (val === 'null' || val === '' || val === 'Taille non spécifiée') ? null : val;

        const descFinal = cleanValue(description);
        const styleFinal = cleanValue(style);
        const tailleFinal = cleanValue(taille);
        
        let paramIndex = 3;
        
        const addRetoursCondition = (field, value) => {
            const cleanedValue = cleanValue(value);
            if (cleanedValue === null) {
                 sqlParts.push(`("${field}" IS NULL OR "${field}" = '')`);
            } else {
                 sqlParts.push(`"${field}" = $${paramIndex}`);
                 params.push(cleanedValue);
            }
        };

        addRetoursCondition('description', descFinal); 
        addRetoursCondition('style', styleFinal);
        addRetoursCondition('taille', tailleFinal);
        
        const sql = `DELETE FROM stock_retours WHERE ` + sqlParts.join(' AND ') + ` RETURNING id`;
        
        const { rowCount } = await db.query(sql, params);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Aucun retour correspondant trouvé.' });
        }

        res.status(200).json({ message: `${rowCount} article(s) supprimé(s).` });

    } catch (err) {
        console.error("Erreur DB DELETE /api/retours/group:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. DELETE ARTICLE INDIVIDUEL (Par ID)
app.delete('/api/retours/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const retourId = req.params.id;

    try {
        const { rowCount } = await db.query(`DELETE FROM stock_retours WHERE id = $1 AND user_id = $2`, [retourId, userId]);

        if (rowCount === 0) { 
            return res.status(404).json({ message: "Retour non trouvé ou non autorisé" }); 
        }
        res.status(200).json({ message: "Retour supprimé" });
    } catch (err) { 
        console.error(`Erreur DB DELETE /api/retours/${retourId}:`, err.message); 
        res.status(500).json({ error: err.message }); 
    }
});

// 3. GET TOUS LES RETOURS
app.get('/api/retours', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    try {
        const sql = `SELECT * FROM stock_retours WHERE user_id = $1 ORDER BY date_ajout DESC`;
        const { rows } = await db.query(sql, [userId]);
        
        res.json(rows || []);
    } catch (err) {
        console.error("Erreur DB GET /api/retours:", err.message); 
        res.status(500).json({ error: "Erreur serveur lors de la récupération des retours." });
    }
});


// 4. POST NOUVEAU RETOUR
app.post('/api/retours', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { nom, style, taille, couleur, description } = req.body; 
    
    if (!nom || !description) { 
        return res.status(400).json({ error: 'Nom et Description sont requis pour ajouter un retour.' }); 
    }
    
    try {
        const sql = `INSERT INTO stock_retours (user_id, nom, style, taille, couleur, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
        
        const { rows } = await db.query(sql, 
            [userId, nom, style || null, taille || null, couleur || null, description]
        );
        
        res.status(201).json({ id: rows[0].id, user_id: userId, nom, style, taille, couleur, description });
    } catch (err) { 
        console.error("Erreur DB POST /api/retours:", err.message); 
        res.status(500).json({ error: err.message }); 
    }
});


// --- ROUTE COMMANDES --- (Conversion complète)

// GET /api/commandes (Récupérer les commandes)
app.get('/api/commandes', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    try {
        const { rows } = await db.query(`SELECT * FROM commandes WHERE user_id = $1 ORDER BY date_commande DESC`, [userId]);
        res.json(rows || []);
    } catch (err) {
        console.error("Erreur DB GET /api/commandes:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/commandes (Ajouter une commande)
app.post('/api/commandes', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire } = req.body;
    
    if (!prix_total || !date_commande) { 
        return res.status(400).json({ error: 'Données invalides : prix_total et date_commande sont requis.' }); 
    }
    
    let articlesJson = null;
    try {
        articlesJson = JSON.stringify(articles || []);
    } catch (e) { 
        console.error("Erreur JSON articles:", e); 
        articlesJson = JSON.stringify([]); 
    }
    
    try {
        const sql = `INSERT INTO commandes (telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire, user_id) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`;
        
        const { rows } = await db.query(sql, [
            telephone || null, 
            nom_prenom || null, 
            adresse || null, 
            type_livraison || null, 
            articlesJson, 
            parseFloat(prix_total), 
            date_commande, 
            date_livraison || null, 
            etat || 'En préparation', 
            commentaire || null, 
            userId
        ]);
        
        res.status(201).json({ id: rows[0].id, ...req.body, articles: articles });
        
    } catch (err) { 
        console.error("Erreur DB POST /api/commandes:", err.message); 
        res.status(500).json({ error: err.message }); 
    }
});

// DELETE /api/commandes/:id (Supprimer une commande)
app.delete('/api/commandes/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const commandeId = req.params.id;
    
    try {
        const { rowCount } = await db.query(`DELETE FROM commandes WHERE id = $1 AND user_id = $2`, [commandeId, userId]);

        if (rowCount === 0) { 
            return res.status(404).json({ message: "Commande non trouvée ou non autorisée" }); 
        }
        res.status(200).json({ message: "Commande supprimée" });
    } catch (err) {
        console.error(`Erreur DB DELETE /api/commandes/${commandeId}:`, err.message); 
        res.status(500).json({ error: err.message });
    }
});


// --- ROUTE DASHBOARD (A adapter pour PostgreSQL) ---

// GET /api/dashboard-summary (Conversion simplifiée)
app.get('/api/dashboard-summary', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    // Reste de la logique de Google Sheets, Totaux, etc. (non converti ici car trop long)
    
    res.status(501).json({ error: "Dashboard non fonctionnel sans la conversion totale du code SQL/Sheets." });
});


// --- Démarrage du Serveur ---
app.get('/', (req, res) => { res.send('API Comptalab (PostgreSQL) fonctionne !'); });

initializeSheetsClient().then(() => {
    // Utilise le port défini dans .env ou 3001
    const port = process.env.PORT && !isNaN(parseInt(process.env.PORT)) ? parseInt(process.env.PORT) : 3001;
    
    app.listen(port, () => {
        console.log(`Serveur backend (PostgreSQL) démarré sur http://localhost:${port}`);
    });
}).catch(initErr => {
    console.error('*** ERREUR CRITIQUE au démarrage (pré-listen):', initErr);
    process.exit(1);
});

// index.js (ROUTE GET /api/financial-summary)

app.get('/api/financial-summary', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { filter = 'actifs' } = req.query; 

    console.log(`--- GET /api/financial-summary (User ${userId}, Filtre: ${filter}) ---`);
    if (!sheets) return res.status(503).json({ error: "Service Google Sheets non disponible." });
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    try {
        const statutsActifsRaw = ['En préparation', 'Confirmé', 'Prêt à Livrer', 'Echange'];
        // Utilise la fonction normalizeStatus nouvellement ajoutée
        const normalizedStatutsActifs = statutsActifsRaw.map(s => normalizeStatus(s));
        const normalizedFilter = normalizeStatus(filter);
        
        let sql = `SELECT prix_total, type_livraison, adresse, articles, etat FROM commandes WHERE user_id = $1`;
        const params = [userId];

        if (normalizedFilter === 'tous') {
            sql += ` AND etat != 'annulé' AND etat != 'non confirmé'`;
        } else if (normalizedFilter === 'actifs') {
            // Utilise la syntaxe PostgreSQL $2, $3, ...
            sql += ` AND etat IN (${normalizedStatutsActifs.map((_, i) => `$${i + 2}`).join(',')})`;
            params.push(...normalizedStatutsActifs);
        } else {
            sql += ` AND etat = $2`;
            params.push(normalizedFilter); 
        }

        // CONVERSION CRITIQUE: db.all -> await db.query
        const { rows: commandes } = await db.query(sql, params);

        if (!commandes || commandes.length === 0) {
            return res.json({ totalCommandes: 0, totalLivraison: 0, totalCoutArticles: 0, gainPotentiel: 0 });
        }

        // --- Le reste de la logique de calcul (synchrone) doit maintenant fonctionner ---
        let totalCommandes = 0;
        let totalLivraison = 0;
        let totalCoutArticles = 0; 

        for (const cmd of commandes) {
            // --- CORRECTION DU NETTOYAGE CRITIQUE ---
            const prixTotalText = String(cmd.prix_total || '').replace(/[^0-9.,]/g, '');
            // Remplace la virgule (séparateur décimal français) par le point
            const prixTotalClean = prixTotalText.replace(',', '.'); 
            
            const prix_total = parseFloat(prixTotalClean) || 0;
console.log(`Lecture Prix Total: ${prix_total}`);
            // --- FIN DE LA CORRECTION ---
            
            const typeLivraison = (cmd.type_livraison || 'autre').toLowerCase().trim();
            const adresseText = (cmd.adresse || '').toLowerCase();
            
            totalCommandes += prix_total;
            // Utilise la fonction parseArticleCost nouvellement ajoutée
            totalCoutArticles += parseArticleCost(articlesText); 

            let coutLivraison = 0;
            if (typeLivraison === 'main a main') {
                coutLivraison = 0;
            } else if (typeLivraison === 'a domicile' || typeLivraison === 'bureau') {
                coutLivraison = PRIX_WILAYAS.defaut.prices[typeLivraison] || PRIX_WILAYAS.defaut.prices['autre'];
                let wilayaTrouvee = false;
                for (const wilayaKey in PRIX_WILAYAS) {
                    if (wilayaKey === 'defaut') continue;
                    const wilayaData = PRIX_WILAYAS[wilayaKey];
                    for (const nom of wilayaData.names) {
                        if (adresseText.includes(nom)) {
                            coutLivraison = wilayaData.prices[typeLivraison] || wilayaData.prices['autre'];
                            wilayaTrouvee = true;
                            break;
                        }
                    }
                    if (wilayaTrouvee) break;
                }
            }
            totalLivraison += coutLivraison;
        }

        const gainNetPotentiel = totalCommandes - totalLivraison - totalCoutArticles;

        res.json({
            totalCommandes,
            totalLivraison,
            totalCoutArticles,
            gainPotentiel: gainNetPotentiel
        });

    } catch (err) {
        console.error("Erreur DB GET /api/financial-summary:", err.message);
        res.status(500).json({ error: `Erreur serveur lors de la récupération du résumé : ${err.message}` });
    }
});
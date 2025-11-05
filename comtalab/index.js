// index.js (Version PostgreSQL pour Render/Neon)

// 1. IMPORTS
require('dotenv').config(); // CHARGE LES VARIABLES D'ENVIRONNEMENT
const express = require('express');
const { Client } = require('pg'); // NOUVEAU: Driver PostgreSQL
const cors = require('cors');
const { google } = require('googleapis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 2. CRÉER LE SERVEUR WEB
const app = express();
const port = process.env.PORT || 3001

// --- Configuration ---
const KEY_FILE_PATH = './google-credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// SECRET pour les tokens JWT (Utilisation de la variable d'environnement)
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const saltRounds = 10; 

// Nom exact de l'onglet (pour l'écriture)
const SHEET_NAME = 'Feuille 2';
// Range pour la lecture (couvre A à J)
const RANGE_READ = "'Feuille 2'!A:J";
// Lettre de la colonne "etat de livraison" (c'est la 9ème, donc 'I')
const STATUS_COLUMN_LETTER = 'I';

// --- Initialisation Google Sheets API Client (inchangé) ---
let sheets;

// index.js (Mise à jour de initializeSheetsClient)

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
        // Ancienne référence: keyFile: KEY_FILE_PATH, est maintenant obsolète
        console.error('*** ERREUR CRITIQUE: Initialisation du client Google Sheets échouée:');
        console.error(err);
        sheets = null;
    }
}
// Mise à jour: Retirer la ligne suivante car elle n'est plus utilisée
// const KEY_FILE_PATH = './google-credentials.json';
// --- FIN Google Sheets ---

// 3. Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

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
                await db.query(sql);
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


// --- NOUVEAU : Middleware d'authentification ---
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
            return res.sendStatus(403); // Forbidden
        }
        
        req.user = user; 
        console.log(`Auth: Requête OK pour user ID ${user.id}`);
        next(); 
    });
}


// --- API Transactions (CONVERTI en PG) ---

app.get('/', (req, res) => { res.send('API Comptalab (PostgreSQL) fonctionne !'); });

// index.js (ROUTE GET /api/transactions)

app.get('/api/transactions', authenticateToken, async (req, res) => { // AJOUTER 'async'
    const userId = req.user.id;
    console.log(`--- GET /api/transactions (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    try {
        // CONVERSION : Utilise await db.query avec $1 (PostgreSQL)
        const { rows } = await db.query(`SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC`, [userId]);
        
        console.log(`GET /api/transactions: ${rows ? rows.length : 0} transactions trouvées.`);
        res.json(rows || []);
    } catch (err) {
        console.error("Erreur DB GET /api/transactions:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des transactions." });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    console.log(`--- POST /api/transactions (User ${userId}) ---`, req.body);
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
            date, 
            description || null, 
            parseFloat(montant), 
            type, 
            categorie, 
            userId
        ]);
        
        const newId = rows[0].id;
        console.log(`POST /api/transactions: Nouvelle transaction insérée (ID: ${newId}).`); 
        res.status(201).json({ id: newId, date, description, montant, type, categorie, user_id: userId });
        
    } catch (err) { 
        console.error("Erreur DB POST /api/transactions:", err.message); 
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
                 paramIndex++;
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


// --- ROUTE DASHBOARD (Doit être convertie vers await db.query) ---

// GET /api/dashboard-summary (Conversion simplifiée)
app.get('/api/dashboard-summary', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    // Reste de la logique de Google Sheets, Totaux, etc. (non converti ici car trop long)
    
    res.status(501).json({ error: "Dashboard non fonctionnel sans la conversion totale du code SQL/Sheets." });
});


// --- Démarrage du Serveur ---
app.get('/', (req, res) => { res.send('API Comptalab (PostgreSQL) fonctionne !'); });

initializeSheetsClient().then(() => {
    app.listen(port, () => {
        console.log(`Serveur backend (PostgreSQL) démarré sur http://localhost:${port}`);
    });
}).catch(initErr => {
    console.error('*** ERREUR CRITIQUE au démarrage (pré-listen):', initErr);
    process.exit(1);
});
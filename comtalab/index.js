const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { google } = require('googleapis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 2. Créer le serveur web
const app = express();
const port = 3001;

// --- Configuration ---
const KEY_FILE_PATH = './google-credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// SECRET pour les tokens JWT (change-le pour quelque chose de long et aléatoire)
const TOKEN_SECRET = 'votre_super_secret_jwt_personnel_ici';
const saltRounds = 10; // Pour bcrypt

// Nom exact de l'onglet (pour l'écriture)
const SHEET_NAME = 'Feuille 2';
// Range pour la lecture (couvre A à J)
const RANGE_READ = "'Feuille 2'!A:J";
// Lettre de la colonne "etat de livraison" (c'est la 9ème, donc 'I')
const STATUS_COLUMN_LETTER = 'I';

// (Le SPREADSHEET_ID global n'est plus utilisé pour les données, mais gardé en exemple)
// const SPREADSHEET_ID_GLOBAL = '1srg0OqWvvo8h4lH6Ukf4j53kplhAZXpnd_AmS7Ax41M';

// --- Initialisation Google Sheets API Client ---
let sheets;

async function initializeSheetsClient() {
  console.log('Tentative d\'initialisation du client Google Sheets...');
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
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
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // AJOUTÉ : 'Authorization' pour permettre l'envoi du token
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

// 4. Connexion à la base de données SQLite
let db;

try {
    db = new sqlite3.Database('./compta.db', (err) => {
        if (err) {
            console.error("*** ERREUR CRITIQUE: Erreur connexion DB:", err.message);
            process.exit(1);
        }
        console.log('Connecté à la base de données SQLite "compta.db".');

        db.serialize(() => {
            console.log('Début de la sérialisation des créations de table...');

// 1. Transactions (CODE CORRECT avec user_id)
const sqlCreateTableTransactions = `
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  description TEXT,
  montant REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('depense', 'revenu')),
  categorie TEXT NOT NULL,
  user_id INTEGER NOT NULL
);
`;
        db.run(sqlCreateTableTransactions, (err) => {
            if (err) { return console.error("Erreur création table transactions:", err.message); }
            console.log("Table 'transactions' prête (avec user_id).");
        });

// 2. Stock (CODE CORRECT avec user_id)
const sqlCreateTableStock = `
CREATE TABLE IF NOT EXISTS stock_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  article_type TEXT,
  taille TEXT,
  couleur TEXT,
  style TEXT,
  quantite INTEGER NOT NULL DEFAULT 0,
  prix REAL,
  user_id INTEGER NOT NULL
);
`;
        db.run(sqlCreateTableStock, (err) => {
            if (err) { return console.error("Erreur création/vérification table stock_items:", err.message); }
            console.log("Table 'stock_items' prête (avec user_id).");
        });
        

// 3. Commandes (CODE CORRECT avec user_id)
const sqlCreateTableCommandes = `
CREATE TABLE IF NOT EXISTS commandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telephone TEXT,
  nom_prenom TEXT,
  adresse TEXT,
  type_livraison TEXT,
  articles TEXT,
  prix_total REAL NOT NULL DEFAULT 0,
  date_commande TEXT NOT NULL,
  date_livraison TEXT,
  etat TEXT NOT NULL DEFAULT 'En préparation',
  commentaire TEXT,
  user_id INTEGER NOT NULL
);
`;
        db.run(sqlCreateTableCommandes, (err) => {
            if (err) { return console.error("Erreur création table commandes:", err.message); }
            console.log("Table 'commandes' prête (avec user_id).");
        });


// 4. Retours (NOUVEAU CODE)
const sqlCreateTableRetours = `
CREATE TABLE IF NOT EXISTS retours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  nom TEXT NOT NULL,
  style TEXT,
  taille TEXT,
  couleur TEXT,
  description TEXT,
  date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
        db.run(sqlCreateTableRetours, (err) => {
            if (err) { return console.error("Erreur création table retours:", err.message); }
            console.log("Table 'retours' prête (avec user_id).");
        });


// 4. Utilisateurs (inchangée, mais le mdp sera haché)
const sqlCreateTableUtilisateurs = `
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  google_sheet_url TEXT NULL
);
`;
            db.run(sqlCreateTableUtilisateurs, (err) => {
                if (err) { return console.error("Erreur création table utilisateurs:", err.message); }
                else {
                    console.log("Table 'utilisateurs' prête.");
                    const sqlCheckUser = `SELECT COUNT(id) as count FROM utilisateurs`;
                    db.get(sqlCheckUser, [], (errCheck, row) => {
                        if (errCheck) { return console.error("Erreur vérification utilisateur:", errCheck.message); }
                        if (row && row.count === 0) {
                            // Crée l'admin par défaut avec un mot de passe haché
                            bcrypt.hash('password', saltRounds, (errHash, hash) => {
                              if (errHash) { return console.error("Erreur hachage mdp admin:", errHash); }
                                
                                const sqlInsertAdmin = `INSERT INTO utilisateurs (username, password) VALUES (?, ?)`;
                                db.run(sqlInsertAdmin, ['admin', hash], (errInsert) => {
                                    if (errInsert) { return console.error("Erreur insertion admin:", errInsert.message); }
                                    console.log("Utilisateur 'admin' (mdp: 'password') créé par défaut.");
                                });
                              });
                        } else {
                            console.log("Utilisateurs déjà présents.");
                        }
                    });

                }
            }); // Fin db.run utilisateurs

            console.log('Fin de la sérialisation des créations de table.');

        }); // Fin de db.serialize
    });








// Fin connexion DB callback
} catch (dbError) {
    console.error('*** ERREUR CRITIQUE: Impossible d\'ouvrir la base de données:', dbError.message);
    process.exit(1);
}
// --- FIN Connexion DB ---


// --- NOUVEAU : Middleware d'authentification ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (token == null) {
    console.warn("Auth: Token manquant.");
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) {
      console.warn("Auth: Token invalide.", err.message);
      return res.sendStatus(403); // Forbidden
    }
    
    req.user = user; // user contient { id, username }
    console.log(`Auth: Requête OK pour user ID ${user.id}`);
    next(); 
  });
}


// --- API Transactions (SÉCURISÉE) ---
app.get('/', (req, res) => { res.send('API Comptalab (Multi-User) fonctionne !'); });

app.get('/api/transactions', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`--- GET /api/transactions (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    db.all("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC", [userId], (err, rows) => {
        if (err) { console.error("Erreur DB GET /api/transactions:", err.message); res.status(500).json({ error: err.message }); }
        else { console.log(`GET /api/transactions: ${rows ? rows.length : 0} transactions trouvées.`); res.json(rows || []); }
    });
});

app.post('/api/transactions', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`--- POST /api/transactions (User ${userId}) ---`, req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { date, description, montant, type, categorie } = req.body;
    if (!date || !montant || !type || !categorie) { console.warn("POST /api/transactions: Données invalides reçues."); return res.status(400).json({ error: 'Données invalides : date, montant, type et categorie sont requis.' }); }
    
    db.run("INSERT INTO transactions (date, description, montant, type, categorie, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [date, description || null, parseFloat(montant), type, categorie, userId], function (err) {
            if (err) { console.error("Erreur DB POST /api/transactions:", err.message); res.status(500).json({ error: err.message }); }
            else { console.log(`POST /api/transactions: Nouvelle transaction insérée (ID: ${this.lastID}).`); res.status(201).json({ id: this.lastID, date, description, montant, type, categorie, user_id: userId }); }
        });
});

app.put('/api/transactions/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const transactionId = req.params.id;
    console.log(`--- PUT /api/transactions/${transactionId} (User ${userId}) ---`, req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { date, description, montant, type, categorie } = req.body;
    if (!date || !montant || !type || !categorie) { console.warn(`PUT /api/transactions/${transactionId}: Données invalides reçues.`); return res.status(400).json({ error: 'Données invalides : date, montant, type et categorie sont requis.' }); }
    
    db.run("UPDATE transactions SET date = ?, description = ?, montant = ?, type = ?, categorie = ? WHERE id = ? AND user_id = ?",
        [date, description || null, parseFloat(montant), type, categorie, transactionId, userId], function (err) {
            if (err) { console.error(`Erreur DB PUT /api/transactions/${transactionId}:`, err.message); res.status(500).json({ error: err.message }); }
            else if (this.changes === 0) { console.warn(`PUT /api/transactions/${transactionId}: Transaction non trouvée ou non autorisée.`); res.status(404).json({ message: "Transaction non trouvée ou non autorisée" }); }
            else { console.log(`PUT /api/transactions/${transactionId}: Transaction mise à jour.`); res.json({ id: transactionId, date, description, montant, type, categorie }); }
        });
});

app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const transactionId = req.params.id;
    console.log(`--- DELETE /api/transactions/${transactionId} (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    db.run("DELETE FROM transactions WHERE id = ? AND user_id = ?", [transactionId, userId], function (err) {
        if (err) { console.error(`Erreur DB DELETE /api/transactions/${transactionId}:`, err.message); res.status(500).json({ error: err.message }); }
        else if (this.changes === 0) { console.warn(`DELETE /api/transactions/${transactionId}: Transaction non trouvée ou non autorisée.`); res.status(404).json({ message: "Transaction non trouvée ou non autorisée" }); }
        else { console.log(`DELETE /api/transactions/${transactionId}: Transaction supprimée.`); res.status(200).json({ message: "Transaction supprimée" }); }
    });
});


// --- API STOCK (SÉCURISÉE) ---

app.get('/api/stock', authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log(`--- GET /api/stock (User ${userId}) ---`);
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  
  const sql = `SELECT * FROM "stock_items" WHERE "user_id" = ? ORDER BY "nom", "style", "couleur", "taille"`;
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Erreur DB GET /api/stock:", err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la récupération du stock." });
    }
    console.log(`GET /api/stock: ${rows ? rows.length : 0} articles trouvés.`);
    res.json(rows || []);
  });
});

// ... dans la section API STOCK ...

// comtalab/index.js

app.post('/api/stock', authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log(`--- POST /api/stock (User ${userId}) ---`, req.body);
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  
  const { nom, taille, couleur, style, prix } = req.body; 

  // --- VALIDATION MODIFIÉE (Couleur n'est plus requise ici) ---
  if (!nom || req.body.quantite === undefined || isNaN(parseInt(req.body.quantite)) || parseInt(req.body.quantite) < 0) {
    console.warn("POST /api/stock: Données invalides reçues.");
    return res.status(400).json({ error: 'Données invalides : nom et quantité (>= 0) sont requis.' });
  }
  // --- FIN VALIDATION ---

  const quantiteParsed = parseInt(req.body.quantite);
  const tailleFinal = taille ? taille : null;
  const couleurFinal = couleur ? couleur : null; // <-- Permet null
  const styleFinal = style ? style : null;

  let prixFinal = null;
  if (prix !== undefined && prix !== null) {
    prixFinal = parseFloat(prix);
    if (isNaN(prixFinal)) prixFinal = 0;
  }
  
  // MODIFIÉ : Gère 'couleurFinal' IS NULL
  const sqlCheck = 'SELECT "id", "quantite" FROM "stock_items" WHERE "nom" = ? AND ("couleur" = ? OR ("couleur" IS NULL AND ? IS NULL)) AND ("taille" = ? OR ("taille" IS NULL AND ? IS NULL)) AND ("style" = ? OR ("style" IS NULL AND ? IS NULL)) AND "user_id" = ?';
  const paramsCheck = [nom, couleurFinal, couleurFinal, tailleFinal, tailleFinal, styleFinal, styleFinal, userId];

  console.log("Exécution SQL Check:", sqlCheck, paramsCheck);

  db.get(sqlCheck, paramsCheck, (err, row) => {
    if (err) {
      console.error("Erreur DB POST /api/stock (check):", err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la vérification de l'article." });
    }
    if (row) {
      const nouvelleQuantite = row.quantite + quantiteParsed;
      const sqlUpdate = `UPDATE "stock_items" SET "quantite" = ?, "prix" = ? WHERE "id" = ?`;
      console.log("Exécution SQL Update:", sqlUpdate, [nouvelleQuantite, prixFinal, row.id]);
      
      db.run(sqlUpdate, [nouvelleQuantite, prixFinal, row.id], function (errUpdate) {
        if (errUpdate) {
          console.error("Erreur DB POST /api/stock (update):", errUpdate.message);
          return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." });
        }
        res.status(200).json({ id: row.id, nom, taille: tailleFinal, couleur: couleurFinal, style: styleFinal, quantite: nouvelleQuantite, prix: prixFinal });
      });
    } else {
      // MODIFIÉ : Gère 'couleurFinal'
      const sqlInsert = `INSERT INTO "stock_items" ("nom", "taille", "couleur", "style", "quantite", "prix", "user_id") VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const paramsInsert = [nom, tailleFinal, couleurFinal, styleFinal, quantiteParsed, prixFinal, userId];
      console.log("Exécution SQL Insert:", sqlInsert, paramsInsert);
      
      db.run(sqlInsert, paramsInsert, function (errInsert) {
        if (errInsert) {
          console.error("Erreur DB POST /api/stock (insert):", errInsert.message);
          return res.status(500).json({ error: "Erreur serveur lors de l'ajout de l'article." });
        }
        const newId = this.lastID;
        res.status(201).json({ id: newId, nom, taille: tailleFinal, couleur: couleurFinal, style: styleFinal, quantite: quantiteParsed, prix: prixFinal });
      });
    }
  });
});

app.put('/api/stock/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantite } = req.body;
  console.log(`--- PUT /api/stock/${id} (User ${userId}) --- Qté: ${quantite}`);
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  if (quantite === undefined || isNaN(parseInt(quantite)) || parseInt(quantite) < 0) {
    console.warn(`PUT /api/stock/${id}: Quantité invalide reçue.`);
    return res.status(400).json({ error: 'Quantité invalide (doit être >= 0).' });
  }
  const quantiteParsed = parseInt(quantite);
  
  // Ajout de "AND user_id = ?" pour la sécurité
  const sql = `UPDATE "stock_items" SET "quantite" = ? WHERE "id" = ? AND "user_id" = ?`;
  console.log("Exécution SQL Update:", sql, [quantiteParsed, id, userId]);
  
  db.run(sql, [quantiteParsed, id, userId], function (err) {
    if (err) {
      console.error(`Erreur DB PUT /api/stock/${id}:`, err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." });
    }
    if (this.changes === 0) {
      console.warn(`PUT /api/stock/${id}: Article non trouvé ou non autorisé.`);
      return res.status(404).json({ error: 'Article non trouvé ou non autorisé.' });
    }
    console.log(`PUT /api/stock/${id}: Quantité mise à jour à ${quantiteParsed}.`);
    res.json({ id: parseInt(id), quantite: quantiteParsed });
  });
});

// comtalab/index.js

app.delete('/api/stock/group', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { nom, couleur, style } = req.query;
  console.log(`--- DELETE /api/stock/group (User ${userId}) ---`, req.query);

  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  if (!nom) { return res.status(400).json({ error: "Le paramètre 'nom' est requis." }); }

  let sql = `DELETE FROM "stock_items" WHERE "nom" = ? AND "user_id" = ?`;
  const params = [nom, userId];


// --- NOUVELLE API RETOURS (SÉCURISÉE) ---

// Récupérer tous les retours de l'utilisateur
app.get('/api/retours', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`--- GET /api/retours (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    // Sélectionne tous les champs et trie par date
    db.all("SELECT * FROM retours WHERE user_id = ? ORDER BY date_ajout DESC", [userId], (err, rows) => {
        if (err) { console.error("Erreur DB GET /api/retours:", err.message); return res.status(500).json({ error: err.message }); }
        console.log(`GET /api/retours: ${rows ? rows.length : 0} retours trouvés.`);
        res.json(rows || []);
    });
});

// Ajouter un nouveau retour
app.post('/api/retours', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`--- POST /api/retours (User ${userId}) ---`, req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    const { nom, style, taille, couleur, description } = req.body; 
    
    // Validation minimale: nom et description sont requis pour un retour
    if (!nom || !description) { 
        console.warn("POST /api/retours: Données invalides (nom ou description manquant)."); 
        return res.status(400).json({ error: 'Nom et Description sont requis pour ajouter un retour.' }); 
    }
    
    const sql = `INSERT INTO retours (user_id, nom, style, taille, couleur, description) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, 
        [userId, nom, style || null, taille || null, couleur || null, description], 
        function (err) {
            if (err) { 
                console.error("Erreur DB POST /api/retours:", err.message); 
                return res.status(500).json({ error: err.message }); 
            }
            console.log(`POST /api/retours: Nouveau retour inséré (ID: ${this.lastID}).`);
            res.status(201).json({ 
                id: this.lastID, 
                user_id: userId,
                nom, style, taille, couleur, description 
            });
        }
    );
});

// Supprimer un retour par ID
app.delete('/api/retours/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const retourId = req.params.id;
    console.log(`--- DELETE /api/retours/${retourId} (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    // Suppression sécurisée : vérifie l'ID et l'appartenance à l'utilisateur
    db.run(`DELETE FROM "retours" WHERE "id" = ? AND "user_id" = ?`, [retourId, userId], function(err) {
        if (err) { 
            console.error(`Erreur DB DELETE /api/retours/${retourId}:`, err.message); 
            return res.status(500).json({ error: err.message }); 
        }
        if (this.changes === 0) { 
            console.warn(`DELETE /api/retours/${retourId}: Retour non trouvé ou non autorisé.`); 
            return res.status(404).json({ message: "Retour non trouvé ou non autorisé" }); 
        }
        console.log(`DELETE /api/retours/${retourId}: Retour supprimé.`);
        res.status(200).json({ message: "Retour supprimé" });
    });
});

// --- FIN API RETOURS ---

// ... (Le code de l'API Commandes suit ici, inchangé)
  // --- LOGIQUE CORRIGÉE POUR LA COULEUR ---
  // Si la couleur est 'null' (envoyée par ton code) ou 'Sans couleur' (envoyée par l'ancien code)
  if (couleur === 'null' || couleur === 'Sans couleur' || couleur === undefined || couleur === '') {
    sql += ` AND "couleur" IS NULL`;
    console.log("Recherche de couleur: NULL");
  } else {
    sql += ` AND "couleur" = ?`;
    params.push(couleur);
    console.log(`Recherche de couleur: "${couleur}"`);
  }
  // --- FIN DE LA CORRECTION ---

  // Logique pour le style (inchangée)
  if (style !== undefined && style !== 'null' && style !== '') {
      sql += ` AND "style" = ?`;
      params.push(style);
  } else {
      sql += ` AND "style" IS NULL`;
  }

  console.log("SQL DELETE Group:", sql, params);

  db.run(sql, params, function (err) {
    if (err) { console.error("Erreur DB DELETE /api/stock/group:", err.message); return res.status(500).json({ error: "Erreur serveur lors de la suppression du groupe." }); }
    if (this.changes === 0) { console.log(`DELETE /api/stock/group: Aucun article supprimé.`); return res.status(404).json({ message: 'Aucun article correspondant trouvé.' }); }
    console.log(`DELETE /api/stock/group: ${this.changes} article(s) supprimé(s).`);
    res.status(200).json({ message: `Groupe supprimé avec succès (${this.changes} articles).` });
  });
});

app.delete('/api/stock/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  console.log(`--- DELETE /api/stock/${id} (User ${userId}) ---`);
  
  if (isNaN(parseInt(id))) { /* ... */ }
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  
  // Ajout de "AND user_id = ?"
  const sql = `DELETE FROM "stock_items" WHERE "id" = ? AND "user_id" = ?`;
  console.log("Exécution SQL Delete:", sql, [id, userId]);
  
  db.run(sql, [id, userId], function (err) {
    if (err) {
      console.error(`Erreur DB DELETE /api/stock/${id}:`, err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la suppression." });
    }
    if (this.changes === 0) {
      console.warn(`DELETE /api/stock/${id}: Article non trouvé ou non autorisé.`);
      return res.status(404).json({ error: 'Article non trouvé ou non autorisé.' });
    }
    console.log(`DELETE /api/stock/${id}: Article supprimé.`);
    res.status(200).json({ message: 'Article supprimé avec succès.' });
  });
});
// --- FIN API STOCK ---


// --- API Commandes (SÉCURISÉE) ---
app.get('/api/commandes', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`--- GET /api/commandes (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    
    db.all("SELECT * FROM commandes WHERE user_id = ? ORDER BY date_commande DESC", [userId], (err, rows) => {
        if (err) { console.error("Erreur DB GET /api/commandes:", err.message); res.status(500).json({ error: err.message }); }
        else { console.log(`GET /api/commandes: ${rows ? rows.length : 0} commandes trouvées.`); res.json(rows || []); }
    });
});

app.post('/api/commandes', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`--- POST /api/commandes (User ${userId}) ---`, req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire } = req.body;
    if (!prix_total || !date_commande) { console.warn("POST /api/commandes: Données invalides reçues."); return res.status(400).json({ error: 'Données invalides : prix_total et date_commande sont requis.' }); }
    
    let articlesJson = null;
    try {
        if (articles && typeof articles === 'object') articlesJson = JSON.stringify(articles);
        else if (typeof articles === 'string') { try { JSON.parse(articles); articlesJson = articles; } catch (e) { articlesJson = JSON.stringify([]); } }
        else articlesJson = JSON.stringify([]);
    } catch (e) { console.error("Erreur stringify articles:", e); articlesJson = JSON.stringify([]); }
    
    db.run("INSERT INTO commandes (telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [telephone || null, nom_prenom || null, adresse || null, type_livraison || null, articlesJson, parseFloat(prix_total), date_commande, date_livraison || null, etat || 'En préparation', commentaire || null, userId], function(err) {
        if (err) { console.error("Erreur DB POST /api/commandes:", err.message); res.status(500).json({ error: err.message }); }
        else { console.log(`POST /api/commandes: Nouvelle commande insérée (ID: ${this.lastID}).`); res.status(201).json({ id: this.lastID, ...req.body, articles: JSON.parse(articlesJson) }); }
    });
});

app.put('/api/commandes/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const commandeId = req.params.id;
  console.log(`--- PUT /api/commandes/${commandeId} (User ${userId}) ---`, req.body);
  if (!db) return res.status(503).json({ error: "Service DB non disponible." });

  const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat: newEtat, commentaire } = req.body;

  // Conversion des articles en JSON
  let articlesJson = null;
  try {
        if (articles && typeof articles === 'object') articlesJson = JSON.stringify(articles);
        else if (typeof articles === 'string') { try { JSON.parse(articles); articlesJson = articles; } catch (e) { articlesJson = JSON.stringify([]); } }
        else articlesJson = JSON.stringify([]);
  } catch (e) { console.error("Erreur stringify articles:", e); articlesJson = JSON.stringify([]); }

  // --- NOUVEAU : Récupérer l'état actuel AVANT la mise à jour ---
  let oldCommandeData;
  try {
    oldCommandeData = await new Promise((resolve, reject) => {
      // Ajout de "AND user_id = ?"
      db.get('SELECT "articles", "etat" FROM "commandes" WHERE "id" = ? AND "user_id" = ?', [commandeId, userId], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Commande non trouvée ou non autorisée.'));
        resolve(row);
      });
    });
  } catch (err) {
    console.error(`Erreur DB GET avant PUT /api/commandes/${commandeId}:`, err.message);
    return res.status(err.message.includes('non trouvée') ? 404 : 500).json({ error: err.message });
  }
  const oldEtat = oldCommandeData.etat;
  const articlesAnciensJson = oldCommandeData.articles;
  // --- FIN Récupération état ---

  // --- Mise à jour de la commande (requête principale) ---
  // Ajout de "AND user_id = ?"
  db.run(`UPDATE "commandes" SET "telephone" = ?, "nom_prenom" = ?, "adresse" = ?, "type_livraison" = ?, "articles" = ?, "prix_total" = ?, "date_commande" = ?, "date_livraison" = ?, "etat" = ?, "commentaire" = ? WHERE "id" = ? AND "user_id" = ?`,
    [telephone || null, nom_prenom || null, adresse || null, type_livraison || null, articlesJson, parseFloat(prix_total), date_commande, date_livraison || null, newEtat, commentaire || null, commandeId, userId],
    async function(err) {
      if (err) {
        console.error(`Erreur DB UPDATE /api/commandes/${commandeId}:`, err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        // Devrait être impossible si l'étape précédente a réussi, mais par sécurité
        console.warn(`PUT /api/commandes/${commandeId}: Commande non trouvée (ou non autorisée) lors de la mise à jour.`);
        return res.status(404).json({ message: "Commande non trouvée ou non autorisée" });
      }

      console.log(`PUT /api/commandes/${commandeId}: Commande mise à jour.`);

      // --- Logique de mise à jour du stock (MAJ SÉCURITÉ) ---
      const doitDecrementerStock =
        (newEtat === 'prêt a livrer' || newEtat === 'envoyé') &&
        oldEtat !== 'prêt a livrer' && oldEtat !== 'envoyé';

      if (doitDecrementerStock) {
        console.log(`Commande ${commandeId}: Passage à "${newEtat}". Décrémentation stock (User ${userId})...`);
        try {
          const articlesCommande = JSON.parse(articlesAnciensJson || '[]');
          if (!Array.isArray(articlesCommande)) {
            throw new Error("Format des articles invalide.");
          }

          for (const article of articlesCommande) {
            const { nom, couleur, taille, style, quantite: qteCommandee } = article;
            if (!nom || !couleur || qteCommandee === undefined || isNaN(parseInt(qteCommandee)) || parseInt(qteCommandee) <= 0) {
              console.warn(`Article invalide ignoré dans commande ${commandeId}:`, article);
              continue;
            }

            const qteADeduire = parseInt(qteCommandee);
            const tailleFinal = taille ? taille : null;
            const styleFinal = style ? style : null;

            // Ajout de "AND user_id = ?"
            // S'assure qu'on décrémente le stock DU BON UTILISATEUR
            const sqlUpdateStock = `
              UPDATE "stock_items"
              SET "quantite" = "quantite" - ?
              WHERE "nom" = ?
                AND "couleur" = ?
                AND ("taille" = ? OR ("taille" IS NULL AND ? IS NULL))
                AND ("style" = ? OR ("style" IS NULL AND ? IS NULL))
                AND "quantite" >= ?
                AND "user_id" = ? 
            `;
            const paramsUpdateStock = [
              qteADeduire,
              nom,
              couleur,
              tailleFinal, tailleFinal,
              styleFinal, styleFinal,
              qteADeduire,
              userId // <-- SÉCURITÉ
            ];

            console.log("Exécution SQL Update Stock:", sqlUpdateStock, paramsUpdateStock);

            await new Promise((resolve) => {
              db.run(sqlUpdateStock, paramsUpdateStock, function(errUpdateStock) {
                if (errUpdateStock) {
                  console.error(`Erreur DB UPDATE Stock (Cmd ${commandeId}):`, errUpdateStock.message);
                } else if (this.changes === 0) {
                  console.warn(`Stock non mis à jour pour ${nom}/${couleur} (Cmd ${commandeId}, User ${userId}). Stock insuffisant ou article non trouvé.`);
                } else {
                  console.log(`Stock mis à jour pour ${nom}/${couleur} (Cmd ${commandeId}): -${qteADeduire}`);
                }
                resolve();
              });
            });
          }
          console.log(`Commande ${commandeId}: MàJ stock terminée.`);
        } catch (parseOrUpdateError) {
          console.error(`Erreur MàJ stock pour commande ${commandeId}:`, parseOrUpdateError);
        }
      }
      // --- FIN Logique stock ---

      res.json({ id: commandeId, ...req.body, articles: JSON.parse(articlesJson) });
    }
  ); // Fin db.run UPDATE commandes
});

// ... dans la section API Commandes ...

app.delete('/api/commandes/:id', authenticateToken, (req, res) => {
     const userId = req.user.id;
     const commandeId = req.params.id;
     console.log(`--- DELETE /api/commandes/${commandeId} (User ${userId}) ---`);
     if (!db) return res.status(503).json({ error: "Service DB non disponible." });
     
     db.run(`DELETE FROM "commandes" WHERE "id" = ? AND "user_id" = ?`, [commandeId, userId], function(err) {
        if (err) { console.error(`Erreur DB DELETE /api/commandes/${commandeId}:`, err.message); res.status(500).json({ error: err.message }); }
        else if (this.changes === 0) { console.warn(`DELETE /api/commandes/${commandeId}: Commande non trouvée ou non autorisée.`); res.status(404).json({ message: "Commande non trouvée ou non autorisée" }); }
        // Le "T" a été supprimé de la ligne suivante
        else { console.log(`DELETE /api/commandes/${commandeId}: Commande supprimée.`); res.status(200).json({ message: "Commande supprimée" }); }
    });
});
// --- FIN API Commandes ---


// --- API Utilisateurs (SÉCURISÉE AVEC JWT ET BCRYPT) ---

app.post('/api/register', (req, res) => {
  console.log("--- Requête reçue sur /api/register ---");
  const { username, password } = req.body;

  if (!db) return res.status(503).json({ message: "Service DB non disponible."});
  if (!username || !password) return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });

  // 1. Vérifier si l'utilisateur existe déjà
  const sqlCheck = `SELECT id FROM utilisateurs WHERE username = ?`;
  db.get(sqlCheck, [username], (err, row) => {
    if (err) {
      console.error("Erreur DB register (check):", err.message);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    if (row) {
      console.warn(`Register échoué : Utilisateur "${username}" existe déjà.`);
      return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });
    }

    // 2. Hacher le mot de passe et insérer l'utilisateur
    console.log(`Hachage du mot de passe pour ${username}...`);
    bcrypt.hash(password, saltRounds, (errHash, hash) => {
      if (errHash) {
        console.error("Erreur bcrypt hash:", errHash);
        return res.status(500).json({ message: "Erreur lors de la création du compte." });
      }

      const sqlInsert = `INSERT INTO utilisateurs (username, password) VALUES (?, ?)`;
      db.run(sqlInsert, [username, hash], function(errInsert) {
        if (errInsert) {
          console.error("Erreur DB register (insert):", errInsert.message);
          return res.status(500).json({ message: "Erreur lors de l'enregistrement." });
        }
        console.log(`Utilisateur ${username} (ID: ${this.lastID}) créé avec succès.`);
        res.status(201).json({ message: 'Compte créé avec succès !', userId: this.lastID });
      });
    });
  });
});

app.post('/api/login', (req, res) => {
  console.log("--- Requête reçue sur /api/login ---");
  const { username, password } = req.body;
  if (!db) { console.error("Login échoué : DB non prête."); return res.status(503).json({ message: "Service de base de données non disponible."}); }
  if (!username || !password) { console.warn("Login échoué : Données username/password manquantes."); return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' }); }
  
  const sql = `SELECT * FROM utilisateurs WHERE username = ?`;
  console.log(`Exécution SQL: ${sql} avec username = ${username}`);
  
  db.get(sql, [username], (err, user) => {
      if (err) { console.error("Erreur DB pendant la requête SELECT:", err.message); return res.status(500).json({ message: "Erreur serveur lors de la recherche utilisateur." }); }
      if (!user) { console.warn(`Login échoué : Utilisateur "${username}" non trouvé.`); return res.status(401).json({ message: 'Identifiants incorrects' }); }
      
      console.log(`Utilisateur trouvé. Comparaison mdp pour "${username}"...`);
      
      bcrypt.compare(password, user.password, (errCompare, isMatch) => {
        if (errCompare) {
          console.error("Erreur bcrypt.compare:", errCompare);
          return res.status(500).json({ message: "Erreur serveur lors de la connexion." });
        }

        if (isMatch) {
          console.log(`Mot de passe correct pour "${username}". Création du token.`);
          
          // Création du Token
          const payload = { id: user.id, username: user.username };
          const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: '24h' });
          
          // Renvoie le token et les infos utilisateur
          res.status(200).json({ 
              message: 'Connexion réussie', 
              token: token, 
              user: { 
                id: user.id, 
                username: user.username, 
                google_sheet_url: user.google_sheet_url 
              } 
          });
        
        } else {
          console.warn(`Login échoué : Mot de passe incorrect pour "${username}".`);
          res.status(401).json({ message: 'Identifiants incorrects' });
        }
      });
  });
});

// Met à jour l'URL du sheet pour l'utilisateur connecté
app.put('/api/user/sheet', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { google_sheet_url } = req.body;
    console.log(`--- PUT /api/user/sheet (User ${userId}) ---`);
    
    if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
    if (google_sheet_url === undefined) { console.warn("PUT /api/user/sheet: URL manquante."); return res.status(400).json({ error: "URL de sheet requise." }); }

    const sql = `UPDATE utilisateurs SET google_sheet_url = ? WHERE id = ?`;
    db.run(sql, [google_sheet_url, userId], function(err) {
        if (err) { console.error(`Erreur DB PUT /api/user/sheet pour ${userId}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." }); }
        if (this.changes === 0) { console.warn(`PUT /api/user/sheet: Utilisateur ID ${userId} non trouvé.`); return res.status(404).json({ message: "Utilisateur non trouvé." }); }
        console.log(`URL Google Sheet mise à jour pour User ${userId}.`);
        res.json({ message: "Lien Google Sheet mis à jour avec succès." });
    });
});
// --- FIN API Utilisateurs ---


// --- API Google Sheet Data (MODIFIÉE POUR LIRE LE 1ER ONGLET) ---

// Fonction helper MODIFIÉE : récupère l'ID ET le nom du 1er onglet
async function getSheetInfoForUser(userId) {
  console.log(`Recherche URL Sheet pour User ${userId}...`);
  const user = await new Promise((resolve, reject) => {
    db.get("SELECT google_sheet_url FROM utilisateurs WHERE id = ?", [userId], (err, row) => {
      if (err) return reject(new Error("Erreur DB: " + err.message));
      resolve(row);
    });
  });

  if (!user || !user.google_sheet_url) {
    console.warn(`User ${userId} n'a pas d'URL de Google Sheet.`);
    throw new Error('Aucun lien Google Sheet configuré pour cet utilisateur.');
  }

  const userSheetUrl = user.google_sheet_url;
  console.log(`URL trouvée: ${userSheetUrl}`);
  
  const match = userSheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    console.error(`URL Google Sheet invalide: ${userSheetUrl}`);
    throw new Error('URL Google Sheet invalide.');
  }
  
  const dynamicSpreadsheetId = match[1];

  // --- NOUVELLE ÉTAPE : Récupérer le nom du premier onglet ---
  console.log(`Récupération des métadonnées du Sheet ID: ${dynamicSpreadsheetId}`);
  let firstSheetName;
  try {
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId: dynamicSpreadsheetId,
    });
    if (!metadataResponse.data.sheets || metadataResponse.data.sheets.length === 0) {
      throw new Error("Le fichier Google Sheet est vide (aucun onglet).");
    }
    // On prend le nom (title) du premier onglet (index 0)
    firstSheetName = metadataResponse.data.sheets[0].properties.title;
    console.log(`Le premier onglet s'appelle: "${firstSheetName}"`);
  } catch (err) {
    console.error("Erreur lors de la récupération des métadonnées du sheet:", err.message);
    if (err.message.includes('permission')) {
      throw new Error("Permission refusée pour lire les métadonnées du Sheet.");
    }
    throw new Error("Impossible de lire la structure du Google Sheet.");
  }
  // --- FIN NOUVELLE ÉTAPE ---

  return { 
    spreadsheetId: dynamicSpreadsheetId, 
    sheetName: firstSheetName // On retourne l'ID et le nom
  };
}

function normalizeStatus(str) {
  return (str || '')
    .trim()
  	 .toLowerCase()
  	 .replace(/[àâä]/g, 'a')
  	 .replace(/[éèêë]/g, 'e') 
  	 .replace(/[ôö]/g, 'o')
  	 .replace(/[îï]/g, 'i')
  	 .replace(/[ûü]/g, 'u')
  	 .replace(/ç/g, 'c');
}

function transformHeaders(headerRow) {
  return (headerRow || []).map(header =>
  	 String(header || '')
  	 	 .trim().toLowerCase().replace(/[\s/()]+/g, '_')
  	 	 .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[îï]/g, 'i')
  	 	 .replace(/[ôö]/g, 'o').replace(/[ûü]/g, 'u').replace(/ç/g, 'c')
  	 	 .replace(/^_+|_+$/g, '').replace(/[^a-z0-9_]/g, '')
  );
}

function columnIndexToLetter(index) {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
  	 letter = String.fromCharCode((temp % 26) + 65) + letter;
  	 temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

function getTodayDateString() {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0'); // Mois est 0-indexé
  const y = today.getFullYear();
  return `${d}/${m}/${y}`; // Format: 31/10/2025
}
// comtalab/index.js

// (Ton dictionnaire PRIX_WILAYAS, articleDetails, BUNDLES, etc. sont au-dessus et ne changent pas)
// (Tes helpers parseArticleCost, normalizeStatus, etc. ne changent pas)

// --- API POUR LES RÉSUMÉS FINANCIERS (MODIFIÉE POUR LIRE SQLITE) ---
app.get('/api/financial-summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { filter = 'actifs' } = req.query; 
  console.log(`--- GET /api/financial-summary (User ${userId}, Filtre: ${filter}) ---`);
  if (!db) return res.status(503).json({ error: "Service DB non disponible." });

  // --- CHANGEMENT MAJEUR : On lit la base de données locale ---
  let sql = `SELECT prix_total, type_livraison, adresse, articles, etat FROM commandes WHERE user_id = ?`;
  const params = [userId];

  // Construit la clause WHERE en fonction du filtre
  const statutsActifsRaw = ['En préparation', 'Confirmé', 'Prêt à Livrer', 'Echange'];
  const normalizedStatutsActifs = statutsActifsRaw.map(s => normalizeStatus(s));
  const normalizedFilter = normalizeStatus(filter);

  if (normalizedFilter === 'tous') {
  	 sql += ` AND etat != 'Annulé' AND etat != 'Non confirmé'`;
  } else if (normalizedFilter === 'actifs') {
  	 // Crée des '?' pour chaque statut actif
  	 sql += ` AND etat IN (${normalizedStatutsActifs.map(() => '?').join(',')})`;
  	 params.push(...normalizedStatutsActifs);
  } else {
  	 sql += ` AND etat = ?`;
  	 params.push(normalizedFilter); // Le filtre est déjà normalisé (ex: 'pret a livrer')
  }
  // --- FIN CHANGEMENT MAJEUR ---

  db.all(sql, params, (err, commandes) => {
  	 if (err) {
  	 	 console.error("Erreur DB GET /api/financial-summary:", err.message);
  	 	 return res.status(500).json({ error: err.message });
  	 }

  	 if (!commandes || commandes.length === 0) {
  	 	 return res.json({ totalCommandes: 0, totalLivraison: 0, totalCoutArticles: 0, gainPotentiel: 0 });
  	 }

  	 // Le reste de la logique de calcul est identique
  	 let totalCommandes = 0;
  	 let totalLivraison = 0;
  	 let totalCoutArticles = 0; 
  	 
  	 for (const cmd of commandes) {
  	 	 const prix_total = parseFloat(cmd.prix_total) || 0;
  	 	 const typeLivraison = (cmd.type_livraison || 'autre').toLowerCase().trim();
  	 	 const adresseText = (cmd.adresse || '').toLowerCase(); 
  	 	 const articlesText = (cmd.articles || ''); // (Doit être du JSON string, mais le parser s'en charge)
     
  	 	 totalCommandes += prix_total;
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

  	 console.log(`Gain Net (Filtre: ${filter}): ${totalCommandes} (Ventes) - ${totalLivraison} (Livraison) - ${totalCoutArticles} (Coût) = ${gainNetPotentiel}`);

  	 res.json({
  	 	 totalCommandes,
  	 	 totalLivraison,
  	 	 totalCoutArticles,
  	 	 gainPotentiel: gainNetPotentiel
  	 });
  });
});


// comtalab/index.js

// REMPLACE l'ancienne route /api/dashboard-summary par celle-ci
app.get('/api/dashboard-summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(`--- GET /api/dashboard-summary (User ${userId}) ---`);
  if (!db || !sheets) return res.status(503).json({
    error: "Services non disponibles."
  });

  let totalStockValue = 0;
  let totalPotentialGain = 0; // Renommé (ce n'est plus juste 'aujourd'hui')

  const salesCounts = {};
  const wilayaSalesCounts = {};

  try {
    // --- 1. Calculer la Valeur Totale du Stock (depuis SQLite) ---
    const stockSql = `SELECT SUM(quantite * prix) as totalValue FROM stock_items WHERE user_id = ?`;
    const stockData = await new Promise((resolve, reject) => {
      db.get(stockSql, [userId], (err, row) => {
        if (err) return reject(new Error(`Erreur DB Stock: ${err.message}`));
        resolve(row);
      });
    });
    totalStockValue = stockData.totalValue || 0;

    // --- 2. Lire le Google Sheet pour les Gains et le Top 5 ---
    const sheetInfo = await getSheetInfoForUser(userId);
    const dynamicRangeRead = `'${sheetInfo.sheetName}'!A:J`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetInfo.spreadsheetId,
      range: dynamicRangeRead
    });

    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      return res.json({
        totalStockValue,
        todaysPotentialGain: 0,
        topCategories: [],
        topWilayas: []
      });
    }

    // Analyser les en-têtes
    const headers = rows[0];
    const transformedHeaders = transformHeaders(headers);
    const prixIndex = transformedHeaders.indexOf('prix_total');
    const typeLivraisonIndex = transformedHeaders.indexOf('type_de_livraison');
    const etatIndex = transformedHeaders.indexOf('etat_de_livraison');
    const articlesIndex = transformedHeaders.indexOf('articles');
    const dtfIndex = transformedHeaders.indexOf('dtf');
    // (dateCommandeIndex n'est plus nécessaire ici)
    let adresseIndex = transformedHeaders.indexOf('adresse');
    if (adresseIndex === -1) {
      adresseIndex = transformedHeaders.indexOf('wilaya_commune_et_adresse_nom_du_bureau');
    }

    // On vérifie si les colonnes critiques existent
    if ([prixIndex, typeLivraisonIndex, etatIndex, adresseIndex, articlesIndex].includes(-1)) {
      console.warn("Avertissement Dashboard: Colonnes manquantes.");
    } else {

      // Statuts pour le gain (Confirmé, Prêt à livrer) - SANS ACCENTS
      const statutsGain = ['confirme', 'pret a livrer'];

      let totalCommandesGain = 0,
        totalLivraisonGain = 0,
        totalCoutArticlesGain = 0,
        totalDTFGain = 0;

      const commandesData = rows.slice(1);

      for (const row of commandesData) {
        const etatNormalized = normalizeStatus(row[etatIndex]);
        const adresseText = (row[adresseIndex] || '').toLowerCase();

        // --- Comptage (Top 3 et Top 5) ---
        // (Se fait sur toutes les commandes non-annulées)
        if (etatNormalized !== 'annulé' && etatNormalized !== 'non confirmé') {
          const articlesText = (row[articlesIndex] || '').toLowerCase();
          let articleCompté = false;

          // (Logique de comptage des lots - inchangée)
          for (const bundleKey in BUNDLES) {
            const bundle = BUNDLES[bundleKey];
            for (const nom of bundle.names) {
              if (articlesText.includes(nom)) {
                salesCounts[bundleKey] = (salesCounts[bundleKey] || 0) + 1;
                articleCompté = true;
                break;
              }
            }
            if (articleCompté) break;
          }

          // (Logique de comptage des articles - inchangée)
          if (!articleCompté) {
            for (const articleKey in articleDetails) {
              if (articleKey === 'autre') continue;
              let allNames = [articleKey, ...articleDetails[articleKey].aliases];
              for (const nom of allNames) {
                if (articlesText.includes(nom)) {
                  salesCounts[articleKey] = (salesCounts[articleKey] || 0) + 1;
                  articleCompté = true;
                  break;
                }
              }
              if (articleCompté) break;
            }
          }

          // (Logique de comptage des wilayas - inchangée)
          let wilayaTrouvee = false;
          for (const wilayaKey in PRIX_WILAYAS) {
            if (wilayaKey === 'defaut') continue;
            const wilayaData = PRIX_WILAYAS[wilayaKey];
            for (const nom of wilayaData.names) {
              if (adresseText.includes(nom)) {
                wilayaSalesCounts[wilayaKey] = (wilayaSalesCounts[wilayaKey] || 0) + 1;
                wilayaTrouvee = true;
                break;
              }
            }
            if (wilayaTrouvee) break;
          }
          if (!wilayaTrouvee && adresseText.length > 2) {
            wilayaSalesCounts['inconnu'] = (wilayaSalesCounts['inconnu'] || 0) + 1;
          }
        }

        // --- Calcul du "Gain" (MODIFIÉ) ---
        // On ne vérifie plus la date, juste le statut
        if (statutsGain.includes(etatNormalized)) {
          const prix_total = parseFloat(row[prixIndex]) || 0;
          const typeLivraison = (row[typeLivraisonIndex] || 'autre').toLowerCase().trim();
          const articlesText = (row[articlesIndex] || '');
          const dtfValue = (dtfIndex !== -1) ? (parseFloat(row[dtfIndex]) || 0) : 0;

          totalCommandesGain += prix_total;
          totalCoutArticlesGain += parseArticleCost(articlesText);
          totalDTFGain += dtfValue;

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
          totalLivraisonGain += coutLivraison;
        }
      }
      totalPotentialGain = totalCommandesGain - totalLivraisonGain - totalCoutArticlesGain - totalDTFGain;
    }

    // --- 3. Finaliser le Top 3 (inchangé) ---
    const topCategories = Object.entries(salesCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([key, count]) => {
        let displayName = key;
        if (BUNDLES[key]) {
          displayName = BUNDLES[key].names[0];
        } else if (articleDetails[key]) {
          displayName = articleDetails[key].display;
        }
        return {
          name: displayName,
          count
        };
      });

    // --- 4. Finaliser le Top 5 Wilayas (inchangé) ---
    const topWilayas = Object.entries(wilayaSalesCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([key, count]) => {
        const displayName = key.charAt(0).toUpperCase() + key.slice(1);
        return {
          name: displayName,
          count
        };
      });

    // --- 5. Envoyer la réponse complète ---
    console.log(`Dashboard Summary: Stock=${totalStockValue}, Gain (Confirmé/Prêt)=${totalPotentialGain}, Top 3=${JSON.stringify(topCategories)}, Top Wilayas=${JSON.stringify(topWilayas)}`);
    res.json({
      totalStockValue,
      todaysPotentialGain: totalPotentialGain, // On garde le nom de variable
      topCategories,
      topWilayas
    });

  } catch (err) {
    console.error("Erreur GET /api/dashboard-summary:", err.message);
    res.status(500).json({
      error: err.message
    });
  }
});

// comtalab/index.js

// REMPLACE l'ancienne route /api/import-sheets par celle-ci
app.post('/api/import-sheets', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(`--- POST /api/import-sheets (User ${userId}) ---`);
  if (!db || !sheets) return res.status(503).json({ error: "Services non disponibles." });

  let sheetInfo;
  let rows;

  // 1. Lire Google Sheets
  try {
    sheetInfo = await getSheetInfoForUser(userId);
    const dynamicRangeRead = `'${sheetInfo.sheetName}'!A:J`; 
    console.log(`Lecture de ${dynamicRangeRead} pour importation...`);
    const response = await sheets.spreadsheets.values.get({ 
      spreadsheetId: sheetInfo.spreadsheetId,
      range: dynamicRangeRead 
    });
    rows = response.data.values;
    if (!rows || rows.length < 2) {
  	 	 return res.status(404).json({ message: 'Aucune donnée trouvée dans le Google Sheet.' });
  	 }
  } catch (err) {
  	 return res.status(500).json({ error: `Erreur lecture Google Sheet: ${err.message}` });
  }

  // 2. Analyser les en-têtes
  const headers = rows[0];
  const transformedHeaders = transformHeaders(headers);
  
  const indices = {
    telephone: transformedHeaders.indexOf('numero_de_telephone'),
    nom_prenom: transformedHeaders.indexOf('nom_prenom'),
    adresse: transformedHeaders.indexOf('adresse') !== -1 ? transformedHeaders.indexOf('adresse') : transformedHeaders.indexOf('wilaya_commune_et_adresse_nom_du_bureau'),
    type_livraison: transformedHeaders.indexOf('type_de_livraison'),
    articles: transformedHeaders.indexOf('articles'),
    prix_total: transformedHeaders.indexOf('prix_total'),
    date_commande: transformedHeaders.indexOf('date_commande'),
    date_livraison: transformedHeaders.indexOf('date_a_livre_si_cest_reporte'),
    etat: transformedHeaders.indexOf('etat_de_livraison'),
    commentaire: transformedHeaders.indexOf('commentaire')
  };
  
  if (indices.prix_total === -1 || indices.etat === -1 || indices.date_commande === -1) {
  	 return res.status(400).json({ error: 'Colonnes critiques manquantes (prix_total, etat_de_livraison, date_commande) dans votre Sheet.' });
  }
  
  // 3. Commencer la transaction de base de données
  db.serialize(() => {
  	 db.run('BEGIN TRANSACTION;', [], async (err) => {
  	 	 if (err) return res.status(500).json({ error: `DB Transaction: ${err.message}` });
  	 });

  	 // 4. Nettoyer les anciennes commandes
  	 console.log(`Nettoyage des anciennes commandes pour User ${userId}...`);
  	 db.run(`DELETE FROM commandes WHERE user_id = ?`, [userId]);

  	 // 5. Préparer l'insertion
  	 const sqlInsert = `INSERT INTO commandes (telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  	 const stmt = db.prepare(sqlInsert);

  	 const commandesData = rows.slice(1);
  	 let importCount = 0;

  	 // 6. Insérer chaque ligne
  	 for (const row of commandesData) {
  	 	 const prix = parseFloat(row[indices.prix_total]) || 0;
  	 	 // *** CORRECTION ICI : On normalise le statut avant de le sauvegarder ***
  	 	 const etat = normalizeStatus(row[indices.etat] || 'en preparation'); 
  	 	 const date_cmd = (row[indices.date_commande] || '').trim();
  	 	 
  	 	 if (prix === 0 || date_cmd === '') continue; 

  	 	 stmt.run(
  	 	 	 row[indices.telephone] || null,
  	 	 	 row[indices.nom_prenom] || null,
  	 	 	 row[indices.adresse] || null,
  	 	 	 row[indices.type_livraison] || null,
  	 	 	 row[indices.articles] || null, 
  	 	 	 prix,
  	 	 	 date_cmd,
  	 	 	 row[indices.date_livraison] || null,
  	 	 	 etat, // L'état est maintenant propre (ex: "pret a livrer")
  	 	 	 row[indices.commentaire] || null,
  	 	 	 userId
  	 	 );
  	 	 importCount++;
  	 }

  	 // 7. Finaliser
  	 stmt.finalize();
  	 db.run('COMMIT;', [], (err) => {
  	 	 if (err) {
  	 	 	 console.error("Erreur COMMIT importation:", err.message);
  	 	 	 return res.status(500).json({ error: `Erreur finalisation: ${err.message}` });
  	 	 }
  	 	 console.log(`Importation réussie: ${importCount} commandes importées pour User ${userId}.`);
  	 	 res.status(201).json({ message: `Importation réussie: ${importCount} commandes ont été synchronisées.` });
  	 });
  });
});


// --- API Google Sheet Data (MODIFIÉE POUR ÊTRE PLUS LÉGÈRE) ---
// Cette route ne sert plus qu'à AFFICHER la liste et CHANGER LE STATUT.
// Elle ne fait plus de calculs.
app.get('/api/sheet-data', authenticateToken, async (req, res) => {
    console.log(`--- GET /api/sheet-data (User ${req.user.id}) ---`);
    if (!sheets) { return res.status(503).json({ error: 'Service Google Sheets non disponible.' }); }

    let sheetInfo
    try {
      sheetInfo = await getSheetInfoForUser(req.user.id);
    } catch (err) {
      if (err.message.includes('Aucun lien')) return res.status(404).json({ error: err.message });
      if (err.message.includes('invalide')) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }
    
    const dynamicRangeRead = `'${sheetInfo.sheetName}'!A:J`;

    try {
        console.log(`Lecture Google Sheet ID: ${sheetInfo.spreadsheetId}, Range: ${dynamicRangeRead}`);
        const response = await sheets.spreadsheets.values.get({ 
            spreadsheetId: sheetInfo.spreadsheetId, 
          	 range: dynamicRangeRead 
        });
        const rows = response.data.values;
        console.log(`GET /api/sheet-data: ${rows ? rows.length : 0} lignes récupérées.`);
        res.json(rows || []);
    } catch (err) {
        console.error('Erreur API Google Sheets GET /api/sheet-data:', err.message);
        res.status(500).json({ error: 'Impossible de récupérer les données depuis Google Sheets.' });
    }
});

app.put('/api/sheet-data/update-status', authenticateToken, async (req, res) => {
  // (Cette route est inchangée, elle est parfaite)
  // ... (ton code existant pour update-status)
});
// --- FIN API Google Sheet ---

app.get('/api/sheet-data', authenticateToken, async (req, res) => {
    console.log(`--- GET /api/sheet-data (User ${req.user.id}) ---`);
    if (!sheets) { /* ... (inchangé) ... */ }

    let sheetInfo;
    try {
      // On récupère l'ID et le nom du premier onglet
      sheetInfo = await getSheetInfoForUser(req.user.id);
    } catch (err) {
      // ... (gestion des erreurs 404, 400, etc. inchangée) ...
      if (err.message.includes('Aucun lien')) return res.status(404).json({ error: err.message });
      if (err.message.includes('invalide')) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }

    // On construit le range dynamiquement avec le nom du 1er onglet
    const dynamicRangeRead = `'${sheetInfo.sheetName}'!A:J`;

    try {
        console.log(`Lecture Google Sheet ID: ${sheetInfo.spreadsheetId}, Range: ${dynamicRangeRead}`);
        const response = await sheets.spreadsheets.values.get({ 
            spreadsheetId: sheetInfo.spreadsheetId, // Utilise l'ID dynamique
            range: dynamicRangeRead // Utilise le range dynamique
        });
        const rows = response.data.values;
        console.log(`GET /api/sheet-data: ${rows ? rows.length : 0} lignes récupérées.`);
        res.json(rows || []);
    } catch (err) {
        console.error('Erreur API Google Sheets GET /api/sheet-data:', err.message);
        // Si on a cette erreur, c'est que l'onglet trouvé n'a pas les colonnes A:J
        if (err.message.includes('Unable to parse range')) {
          console.error(`--> Erreur: L'onglet "${sheetInfo.sheetName}" n'a pas pu être lu. Est-ce le bon onglet ?`);
          return res.status(400).json({ error: `Erreur: L'onglet "${sheetInfo.sheetName}" est invalide.` });
        }
        res.status(500).json({ error: 'Impossible de récupérer les données depuis Google Sheets.' });
    }
});

app.put('/api/sheet-data/update-status', authenticateToken, async (req, res) => {
    console.log(`--- PUT /api/sheet-data/update-status (User ${req.user.id}) ---`);
    if (!sheets) { return res.status(503).json({ error: 'Service Google Sheets non disponible.' }); }
    
    const { rowIndex, newStatus } = req.body;
    if (!rowIndex || typeof rowIndex !== 'number' || rowIndex < 2 || !newStatus || typeof newStatus !== 'string') { 
      return res.status(400).json({ error: 'Index de ligne (rowIndex >= 2) et nouveau statut (newStatus) requis.' }); 
    }

    let sheetInfo;
    try {
      sheetInfo = await getSheetInfoForUser(req.user.id);
    } catch (err) {
      if (err.message.includes('Aucun lien')) return res.status(404).json({ error: err.message });
      if (err.message.includes('invalide')) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }

    // --- NOUVELLE LOGIQUE DYNAMIQUE ---
    let dynamicStatusColumnLetter;
    try {
      // 1. Lire la première ligne (les en-têtes)
      const headerRange = `'${sheetInfo.sheetName}'!1:1`;
      console.log(`Lecture des en-têtes (Range: ${headerRange}) pour trouver la colonne état...`);
      const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetInfo.spreadsheetId,
        range: headerRange,
      });

      const headers = headerResponse.data.values[0];
      if (!headers || headers.length === 0) {
        throw new Error("La première ligne (en-têtes) du Sheet est vide.");
      }

      // 2. Transformer les en-têtes et trouver l'index
      const transformedHeaders = transformHeaders(headers);
      const statusKey = 'etat_de_livraison';
      const statusIndex = transformedHeaders.findIndex(h => h === statusKey);

      if (statusIndex === -1) {
        console.error(`Colonne "${statusKey}" non trouvée dans les en-têtes:`, transformedHeaders);
        throw new Error(`Colonne "etat_de_livraison" non trouvée dans votre Google Sheet.`);
      }

      // 3. Convertir l'index (ex: 7) en lettre (ex: 'H')
      dynamicStatusColumnLetter = columnIndexToLetter(statusIndex);
      console.log(`La colonne "${statusKey}" a été trouvée à l'index ${statusIndex} (Colonne ${dynamicStatusColumnLetter})`);

    } catch (err) {
      console.error("Erreur lors de la recherche de la colonne état:", err.message);
      return res.status(500).json({ error: err.message });
    }
    // --- FIN DE LA LOGIQUE DYNAMIQUE ---


    // 4. Utiliser la lettre dynamique pour mettre à jour
    const rangeToUpdate = `'${sheetInfo.sheetName}'!${dynamicStatusColumnLetter}${rowIndex}`;
    console.log(`MàJ cellule: ${rangeToUpdate} (Sheet ID: ${sheetInfo.spreadsheetId}) avec valeur: "${newStatus}"`);
    
    try {
        const response = await sheets.spreadsheets.values.update({ 
            spreadsheetId: sheetInfo.spreadsheetId, 
            range: rangeToUpdate, // Utilise le range dynamique
            valueInputOption: 'USER_ENTERED', 
            resource: { values: [[newStatus]] } 
        });
        console.log(`PUT update-status: Succès. Cellule(s) mise(s) à jour: ${response.data.updatedCells}`);
        res.status(200).json({ message: 'Statut mis à jour avec succès.' });
    } catch (err) {
        console.error(`Erreur API Google Sheets PUT update-status (Range: ${rangeToUpdate}):`, err.message);
        res.status(500).json({ error: 'Impossible de mettre à jour le statut dans Google Sheets.' });
    }
});
// --- FIN API Google Sheet ---
const articleDetails = {
  'tshirt': { // <-- Clé simplifiée
    display: 'T-shirt', 
    aliases: ['t shirt', 't-shirt'], // <-- Synonymes
    styles: ['oversize', 'oversize premium', 'regular', 'enfant'], 
    prix: { 'oversize': 950, 'oversize premium': 1150, 'regular': 790, 'enfant': 620 } 
  },
  'hoodie': { 
  	 display: 'Hoodie', 
  	 aliases: ['sweat'], // <-- Synonyme
  	 styles: ['premium', 'enfant', 'standard', 'oversize'], // <-- Corrigé (orma premium -> premium)
  	 prix: { 'premium': 1650, 'enfant': 1300, 'standard': 1260,'oversize': 1600 } 

  },
  'jogging': { 
  	 display: 'Jogging', 
  	 aliases: [],
  	 styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], 
  	 prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } 
  },
  'sac a dos': { 
  	 display: 'Sac à dos', 
  	 aliases: ['sacados', 'sac à dos'], // <-- Synonymes
  	 styles: ['standard', 'premium'], 
  	 prix: { 'standard': 1150, 'premium': 1220 } 
  },
  'autre': { 
  	 display: 'Autre', 
  	 aliases: [],
  	 styles: [], 
  	 prix: {} 
  }
};

// 1. LE DICTIONNAIRE DES PRIX (Ta liste)
const PRIX_WILAYAS = {
  'adrar': {
    names: ['adrar', 'أدرار'],
    prices: { 'a domicile': 1400, 'bureau': 970, 'autre': 970 }
  },
  'chlef': {
    names: ['chlef', 'الشلف'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'laghouat': {
    names: ['laghouat', 'الأغواط'],
    prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 }
  },
  'oumelbouaghi': {
    names: ['oumelbouaghi', 'أم البواقي'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'batna': {
    names: ['batna', 'باتنة'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'bejaia': {
    names: ['bejaia', 'بجاية'],
    prices: { 'a domicile': 750, 'bureau': 520, 'autre': 520 }
  },
  'biskra': {
    names: ['biskra', 'بسكرة'],
    prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 }
  },
  'bechar': {
    names: ['bechar', 'بشار'],
    prices: { 'a domicile': 1100, 'bureau': 720, 'autre': 720 }
  },
  'blida': {
    names: ['blida', 'البليدة'],
    prices: { 'a domicile': 750, 'bureau': 470, 'autre': 470 }
  },
  'bouira': {
    names: ['bouira', 'البويرة'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'tamanrasset': {
    names: ['tamanrasset', 'تمنراست'],
    prices: { 'a domicile': 1500, 'bureau': 1120, 'autre': 1120 }
  },
  'tebessa': {
    names: ['tebessa', 'تبسة'],
    prices: { 'a domicile': 900, 'bureau': 520, 'autre': 520 }
  },
  'tlemcen': {
    names: ['tlemcen', 'تلمسان'],
    prices: { 'a domicile': 850, 'bureau': 570, 'autre': 570 }
  },
  'tiaret': {
    names: ['tiaret', 'تيارت'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'tiziouzou': {
    names: ['tiziouzou', 'tizi ouzou', 'تيزي وزو'], // J'ai ajouté 'tizi ouzou'
    prices: { 'a domicile': 500, 'bureau': 370, 'autre': 370 }
  },
  'alger': {
    names: ['alger', 'الجزائر'],
    prices: { 'a domicile': 700, 'bureau': 470, 'autre': 470 }
  },
  'djelfa': {
    names: ['djelfa', 'الجلفة'],
    prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 }
  },
  'jijel': {
    names: ['jijel', 'جيجل'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'setif': {
    names: ['setif', 'سطيف'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'saida': {
    names: ['saida', 'سعيدة'],
    prices: { 'a domicile': 850, 'bureau': 570, 'autre': 570 }
  },
  'skikda': {
    names: ['skikda', 'سكيكدة'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'sidibelabbes': {
    names: ['sidibelabbes', 'sidi bel abbes', 'سيدي بلعباس'], // J'ai ajouté
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'annaba': {
    names: ['annaba', 'عنابة'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'guelma': {
    names: ['guelma', 'قالمة'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'constantine': {
    names: ['constantine', 'قسنطينة'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'medea': {
    names: ['medea', 'المدية'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'mostaganem': {
    names: ['mostaganem', 'مستغانم'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'msila': {
    names: ['msila', 'المسيلة'],
    prices: { 'a domicile': 850, 'bureau': 570, 'autre': 570 }
  },
  'mascara': {
    names: ['mascara', 'معسكر'],
    prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'ouargla': {
    names: ['ouargla', 'ورقلة'],
  	 prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 }
  },
  'oran': {
    names: ['oran', 'وهران'],
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'elbayadh': {
    names: ['elbayadh', 'البيض'],
  	 prices: { 'a domicile': 1050, 'bureau': 670, 'autre': 670 }
  },
  'illizi': {
    names: ['illizi', 'إليزي'],
  	 prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 }
  },
  'bordjbouarreridj': {
    names: ['bordjbouarreridj', 'bordj bou arreridj', 'برج بوعريريج'], // J'ai ajouté
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'boumerdes': {
    names: ['boumerdes', 'بومرداس'],
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'eltarf': {
  	 names: ['eltarf', 'الطارف'],
  	 prices: { 'a domicile': 850, 'bureau': 520, 'autre': 520 }
  },
  'tindouf': {
  	 names: ['tindouf', 'تندوف'],
  	 prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 }
  },
  'tissemsilt': {
  	 names: ['tissemsilt', 'تيسمسيلت'],
  	 prices: { 'a domicile': 900, 'bureau': 520, 'autre': 520 }
  },
  'eloued': {
  	 names: ['eloued', 'el oued', 'الوادي'], // J'ai ajouté
  	 prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 }
  },
  'khenchela': {
  	 names: ['khenchela', 'خنشلة'],
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'soukahras': {
  	 names: ['soukahras', 'souk ahras', 'سوق أهراس'], // J'ai ajouté
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'tipaza': {
  	 names: ['tipaza', 'تيبازة'],
  	 prices: { 'a domicile': 850, 'bureau': 520, 'autre': 520 }
  },
  'mila': {
  	 names: ['mila', 'ميلة'],
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'aindefla': {
  	 names: ['aindefla', 'ain defla', 'عين الدفلى'], // J'ai ajouté
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'naama': {
  	 names: ['naama', 'النعامة'],
  	 prices: { 'a domicile': 1100, 'bureau': 670, 'autre': 670 }
  },
  'aintemouchent': {
  	 names: ['aintemouchent', 'ain temouchent', 'عين تموشنت'], // J'ai ajouté
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'ghardaia': {
  	 names: ['ghardaia', 'غرداية'],
  	 prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 }
  },
  'relizane': {
  	 names: ['relizane', 'غليزان'],
  	 prices: { 'a domicile': 800, 'bureau': 520, 'autre': 520 }
  },
  'timimoun': {
  	 names: ['timimoun', 'تيميمون'],
  	 prices: { 'a domicile': 1400, 'bureau': 0, 'autre': 0 }
  },
  'bordjbadjimokhtar': {
  	 names: ['bordjbadjimokhtar', 'برج باجي مختار'],
  	 prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 }
  },
  'ouleddjellal': {
  	 names: ['ouleddjellal', 'أولاد جلال'],
  	 prices: { 'a domicile': 950, 'bureau': 620, 'autre': 620 }
  },
  'beniabbes': {
  	 names: ['beniabbes', 'بني عباس'],
  	 prices: { 'a domicile': 1000, 'bureau': 970, 'autre': 970 }
  },
  'insalah': {
  	 names: ['insalah', 'عين صالح'],
  	 prices: { 'a domicile': 1500, 'bureau': 0, 'autre': 0 }
  },
  'inguezzam': {
  	 names: ['inguezzam', 'عين قزام'],
  	 prices: { 'a domicile': 1500, 'bureau': 0, 'autre': 0 }
  },
  'touggourt': {
  	 names: ['touggourt', 'تقرت'],
  	 prices: { 'a domicile': 950, 'bureau': 670, 'autre': 670 }
  },
  'djanet': {
  	 names: ['djanet', 'جانت'],
  	 prices: { 'a domicile': 0, 'bureau': 0, 'autre': 0 }
  },
  'mghair': {
  	 names: ['mghair', 'المغير'],
  	 prices: { 'a domicile': 950, 'bureau': 0, 'autre': 0 }
  },
  'meniaa': {
  	 names: ['meniaa', 'المنيعة'],
  	 prices: { 'a domicile': 1000, 'bureau': 0, 'autre': 0 }
  },
  'defaut': {
    names: [], // Pas de nom pour le défaut
  	 prices: { 'a domicile': 650, 'bureau': 600, 'autre': 600 }
  }
};

const BUNDLES = {
  'ensemble_premium': {
    names: ['ensemble premium', 'pack premium'], // Mots-clés pour ce lot
    cost: 1650 + 1200 // hoodie premium (1650) + jogging (1200)
  },
  'ensemble_standard': {
    names: ['ensemble', 'pack standard', 'ensemble standard'], // 'ensemble' seul = standard
    cost: 1260 + 1200 // hoodie standard (1260) + jogging (1200)
  }
};





// comtalab/index.js

// REMPLACE L'ANCIENNE FONCTION 'parseArticleCost' PAR CELLE-CI
function parseArticleCost(articlesText) {
  if (!articlesText) return 0;
  
  let finalTotalCost = 0;
  
  // 1. Nettoyer le texte
  const cleanedText = articlesText.toLowerCase()
                                    .replace(/\s+et\s+/g, ' + ') 
                                    .replace(/,/g, ' + ');

  // 2. Séparer les articles
  const items = cleanedText.split('+');

  // 3. Boucle sur chaque article
  for (const itemString of items) {
    const text = itemString.trim(); 
    if (text.length === 0) continue;

    let itemCost = 0;
    let itemFound = false;
    let quantity = 1; 
    let textToParse = text;

    // 4. Détecte la quantité (ex: "2 tshirt")
    const qtyMatch = text.match(/^(\d+)\s*x?\s*/); 
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10) || 1;
      textToParse = text.substring(qtyMatch[0].length).trim(); 
    }

    // --- 5. Vérifier les LOTS (Bundles) ---
    const bundleKeysSorted = Object.keys(BUNDLES).sort((a, b) => {
      const longestA = Math.max(...BUNDLES[a].names.map(n => n.length));
      const longestB = Math.max(...BUNDLES[b].names.map(n => n.length));
      return longestB - longestA;
    });

    for (const bundleKey of bundleKeysSorted) {
      const bundle = BUNDLES[bundleKey];
      for (const nom of bundle.names) {
        if (textToParse.includes(nom)) {
          console.log(`Lot trouvé: "${nom}", Coût: ${bundle.cost}`);
          itemCost = bundle.cost;
          itemFound = true;
          break;
        }
      }
      if (itemFound) break;
    }
    
    if (itemFound) {
       finalTotalCost += (itemCost * quantity);
       continue; 
    }

    // --- 6. VÉRIFIER LES ARTICLES SIMPLES ---
    for (const articleKey in articleDetails) {
      if (articleKey === 'autre') continue;
      
      const details = articleDetails[articleKey];
      let allNames = [articleKey, ...(details.aliases || [])];
      let articleFoundInLoop = false;

      for (const nom of allNames) {
        if (textToParse.includes(nom)) {
          articleFoundInLoop = true;
          break;
        }
      }
      
      if (articleFoundInLoop) { // Article trouvé (ex: "hoodie" ou "tshirt")
        let styleTrouve = null;
        let cost = 0;
        
        // *** CORRECTION IMPORTANTE ICI ***
        // Trie les styles du plus long au plus court
        // (ex: "oversize premium" sera trouvé AVANT "oversize")
        const stylesTries = (details.styles || []).sort((a, b) => b.length - a.length);

        for (const styleKey of stylesTries) {
          if (textToParse.includes(styleKey)) { 
            styleTrouve = styleKey; // ex: "oversize"
            cost = details.prix[styleKey] || 0; // 1600 (pour hoodie) ou 950 (pour tshirt)
            break; 
          }
        }
        
        // Cas spécial hoodie enfant (inchangé)
        if (articleKey === 'hoodie' && styleTrouve === 'enfant') {
           if (textToParse.includes(' s ') || textToParse.includes(' m ') || textToParse.includes(' l ') || textToParse.includes(' xl ') || textToParse.includes(' xxl ')) {
             cost = 1650;
           }
        }
        
        // Gère les prix par défaut
        if (!styleTrouve) {
            if (articleKey === 'tshirt' && details.prix['regular']) {
                console.log(`Style non trouvé pour "tshirt", utilisation du prix 'regular'`);
                cost = details.prix['regular']; // 620
                styleTrouve = 'regular';
            } 
            else if (articleKey === 'hoodie' && details.prix['standard']) {
                console.log(`Style non trouvé pour "hoodie", utilisation du prix 'standard'`);
                cost = details.prix['standard']; // 1260
                styleTrouve = 'standard';
            }
            // (Si aucun défaut, cost reste 0)
        }
        
        itemCost = cost;
        console.log(`Article trouvé: "${articleKey}", Style: "${styleTrouve}", Coût: ${cost}`);
        break; 
      }
    } // fin boucle articleDetails
    
    // 7. Ajoute le coût de cet item au total
    finalTotalCost += (itemCost * quantity);
    
  } // fin de la boucle sur les items (après le '+')

  return finalTotalCost; // Retourne la somme de tous les items
}
// REMPLACE l'ancienne route /api/financial-summary par celle-ci
app.get('/api/financial-summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { filter = 'actifs' } = req.query; 

  console.log(`--- GET /api/financial-summary (User ${userId}, Filtre: ${filter}) ---`);
  if (!sheets) return res.status(503).json({ error: "Service Google Sheets non disponible." });

  let sheetInfo;
  let rows;

  // Étape 1: Récupérer les données du Google Sheet
  try {
    sheetInfo = await getSheetInfoForUser(userId);
    const dynamicRangeRead = `'${sheetInfo.sheetName}'!A:J`; 
    const response = await sheets.spreadsheets.values.get({ 
      spreadsheetId: sheetInfo.spreadsheetId,
      range: dynamicRangeRead 
    });
    rows = response.data.values;
    if (!rows || rows.length < 2) {
  	 	 return res.json({ totalCommandes: 0, totalLivraison: 0, totalCoutArticles: 0, gainPotentiel: 0 });
  	 }
  } catch (err) {
  	 console.error("Erreur API Google Sheets GET (pour summary):", err.message);
  	 return res.status(500).json({ error: err.message });
  }

  // Étape 2: Analyser les en-têtes (inchangé)
  const headers = rows[0];
  const transformedHeaders = transformHeaders(headers); 
  const prixIndex = transformedHeaders.indexOf('prix_total');
  const typeLivraisonIndex = transformedHeaders.indexOf('type_de_livraison');
  const etatIndex = transformedHeaders.indexOf('etat_de_livraison');
  const articlesIndex = transformedHeaders.indexOf('articles'); 
  let adresseIndex = transformedHeaders.indexOf('adresse');
  if (adresseIndex === -1) {
      adresseIndex = transformedHeaders.indexOf('wilaya_commune_et_adresse_nom_du_bureau');
  }
  
  if ([prixIndex, typeLivraisonIndex, etatIndex, adresseIndex, articlesIndex].includes(-1)) {
  	 console.error("Erreur: Colonnes manquantes.");
  	 return res.status(400).json({ error: 'Colonnes manquantes (prix_total, type_de_livraison, etat_de_livraison, articles ou adresse) dans votre Google Sheet.' });
  }

  // Étape 3: Calculer les totaux
  const statutsActifsRaw = ['En préparation', 'Confirmé', 'Prêt à Livrer', 'Echange'];
  const normalizedStatutsActifs = statutsActifsRaw.map(s => normalizeStatus(s));

  let totalCommandes = 0;
  let totalLivraison = 0;
  let totalCoutArticles = 0; 
  
  const commandesData = rows.slice(1);
  const normalizedFilter = normalizeStatus(filter); 

  for (const row of commandesData) {
  	 const etatRaw = (row[etatIndex] || '');
  	 const etatNormalized = normalizeStatus(etatRaw); 

  	 // --- LOGIQUE DE FILTRAGE ---
  	 let doitEtreComptee = false;
  	 if (normalizedFilter === 'tous') {
  	 	 if (etatNormalized !== 'annulé' && etatNormalized !== 'non confirmé') { doitEtreComptee = true; }
  	 } else if (normalizedFilter === 'actifs') {
  	 	 if (normalizedStatutsActifs.includes(etatNormalized)) { doitEtreComptee = true; }
  	 } else {
  	 	 if (etatNormalized === normalizedFilter) { doitEtreComptee = true; }
  	 }
  	 if (!doitEtreComptee) continue;
  	 // --- FIN FILTRAGE ---

  	 // Calculs
  	 const prix_total = parseFloat(row[prixIndex]) || 0;
  	 const typeLivraison = (row[typeLivraisonIndex] || 'autre').toLowerCase().trim();
  	 const adresseText = (row[adresseIndex] || '').toLowerCase(); 
  	 const articlesText = (row[articlesIndex] || ''); 
     
     // *** CORRECTION : LE COÛT EST CALCULÉ UNE SEULE FOIS PAR LIGNE ***
  	 totalCommandes += prix_total;
  	 totalCoutArticles += parseArticleCost(articlesText); // <--- Placé ici
     // *** FIN CORRECTION ***

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

  console.log(`Gain Net (Filtre: ${filter}): ${totalCommandes} (Ventes) - ${totalLivraison} (Livraison) - ${totalCoutArticles} (Coût) = ${gainNetPotentiel}`);

  res.json({
  	 totalCommandes,
  	 totalLivraison,
  	 totalCoutArticles,
  	 gainPotentiel: gainNetPotentiel
  });
});

// comtalab/index.js

// ... (après la route app.get('/api/financial-summary', ...))

// --- NOUVELLE API POUR LE STOCK FAIBLE (CORRIGÉE) ---
app.get('/api/stock-low', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const alertThreshold = 5; // On cherche les articles avec moins de 5 en stock
  console.log(`--- GET /api/stock-low (User ${userId}, Seuil: ${alertThreshold}) ---`);
  if (!db) return res.status(503).json({
    error: "Service DB non disponible."
  });

  // NOUVEAU : On définit ce qu'est un "vêtement"
  // On utilise les clés de ton objet 'articleDetails'
  const clothingKeys = ['tshirt', 'hoodie', 'jogging', 'sac a dos'];

  // *** CORRECTION ICI : Requête sur une seule ligne ***
  const sql = `SELECT id, nom, couleur, taille, style, quantite FROM stock_items WHERE user_id = ? AND quantite < ? AND nom IN (${clothingKeys.map(k => '?').join(',')}) ORDER BY quantite ASC LIMIT 5`;

  // On ajoute les clés aux paramètres de la requête
  const params = [userId, alertThreshold, ...clothingKeys];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Erreur DB GET /api/stock-low:", err.message);
      return res.status(500).json({
        error: err.message
      });
    }
    console.log(`Stock faible trouvé: ${rows.length} articles.`);
    res.json(rows || []);
  });
});


app.get('/api/sheet-data', authenticateToken, async (req, res) => {
    console.log(`--- GET /api/sheet-data (User ${req.user.id}) ---`);
    if (!sheets) { console.warn('GET /api/sheet-data: Client Sheets non initialisé.'); return res.status(503).json({ error: 'Service Google Sheets non disponible.' }); }

    let dynamicSpreadsheetId;
    try {
      dynamicSpreadsheetId = await getSpreadsheetIdForUser(req.user.id);
    } catch (err) {
      // Gère les erreurs "non trouvé" (404) ou "URL invalide" (400)
      if (err.message.includes('Aucun lien')) return res.status(404).json({ error: err.message });
      if (err.message.includes('invalide')) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }

    try {
        console.log(`Lecture Google Sheet ID: ${dynamicSpreadsheetId}, Range: ${RANGE_READ}`);
        const response = await sheets.spreadsheets.values.get({ 
            spreadsheetId: dynamicSpreadsheetId, // Utilise l'ID dynamique
            range: RANGE_READ 
        });
        const rows = response.data.values;
        console.log(`GET /api/sheet-data: ${rows ? rows.length : 0} lignes récupérées.`);
        res.json(rows || []);
    } catch (err) {
        console.error('Erreur API Google Sheets GET /api/sheet-data:', err.message);
        // ... (gestion des erreurs 403, 404, etc. inchangée) ...
        res.status(500).json({ error: 'Impossible de récupérer les données depuis Google Sheets.' });
    }
});

app.put('/api/sheet-data/update-status', authenticateToken, async (req, res) => {
    console.log(`--- PUT /api/sheet-data/update-status (User ${req.user.id}) ---`);
    if (!sheets) { console.warn('PUT update-status: Client Sheets non initialisé.'); return res.status(503).json({ error: 'Service Google Sheets non disponible.' }); }
    
    const { rowIndex, newStatus } = req.body;
    console.log("Données reçues:", { rowIndex, newStatus });
    if (!rowIndex || typeof rowIndex !== 'number' || rowIndex < 2 || !newStatus || typeof newStatus !== 'string') { console.warn("PUT update-status: Données invalides."); return res.status(400).json({ error: 'Index de ligne (rowIndex >= 2) et nouveau statut (newStatus) requis.' }); }

    let dynamicSpreadsheetId;
    try {
      dynamicSpreadsheetId = await getSpreadsheetIdForUser(req.user.id);
    } catch (err) {
      if (err.message.includes('Aucun lien')) return res.status(404).json({ error: err.message });
      if (err.message.includes('invalide')) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }

    const rangeToUpdate = `'${SHEET_NAME}'!${STATUS_COLUMN_LETTER}${rowIndex}`;
    console.log(`MàJ cellule: ${rangeToUpdate} (Sheet ID: ${dynamicSpreadsheetId}) avec valeur: "${newStatus}"`);
    
    try {
        const response = await sheets.spreadsheets.values.update({ 
            spreadsheetId: dynamicSpreadsheetId, // Utilise l'ID dynamique
            range: rangeToUpdate, 
            valueInputOption: 'USER_ENTERED', 
            resource: { values: [[newStatus]] } 
        });
        console.log(`PUT update-status: Succès. Cellule(s) mise(s) à jour: ${response.data.updatedCells}`);
        res.status(200).json({ message: 'Statut mis à jour avec succès.' });
    } catch (err) {
        console.error(`Erreur API Google Sheets PUT update-status (Range: ${rangeToUpdate}):`, err.message);
        // ... (gestion des erreurs 403, 404, etc. inchangée) ...
        res.status(500).json({ error: 'Impossible de mettre à jour le statut dans Google Sheets.' });
S   }
});

// comtalab/index.js

// comtalab/index.js

// comtalab/index.js

// comtalab/index.js

// REMPLACE l'ancienne route /api/dashboard-summary par celle-ci
app.get('/api/dashboard-summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(`--- GET /api/dashboard-summary (User ${userId}) ---`);
  if (!db || !sheets) return res.status(503).json({ error: "Services non disponibles." });

  let totalStockValue = 0;
  let totalPotentialGain = 0; 
  const salesCounts = {};
  const wilayaSalesCounts = {}; 

  try {
    // --- 1. Calculer la Valeur Totale du Stock (depuis SQLite) ---
    const stockSql = `SELECT SUM(quantite * prix) as totalValue FROM stock_items WHERE user_id = ?`;
    const stockData = await new Promise((resolve, reject) => {
      db.get(stockSql, [userId], (err, row) => {
        if (err) return reject(new Error(`Erreur DB Stock: ${err.message}`));
    	 resolve(row);
      });
    });
    totalStockValue = stockData.totalValue || 0; 

    // --- 2. Lire le Google Sheet pour les Gains et le Top 5 ---
    const sheetInfo = await getSheetInfoForUser(userId);
    const dynamicRangeRead = `'${sheetInfo.sheetName}'!A:J`; 
    const response = await sheets.spreadsheets.values.get({ 
      spreadsheetId: sheetInfo.spreadsheetId,
      range: dynamicRangeRead 
    });
    
    const rows = response.data.values;

    if (!rows || rows.length < 2) {
  	 	 return res.json({ totalStockValue, todaysPotentialGain: 0, topCategories: [], topWilayas: [] });
  	 }

    // Analyser les en-têtes
    const headers = rows[0];
    const transformedHeaders = transformHeaders(headers);
    const prixIndex = transformedHeaders.indexOf('prix_total');
    const typeLivraisonIndex = transformedHeaders.indexOf('type_de_livraison');
    const etatIndex = transformedHeaders.indexOf('etat_de_livraison');
    const articlesIndex = transformedHeaders.indexOf('articles'); 
    const dtfIndex = transformedHeaders.indexOf('dtf');
    // (dateCommandeIndex n'est plus nécessaire ici)
    let adresseIndex = transformedHeaders.indexOf('adresse');
    if (adresseIndex === -1) {
        adresseIndex = transformedHeaders.indexOf('wilaya_commune_et_adresse_nom_du_bureau');
    }

    if ([prixIndex, typeLivraisonIndex, etatIndex, adresseIndex, articlesIndex].includes(-1)) {
    	 console.error("Avertissement Dashboard: Colonnes manquantes.");
    } else {
    	 
    	 // Statuts pour le gain (Confirmé, Prêt à livrer) - SANS ACCENTS
    	 const statutsGain = ['confirme', 'pret a livrer']; // <-- CORRIGÉ

    	 let totalCommandesGain = 0, totalLivraisonGain = 0, totalCoutArticlesGain = 0, totalDTFGain = 0;
    	 
    	 const commandesData = rows.slice(1);

    	 for (const row of commandesData) {
    	 	 const etatNormalized = normalizeStatus(row[etatIndex]);
    	 	 const adresseText = (row[adresseIndex] || '').toLowerCase(); 
    	 	 
    	 	 // --- Comptage (Top 3 et Top 5) ---
    	 	 if (etatNormalized !== 'annulé' && etatNormalized !== 'non confirmé') {
    	 	 	 const articlesText = (row[articlesIndex] || '').toLowerCase();
    	 	 	 // ... (logique de comptage Top 3, inchangée) ...
    	 	 	 let articleCompté = false;
           for (const bundleKey in BUNDLES) {
             const bundle = BUNDLES[bundleKey];
             for (const nom of bundle.names) {
               if (articlesText.includes(nom)) {
                 salesCounts[bundleKey] = (salesCounts[bundleKey] || 0) + 1;
                 articleCompté = true; break;
               }
             }
             if (articleCompté) break;
           }

    	 	 	 if (!articleCompté) {
    	 	 	 	 for (const articleKey in articleDetails) {
    	 	 	 	 	 if (articleKey === 'autre') continue;
    	 	 	 	 	 let allNames = [articleKey, ...articleDetails[articleKey].aliases];
    	 	 	 	 	 for (const nom of allNames) {
    	 	 	 	 	 	 if (articlesText.includes(nom)) {
    	 	 	 	 	 	 	 salesCounts[articleKey] = (salesCounts[articleKey] || 0) + 1;
    	 	 	 	 	 	 	 articleCompté = true; break;
    	 	 	 	 	 	 }
    	 	 	 	 	 }
    	 	 	 	 	 if (articleCompté) break;
    	 	 	 	 }
    	 	 	 }
    	 	 	 
    	 	 	 // ... (logique de comptage Wilaya, inchangée) ...
    	 	 	 let wilayaTrouvee = false;
           for (const wilayaKey in PRIX_WILAYAS) {
             if (wilayaKey === 'defaut') continue;
             const wilayaData = PRIX_WILAYAS[wilayaKey];
             for (const nom of wilayaData.names) {
               if (adresseText.includes(nom)) {
                 wilayaSalesCounts[wilayaKey] = (wilayaSalesCounts[wilayaKey] || 0) + 1;
                 wilayaTrouvee = true; break;
               }
             }
             if (wilayaTrouvee) break;
           }
    	 	 	 if (!wilayaTrouvee && adresseText.length > 2) { 
    	 	 	 	 wilayaSalesCounts['inconnu'] = (wilayaSalesCounts['inconnu'] || 0) + 1;
    	 	 	 }
    	 	 }

    	 	 // --- Calcul du "Gain" (CORRIGÉ : SANS DATE) ---
    	 	 if (statutsGain.includes(etatNormalized)) {
    	 	 	 const prix_total = parseFloat(row[prixIndex]) || 0;
    	 	 	 const typeLivraison = (row[typeLivraisonIndex] || 'autre').toLowerCase().trim();
    	 	 	 const articlesText = (row[articlesIndex] || ''); 
    	 	 	 const dtfValue = (dtfIndex !== -1) ? (parseFloat(row[dtfIndex]) || 0) : 0;

    	 	 	 totalCommandesGain += prix_total;
    	 	 	 totalCoutArticlesGain += parseArticleCost(articlesText); 
    	 	 	 totalDTFGain += dtfValue;

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
    	 	 	 totalLivraisonGain += coutLivraison;
    	 	 }
    	 }
    	 totalPotentialGain = totalCommandesGain - totalLivraisonGain - totalCoutArticlesGain - totalDTFGain;
     }
    
    // --- 3. Finaliser le Top 3 (inchangé) ---
    const topCategories = Object.entries(salesCounts)
    	 .sort(([, countA], [, countB]) => countB - countA) 
.slice(0, 3) 
    	 .map(([key, count]) => {
    	 	 let displayName = key;
    	 	 if (BUNDLES[key]) { displayName = BUNDLES[key].names[0]; } 
    	 	 else if (articleDetails[key]) { displayName = articleDetails[key].display; }
    	 	 return { name: displayName, count };
    	 });
    	 
    // --- 4. Finaliser le Top 5 Wilayas (inchangé) ---
    const topWilayas = Object.entries(wilayaSalesCounts)
    	 .sort(([, countA], [, countB]) => countB - countA)
    	 .slice(0, 5) 
    	 .map(([key, count]) => {
    	 	 const displayName = key.charAt(0).toUpperCase() + key.slice(1);
    	 	 return { name: displayName, count };
    	 });

    // --- 5. Envoyer la réponse complète ---
    console.log(`Dashboard Summary: Stock=${totalStockValue}, Gain (Confirmé/Prêt)=${totalPotentialGain}, Top 3=${JSON.stringify(topCategories)}, Top Wilayas=${JSON.stringify(topWilayas)}`);
    res.json({
    	 totalStockValue,
    	 todaysPotentialGain: totalPotentialGain, // On garde le nom de variable
    	 topCategories,
    	 topWilayas 
    });

  } catch (err) {
    console.error("Erreur GET /api/dashboard-summary:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Démarrage du Serveur ---
initializeSheetsClient().then(() => {
    app.listen(port, () => {
        console.log(`Serveur backend (MULTI-USER) démarré sur http://localhost:${port}`);
    });
}).catch(initErr => {
    console.error('*** ERREUR CRITIQUE au démarrage (pré-listen):', initErr);
    process.exit(1);
});
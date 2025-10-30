// comtalab/index.js (Version complète Multi-Utilisateurs)

// 1. Importer les modules
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
    }); // Fin connexion DB callback
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

app.post('/api/stock', authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log(`--- POST /api/stock (User ${userId}) ---`, req.body);
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  const { nom, taille, couleur, style } = req.body;
  
  if (!nom || !couleur || req.body.quantite === undefined || isNaN(parseInt(req.body.quantite)) || parseInt(req.body.quantite) < 0) {
    console.warn("POST /api/stock: Données invalides reçues.");
    return res.status(400).json({ error: 'Données invalides : nom, couleur et quantité (>= 0) sont requis.' });
  }
  const quantiteParsed = parseInt(req.body.quantite);
  const tailleFinal = taille ? taille : null;
  const styleFinal = style ? style : null;

  // Ajout de "user_id" = ? à la vérification
  const sqlCheck = 'SELECT "id", "quantite" FROM "stock_items" WHERE "nom" = ? AND "couleur" = ? AND ("taille" = ? OR ("taille" IS NULL AND ? IS NULL)) AND ("style" = ? OR ("style" IS NULL AND ? IS NULL)) AND "user_id" = ?';
  const paramsCheck = [nom, couleur, tailleFinal, tailleFinal, styleFinal, styleFinal, userId];

  console.log("Exécution SQL Check:", sqlCheck, paramsCheck);

  db.get(sqlCheck, paramsCheck, (err, row) => {
    if (err) {
      console.error("Erreur DB POST /api/stock (check):", err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la vérification de l'article." });
    }
    if (row) {
      const nouvelleQuantite = row.quantite + quantiteParsed;
      // La mise à jour se fait par ID, donc pas besoin de user_id ici (on sait déjà que c'est le bon)
      const sqlUpdate = `UPDATE "stock_items" SET "quantite" = ? WHERE "id" = ?`;
      console.log("Exécution SQL Update:", sqlUpdate, [nouvelleQuantite, row.id]);
      db.run(sqlUpdate, [nouvelleQuantite, row.id], function (errUpdate) {
        if (errUpdate) {
          console.error("Erreur DB POST /api/stock (update):", errUpdate.message);
          return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." });
        }
        console.log(`POST /api/stock: Article ID ${row.id} mis à jour.`);
        res.status(200).json({ id: row.id, nom, taille: tailleFinal, couleur, style: styleFinal, quantite: nouvelleQuantite });
      });
    } else {
      // Ajout de "user_id" à l'insertion
      const sqlInsert = `INSERT INTO "stock_items" ("nom", "taille", "couleur", "style", "quantite", "user_id") VALUES (?, ?, ?, ?, ?, ?)`;
      const paramsInsert = [nom, tailleFinal, couleur, styleFinal, quantiteParsed, userId];
      console.log("Exécution SQL Insert:", sqlInsert, paramsInsert);
      db.run(sqlInsert, paramsInsert, function (errInsert) {
        if (errInsert) {
          console.error("Erreur DB POST /api/stock (insert):", errInsert.message);
          return res.status(500).json({ error: "Erreur serveur lors de l'ajout de l'article." });
        }
        const newId = this.lastID;
        console.log(`POST /api/stock: Nouvel article inséré (ID: ${newId}).`);
        res.status(201).json({ id: newId, nom, taille: tailleFinal, couleur, style: styleFinal, quantite: quantiteParsed });
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

app.delete('/api/stock/group', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { nom, couleur, style } = req.query;
  console.log(`--- DELETE /api/stock/group (User ${userId}) ---`, req.query);

  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  if (!nom || !couleur) { /* ... */ }

  // Ajout de "AND user_id = ?"
  let sql = `DELETE FROM "stock_items" WHERE "nom" = ? AND "couleur" = ? AND "user_id" = ?`;
  const params = [nom, couleur, userId];

  if (style !== undefined && style !== 'null' && style !== '') {
      sql += ` AND "style" = ?`;
      params.push(style);
  } else {
      sql += ` AND "style" IS NULL`;
  }

  console.log("SQL DELETE Group:", sql, params);

  db.run(sql, params, function (err) {
    if (err) { console.error("Erreur DB DELETE /api/stock/group:", err.message); return res.status(500).json({ error: "Erreur serveur lors de la suppression du groupe." }); }
    if (this.changes === 0) { console.log(`DELETE /api/stock/group: Aucun article supprimé.`); return res.status(200).json({ message: 'Aucun article correspondant trouvé.' }); }
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
    if (!sheets) { /* ... (inchangé) ... */ }
    
    const { rowIndex, newStatus } = req.body;
    if (!rowIndex || typeof rowIndex !== 'number' || rowIndex < 2 || !newStatus || typeof newStatus !== 'string') { /* ... (inchangé) ... */ }

    let sheetInfo;
    try {
      // On récupère l'ID et le nom du premier onglet
      sheetInfo = await getSheetInfoForUser(req.user.id);
    } catch (err) {
      if (err.message.includes('Aucun lien')) return res.status(404).json({ error: err.message });
      if (err.message.includes('invalide')) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }

    // On construit le range dynamiquement
    const rangeToUpdate = `'${sheetInfo.sheetName}'!${STATUS_COLUMN_LETTER}${rowIndex}`;
    console.log(`MàJ cellule: ${rangeToUpdate} (Sheet ID: ${sheetInfo.spreadsheetId}) avec valeur: "${newStatus}"`);
    
    try {
        const response = await sheets.spreadsheets.values.update({ 
            spreadsheetId: sheetInfo.spreadsheetId, // Utilise l'ID dynamique
            range: rangeToUpdate, // Utilise le range dynamique
            valueInputOption: 'USER_ENTERED', 
            resource: { values: [[newStatus]] } 
        });
        console.log(`PUT update-status: Succès. Cellule(s) mise(s) à jour: ${response.data.updatedCells}`);
        res.status(200).json({ message: 'Statut mis à jour avec succès.' });
    } catch (err) {
        console.error(`Erreur API Google Sheets PUT update-status (Range: ${rangeToUpdate}):`, err.message);
        if (err.message.includes('Unable to parse range')) {
          console.error(`--> Erreur: L'onglet "${sheetInfo.sheetName}" n'a pas pu être lu.`);
          return res.status(400).json({ error: `Erreur: L'onglet "${sheetInfo.sheetName}" est invalide.` });
        }
        res.status(500).json({ error: 'Impossible de mettre à jour le statut dans Google Sheets.' });
    }
});
// --- FIN API Google Sheet ---

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
// --- FIN API Google Sheet ---


// --- Démarrage du Serveur ---
initializeSheetsClient().then(() => {
    app.listen(port, () => {
        console.log(`Serveur backend (MULTI-USER) démarré sur http://localhost:${port}`);
    });
}).catch(initErr => {
    console.error('*** ERREUR CRITIQUE au démarrage (pré-listen):', initErr);
    process.exit(1);
});
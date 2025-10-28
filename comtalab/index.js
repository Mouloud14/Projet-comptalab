// comtalab/index.js

// 1. Importer les modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { google } = require('googleapis'); // *** Google API ***

// 2. Créer le serveur web
const app = express();
const port = 3001;

// --- Configuration Google Sheets ---
const KEY_FILE_PATH = './google-credentials.json'; // Chemin vers ton fichier JSON
// Scope LECTURE ET ÉCRITURE (NÉCESSAIRE POUR MODIFIER)
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = '1srg0OqWvvo8h4lH6Ukf4j53kplhAZXpnd_AmS7Ax41M'; // Ton ID
// Nom exact de l'onglet (pour l'écriture)
const SHEET_NAME = 'Feuille 2';
// Range pour la lecture (couvre A à J)
const RANGE_READ = "'Feuille 2'!A:J";
// Lettre de la colonne "etat de livraison" (c'est la 9ème, donc 'I')
const STATUS_COLUMN_LETTER = 'I';

// --- Initialisation Google Sheets API Client ---
let sheets; // Variable pour le client Sheets

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
  allowedHeaders: ['Content-Type']
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

const sqlCreateTableTransactions = `
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, description TEXT,
    montant REAL NOT NULL, type TEXT NOT NULL CHECK(type IN ('depense', 'revenu')),
    categorie TEXT NOT NULL
);
`;
            db.run(sqlCreateTableTransactions, (err) => {
                if (err) { return console.error("Erreur création table transactions:", err.message); }
                console.log("Table 'transactions' prête.");
            });

// Utilise article_type
const sqlCreateTableStock = `
CREATE TABLE IF NOT EXISTS stock_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, article_type TEXT,
    taille TEXT, couleur TEXT, style TEXT, quantite INTEGER NOT NULL DEFAULT 0
);
`;
            db.run(sqlCreateTableStock, (err) => {
                if (err) { return console.error("Erreur création/vérification table stock_items:", err.message); }
                console.log("Table 'stock_items' prête.");
            });

const sqlCreateTableCommandes = `
CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, telephone TEXT, nom_prenom TEXT,
    adresse TEXT, type_livraison TEXT, articles TEXT,
    prix_total REAL NOT NULL DEFAULT 0, date_commande TEXT NOT NULL,
    date_livraison TEXT, etat TEXT NOT NULL DEFAULT 'En préparation',
    commentaire TEXT
);
`;
            db.run(sqlCreateTableCommandes, (err) => {
                if (err) { return console.error("Erreur création table commandes:", err.message); }
                console.log("Table 'commandes' prête.");
            });

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
                            const sqlInsertAdmin = `INSERT INTO utilisateurs (username, password) VALUES (?, ?)`;
                            db.run(sqlInsertAdmin, ['admin', 'password'], (errInsert) => {
                                if (errInsert) { return console.error("Erreur insertion admin:", errInsert.message); }
                                console.log("Utilisateur 'admin' (mdp: 'password') créé par défaut.");
                            });
                        } else {
                            console.log("Utilisateurs déjà présents ou erreur lors de la vérification.");
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


// --- API Transactions (inchangé) ---
app.get('/', (req, res) => { res.send('API Comptalab fonctionne !'); });
app.get('/api/transactions', (req, res) => {
    console.log("--- GET /api/transactions reçu ---");
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    db.all("SELECT * FROM transactions ORDER BY date DESC", [], (err, rows) => {
        if (err) { console.error("Erreur DB GET /api/transactions:", err.message); res.status(500).json({ error: err.message }); }
        else { console.log(`GET /api/transactions: ${rows ? rows.length : 0} transactions trouvées.`); res.json(rows || []); }
    });
});
app.post('/api/transactions', (req, res) => {
    console.log("--- POST /api/transactions reçu ---", req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { date, description, montant, type, categorie } = req.body;
    if (!date || !montant || !type || !categorie) { console.warn("POST /api/transactions: Données invalides reçues."); return res.status(400).json({ error: 'Données invalides : date, montant, type et categorie sont requis.' }); }
    db.run("INSERT INTO transactions (date, description, montant, type, categorie) VALUES (?, ?, ?, ?, ?)",
        [date, description || null, parseFloat(montant), type, categorie], function (err) {
            if (err) { console.error("Erreur DB POST /api/transactions:", err.message); res.status(500).json({ error: err.message }); }
            else { console.log(`POST /api/transactions: Nouvelle transaction insérée (ID: ${this.lastID}).`); res.status(201).json({ id: this.lastID, date, description, montant, type, categorie }); }
        });
});
app.put('/api/transactions/:id', (req, res) => {
    const transactionId = req.params.id;
    console.log(`--- PUT /api/transactions/${transactionId} reçu ---`, req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { date, description, montant, type, categorie } = req.body;
    if (!date || !montant || !type || !categorie) { console.warn(`PUT /api/transactions/${transactionId}: Données invalides reçues.`); return res.status(400).json({ error: 'Données invalides : date, montant, type et categorie sont requis.' }); }
    db.run("UPDATE transactions SET date = ?, description = ?, montant = ?, type = ?, categorie = ? WHERE id = ?",
        [date, description || null, parseFloat(montant), type, categorie, transactionId], function (err) {
            if (err) { console.error(`Erreur DB PUT /api/transactions/${transactionId}:`, err.message); res.status(500).json({ error: err.message }); }
            else if (this.changes === 0) { console.warn(`PUT /api/transactions/${transactionId}: Transaction non trouvée.`); res.status(404).json({ message: "Transaction non trouvée" }); }
            else { console.log(`PUT /api/transactions/${transactionId}: Transaction mise à jour.`); res.json({ id: transactionId, date, description, montant, type, categorie }); }
        });
});
app.delete('/api/transactions/:id', (req, res) => {
    const transactionId = req.params.id;
    console.log(`--- DELETE /api/transactions/${transactionId} reçu ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    db.run("DELETE FROM transactions WHERE id = ?", transactionId, function (err) {
        if (err) { console.error(`Erreur DB DELETE /api/transactions/${transactionId}:`, err.message); res.status(500).json({ error: err.message }); }
        else if (this.changes === 0) { console.warn(`DELETE /api/transactions/${transactionId}: Transaction non trouvée.`); res.status(404).json({ message: "Transaction non trouvée" }); }
        else { console.log(`DELETE /api/transactions/${transactionId}: Transaction supprimée.`); res.status(200).json({ message: "Transaction supprimée" }); }
    });
});


// --- API STOCK (avec identifiants quotés et ordre des routes corrigé) ---

// GET /api/stock
app.get('/api/stock', (req, res) => {
  console.log("--- GET /api/stock reçu ---");
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  const sql = `SELECT * FROM "stock_items" ORDER BY "nom", "style", "couleur", "taille"`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erreur DB GET /api/stock:", err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la récupération du stock." });
    }
    console.log(`GET /api/stock: ${rows ? rows.length : 0} articles trouvés.`);
    res.json(rows || []);
  });
});

// POST /api/stock
app.post('/api/stock', (req, res) => {
  console.log("--- POST /api/stock reçu ---");
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  const { nom, taille, couleur, style /*, article_type */ } = req.body; // Récupérer article_type si besoin
  console.log("Données reçues POST /api/stock:", req.body);
  if (!nom || !couleur || req.body.quantite === undefined || isNaN(parseInt(req.body.quantite)) || parseInt(req.body.quantite) < 0) {
    console.warn("POST /api/stock: Données invalides reçues.");
    return res.status(400).json({ error: 'Données invalides : nom, couleur et quantité (>= 0) sont requis.' });
  }
  const quantiteParsed = parseInt(req.body.quantite);
  const tailleFinal = taille ? taille : null;
  const styleFinal = style ? style : null;
  // const articleTypeFinal = article_type ? article_type : null; // Si vous avez renommé la colonne et voulez l'insérer

  const sqlCheck = 'SELECT "id", "quantite" FROM "stock_items" WHERE "nom" = ? AND "couleur" = ? AND ("taille" = ? OR ("taille" IS NULL AND ? IS NULL)) AND ("style" = ? OR ("style" IS NULL AND ? IS NULL))';

  console.log("Exécution SQL Check (quoted, single line):", sqlCheck);
  const paramsCheck = [nom, couleur, tailleFinal, tailleFinal, styleFinal, styleFinal];
  console.log("Paramètres SQL Check:", paramsCheck);

  db.get(sqlCheck, paramsCheck, (err, row) => {
    if (err) {
      console.error("Erreur DB POST /api/stock (check):", err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la vérification de l'article." });
    }
    if (row) {
      const nouvelleQuantite = row.quantite + quantiteParsed;
      const sqlUpdate = `UPDATE "stock_items" SET "quantite" = ? WHERE "id" = ?`;
      console.log("Exécution SQL Update (quoted):", sqlUpdate, [nouvelleQuantite, row.id]);
      db.run(sqlUpdate, [nouvelleQuantite, row.id], function (errUpdate) {
        if (errUpdate) {
          console.error("Erreur DB POST /api/stock (update):", errUpdate.message);
          return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." });
        }
        console.log(`POST /api/stock: Article ID ${row.id} mis à jour (Qté: ${row.quantite} + ${quantiteParsed} = ${nouvelleQuantite}).`);
        res.status(200).json({ id: row.id, nom, taille: tailleFinal, couleur, style: styleFinal, quantite: nouvelleQuantite });
      });
    } else {
      // Assurez-vous d'utiliser les bons noms de colonne ici (nom, taille, couleur, style, quantite)
      // Si vous avez renommé 'type' en 'article_type', ne l'incluez pas ici sauf si vous l'ajoutez explicitement
      const sqlInsert = `INSERT INTO "stock_items" ("nom", "taille", "couleur", "style", "quantite") VALUES (?, ?, ?, ?, ?)`;
      const paramsInsert = [nom, tailleFinal, couleur, styleFinal, quantiteParsed];
      console.log("Exécution SQL Insert (quoted):", sqlInsert, paramsInsert);
      db.run(sqlInsert, paramsInsert, function (errInsert) {
        if (errInsert) {
          console.error("Erreur DB POST /api/stock (insert):", errInsert.message);
          return res.status(500).json({ error: "Erreur serveur lors de l'ajout de l'article." });
        }
        const newId = this.lastID;
        console.log(`POST /api/stock: Nouvel article inséré (ID: ${newId}, Qté: ${quantiteParsed}).`);
        res.status(201).json({ id: newId, nom, taille: tailleFinal, couleur, style: styleFinal, quantite: quantiteParsed });
      });
    }
  });
});


// PUT /api/stock/:id
app.put('/api/stock/:id', (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;
  console.log(`--- PUT /api/stock/${id} reçu --- Quantité: ${quantite}`);
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  if (quantite === undefined || isNaN(parseInt(quantite)) || parseInt(quantite) < 0) {
    console.warn(`PUT /api/stock/${id}: Quantité invalide reçue.`);
    return res.status(400).json({ error: 'Quantité invalide (doit être >= 0).' });
  }
  const quantiteParsed = parseInt(quantite);
  const sql = `UPDATE "stock_items" SET "quantite" = ? WHERE "id" = ?`;
  console.log("Exécution SQL Update (quoted):", sql, [quantiteParsed, id]);
  db.run(sql, [quantiteParsed, id], function (err) {
    if (err) {
      console.error(`Erreur DB PUT /api/stock/${id}:`, err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." });
    }
    if (this.changes === 0) {
      console.warn(`PUT /api/stock/${id}: Article non trouvé.`);
      return res.status(404).json({ error: 'Article non trouvé.' });
    }
    console.log(`PUT /api/stock/${id}: Quantité mise à jour à ${quantiteParsed}.`);
    res.json({ id: parseInt(id), quantite: quantiteParsed });
  });
});

// DELETE /api/stock/group (Placé AVANT /api/stock/:id)
app.delete('/api/stock/group', (req, res) => {
  const { nom, couleur, style } = req.query;
  console.log("--- DELETE /api/stock/group reçu ---");
  console.log("Paramètres reçus (group):", req.query);

  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  if (!nom || !couleur) { console.warn("DELETE /api/stock/group: Paramètres 'nom' et 'couleur' manquants."); return res.status(400).json({ error: "Les paramètres 'nom' et 'couleur' sont requis." }); }

  let sql = `DELETE FROM "stock_items" WHERE "nom" = ? AND "couleur" = ?`;
  const params = [nom, couleur];

  if (style !== undefined) {
      sql += ` AND "style" = ?`;
      params.push(style);
  } else {
      sql += ` AND "style" IS NULL`;
  }

  console.log("SQL DELETE Group (quoted):", sql, params);

  db.run(sql, params, function (err) {
    if (err) { console.error("Erreur DB DELETE /api/stock/group:", err.message); return res.status(500).json({ error: "Erreur serveur lors de la suppression du groupe." }); }
    if (this.changes === 0) { console.log(`DELETE /api/stock/group: Aucun article supprimé pour ${nom}/${couleur}/${style || 'NULL'}.`); return res.status(200).json({ message: 'Aucun article correspondant trouvé (déjà supprimé ?).' }); }
    console.log(`DELETE /api/stock/group: ${this.changes} article(s) supprimé(s).`);
    res.status(200).json({ message: `Groupe supprimé avec succès (${this.changes} articles).` });
  });
});


// DELETE /api/stock/:id (Placé APRÈS /api/stock/group)
app.delete('/api/stock/:id', (req, res) => {
  const { id } = req.params;
  console.log(`--- DELETE /api/stock/${id} reçu ---`);
  // Vérifie si l'id reçu est bien un nombre, sinon c'est peut-être un appel mal routé
  if (isNaN(parseInt(id))) {
    console.warn(`DELETE /api/stock/:id : ID invalide reçu "${id}". L'appel aurait dû aller à /api/stock/group?`);
    return res.status(400).json({ error: `ID d'article invalide: ${id}` });
  }
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
  const sql = `DELETE FROM "stock_items" WHERE "id" = ?`;
  console.log("Exécution SQL Delete (quoted):", sql, [id]);
  db.run(sql, id, function (err) {
    if (err) {
      console.error(`Erreur DB DELETE /api/stock/${id}:`, err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la suppression." });
    }
    if (this.changes === 0) {
      console.warn(`DELETE /api/stock/${id}: Article non trouvé.`);
      return res.status(404).json({ error: 'Article non trouvé.' });
    }
    console.log(`DELETE /api/stock/${id}: Article supprimé.`);
    res.status(200).json({ message: 'Article supprimé avec succès.' });
  });
});

// --- FIN API STOCK ---


// --- API Commandes ---
app.get('/api/commandes', (req, res) => {
    console.log("--- GET /api/commandes reçu ---");
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    db.all("SELECT * FROM commandes ORDER BY date_commande DESC", [], (err, rows) => {
        if (err) { console.error("Erreur DB GET /api/commandes:", err.message); res.status(500).json({ error: err.message }); }
        else { console.log(`GET /api/commandes: ${rows ? rows.length : 0} commandes trouvées.`); res.json(rows || []); }
    });
});
app.post('/api/commandes', (req, res) => {
    console.log("--- POST /api/commandes reçu ---", req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire } = req.body;
    if (!prix_total || !date_commande) { console.warn("POST /api/commandes: Données invalides reçues."); return res.status(400).json({ error: 'Données invalides : prix_total et date_commande sont requis.' }); }
    let articlesJson = null;
    try {
        if (articles && typeof articles === 'object') articlesJson = JSON.stringify(articles);
        else if (typeof articles === 'string') { try { JSON.parse(articles); articlesJson = articles; } catch (e) { articlesJson = JSON.stringify([]); } }
        else articlesJson = JSON.stringify([]);
    } catch (e) { console.error("Erreur stringify articles:", e); articlesJson = JSON.stringify([]); }
    db.run("INSERT INTO commandes (telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [telephone || null, nom_prenom || null, adresse || null, type_livraison || null, articlesJson, parseFloat(prix_total), date_commande, date_livraison || null, etat || 'En préparation', commentaire || null], function(err) {
        if (err) { console.error("Erreur DB POST /api/commandes:", err.message); res.status(500).json({ error: err.message }); }
        else { console.log(`POST /api/commandes: Nouvelle commande insérée (ID: ${this.lastID}).`); res.status(201).json({ id: this.lastID, ...req.body, articles: JSON.parse(articlesJson) }); }
    });
});

// PUT /api/commandes/:id (MODIFIÉ pour décrémenter le stock)
app.put('/api/commandes/:id', async (req, res) => { // Ajout de 'async' ici
  const commandeId = req.params.id;
  console.log(`--- PUT /api/commandes/${commandeId} reçu ---`, req.body);
  if (!db) return res.status(503).json({ error: "Service DB non disponible." });

  const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat: newEtat, commentaire } = req.body;

  // --- Vérifications de base (inchangées) ---
  if (!prix_total || !date_commande || !newEtat) {
    console.warn(`PUT /api/commandes/${commandeId}: Données invalides reçues.`);
    return res.status(400).json({ error: 'Données invalides : prix_total, date_commande et etat sont requis.' });
  }

  let articlesJson = null;
  try {
    if (articles && typeof articles === 'object') articlesJson = JSON.stringify(articles);
    else if (typeof articles === 'string') { try { JSON.parse(articles); articlesJson = articles; } catch (e) { articlesJson = JSON.stringify([]); } }
    else articlesJson = JSON.stringify([]);
  } catch (e) { console.error("Erreur stringify articles (PUT):", e); articlesJson = JSON.stringify([]); }
  // --- Fin Vérifications ---

  // --- NOUVEAU : Récupérer l'état actuel et les articles AVANT la mise à jour ---
  let oldCommandeData;
  try {
    oldCommandeData = await new Promise((resolve, reject) => {
      // Utilise les identifiants quotés aussi ici par cohérence
      db.get('SELECT "articles", "etat" FROM "commandes" WHERE "id" = ?', [commandeId], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Commande non trouvée pour vérification état.'));
        resolve(row);
      });
    });
  } catch (err) {
    console.error(`Erreur DB GET avant PUT /api/commandes/${commandeId}:`, err.message);
    return res.status(err.message.includes('non trouvée') ? 404 : 500).json({ error: err.message });
  }
  const oldEtat = oldCommandeData.etat;
  const articlesAnciensJson = oldCommandeData.articles; // Garder les articles tels qu'ils étaient AU MOMENT de la commande
  // --- FIN Récupération état ---

  // --- Mise à jour de la commande (requête principale) ---
  // Utilise les identifiants quotés
  db.run(`UPDATE "commandes" SET "telephone" = ?, "nom_prenom" = ?, "adresse" = ?, "type_livraison" = ?, "articles" = ?, "prix_total" = ?, "date_commande" = ?, "date_livraison" = ?, "etat" = ?, "commentaire" = ? WHERE "id" = ?`,
    [telephone || null, nom_prenom || null, adresse || null, type_livraison || null, articlesJson, parseFloat(prix_total), date_commande, date_livraison || null, newEtat, commentaire || null, commandeId],
    async function(err) { // Ajout de 'async' ici aussi
      if (err) {
        console.error(`Erreur DB UPDATE /api/commandes/${commandeId}:`, err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        console.warn(`PUT /api/commandes/${commandeId}: Commande non trouvée lors de la mise à jour.`);
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      console.log(`PUT /api/commandes/${commandeId}: Commande mise à jour.`);

      // --- NOUVEAU : Logique de mise à jour du stock ---
      const doitDecrementerStock =
        (newEtat === 'prêt a livrer' || newEtat === 'envoyé') &&
        oldEtat !== 'prêt a livrer' && oldEtat !== 'envoyé';

      if (doitDecrementerStock) {
        console.log(`Commande ${commandeId}: Passage à l'état "${newEtat}". Décrémentation du stock...`);
        try {
          const articlesCommande = JSON.parse(articlesAnciensJson || '[]'); // Utilise les articles originaux
          if (!Array.isArray(articlesCommande)) {
            throw new Error("Format des articles invalide dans la commande.");
          }

          for (const article of articlesCommande) {
            const { nom, couleur, taille, style, quantite: qteCommandee } = article;

            if (!nom || !couleur || qteCommandee === undefined || isNaN(parseInt(qteCommandee)) || parseInt(qteCommandee) <= 0) {
              console.warn(`Article invalide ignoré dans commande ${commandeId}:`, article);
              continue; // Passe à l'article suivant
            }

            const qteADeduire = parseInt(qteCommandee);
            const tailleFinal = taille ? taille : null;
            const styleFinal = style ? style : null;

            // Utilise les identifiants quotés comme on a fait pour le reste
            const sqlUpdateStock = `
              UPDATE "stock_items"
              SET "quantite" = "quantite" - ?
              WHERE "nom" = ?
                AND "couleur" = ?
                AND ("taille" = ? OR ("taille" IS NULL AND ? IS NULL))
                AND ("style" = ? OR ("style" IS NULL AND ? IS NULL))
                AND "quantite" >= ?
            `;
            const paramsUpdateStock = [
              qteADeduire,
              nom,
              couleur,
              tailleFinal, tailleFinal,
              styleFinal, styleFinal,
              qteADeduire // Vérifie qu'il y a assez de stock
            ];

            console.log("Exécution SQL Update Stock:", sqlUpdateStock, paramsUpdateStock);

            // Exécute la mise à jour pour cet article
            await new Promise((resolve, reject) => {
              db.run(sqlUpdateStock, paramsUpdateStock, function(errUpdateStock) {
                if (errUpdateStock) {
                  console.error(`Erreur DB UPDATE Stock pour article ${nom}/${couleur}/${taille}/${style} (Cmd ${commandeId}):`, errUpdateStock.message);
                  // On ne bloque pas tout, on log l'erreur et on continue
                } else if (this.changes === 0) {
                  console.warn(`Stock non mis à jour pour ${nom}/${couleur}/${taille || 'N/A'}/${style || 'N/A'} (Cmd ${commandeId}). Article inexistant ou stock insuffisant.`);
                } else {
                  console.log(`Stock mis à jour pour ${nom}/${couleur}/${taille || 'N/A'}/${style || 'N/A'} (Cmd ${commandeId}): -${qteADeduire}`);
                }
                resolve(); // Passe à l'article suivant même si erreur/non trouvé
              });
            });
          }
          console.log(`Commande ${commandeId}: Tentative de mise à jour du stock terminée.`);
        } catch (parseOrUpdateError) {
          console.error(`Erreur lors de la mise à jour du stock pour commande ${commandeId}:`, parseOrUpdateError);
        }
      }
      // --- FIN Logique stock ---

      // Renvoie la réponse succès pour la mise à jour de la commande
      res.json({ id: commandeId, ...req.body, articles: JSON.parse(articlesJson) });
    }
  ); // Fin db.run UPDATE commandes
});

app.delete('/api/commandes/:id', (req, res) => {
     const commandeId = req.params.id;
     console.log(`--- DELETE /api/commandes/${commandeId} reçu ---`);
     if (!db) return res.status(503).json({ error: "Service DB non disponible." });
     // Utilise les identifiants quotés
     db.run(`DELETE FROM "commandes" WHERE "id" = ?`, commandeId, function(err) {
        if (err) { console.error(`Erreur DB DELETE /api/commandes/${commandeId}:`, err.message); res.status(500).json({ error: err.message }); }
        else if (this.changes === 0) { console.warn(`DELETE /api/commandes/${commandeId}: Commande non trouvée.`); res.status(404).json({ message: "Commande non trouvée" }); }
        else { console.log(`DELETE /api/commandes/${commandeId}: Commande supprimée.`); res.status(200).json({ message: "Commande supprimée" }); }
    });
});
// --- FIN API Commandes ---


// --- API Utilisateurs (inchangé) ---
app.post('/api/login', (req, res) => {
  console.log("--- Requête reçue sur /api/login ---");
  const { username, password } = req.body;
  console.log("Données reçues:", { username, password });
  if (!db) { console.error("Login échoué : DB non prête."); return res.status(503).json({ message: "Service de base de données non disponible."}); }
  if (!username || !password) { console.warn("Login échoué : Données username/password manquantes."); return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' }); }
  const sql = `SELECT * FROM utilisateurs WHERE username = ?`; // Pas besoin de quoter ici a priori
  console.log(`Exécution SQL: ${sql} avec username = ${username}`);
  db.get(sql, [username], (err, user) => {
      if (err) { console.error("Erreur DB pendant la requête SELECT:", err.message); return res.status(500).json({ message: "Erreur serveur lors de la recherche utilisateur." }); }
      if (!user) { console.warn(`Login échoué : Utilisateur "${username}" non trouvé dans la DB.`); return res.status(401).json({ message: 'Identifiants incorrects' }); }
      console.log(`Utilisateur trouvé (avant comparaison):`, { id: user.id, username: user.username, passwordExists: !!user.password });
      try {
          console.log('Début de la comparaison de mot de passe...');
          if (user.password === password) {
              console.log(`Mot de passe correct pour "${username}". Envoi de la réponse succès...`);
              res.status(200).json({ message: 'Connexion réussie', user: { id: user.id, username: user.username, google_sheet_url: user.google_sheet_url } });
              console.log(`Réponse succès envoyée pour "${username}".`);
          } else { console.warn(`Login échoué : Mot de passe incorrect pour "${username}".`); return res.status(401).json({ message: 'Identifiants incorrects' }); }
          console.log('Fin de la comparaison de mot de passe.');
      } catch (compareError) { console.error(`Erreur pendant/après la comparaison du mot de passe pour ${username}:`, compareError); return res.status(500).json({ message: "Erreur serveur interne lors de la connexion." }); }
  });
});
app.put('/api/user/sheet', (req, res) => {
    console.log("--- PUT /api/user/sheet reçu ---");
    const { username, google_sheet_url } = req.body;
    console.log("Données reçues:", req.body);
    if (!db) return res.status(503).json({ error: "Service de base de données non disponible."});
    if (!username || google_sheet_url === undefined) { console.warn("PUT /api/user/sheet: Données invalides."); return res.status(400).json({ error: "Nom d'utilisateur et URL de sheet requis." }); }
    const sql = `UPDATE utilisateurs SET google_sheet_url = ? WHERE username = ?`; // Pas besoin de quoter ici a priori
    db.run(sql, [google_sheet_url, username], function(err) {
        if (err) { console.error(`Erreur DB PUT /api/user/sheet pour ${username}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." }); }
        if (this.changes === 0) { console.warn(`PUT /api/user/sheet: Utilisateur "${username}" non trouvé.`); return res.status(404).json({ message: "Utilisateur non trouvé." }); }
        console.log(`URL Google Sheet mise à jour pour ${username}.`);
        res.json({ message: "Lien Google Sheet mis à jour avec succès." });
    });
});
// --- FIN API Utilisateurs ---


// --- API Google Sheet Data (inchangé) ---
app.get('/api/sheet-data', async (req, res) => {
    console.log("--- GET /api/sheet-data reçu ---");
    if (!sheets) { console.warn('GET /api/sheet-data: Client Sheets non initialisé.'); return res.status(503).json({ error: 'Service Google Sheets non disponible.' }); }
    try {
        console.log(`Lecture Google Sheet ID: ${SPREADSHEET_ID}, Range: ${RANGE_READ}`);
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: RANGE_READ });
        const rows = response.data.values;
        console.log(`GET /api/sheet-data: ${rows ? rows.length : 0} lignes récupérées.`);
        res.json(rows || []);
    } catch (err) {
        console.error('Erreur API Google Sheets GET /api/sheet-data:', err.message);
        if (err.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('403'))) { console.error("--> Vérifiez que l'adresse email du compte de service a bien les permissions 'Éditeur' sur la feuille Google Sheet."); }
        else if (err.message && err.message.includes('Requested entity was not found')) { console.error("--> Vérifiez que le SPREADSHEET_ID est correct."); }
        else if (err.message && err.message.includes('Unable to parse range')) { console.error(`--> Vérifiez que la plage (RANGE_READ) '${RANGE_READ}' est correcte.`); }
        res.status(500).json({ error: 'Impossible de récupérer les données depuis Google Sheets.' });
    }
});
app.put('/api/sheet-data/update-status', async (req, res) => {
    console.log("--- PUT /api/sheet-data/update-status reçu ---");
    if (!sheets) { console.warn('PUT update-status: Client Sheets non initialisé.'); return res.status(503).json({ error: 'Service Google Sheets non disponible.' }); }
    const { rowIndex, newStatus } = req.body;
    console.log("Données reçues:", { rowIndex, newStatus });
    if (!rowIndex || typeof rowIndex !== 'number' || rowIndex < 2 || !newStatus || typeof newStatus !== 'string') { console.warn("PUT update-status: Données invalides reçues."); return res.status(400).json({ error: 'Index de ligne (rowIndex >= 2) et nouveau statut (newStatus) requis.' }); }
    const rangeToUpdate = `'${SHEET_NAME}'!${STATUS_COLUMN_LETTER}${rowIndex}`;
    console.log(`Tentative de mise à jour de la cellule: ${rangeToUpdate} avec la valeur: "${newStatus}"`);
    try {
        const response = await sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: rangeToUpdate, valueInputOption: 'USER_ENTERED', resource: { values: [[newStatus]] } });
        console.log(`PUT update-status: Succès. Cellule(s) mise(s) à jour: ${response.data.updatedCells}`);
        res.status(200).json({ message: 'Statut mis à jour avec succès.' });
    } catch (err) {
        console.error(`Erreur API Google Sheets PUT update-status (Range: ${rangeToUpdate}):`, err.message);
        if (err.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('403'))) { console.error("--> Vérifiez que le SCOPE permet l'écriture ('spreadsheets' et non '.readonly')."); console.error("--> Vérifiez que le compte de service a bien le rôle 'Éditeur' sur la feuille."); }
        else if (err.message && err.message.includes('Unable to parse range')) { console.error(`--> Vérifiez que la plage calculée '${rangeToUpdate}' est correcte.`); }
        res.status(500).json({ error: 'Impossible de mettre à jour le statut dans Google Sheets.' });
    }
});
// --- FIN API Google Sheet ---


// --- Démarrage du Serveur ---
initializeSheetsClient().then(() => {
    app.listen(port, () => {
        console.log(`Serveur backend démarré sur http://localhost:${port}`);
    });
}).catch(initErr => {
    console.error('*** ERREUR CRITIQUE au démarrage (pré-listen):', initErr);
    process.exit(1);
});
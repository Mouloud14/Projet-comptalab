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
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']; // Scope pour lire SEULEMENT
// MODIFIE ÇA : Remplace par l'ID de ta feuille Google Sheet
const SPREADSHEET_ID = 'METS_L_ID_DE_TA_FEUILLE_GOOGLE_SHEET_ICI';
// MODIFIE ÇA : Remplace par le nom de la feuille ET la plage à lire
const RANGE = 'Feuille1!A1:E10'; // Exemple : Feuille 'Feuille1', colonnes A à E, lignes 1 à 10

// --- Initialisation Google Sheets API Client ---
let sheets; // Variable pour le client Sheets

async function initializeSheetsClient() {
  console.log('Tentative d\'initialisation du client Google Sheets...'); // LOG AJOUTÉ
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient });
    console.log('Client Google Sheets initialisé avec succès.'); // LOG SUCCÈS
  } catch (err) {
    console.error('*** ERREUR CRITIQUE: Initialisation du client Google Sheets échouée:'); // LOG ERREUR
    console.error(err);
    sheets = null; // S'assurer que 'sheets' est null en cas d'erreur
  }
}
// --- FIN Google Sheets ---

// 3. Middlewares
app.use(express.json()); // **Important : Pour parser le corps des requêtes POST/PUT**
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// 4. Connexion à la base de données SQLite
let db; // Déclare db ici pour vérifier s'il est initialisé

try {
    db = new sqlite3.Database('./compta.db', (err) => {
        if (err) {
            console.error("*** ERREUR CRITIQUE: Erreur connexion DB:", err.message); // Log d'erreur DB
            // Si la DB ne se connecte pas, les routes ne fonctionneront pas
            process.exit(1); // Arrête le serveur si la DB est inaccessible
        }
        console.log('Connecté à la base de données SQLite "compta.db".'); // Log succès DB

        // Utilisation de db.serialize pour garantir l'ordre d'exécution des créations de table
        db.serialize(() => {
            console.log('Début de la sérialisation des créations de table...'); // LOG AJOUTÉ

            // --- Table Transactions ---
            const sqlCreateTableTransactions = `
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, description TEXT,
                montant REAL NOT NULL, type TEXT NOT NULL CHECK(type IN ('depense', 'revenu')),
                categorie TEXT NOT NULL
            );
            `;
            db.run(sqlCreateTableTransactions, (err) => {
                if (err) { return console.error("Erreur création table transactions:", err.message); }
                console.log("Table 'transactions' prête."); // LOG succès table
            });

            // --- Table Stock ---
            const sqlCreateTableStock = `
            CREATE TABLE IF NOT EXISTS stock_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, type TEXT,
                taille TEXT, couleur TEXT, style TEXT, quantite INTEGER NOT NULL DEFAULT 0
            );
            `;
            db.run(sqlCreateTableStock, (err) => {
                if (err) { return console.error("Erreur création/vérification table stock_items:", err.message); }
                console.log("Table 'stock_items' prête."); // LOG succès table
            });

            // --- Table Commandes ---
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
                console.log("Table 'commandes' prête."); // LOG succès table
            });

            // --- Table Utilisateurs ---
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
                    console.log("Table 'utilisateurs' prête."); // LOG succès table
                    // Insertion de l'utilisateur par défaut (logique inchangée)
                    const sqlCheckUser = `SELECT COUNT(id) as count FROM utilisateurs`;
                    db.get(sqlCheckUser, [], (errCheck, row) => {
                        if (errCheck) { return console.error("Erreur vérification utilisateur:", errCheck.message); } // Log erreur check
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

            console.log('Fin de la sérialisation des créations de table.'); // LOG AJOUTÉ

        }); // Fin de db.serialize
    }); // Fin connexion DB callback
} catch (dbError) {
    console.error('*** ERREUR CRITIQUE: Impossible d\'ouvrir la base de données:', dbError.message);
    process.exit(1);
}


// --- API Transactions (Détails omis, ajoute des logs si nécessaire) ---
app.get('/', (req, res) => { res.send('API Comptalab fonctionne !'); });
// Remplace /* ... Ton code ici ... */ par tes routes existantes si elles étaient différentes
app.get('/api/transactions', (req, res) => {
    console.log("--- GET /api/transactions reçu ---");
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    db.all("SELECT * FROM transactions ORDER BY date DESC", [], (err, rows) => {
        if (err) {
            console.error("Erreur DB GET /api/transactions:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});
app.post('/api/transactions', (req, res) => {
    console.log("--- POST /api/transactions reçu ---", req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { date, description, montant, type, categorie } = req.body;
    // Ajoute une validation ici si nécessaire
    db.run("INSERT INTO transactions (date, description, montant, type, categorie) VALUES (?, ?, ?, ?, ?)",
        [date, description, montant, type, categorie], function (err) {
            if (err) {
                console.error("Erreur DB POST /api/transactions:", err.message);
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, date, description, montant, type, categorie });
            }
        });
});
app.put('/api/transactions/:id', (req, res) => {
    console.log(`--- PUT /api/transactions/${req.params.id} reçu ---`, req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { date, description, montant, type, categorie } = req.body;
    db.run("UPDATE transactions SET date = ?, description = ?, montant = ?, type = ?, categorie = ? WHERE id = ?",
        [date, description, montant, type, categorie, req.params.id], function (err) {
            if (err) {
                console.error(`Erreur DB PUT /api/transactions/${req.params.id}:`, err.message);
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ message: "Transaction non trouvée" });
            } else {
                res.json({ id: req.params.id, date, description, montant, type, categorie });
            }
        });
});
app.delete('/api/transactions/:id', (req, res) => {
    console.log(`--- DELETE /api/transactions/${req.params.id} reçu ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    db.run("DELETE FROM transactions WHERE id = ?", req.params.id, function (err) {
        if (err) {
            console.error(`Erreur DB DELETE /api/transactions/${req.params.id}:`, err.message);
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: "Transaction non trouvée" });
        } else {
            res.status(200).json({ message: "Transaction supprimée" });
        }
    });
});


// --- *** API STOCK (Avec Logs et Corrections) *** ---

// GET : Récupérer tout le stock
app.get('/api/stock', (req, res) => {
  console.log("--- GET /api/stock reçu ---"); // LOG
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."}); // Vérifie si DB est prête

  const sql = `SELECT * FROM stock_items ORDER BY nom, style, couleur, taille`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erreur DB GET /api/stock:", err.message); // LOG ERREUR
      return res.status(500).json({ error: "Erreur serveur lors de la récupération du stock." });
    }
    console.log(`GET /api/stock: ${rows ? rows.length : 0} articles trouvés.`); // LOG SUCCÈS (sécurisé)
    res.json(rows || []); // Renvoie un tableau vide si rows est null/undefined
  });
});

// POST : Ajouter/Mettre à jour un article
app.post('/api/stock', (req, res) => {
  console.log("--- POST /api/stock reçu ---"); // LOG
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."}); // Vérifie si DB est prête

  const { nom, taille, couleur, style, quantite } = req.body;
  console.log("Données reçues POST /api/stock:", req.body); // LOG

  if (!nom || !couleur || quantite === undefined || isNaN(parseInt(quantite)) || parseInt(quantite) < 0) {
    console.warn("POST /api/stock: Données invalides reçues."); // LOG ERREUR VALIDATION
    return res.status(400).json({ error: 'Données invalides : nom, couleur et quantité (>= 0) sont requis.' });
  }

  const quantiteParsed = parseInt(quantite);
  const tailleFinal = taille ? taille : null;
  const styleFinal = style ? style : null;

  const sqlCheck = `
    SELECT id, quantite FROM stock_items
    WHERE nom = ?
    AND couleur = ?
    AND (taille = ? OR (taille IS NULL AND ? IS NULL))
    AND (style = ? OR (style IS NULL AND ? IS NULL))
  `;
  db.get(sqlCheck, [nom, couleur, tailleFinal, tailleFinal, styleFinal, styleFinal], (err, row) => {
    if (err) {
      console.error("Erreur DB POST /api/stock (check):", err.message); // LOG ERREUR
      return res.status(500).json({ error: "Erreur serveur lors de la vérification de l'article." });
    }

    if (row) {
      // Existe -> UPDATE
      const nouvelleQuantite = row.quantite + quantiteParsed;
      const sqlUpdate = `UPDATE stock_items SET quantite = ? WHERE id = ?`;
      db.run(sqlUpdate, [nouvelleQuantite, row.id], function (errUpdate) {
        if (errUpdate) {
          console.error("Erreur DB POST /api/stock (update):", errUpdate.message); // LOG ERREUR
          return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." });
        }
        console.log(`POST /api/stock: Article ID ${row.id} mis à jour (Qté: ${row.quantite} + ${quantiteParsed} = ${nouvelleQuantite}).`); // LOG SUCCÈS
        res.status(200).json({ id: row.id, nom, taille: tailleFinal, couleur, style: styleFinal, quantite: nouvelleQuantite });
      });
    } else {
      // N'existe pas -> INSERT
      // Assure-toi que les colonnes correspondent EXACTEMENT à ta table 'stock_items'
      // Si tu as une colonne 'type' dans stock_items, décommente-la ci-dessous
      const sqlInsert = `INSERT INTO stock_items (nom, taille, couleur, style, quantite) VALUES (?, ?, ?, ?, ?)`;
      // const sqlInsert = `INSERT INTO stock_items (nom, type, taille, couleur, style, quantite) VALUES (?, ?, ?, ?, ?, ?)`; // Avec 'type'
      db.run(sqlInsert, [nom, tailleFinal, couleur, styleFinal, quantiteParsed], function (errInsert) {
      // db.run(sqlInsert, [nom, null, tailleFinal, couleur, styleFinal, quantiteParsed], function (errInsert) { // Avec type=null
        if (errInsert) {
          console.error("Erreur DB POST /api/stock (insert):", errInsert.message); // LOG ERREUR
          return res.status(500).json({ error: "Erreur serveur lors de l'ajout de l'article." });
        }
        const newId = this.lastID;
        console.log(`POST /api/stock: Nouvel article inséré (ID: ${newId}, Qté: ${quantiteParsed}).`); // LOG SUCCÈS
        res.status(201).json({ id: newId, nom, taille: tailleFinal, couleur, style: styleFinal, quantite: quantiteParsed });
      });
    }
  });
});

// PUT : Mettre à jour la quantité par ID
app.put('/api/stock/:id', (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;
  console.log(`--- PUT /api/stock/${id} reçu --- Quantité: ${quantite}`); // LOG
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."}); // Vérifie si DB est prête

  if (quantite === undefined || isNaN(parseInt(quantite)) || parseInt(quantite) < 0) {
    console.warn(`PUT /api/stock/${id}: Quantité invalide reçue.`); // LOG ERREUR VALIDATION
    return res.status(400).json({ error: 'Quantité invalide (doit être >= 0).' });
  }

  const quantiteParsed = parseInt(quantite);
  const sql = `UPDATE stock_items SET quantite = ? WHERE id = ?`;

  db.run(sql, [quantiteParsed, id], function (err) {
    if (err) {
      console.error(`Erreur DB PUT /api/stock/${id}:`, err.message); // LOG ERREUR
      return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." });
    }
    if (this.changes === 0) {
      console.warn(`PUT /api/stock/${id}: Article non trouvé.`); // LOG NON TROUVÉ
      return res.status(404).json({ error: 'Article non trouvé.' });
    }
    console.log(`PUT /api/stock/${id}: Quantité mise à jour à ${quantiteParsed}.`); // LOG SUCCÈS
    res.json({ id: parseInt(id), quantite: quantiteParsed });
  });
});

// DELETE : Supprimer par ID
app.delete('/api/stock/:id', (req, res) => {
  const { id } = req.params;
  console.log(`--- DELETE /api/stock/${id} reçu ---`); // LOG
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."}); // Vérifie si DB est prête

  const sql = `DELETE FROM stock_items WHERE id = ?`;
  db.run(sql, id, function (err) {
    if (err) {
      console.error(`Erreur DB DELETE /api/stock/${id}:`, err.message); // LOG ERREUR
      return res.status(500).json({ error: "Erreur serveur lors de la suppression." });
    }
    if (this.changes === 0) {
      console.warn(`DELETE /api/stock/${id}: Article non trouvé.`); // LOG NON TROUVÉ
      return res.status(404).json({ error: 'Article non trouvé.' });
    }
    console.log(`DELETE /api/stock/${id}: Article supprimé.`); // LOG SUCCÈS
    res.status(200).json({ message: 'Article supprimé avec succès.' });
  });
});

// DELETE GROUP : Supprimer un groupe
app.delete('/api/stock/group', (req, res) => {
  const { nom, couleur, style } = req.query;
  console.log("--- DELETE /api/stock/group reçu ---", req.query); // LOG
  if (!db) return res.status(503).json({ error: "Service de base de données non disponible."}); // Vérifie si DB est prête

  if (!nom || !couleur) {
    console.warn("DELETE /api/stock/group: Paramètres 'nom' et 'couleur' manquants."); // LOG ERREUR VALIDATION
    return res.status(400).json({ error: "Les paramètres 'nom' et 'couleur' sont requis." });
  }

  let sql = `DELETE FROM stock_items WHERE nom = ? AND couleur = ?`;
  const params = [nom, couleur];

  if (style !== undefined && style !== '') {
      sql += ` AND style = ?`;
      params.push(style);
  } else {
      sql += ` AND style IS NULL`;
  }

  console.log("SQL DELETE Group:", sql, params); // Log SQL

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Erreur DB DELETE /api/stock/group:", err.message); // LOG ERREUR
      return res.status(500).json({ error: "Erreur serveur lors de la suppression du groupe." });
    }
    console.log(`DELETE /api/stock/group: ${this.changes} article(s) supprimé(s).`); // LOG SUCCÈS/INFO
    res.status(200).json({ message: `Groupe supprimé (${this.changes} articles).` });
  });
});

// --- FIN API STOCK ---


// --- API Commandes (Détails omis, ajoute des logs si nécessaire) ---
app.get('/api/commandes', (req, res) => {
    console.log("--- GET /api/commandes reçu ---");
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    db.all("SELECT * FROM commandes ORDER BY date_commande DESC", [], (err, rows) => {
        if (err) {
             console.error("Erreur DB GET /api/commandes:", err.message);
             res.status(500).json({ error: err.message });
        } else {
             res.json(rows);
        }
    });
});
app.post('/api/commandes', (req, res) => {
    console.log("--- POST /api/commandes reçu ---", req.body);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire } = req.body;
    db.run("INSERT INTO commandes (telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [telephone, nom_prenom, adresse, type_livraison, JSON.stringify(articles), prix_total, date_commande, date_livraison, etat, commentaire], function(err) {
        if (err) {
            console.error("Erreur DB POST /api/commandes:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, ...req.body });
        }
    });
});
app.put('/api/commandes/:id', (req, res) => {
     console.log(`--- PUT /api/commandes/${req.params.id} reçu ---`, req.body);
     if (!db) return res.status(503).json({ error: "Service DB non disponible." });
     const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire } = req.body;
     db.run("UPDATE commandes SET telephone = ?, nom_prenom = ?, adresse = ?, type_livraison = ?, articles = ?, prix_total = ?, date_commande = ?, date_livraison = ?, etat = ?, commentaire = ? WHERE id = ?",
        [telephone, nom_prenom, adresse, type_livraison, JSON.stringify(articles), prix_total, date_commande, date_livraison, etat, commentaire, req.params.id], function(err) {
        if (err) {
            console.error(`Erreur DB PUT /api/commandes/${req.params.id}:`, err.message);
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: "Commande non trouvée" });
        } else {
            res.json({ id: req.params.id, ...req.body });
        }
    });
});
app.delete('/api/commandes/:id', (req, res) => {
     console.log(`--- DELETE /api/commandes/${req.params.id} reçu ---`);
     if (!db) return res.status(503).json({ error: "Service DB non disponible." });
     db.run("DELETE FROM commandes WHERE id = ?", req.params.id, function(err) {
        if (err) {
             console.error(`Erreur DB DELETE /api/commandes/${req.params.id}:`, err.message);
             res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: "Commande non trouvée" });
        } else {
            res.status(200).json({ message: "Commande supprimée" });
        }
    });
});


// --- API Utilisateurs (Login MODIFIÉ, Update Sheet URL inchangée avec logs) ---
app.post('/api/login', (req, res) => {
  console.log("--- Requête reçue sur /api/login ---"); // Log existant
  const { username, password } = req.body;
  console.log("Données reçues:", { username, password }); // Log existant

  // Vérifie si la DB est prête
  if (!db) {
      console.error("Login échoué : DB non prête."); // LOG ERREUR DB
      return res.status(503).json({ message: "Service de base de données non disponible."});
  }

  // Validation simple des entrées
  if (!username || !password) {
     console.warn("Login échoué : Données username/password manquantes."); // LOG WARN
     return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
  }

  const sql = `SELECT * FROM utilisateurs WHERE username = ?`;
  console.log(`Exécution SQL: ${sql} avec username = ${username}`); // LOG SQL

  db.get(sql, [username], (err, user) => {
      // 1. Gérer l'erreur potentielle de la requête DB
      if (err) {
          console.error("Erreur DB pendant la requête SELECT:", err.message); // LOG ERREUR DB
          return res.status(500).json({ message: "Erreur serveur lors de la recherche utilisateur." });
      }

      // 2. Vérifier si l'utilisateur a été trouvé
      if (!user) {
          console.warn(`Login échoué : Utilisateur "${username}" non trouvé dans la DB.`); // LOG WARN Non trouvé
          // En production, garder le message vague pour la sécurité
          return res.status(401).json({ message: 'Identifiants incorrects' });
          // return res.status(401).json({ message: 'Identifiants incorrects (utilisateur non trouvé)' }); // Pour le dev
      }

      // 3. Utilisateur trouvé, vérifier le mot de passe
      console.log(`Utilisateur trouvé: id=${user.id}, username=${user.username}, password=${user.password ? '***' : 'NULL'}, sheet_url=${user.google_sheet_url || 'NULL'}`); // LOG SUCCÈS Recherche (masque mdp)

      // !! ATTENTION : Comparaison directe du mot de passe en clair !!
      // C'est ok pour le développement initial, mais PAS pour la production.
      // Il faudrait utiliser bcrypt pour hasher les mots de passe.
      if (user.password === password) {
          // Mot de passe correct
          console.log(`Mot de passe correct pour "${username}". Connexion réussie.`); // LOG SUCCÈS Connexion
          // On renvoie les infos (sans le mot de passe)
          res.status(200).json({
              message: 'Connexion réussie',
              user: {
                  id: user.id,
                  username: user.username,
                  google_sheet_url: user.google_sheet_url
              }
          });
      } else {
          // Mot de passe incorrect
          console.warn(`Login échoué : Mot de passe incorrect pour "${username}".`); // LOG WARN Mdp incorrect
          // Log pour comparer (uniquement en dev si besoin)
          // console.log(`Comparaison échouée: Reçu='${password}', DB='${user.password}'`);
          // En production, garder le message vague
          return res.status(401).json({ message: 'Identifiants incorrects' });
          // return res.status(401).json({ message: 'Identifiants incorrects (mot de passe erroné)' }); // Pour le dev
      }
  });
});


app.put('/api/user/sheet', (req, res) => {
    console.log("--- PUT /api/user/sheet reçu ---"); // LOG AJOUTÉ
    const { username, google_sheet_url } = req.body;
    console.log("Données reçues:", req.body); // LOG AJOUTÉ
    if (!db) return res.status(503).json({ error: "Service de base de données non disponible."}); // Vérifie si DB est prête

    if (!username || google_sheet_url === undefined) {
        console.warn("PUT /api/user/sheet: Données invalides.");
        return res.status(400).json({ error: "Nom d'utilisateur et URL de sheet requis." });
    }

    const sql = `UPDATE utilisateurs SET google_sheet_url = ? WHERE username = ?`;
    db.run(sql, [google_sheet_url, username], function(err) {
        if (err) {
            console.error(`Erreur DB PUT /api/user/sheet pour ${username}:`, err.message);
            return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
        }
        if (this.changes === 0) {
            console.warn(`PUT /api/user/sheet: Utilisateur "${username}" non trouvé.`);
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        console.log(`URL Google Sheet mise à jour pour ${username}.`);
        res.json({ message: "Lien Google Sheet mis à jour avec succès." });
    });
});


// --- API Google Sheet Data (inchangée avec logs) ---
app.get('/api/sheet-data', async (req, res) => {
    console.log("--- GET /api/sheet-data reçu ---"); // LOG AJOUTÉ
    if (!sheets) {
        console.warn('GET /api/sheet-data: Client Sheets non initialisé.'); // LOG WARN
        return res.status(503).json({ error: 'Service Google Sheets non disponible.' });
    }
    try {
        const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        });
        const rows = response.data.values;
        console.log(`GET /api/sheet-data: ${rows ? rows.length : 0} lignes récupérées.`); // LOG SUCCÈS
        res.json(rows || []);
    } catch (err) {
        console.error('Erreur API Google Sheets GET /api/sheet-data:', err.message); // LOG ERREUR
        // Vérifie si l'erreur est due aux permissions
        if (err.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('403'))) {
             console.error("--> Vérifiez que l'adresse email du compte de service a bien les permissions 'Éditeur' sur la feuille Google Sheet.");
        }
        res.status(500).json({ error: 'Impossible de récupérer les données depuis Google Sheets.' });
    }
});

// --- Démarrage du Serveur (inchangé) ---
initializeSheetsClient().then(() => {
    app.listen(port, () => {
        console.log(`Serveur backend démarré sur http://localhost:${port}`); // Log final si tout démarre
    });
}).catch(initErr => {
    console.error('*** ERREUR CRITIQUE au démarrage (pré-listen):', initErr);
    process.exit(1);
});
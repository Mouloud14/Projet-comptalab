// comtalab/index.js

// 1. Importer les modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// 2. Créer le serveur web
const app = express();
const port = 3001;

// 3. Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// 4. Connexion à la base de données SQLite
const db = new sqlite3.Database('./compta.db', (err) => {
  if (err) {
    return console.error("Erreur connexion DB:", err.message);
  }
  console.log('Connecté à la base de données SQLite "compta.db".');

  db.serialize(() => {
    // --- Création Table Transactions ---
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

    // --- Création/Modification Table Stock ---
    const sqlCreateTableStock = `
      CREATE TABLE IF NOT EXISTS stock_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, type TEXT,
        taille TEXT, couleur TEXT, style TEXT, quantite INTEGER NOT NULL DEFAULT 0
      );
    `;
    db.run(sqlCreateTableStock, (err) => {
        if (err) { return console.error("Erreur création/vérification table stock_items:", err.message); }
        console.log("Table 'stock_items' vérifiée/créée.");
        db.run("ALTER TABLE stock_items ADD COLUMN taille TEXT", () => {});
        db.run("ALTER TABLE stock_items ADD COLUMN couleur TEXT", () => {});
        db.run("ALTER TABLE stock_items ADD COLUMN style TEXT", () => {
             console.log("Colonnes stock 'taille', 'couleur', 'style' vérifiées/ajoutées (erreurs ignorées si existent).");
        });
    });

    // --- Création Table Commandes ---
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
    
  }); // Fin de db.serialize
}); // Fin connexion DB

// --- ROUTES API ---

// Route simple pour tester
app.get('/', (req, res) => {
  res.send('Bonjour ! Le serveur backend "comtalab" fonctionne.');
});

// --- API Transactions (CRUD) ---
app.get('/api/transactions', (req, res) => {
  const sql = "SELECT * FROM transactions ORDER BY date DESC, id DESC";
  db.all(sql, [], (err, rows) => {
    if (err) { console.error("ERREUR BACKEND - Lecture transactions:", err.message); return res.status(500).json({ error: "Erreur serveur lors de la lecture des transactions." }); }
    res.json(rows);
  });
});
app.post('/api/transactions', (req, res) => {
  const { date, description, montant, type, categorie } = req.body;
  if (!date || montant == null || !type || !categorie) { return res.status(400).json({ error: "Données manquantes (date, montant, type, categorie sont requis)." }); }
  if (type !== 'depense' && type !== 'revenu') { return res.status(400).json({ error: "Le type doit être 'depense' ou 'revenu'." }); }
  if (typeof montant !== 'number' || montant < 0) { return res.status(400).json({ error: "Le montant doit être un nombre positif." }); }
  const sql = `INSERT INTO transactions (date, description, montant, type, categorie) VALUES (?, ?, ?, ?, ?)`;
  const params = [date, description || '', montant, type, categorie];
  db.run(sql, params, function(err) {
    if (err) { console.error("Erreur insertion transaction:", err.message); return res.status(500).json({ error: "Erreur serveur lors de l'ajout." }); }
    console.log(`Nouvelle transaction ajoutée ID: ${this.lastID}`);
    res.status(201).json({ message: "Transaction ajoutée avec succès", id: this.lastID });
  });
});
app.put('/api/transactions/:id', (req, res) => {
  const id = req.params.id;
  const { date, description, montant, type, categorie } = req.body;
  if (!date || montant == null || !type || !categorie) { return res.status(400).json({ error: "Données manquantes." }); }
  if (type !== 'depense' && type !== 'revenu') { return res.status(400).json({ error: "Type invalide." }); }
   if (typeof montant !== 'number' || montant < 0) { return res.status(400).json({ error: "Montant invalide." }); }
  const sql = `UPDATE transactions SET date = ?, description = ?, montant = ?, type = ?, categorie = ? WHERE id = ?`;
  const params = [date, description || '', montant, type, categorie, id];
  db.run(sql, params, function(err) {
    if (err) { console.error(`Erreur MAJ transaction ID ${id}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." }); }
    if (this.changes === 0) { return res.status(404).json({ message: "Transaction non trouvée" }); }
    console.log(`Transaction ID ${id} modifiée.`);
    res.json({ message: "Transaction modifiée avec succès" });
  });
});
app.delete('/api/transactions/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM transactions WHERE id = ?";
  db.run(sql, id, function(err) {
    if (err) { console.error(`Erreur suppression transaction ID ${id}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la suppression." }); }
    if (this.changes === 0) { return res.status(404).json({ message: "Transaction non trouvée" }); }
    console.log(`Transaction ID ${id} supprimée.`);
    res.json({ message: "Transaction supprimée avec succès" });
  });
});
// --- Fin API Transactions ---

// --- API Stock (CRUD) ---
app.get('/api/stock', (req, res) => {
    const sql = "SELECT id, nom, taille, couleur, style, quantite FROM stock_items ORDER BY nom, couleur, taille, style";
    db.all(sql, [], (err, rows) => {
        if (err) { console.error("Erreur lecture stock:", err.message); return res.status(500).json({ error: "Erreur serveur lors de la lecture du stock." }); }
        res.json(rows);
    });
});
app.post('/api/stock', (req, res) => {
  const { nom, taille, couleur, style, quantite } = req.body;
  const quantiteToAdd = parseInt(quantite);
  if (!nom || (!taille && nom !== 'sac a dos' && nom !== 'autre') || !couleur || quantiteToAdd == null || isNaN(quantiteToAdd) || quantiteToAdd < 0) {
    return res.status(400).json({ error: "Données manquantes ou invalides (nom, couleur, quantite entier >= 0 requis; taille requise sauf pour sac a dos/autre)." });
  }
  const checkSql = `SELECT id, quantite as currentQuantite FROM stock_items WHERE nom = ? AND COALESCE(taille, '') = COALESCE(?, '') AND couleur = ? AND COALESCE(style, '') = COALESCE(?, '')`;
  const checkParams = [nom, taille || '', couleur, style || ''];
  db.get(checkSql, checkParams, (err, row) => {
      if (err) { console.error("Erreur vérification doublon stock:", err.message); return res.status(500).json({ error: "Erreur serveur lors de la vérification." }); }
      if (row) {
          const existingItemId = row.id;
          const currentQuantity = row.currentQuantite;
          const newQuantity = currentQuantity + quantiteToAdd;
          const updateSql = `UPDATE stock_items SET quantite = ? WHERE id = ?`;
          db.run(updateSql, [newQuantity, existingItemId], function(updateErr) {
              if (updateErr) { console.error(`Erreur MAJ quantité stock ID ${existingItemId}:`, updateErr.message); return res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la quantité." }); }
              console.log(`Stock ID ${existingItemId} mis à jour. Ajout de ${quantiteToAdd}. Nouvelle quantité: ${newQuantity}`);
              res.status(200).json({ message: `Quantité ajoutée avec succès à l'article existant.`, id: existingItemId, quantite: newQuantity });
          });
      } else {
          const insertSql = `INSERT INTO stock_items (nom, taille, couleur, style, quantite) VALUES (?, ?, ?, ?, ?)`;
          const insertParams = [nom, taille || null, couleur, style || null, quantiteToAdd];
          db.run(insertSql, insertParams, function(insertErr) {
            if (insertErr) { console.error("Erreur insertion stock:", insertErr); return res.status(500).json({ error: "Erreur serveur lors de l'ajout de l'article." }); }
            console.log(`Nouvel article (variation) ajouté ID: ${this.lastID}`);
            res.status(201).json({ message: "Nouvel article ajouté avec succès", id: this.lastID, nom, taille: taille || null, couleur, style: style || null, quantite: quantiteToAdd });
          });
      }
  });
});
app.put('/api/stock/:id', (req, res) => {
  const id = req.params.id;
  const { quantite } = req.body;
  if (quantite == null || quantite < 0 || !Number.isInteger(parseInt(quantite))) { return res.status(400).json({ error: "Quantité invalide (doit être un entier >= 0)." }); }
  const newQuantity = parseInt(quantite);
  const sql = `UPDATE stock_items SET quantite = ? WHERE id = ?`;
  const params = [newQuantity, id];
  db.run(sql, params, function(err) {
    if (err) { console.error(`Erreur MAJ stock ID ${id}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." }); }
    if (this.changes === 0) { return res.status(404).json({ message: "Article non trouvé" }); }
    console.log(`Stock ID ${id} modifié. Nouvelle quantité: ${newQuantity}`);
    res.json({ message: "Stock modifié avec succès", id: parseInt(id), quantite: newQuantity });
  });
});
app.delete('/api/stock/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM stock_items WHERE id = ?";
  db.run(sql, id, function(err) {
    if (err) { console.error(`Erreur suppression stock ID ${id}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la suppression." }); }
    if (this.changes === 0) { return res.status(404).json({ message: "Article non trouvé" }); }
    console.log(`Article ID ${id} supprimé.`);
    res.json({ message: "Article supprimé avec succès", id: parseInt(id) });
  });
});
app.delete('/api/stock/group', (req, res) => {
    const { nom, style, couleur } = req.query;
    console.log("Requête DELETE /api/stock/group reçue pour:", { nom, style, couleur });
    if (!nom || !couleur) { return res.status(400).json({ error: "Les paramètres 'nom' et 'couleur' sont requis." }); }
    let sql = `DELETE FROM stock_items WHERE nom = ? AND couleur = ?`;
    const params = [nom, couleur];
    if (style && style.toLowerCase() !== 'null' && style.toLowerCase() !== 'standard' && style !== '-') {
         sql += ` AND style = ?`;
         params.push(style);
     } else {
         sql += ` AND (style IS NULL OR style = '' OR style = 'standard' OR style = '-')`;
     }
    console.log("SQL Delete Group:", sql); console.log("Params:", params);
    db.run(sql, params, function(err) {
        if (err) { console.error(`Erreur suppression groupe stock [${nom}/${style}/${couleur}]:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la suppression groupée." }); }
        if (this.changes === 0) { console.log(`Aucun article trouvé pour le groupe [${nom}/${style}/${couleur}].`); return res.status(404).json({ message: "Aucun article correspondant trouvé." }); }
        console.log(`${this.changes} article(s) supprimé(s) pour le groupe [${nom}/${style}/${couleur}].`);
        res.json({ message: `${this.changes} article(s) supprimé(s) avec succès.` });
    });
});
// --- FIN API Stock ---

// --- API Commandes (CRUD) ---
app.get('/api/commandes', (req, res) => {
  const sql = "SELECT * FROM commandes ORDER BY date_commande DESC, id DESC";
  db.all(sql, [], (err, rows) => {
    if (err) { console.error("Erreur lecture commandes:", err.message); return res.status(500).json({ error: "Erreur serveur lors de la lecture des commandes." }); }
    res.json(rows);
  });
});
app.post('/api/commandes', (req, res) => {
  const { telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire } = req.body;
  if (!nom_prenom || !articles || !prix_total || !date_commande) { return res.status(400).json({ error: "Champs requis manquants (nom_prenom, articles, prix_total, date_commande)." }); }
  const sql = `INSERT INTO commandes (telephone, nom_prenom, adresse, type_livraison, articles, prix_total, date_commande, date_livraison, etat, commentaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [ telephone || null, nom_prenom, adresse || null, type_livraison || null, articles, prix_total, date_commande, date_livraison || null, etat || 'En préparation', commentaire || null ];
  db.run(sql, params, function(err) {
      if (err) { console.error("Erreur insertion commande:", err.message); return res.status(500).json({ error: "Erreur serveur lors de l'ajout de la commande." }); }
      console.log(`Nouvelle commande ajoutée ID: ${this.lastID}`);
      res.status(201).json({ message: "Commande ajoutée avec succès", id: this.lastID });
  });
});
app.put('/api/commandes/:id', (req, res) => {
  const id = req.params.id;
  const { etat, commentaire, date_livraison } = req.body;
  let fieldsToUpdate = [];
  let params = [];
  if (etat) { fieldsToUpdate.push("etat = ?"); params.push(etat); }
  if (commentaire || commentaire === '') { fieldsToUpdate.push("commentaire = ?"); params.push(commentaire); }
  if (date_livraison) { fieldsToUpdate.push("date_livraison = ?"); params.push(date_livraison); }
  if (fieldsToUpdate.length === 0) { return res.status(400).json({ error: "Aucun champ à mettre à jour." }); }
  params.push(id);
  const sql = `UPDATE commandes SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  db.run(sql, params, function(err) {
      if (err) { console.error(`Erreur MAJ commande ID ${id}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." }); }
      if (this.changes === 0) { return res.status(404).json({ message: "Commande non trouvée" }); }
      console.log(`Commande ID ${id} modifiée.`);
      res.json({ message: "Commande modifiée avec succès" });
  });
});
app.delete('/api/commandes/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM commandes WHERE id = ?";
    db.run(sql, id, function(err) {
        // CORRECTION DE LA FAUTE DE FRAPPE (5D -> 500)
        if (err) { console.error(`Erreur suppression commande ID ${id}:`, err.message); return res.status(500).json({ error: "Erreur serveur lors de la suppression." }); }
        if (this.changes === 0) { return res.status(404).json({ message: "Commande non trouvée" }); }
        console.log(`Commande ID ${id} supprimée.`);
        res.json({ message: "Commande supprimée avec succès" });
    });
});
// --- FIN API Commandes ---


// --- API pour la Connexion ---
app.post('/api/login', (req, res) => {
  console.log("--- Requête reçue sur /api/login ---");
  const { username, password } = req.body;
  console.log("Données reçues:", { username, password });
  if (!username || !password) { console.log("Login échoué : Données manquantes"); return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' }); }
  
  // --- TES IDENTIFIANTS ---
  const VALID_USERNAME = 'admin'; // REMPLACE SI BESOIN
  const VALID_PASSWORD = 'password'; // REMPLACE SI BESOIN
  // --- FIN IDENTIFIANTS ---

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    console.log(`Utilisateur ${username} connecté avec succès.`);
    res.status(200).json({ message: 'Connexion réussie' });
  } else {
    console.log(`Tentative de connexion échouée pour ${username}. Comparaison échouée.`);
    res.status(401).json({ message: 'Identifiants incorrects' });
  }
});
// --- Fin API Connexion ---


// --- Démarrage du Serveur ---
app.listen(port, () => {
  console.log(`Serveur backend démarré sur http://localhost:${port}`);
});
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

// index.js (REMPLACE CE BLOC)

// index.js (REMPLACE CE BLOC)

const articleDetails = {
  'tshirt': { 
    display: 'T-shirt', 
    aliases: ['t shirt', 't-shirt', 'tshirt'], // <-- Corrigé
    styles: ['oversize', 'oversize premium', 'regular', 'enfant'], 
    prix: { 'oversize': 950, 'oversize premium': 1150, 'regular': 790, 'enfant': 620 },
    defaultStyle: 'regular' 
  },
  'hoodie': { 
    display: 'Hoodie', 
    aliases: ['sweat', 'hoodie'], // <-- Corrigé
    styles: ['premium', 'enfant', 'standard', 'oversize'], 
    prix: { 'premium': 1650, 'enfant': 1300, 'standard': 1260,'oversize': 1600 },
    defaultStyle: 'standard' 
  },
  'jogging': { 
    display: 'Jogging', 
    aliases: ['jogging'], // <-- Corrigé
    styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], 
    prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 },
    defaultStyle: 'elastiqué normal' 
  },
  'sac a dos': { 
    display: 'Sac à dos', 
    aliases: ['sacados', 'sac à dos', 'sac a dos'], // <-- Corrigé
    styles: ['standard', 'premium'], 
    prix: { 'standard': 1150, 'premium': 1220 },
    defaultStyle: 'standard' 
  },
  'autre': { display: 'Autre', aliases: [], styles: [], prix: {} }
};

function calculateDebtCost(debtType, amount, articlesJson) {
    // Si c'est Euro, DTF, ou Autre, on prend le montant saisi directement
    if (debtType === 'euro' || debtType === 'dtf' || debtType === 'autre') {
        return parseFloat(amount) || 0;
    }
    // Si c'est un Article, on utilise la fonction existante parseArticleCost
    if (debtType === 'article' && articlesJson) {
        return parseArticleCost(articlesJson); 
    }
    return 0;
}

// index.js (REMPLACE CETTE FONCTION EN ENTIER)
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
    let itemStyle = (item.style || '').toLowerCase().trim();
    const quantite = parseInt(item.quantite, 10) || 0;

    if (quantite <= 0) continue;
    let itemCost = 0;

    // 1. Vérification des Bundles (Ensemble / Ensemble Premium)
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
        let stylePourPrix = ''; // Le style qu'on va utiliser pour le prix

        // --- LOGIQUE DE DÉDUCTION DE STYLE ---

        // Priorité 1: Le style est-il explicitement défini dans l'objet JSON ?
        if (itemStyle && details.prix[itemStyle] !== undefined) {
          stylePourPrix = itemStyle;
          // console.log(`      [Coût Article] Style explicite trouvé...`); // <-- SUPPRIMÉ
        }

        // Priorité 2: Si aucun style explicite, l'inférer depuis itemNom
        if (!stylePourPrix) {
          // console.log(`      [Coût Article] Style non explicite...`); // <-- SUPPRIMÉ

          if (articleKey === 'tshirt') {
            if (itemNom.includes('oversize +') || itemNom.includes('oversize plus')) {
              stylePourPrix = 'oversize premium'; // 1150
            } else if (itemNom.includes('oversize')) {
              stylePourPrix = 'oversize'; // 950
            } else {
              stylePourPrix = details.defaultStyle; // 'regular' (790)
            }
          } else if (articleKey === 'hoodie') {
            if (itemNom.includes('premium')) {
              stylePourPrix = 'premium'; // 1650
            } else if (itemNom.includes('oversize')) {
              stylePourPrix = 'oversize'; // 1600
            } else {
              stylePourPrix = details.defaultStyle; // 'standard' (1260)
            }
          } else {
            stylePourPrix = details.defaultStyle;
          }
        }

        // Priorité 3: Fallback (si on n'a toujours rien trouvé)
        if (!stylePourPrix && details.styles && details.styles.length > 0) {
          stylePourPrix = details.styles[0];
          // console.log(`      [Coût Article] Logique d'inférence échouée...`); // <-- SUPPRIMÉ
        }
        // --- FIN DE LA LOGIQUE DE DÉDUCTION ---

        // 3. Récupérer le prix basé sur le style déterminé
        if (details.prix && details.prix[stylePourPrix] !== undefined) {
          itemCost = details.prix[stylePourPrix];
        } else {
          // On garde ce log, il est important s'il y a une VRAIE erreur
          console.log(`      [Coût Article] PRIX NON TROUVÉ pour ${itemNom} (Style déterminé: ${stylePourPrix})`);
        }
      }
    }
    totalCost += itemCost * quantite;
  }
  return totalCost;
}
// index.js (REMPLACER CETTE FONCTION EN ENTIER)
const SHEET_STATUS_MAP = {
    'enpreparation': 'En préparation',
    'confirme': 'Confirmé',
    'nonconfirme': 'Non confirmé',
    'pretalivrer': 'Prêt a livrer', // Format avec accent
    'echange': 'Echange',
    'envoye': 'Envoyé',
    'annule': 'Annulé',
};


function parseGSheetArticleString(articlesStr) {
    if (!articlesStr || typeof articlesStr !== 'string') return '[]';

    const articles = [];

    // CORRECTION CRITIQUE: On utilise un groupe NON-CAPTURANT (?:...)
    // pour que le split ne retourne que les articles. Ceci supprime le bug du mot "et".
    const separatorsRegex = /\s*(?:\s*\+\s*|\s*,\s*|\s+et\s+)\s*/i;
    
    // split() avec un regex sans groupe de capture retourne seulement les morceaux (les articles).
    const items = articlesStr.split(separatorsRegex).filter(item => item && item.trim() !== '');

    const qteRegex = /^\s*(\d+)\s*x\s*/i; // Ex: "1x "
    const styleRegex = /\((.*?)\)/; // Ex: "(Premium)"

    for (const item of items) {
        let nom = item.trim();
        let quantite = 1;
        let style = '';

        if (!nom) continue; // Skip if item is empty after trim

        // 2. Extraire la quantité (ex: "1x ")
        const qteMatch = nom.match(qteRegex);
        if (qteMatch) {
            quantite = parseInt(qteMatch[1], 10) || 1;
            nom = nom.replace(qteRegex, '').trim(); // Retire "1x "
        }

        // 3. Extraire le style (ex: "(Premium)")
        const styleMatch = nom.match(styleRegex);
        if (styleMatch) {
            style = styleMatch[1].trim().toLowerCase();
            // Retirer le style du nom (pour 'Hoodie (Premium)' -> 'Hoodie')
            nom = nom.replace(styleRegex, '').trim();
        }

        // 4. Utiliser le nom nettoyé pour le coût
        if (nom) {
            articles.push({
                nom: nom.toLowerCase(),
                quantite: quantite,
                style: style
            });
        }
    }

    // 5. Fallback si l'extraction par séparateur a échoué mais qu'il y a du texte
    if (articles.length === 0 && articlesStr.trim() !== '') {
        let nom = articlesStr.trim();
        let quantite = 1;
        let style = '';

        // Tenter d'extraire la quantité
        const qteMatch = nom.match(qteRegex);
        if (qteMatch) {
            quantite = parseInt(qteMatch[1], 10) || 1;
            nom = nom.replace(qteRegex, '').trim();
        }

        // Tenter d'extraire le style
        const styleMatch = nom.match(styleRegex);
        if (styleMatch) {
            style = styleMatch[1].trim().toLowerCase();
            nom = nom.replace(styleRegex, '').trim();
        }

        if (nom) {
            articles.push({ nom: nom.toLowerCase().trim(), quantite: quantite, style: style });
        }
    }

    return JSON.stringify(articles);
}


/**
 * NOUVELLE FONCTION : Calcule le coût de livraison
 * Extrait de financial-summary pour plus de clarté.
 */
function getLivraisonCost(typeLivraison, adresseText) {
  const type = (typeLivraison || 'autre').toLowerCase().trim();
  const adresse = (adresseText || '').toLowerCase();
  
  // Cas 1: Main à main
  if (type === 'main a main') {
    return 0;
  }

  // Cas 2: Domicile ou Bureau
  if (type === 'a domicile' || type === 'bureau') {
    // Commencer avec le prix par défaut
    let cout = PRIX_WILAYAS.defaut.prices[type] || PRIX_WILAYAS.defaut.prices['autre'];

    // Chercher une wilaya correspondante
    // (Cette boucle est rapide car PRIX_WILAYAS est en mémoire)
    for (const wilayaKey in PRIX_WILAYAS) {
      if (wilayaKey === 'defaut') continue;
      
      const wilayaData = PRIX_WILAYAS[wilayaKey];
      const found = wilayaData.names.some(nom => adresse.includes(nom));
      
      if (found) {
        cout = wilayaData.prices[type] || wilayaData.prices['autre'];
        return cout; // On a trouvé, on sort
      }
    }
    return cout; // Retourne le défaut si rien n'est trouvé
  }
  
  // Cas 3: 'autre' ou inconnu
  return PRIX_WILAYAS.defaut.prices['autre'];
}
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


const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://projet-comptalab.vercel.app' 
];

const corsOptions = {
    origin: function (origin, callback) {
        // ... (votre logique d'origine reste inchangée)
        callback(null, true); 
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // 🚨 MODIFICATION CRITIQUE CI-DESSOUS
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'], // <-- AJOUTEZ 'Cache-Control'
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
                
                // INDEX transactions: Recherche rapide par utilisateur
                await db.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);`);


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
                
                // INDEX stock_items: Recherche rapide par utilisateur et par nom
                await db.query(`CREATE INDEX IF NOT EXISTS idx_stock_items_user_id ON stock_items (user_id);`);
                await db.query(`CREATE INDEX IF NOT EXISTS idx_stock_items_user_nom ON stock_items (user_id, nom);`);


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
                        comment TEXT NULL
                        date_ajout TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `, 'stock_retours');
                
                // INDEX stock_retours: Recherche rapide par utilisateur
                await db.query(`CREATE INDEX IF NOT EXISTS idx_stock_retours_user_id ON stock_retours (user_id);`);


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
                
                // INDEX commandes: CRITIQUE pour le filtrage et le tri
                await db.query(`CREATE INDEX IF NOT EXISTS idx_commandes_user_etat ON commandes (user_id, etat);`);
                await db.query(`CREATE INDEX IF NOT EXISTS idx_commandes_date_user ON commandes (user_id, date_commande DESC);`);


                // 5. Utilisateurs
                await createTable(`
                    CREATE TABLE IF NOT EXISTS utilisateurs (
                        id SERIAL PRIMARY KEY,
                        username TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        google_sheet_url TEXT NULL
                    );
                `, 'utilisateurs');

                await createTable(`
    CREATE TABLE IF NOT EXISTS dettes (
        id SERIAL PRIMARY KEY,
        contact_name TEXT NOT NULL,
        debt_type TEXT NOT NULL CHECK(debt_type IN ('article', 'euro', 'dtf', 'autre')),
        montant REAL DEFAULT 0, /* Montant pour euro/dtf/autre, ou coût estimé pour article */
        article_json TEXT NULL, /* Détails des articles (pour les dettes de stock) */
        is_paid BOOLEAN NOT NULL DEFAULT FALSE,
        date_owed TEXT NOT NULL,
        commentaire TEXT NULL,
        user_id INTEGER NOT NULL
    );
`, 'dettes');
await db.query(`CREATE INDEX IF NOT EXISTS idx_dettes_user_contact ON dettes (user_id, contact_name);`);

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


// index.js

// ... (Laissez le code précédent, y compris app.get('/api/transactions', ...))

// POST /api/import-sheets (VERSION FINALE AVEC GESTION ROBUSTE DES TRANSACTIONS)
app.post('/api/import-sheets', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    console.log(`--- POST /api/import-sheets (User ${userId}) ---`);
    if (!db) return res.status(503).json({ error: "Service DB non disponible." });
    if (!sheets) return res.status(503).json({ error: "Service Google Sheets non disponible." });
    
    // Le client unique 'db' est utilisé pour toutes les requêtes transactionnelles.

    try {
        // 1. Récupérer l'URL et lire les données (Utilise db.query)
        const { rows: userRows } = await db.query('SELECT google_sheet_url FROM utilisateurs WHERE id = $1', [userId]);
        const userSheetUrl = userRows[0]?.google_sheet_url;
        if (!userSheetUrl) throw new Error("Aucun lien Google Sheet n'est configuré.");
        const match = userSheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if (!match) throw new Error("Lien Google Sheet invalide.");
        const spreadsheetId = match[1];
        const rawData = await readSheetData(spreadsheetId);
        if (!rawData || rawData.length < 2) throw new Error("Feuille Google Sheet vide ou en-têtes manquants.");

        // 2. Normaliser les en-têtes (headers)
        const headers = rawData[0].map(header =>
            String(header || '').trim().toLowerCase().replace(/[\s/()]+/g, '_')
                .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a')
                .replace(/ç/g, 'c').replace(/[^a-z0-9_]/g, '')
        );

        // 3. Trouver l'index des colonnes essentielles
        const telIndex = headers.indexOf('numero_de_telephone');
        const nomIndex = headers.indexOf('nom_prenom');
        const articlesIndex = headers.indexOf('articles');
        if (telIndex === -1 && nomIndex === -1 && articlesIndex === -1) {
            throw new Error("Colonnes essentielles (numero_de_telephone, nom_prenom, articles) introuvables.");
        }

        // 4. Filtrer les lignes vides
        const filledRows = rawData.slice(1).filter(row => {
            return (row[telIndex] && String(row[telIndex]).trim() !== '') ||
                   (row[nomIndex] && String(row[nomIndex]).trim() !== '') ||
                   (row[articlesIndex] && String(row[articlesIndex]).trim() !== '');
        });
        
        // 5. 🚀 DÉBUT DE LA TRANSACTION : Assure que DELETE et INSERT sont atomiques
        await db.query('BEGIN'); 

        // 6. 💥 EFFACER LES ANCIENNES COMMANDES DE CET UTILISATEUR 💥
        // (Doit être la première chose dans la transaction)
        await db.query(
            `DELETE FROM commandes WHERE user_id = $1`, 
            [userId]
        );
        console.log(`DELETE réussi : Anciennes commandes effacées pour User ${userId}.`);

        // 7. S'il n'y a rien à importer, on s'arrête ici
        if (filledRows.length === 0) {
            console.log("Aucune donnée valide trouvée, COMMIT du nettoyage...");
            await db.query('COMMIT');
            return res.json({ message: "Synchronisation réussie. Aucune commande valide trouvée, la base de données a été nettoyée." });
        }

        // 8. Transformer les lignes
        const transformedData = filledRows.map(row => {
            const commande = {};
            headers.forEach((header, index) => {
                if (header) commande[header] = row[index] !== undefined && row[index] !== null ? String(row[index]) : '';
            });
            return commande;
        });

        // 9. "BULK INSERT" (Préparation et exécution de l'insertion)
        const insertQuery = 
`INSERT INTO commandes (
    user_id, telephone, nom_prenom, adresse, type_livraison, 
    articles, prix_total, date_commande, date_livraison, etat, commentaire
) VALUES `;

        const allParams = []; 
        const valuePlaceholders = []; 
        let paramCounter = 1;

        for (const cmd of transformedData) {
            const articlesJson = parseGSheetArticleString(cmd.articles);
            const prixTotalText = String(cmd.prix_total || '0').replace(/[^0-9.,]/g, '').replace(',', '.');
            
            const rowValues = [
                userId,
                cmd.numero_de_telephone || null,
                cmd.nom_prenom || null,
                cmd['wilaya_commune_et_adresse_nom_du_bureau'] || null,
                cmd.type_de_livraison || null,
                articlesJson, 
                parseFloat(prixTotalText) || 0,
                cmd.date_commande || new Date().toISOString().slice(0, 10),
                cmd['date_a_livre_si_cest_reporte'] || null,
                normalizeStatus(cmd.etat_de_livraison || 'En préparation'),
                cmd.commentaire || null
            ];

            allParams.push(...rowValues);
            const placeholders = rowValues.map(() => `$${paramCounter++}`);
            valuePlaceholders.push(`(${placeholders.join(', ')})`);
        }

        const finalQuery = insertQuery + valuePlaceholders.join(', ');
        await db.query(finalQuery, allParams);
        
        // 10. Valider la transaction
        await db.query('COMMIT'); // FIN DE LA TRANSACTION (Sauvegarde)

        console.log(`Importation réussie pour User ${userId}: ${filledRows.length} commandes.`);
        res.json({ message: `Synchronisation réussie. ${filledRows.length} commandes ont été importées.` });

    } catch (err) {
        // 11. Annuler la transaction en cas d'erreur
        console.warn("---! ERREUR CRITIQUE D'IMPORTATION, ROLLBACK !---");
        // Le ROLLBACK force l'annulation de toutes les commandes (y compris le DELETE)
        // si une erreur (comme une erreur d'insertion) s'est produite.
        await db.query('ROLLBACK');
        console.error("Erreur POST /api/import-sheets:", err.message, err.stack);
        res.status(500).json({ error: `Erreur serveur lors de l'importation: ${err.message}` });
    } finally {
        console.log(`Importation (User ${userId}) terminée.`);
    }
});

// comtalab/index.js (AJOUTER CE BLOC APRÈS app.put('/api/commandes/:id', ...))

// PUT /api/commandes/:id/sync-sheet
// PUT /api/commandes/:id/sync-sheet
// Synchronise l'état de la DB vers le Google Sheet pour une seule commande
app.put('/api/commandes/:id/sync-sheet', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const commandeId = req.params.id;
    // Le statut tel qu'il doit être affiché dans Sheets (ex: "Prêt a livrer")
    const { newStatus } = req.body; 

    if (!newStatus) {
        return res.status(400).json({ error: 'newStatus est requis.' });
    }
    if (!db || !sheets) {
        return res.status(503).json({ error: "Service DB ou Google Sheets non disponible." });
    }

    try {
        // 1. Récupérer l'URL du Sheet et les détails de la commande depuis la DB
        const { rows: userRows } = await db.query('SELECT google_sheet_url FROM utilisateurs WHERE id = $1', [userId]);
        const userSheetUrl = userRows[0]?.google_sheet_url;
        if (!userSheetUrl) {
            return res.status(200).json({ message: "OK: Pas de lien Google Sheet, synchro ignorée." });
        }
        const match = userSheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if (!match) {
            return res.status(400).json({ error: "Lien Google Sheet invalide." });
        }
        const spreadsheetId = match[1];

        const { rows: commandeRows } = await db.query('SELECT * FROM commandes WHERE id = $1 AND user_id = $2', [commandeId, userId]);
        const commande = commandeRows[0];
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée ou non autorisée." });
        }

        // 2. Trouver le numéro de ligne dans le Google Sheet (utilise la fonction getOriginalRowIndex)
        const rowIndex = await getOriginalRowIndex(spreadsheetId, sheets, commande); 

        if (rowIndex === null) {
            return res.status(200).json({ message: "OK: Ligne non trouvée dans le Sheet, synchro ignorée." });
        }
        
        // 3. Mettre à jour le statut dans Google Sheets
        const metaResponse = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
            fields: 'sheets.properties.title'
        });
        const sheetName = metaResponse.data.sheets[0].properties.title;
        
        // STATUS_COLUMN_LETTER est défini en haut du fichier (colonne 'I')
        const range = `${STATUS_COLUMN_LETTER}${rowIndex}`; 

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: `'${sheetName}'!${range}`, 
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[newStatus]],
            },
        });

        res.json({ message: `Statut de la ligne ${rowIndex} mis à jour dans le Sheet à '${newStatus}'` });

    } catch (err) {
        console.error(`Erreur Sheets PUT /api/commandes/${commandeId}/sync-sheet:`, err.message);
        res.status(500).json({ error: `Erreur synchro Sheets: ${err.message}` });
    }
});


// NOUVEAU: PUT /api/commandes/:id (Mettre à jour l'état de la commande de l'utilisateur)
app.put('/api/commandes/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const commandeId = req.params.id;
    // On récupère SEULEMENT l'état (le champ qui change)
    const { etat } = req.body; 

    if (!etat) {
        return res.status(400).json({ error: 'Le champ "etat" est requis pour la mise à jour.' });
    }
    const normalizedEtat = normalizeStatus(etat); // Utilise la fonction de normalisation globale

    try {
        // CRITIQUE: Mise à jour sécurisée, vérifie l'ID de la commande ET l'ID de l'utilisateur
        const sql = `UPDATE commandes SET etat = $1 WHERE id = $2 AND user_id = $3 RETURNING id, etat`;

        const { rowCount, rows } = await db.query(sql, [
            normalizedEtat,
            commandeId,
            userId
        ]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Commande non trouvée ou non autorisée" });
        }

        console.log(`PUT /api/commandes/${commandeId}: Statut mis à jour à ${normalizedEtat}.`);
        res.json({ id: commandeId, etat: rows[0].etat });

    } catch (err) {
        console.error(`Erreur DB PUT /api/commandes/${commandeId}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});


// ... (Laissez le reste des routes (POST/PUT/DELETE /api/transactions, etc.) tel quel)


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

    if (!date || montant === undefined || montant === null || !type || !categorie) {
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

    if (!date || montant === undefined || montant === null || !type || !categorie) {
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
// CORRIGÉ : Ajout de la validation du lien avant enregistrement.
app.put('/api/user/sheet-link', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { googleSheetUrl } = req.body;
    console.log(`--- PUT /api/user/sheet-link (User ${userId}) ---`);

    if (!googleSheetUrl) {
        return res.status(400).json({ message: 'Le lien Google Sheet est requis.' });
    }

    // --- AMÉLIORATION ---
    // Valider le lien AVANT de le sauver.
    const match = googleSheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!match || !match[1]) {
        return res.status(400).json({ message: "Lien Google Sheet invalide. Assurez-vous d'utiliser le format d'URL complet." });
    }
    // --- FIN AMÉLIORATION ---

    try {
        const sql = `UPDATE utilisateurs SET google_sheet_url = $1 WHERE id = $2 RETURNING username, google_sheet_url`;
        const { rows } = await db.query(sql, [googleSheetUrl, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        console.log(`Lien Google Sheet mis à jour pour ${rows[0].username}.`);

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
// CORRIGÉ : Gestion d'erreur plus propre, suppression du fallback 'Feuille 2'
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

        if (!metaResponse.data.sheets || metaResponse.data.sheets.length === 0) {
          throw new Error("Le Google Sheet ne contient aucune feuille.");
        }
        
        // Assumer que la première feuille (index 0) contient les commandes
        sheetName = metaResponse.data.sheets[0].properties.title;
        console.log(`Lecture à partir de la feuille: "${sheetName}"`);

    } catch (error) {
        console.error("Erreur de récupération du nom de la feuille:", error.message);
        throw new Error(`Impossible de lire le nom de la feuille: ${error.message}`);
    }

    // Le Range DOIT inclure le nom de la feuille, 'A:J' est une supposition
    const RANGE = `'${sheetName}'!A:J`;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: RANGE,
        });
        return response.data.values || [];
    } catch (error) {
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

        // BUG CORRIGÉ : Récupérer le nom de la feuille avant de mettre à jour
        let sheetName;
        try {
            const metaResponse = await sheets.spreadsheets.get({
                spreadsheetId: spreadsheetId,
                fields: 'sheets.properties.title'
            });
            sheetName = metaResponse.data.sheets[0].properties.title;
        } catch (metaErr) {
            console.error("Erreur de récupération du nom de la feuille:", metaErr.message);
            return res.status(500).json({ error: "Impossible de déterminer le nom de la feuille." });
        }
        // FIN CORRECTION BUG

        // Déterminer la colonne d'état (basée sur l'ancienne constante STATUS_COLUMN_LETTER = 'I')
        const range = `${STATUS_COLUMN_LETTER}${rowIndex}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: `'${sheetName}'!${range}`, // Ex: 'Feuille 2'!I2
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

// comtalab/index.js (Remplacez la fonction DELETE GROUPE DE RETOURS)

// 1. DELETE GROUPE DE RETOURS (Par Modèle/Taille)
app.delete('/api/retours/group', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    // Les paramètres proviennent de req.query (frontend)
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
                paramIndex++; // 🚨 CORRECTION : Incrémente l'index pour le paramètre suivant
            }
        };

        addRetoursCondition('description', descFinal);
        addRetoursCondition('style', styleFinal);
        addRetoursCondition('taille', tailleFinal);

        const sql = `DELETE FROM stock_retours WHERE ` + sqlParts.join(' AND ') + ` RETURNING id`;

        // Execute la suppression
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


app.get('/api/commandes', authenticateToken, async (req, res) => {
    // 🚨 CORRECTION CRITIQUE: Assurer que seule les commandes de l'utilisateur sont retournées
    const userId = req.user.id; // L'ID est extrait du token JWT (unique à l'utilisateur)
    
    try {
        // NOUVEAU: Ajout de 'WHERE user_id = $1' pour garantir l'isolation des données
        const sql = `SELECT * FROM commandes WHERE user_id = $1 ORDER BY date_commande DESC`;
        const { rows } = await db.query(sql, [userId]);

        console.log(`GET /api/commandes: ${rows.length} commandes trouvées pour User ${userId}.`);
        res.json(rows);
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
            normalizeStatus(etat || 'En préparation'),
            commentaire || null,
            userId
        ]);

        res.status(201).json({ id: rows[0].id, ...req.body, articles: articles });

    } catch (err) {
        console.error("Erreur DB POST /api/commandes:", err.message);
        res.status(500).json({ error: err.message });
    }
});


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



// index.js (ROUTE MANQUANTE À AJOUTER APRÈS POST/DELETE /api/commandes)

// PUT /api/commandes/:id (Mettre à jour l'état de la commande)
app.put('/api/commandes/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const commandeId = req.params.id;
    // On s'assure de récupérer SEULEMENT l'état ou les champs nécessaires
    const { etat } = req.body; 

    if (!etat) {
        return res.status(400).json({ error: 'Le champ "etat" est requis pour la mise à jour.' });
    }
    const normalizedEtat = normalizeStatus(etat); // Utilise votre fonction de normalisation

    try {
        const sql = `UPDATE commandes SET etat = $1 WHERE id = $2 AND user_id = $3 RETURNING id, etat`;

        const { rowCount, rows } = await db.query(sql, [
            normalizedEtat,
            commandeId,
            userId
        ]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Commande non trouvée ou non autorisée" });
        }

        console.log(`PUT /api/commandes/${commandeId}: Statut mis à jour à ${normalizedEtat}.`);
        // Le frontend n'a besoin que du statut normalisé pour mettre à jour son état local
        res.json({ id: commandeId, etat: rows[0].etat });

    } catch (err) {
        console.error(`Erreur DB PUT /api/commandes/${commandeId}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// NOUVELLE ROUTE : GET /api/dashboard-data
app.get('/api/dashboard-data', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);
    console.log(`--- GET /api/dashboard-data (User ${userId}) ---`);

    try {
        // --- 1. Calcul du Solde Actuel (Balance) ---
        const { rows: balanceRows } = await db.query(
            `SELECT 
                SUM(CASE WHEN type = 'revenu' THEN montant ELSE 0 END) AS total_revenu,
                SUM(CASE WHEN type = 'depense' THEN montant ELSE 0 END) AS total_depense
             FROM transactions
             WHERE user_id = $1`,
            [userId]
        );
        const totalRevenu = parseFloat(balanceRows[0]?.total_revenu || 0);
        const totalDepense = parseFloat(balanceRows[0]?.total_depense || 0);
        const totalBalance = totalRevenu - totalDepense;


        // --- 2. Calcul de la Valeur Totale du Stock (Total Stock Value) ---
        // Utilisation du champ 'prix' qui représente le prix de vente unitaire
        const { rows: stockValueRows } = await db.query(
            `SELECT SUM(quantite * prix) AS total_value 
             FROM stock_items 
             WHERE user_id = $1`,
            [userId]
        );
        const totalStockValue = parseFloat(stockValueRows[0]?.total_value || 0);


        // --- 3. Calcul du Gain Net du Jour (Todays Potential Gain) ---
        // On cherche les commandes confirmées aujourd'hui.
        const normalizedConfirme = normalizeStatus('Confirmé');
        const { rows: todaysCommands } = await db.query(
            `SELECT articles, prix_total, type_livraison, adresse, date_commande
             FROM commandes 
             WHERE user_id = $1 AND etat = $2 AND date_commande = $3`,
            [userId, normalizedConfirme, today]
        );

        let todaysPotentialGain = 0;
        let todaysTotalLivraison = 0;
        let todaysTotalCost = 0;

        for (const cmd of todaysCommands) {
            const prixTotal = parseFloat(cmd.prix_total || 0);
            const coutArticle = parseArticleCost(cmd.articles || '[]');
            const coutLivraison = getLivraisonCost(cmd.type_livraison, cmd.adresse);
            
            todaysTotalCost += coutArticle;
            todaysTotalLivraison += coutLivraison;
            todaysPotentialGain += (prixTotal - coutArticle - coutLivraison);
        }

        // --- 4. Top Catégories (Top 3 des ventes) ---
        // Simplification : On compte les articles vendus (en général)
        const topCategories = [
            // C'est un calcul complexe qui nécessiterait de parser chaque JSON d'article.
            // Pour l'instant, on laisse vide, ou on renvoie une valeur factice.
            // Le frontend gère ce cas.
        ];
        
        // --- 5. Top Wilayas (Top 5 des commandes) ---
        // On fait un COUNT GROUP BY sur les adresses (simplifié à la wilaya/adresse)
        const { rows: topWilayasRows } = await db.query(
            `SELECT adresse, COUNT(id) AS count
             FROM commandes 
             WHERE user_id = $1 AND adresse IS NOT NULL AND adresse != ''
             GROUP BY adresse
             ORDER BY count DESC
             LIMIT 5`,
            [userId]
        );
        
        const topWilayas = topWilayasRows.map(row => ({ 
            // On utilise l'adresse comme nom de wilaya
            name: row.adresse.substring(0, 30) + (row.adresse.length > 30 ? '...' : ''), 
            count: parseInt(row.count) 
        }));

const normalizedPretALivrer = normalizeStatus('Prêt a livrer');

const { rows: pretALivrerCommands } = await db.query(
    `SELECT articles, prix_total, type_livraison, adresse 
     FROM commandes 
     WHERE user_id = $1 AND etat = $2`,
    [userId, normalizedPretALivrer]
);

let totalPotentialGain = 0;

for (const cmd of pretALivrerCommands) {
    const prixTotal = parseFloat(cmd.prix_total || 0);
    const coutArticle = parseArticleCost(cmd.articles || '[]');
    const coutLivraison = getLivraisonCost(cmd.type_livraison, cmd.adresse);
    
    // Gain net potentiel = Prix Total - Coût Article - Coût Livraison
    totalPotentialGain += (prixTotal - coutArticle - coutLivraison);
}
        // --- Résultat final pour le frontend ---
        res.json({
            totalBalance,       // Le solde exact de toutes les transactions
            totalStockValue,    // Valeur totale du stock
            todaysPotentialGain: totalPotentialGain,
            topCategories,
            topWilayas
        });

    } catch (err) {
        console.error("Erreur DB GET /api/dashboard-data:", err.message, err.stack);
        res.status(500).json({ error: `Erreur serveur lors du chargement du tableau de bord: ${err.message}` });
    }
});
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

// index.js (REMPLACEZ CETTE ROUTE EN ENTIER - Version 2)

// Assurez-vous que cette fonction JS est bien en haut de votre fichier index.js
function normalizeStatus(status) {
    if (!status) return '';
    return status.toLowerCase()
        .replace(/[\s\t\-]/g, '') // Supprime les espaces et tirets
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
}

// index.js (REMPLACEZ LA FONCTION getOriginalRowIndex EN ENTIER)

/**
// index.js (REMPLACEZ LA FONCTION getOriginalRowIndex EN ENTIER)

/**
 * Tente de retrouver le numéro de ligne d'une commande dans le Google Sheet
 * en se basant sur le numéro de téléphone normalisé.
 * @returns Le numéro de ligne dans le Sheet (ex: 2 pour la première commande), ou null.
 */
async function getOriginalRowIndex(spreadsheetId, sheets, commande) {
    if (!spreadsheetId || !sheets || !commande.telephone) return null;

    // NORMALISATION : Garde uniquement les chiffres (sécurité maximale)
    const normalizePhone = (phone) => {
        if (!phone) return '';
        return String(phone).replace(/[^0-9]/g, ''); 
    };

    // Préparation du numéro DB : sans le 213 si présent
    const normalizedDbPhone = normalizePhone(commande.telephone);
    const finalDbPhone = normalizedDbPhone.startsWith('213') 
        ? normalizedDbPhone.substring(3) 
        : normalizedDbPhone;
    
    if (finalDbPhone.length < 8) { 
        console.warn(`Téléphone DB trop court pour la recherche: ${commande.telephone}`);
        return null;
    }
    
    console.log(`Recherche du tel DB normalisé: ${finalDbPhone}`);

    let sheetName;
    try {
        const metaResponse = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
            fields: 'sheets.properties.title'
        });
        sheetName = metaResponse.data.sheets[0].properties.title;
    } catch (metaErr) {
        console.error("Impossible de déterminer le nom de la feuille pour le patch.");
        return null; 
    }
    
    // Colonnes A:C (A=Téléphone, B=Nom/Prénom, C=...)
    const RANGE = `'${sheetName}'!A:C`;
    
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: RANGE });
        const values = response.data.values || [];

        // On commence à la ligne 2 (index 1 du tableau)
        for (let i = 1; i < values.length; i++) {
            const row = values[i];
            
            // 🚨 CHANGEMENT CRITIQUE : Le téléphone est maintenant à l'index 0 (COLONNE A)
            const telSheet = String(row[0] || '').trim(); 

            const normalizedSheetPhone = normalizePhone(telSheet);
            
            // Si le numéro Sheet commence par '213', on le tronque
            const finalSheetPhone = normalizedSheetPhone.startsWith('213')
                ? normalizedSheetPhone.substring(3)
                : normalizedSheetPhone;

            // Comparaison principale
            if (finalSheetPhone === finalDbPhone) {
                // Vérification secondaire du Nom (à l'index 1 = Colonne B)
                const nomSheet = String(row[1] || '').trim().toLowerCase();
                const nomDb = String(commande.nom_prenom || '').trim().toLowerCase();

                if (nomSheet.includes(nomDb.substring(0, 5)) || nomDb.includes(nomSheet.substring(0, 5)) || nomDb === '') {
                     console.log(`✅ Ligne trouvée : ${i + 1} (Tel en Col A)`);
                     return i + 1; 
                }
            }
        }
        console.warn(`Ligne non trouvée dans Google Sheet pour le téléphone: ${commande.telephone}`);
        return null;
    } catch (error) {
        console.error("Erreur de lecture Google Sheet pour retrouver l'index:", error.message);
        return null;
    }
}

app.get('/api/financial-summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { filter = 'actifs' } = req.query;

  if (!db) return res.status(503).json({ error: "Service DB non disponible." });

  try {
    const statutsActifsRaw = ['En préparation', 'Confirmé', 'Prêt à Livrer', 'Echange'];
    const normalizedStatutsActifs = statutsActifsRaw.map(s => normalizeStatus(s));
    const normalizedFilter = normalizeStatus(filter);

    // 1. On prend TOUT ce qui appartient à l'utilisateur (requête rapide)
    const sql = 'SELECT prix_total, type_livraison, adresse, articles, etat FROM commandes WHERE user_id = $1';
    const { rows: allDbCommandes } = await db.query(sql, [userId]);

    if (!allDbCommandes || allDbCommandes.length === 0) {
      return res.json({ totalCommandes: 0, totalLivraison: 0, totalCoutArticles: 0, gainPotentiel: 0 });
    }

    // 2. On filtre en JAVASCRIPT (fiable et rapide)
    let commandes; 
    const commandesNonAnnulees = allDbCommandes.filter(cmd => normalizeStatus(cmd.etat) !== 'annule');

    if (normalizedFilter === 'tous') {
      commandes = commandesNonAnnulees;
    } else if (normalizedFilter === 'actifs') {
      commandes = commandesNonAnnulees.filter(cmd => 
        normalizedStatutsActifs.includes(normalizeStatus(cmd.etat))
      );
    } else {
      commandes = allDbCommandes.filter(cmd => 
        normalizeStatus(cmd.etat) === normalizedFilter
      );
    }

    if (commandes.length === 0) {
      return res.json({ totalCommandes: 0, totalLivraison: 0, totalCoutArticles: 0, gainPotentiel: 0 });
    }

    // 3. Logique de calcul
    let totalCommandes = 0;
    let totalLivraison = 0;
    let totalCoutArticles = 0;

    console.log(` -> Calcul de ${commandes.length} commandes (Filtre: ${filter})...`);
    for (const cmd of commandes) {
      // A. Total des ventes
      // (Gère les formats "1500" ou "1.500" ou "1,500")
      const prixTotalText = String(cmd.prix_total || '0').replace(/[^0-9,.]/g, '').replace(',', '.');
      const prix_total = parseFloat(prixTotalText) || 0;
      totalCommandes += prix_total;

      // B. Coût des articles (utilise le JSON, qui est maintenant correct grâce à l'import)
      const articlesText = cmd.articles || '[]';
      const coutArticle = parseArticleCost(articlesText); 
      totalCoutArticles += coutArticle;

      // C. Coût de livraison (utilise la nouvelle fonction)
      const coutLivraison = getLivraisonCost(cmd.type_livraison, cmd.adresse);
      totalLivraison += coutLivraison;
    }

    const gainNetPotentiel = totalCommandes - totalLivraison - totalCoutArticles;

    console.log(`--- Totaux (Filtre: ${filter}) ---`);
    console.log(`Total Ventes: ${totalCommandes}`);
    console.log(`Total Livraison: ${totalLivraison}`);
    console.log(`Total Coût Articles: ${totalCoutArticles}`);
    console.log(`Bénéfice Brut: ${gainNetPotentiel}`);

    res.json({
      totalCommandes,
      totalLivraison,
      totalCoutArticles,
      gainPotentiel: gainNetPotentiel
    });

  } catch (err) {
    console.error("Erreur DB GET /api/financial-summary:", err.message, err.stack);
    res.status(500).json({ error: `Erreur serveur lors de la récupération du résumé : ${err.message}` });
  }
});

// comtalab/index.js (À insérer après la dernière route /api/stock ou /api/retours)

// --- API DETTES & FOURNISSEURS ---
// comtalab/index.js (Route POST /api/dettes)

app.post('/api/dettes', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    // Ajout de 'commentaire'
    const { contact_name, debt_type, amount, article_json, date_owed, comment } = req.body; 
    
    if (!contact_name || !debt_type || !date_owed) {
        return res.status(400).json({ error: 'Nom du contact, type de dette et date sont requis.' });
    }

    try {
        const finalMontant = calculateDebtCost(debt_type, amount, article_json);
        
        // REQUÊTE CORRIGÉE (7 colonnes, 7 paramètres)
        const sql = `
            INSERT INTO dettes (user_id, contact_name, debt_type, montant, article_json, date_owed, commentaire) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id, montant, debt_type, contact_name, is_paid, date_owed, article_json, commentaire`; // AJOUT DE 'commentaire' DANS RETURNING

        const { rows } = await db.query(sql, [
            userId,                          // $1
            contact_name,                    // $2
            debt_type,                       // $3
            finalMontant,                    // $4
            article_json || null,            // $5
            date_owed,                       // $6
            comment || null                  // $7 <-- LE 7ème PARAMÈTRE
        ]);

        res.status(201).json({ 
            id: rows[0].id, 
            contact_name: rows[0].contact_name, 
            debt_type: rows[0].debt_type, 
            montant: rows[0].montant,
            date_owed: rows[0].date_owed,
            article_json: rows[0].article_json,
            commentaire:commentaire, // <-- RENVOI DU COMMENTAIRE
            is_paid: false 
        });

    } catch (err) {
        console.error("Erreur DB POST /api/dettes:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dettes (Récupérer les dettes)
app.get('/api/dettes', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { status = 'unpaid' } = req.query; // 'unpaid', 'paid', ou 'all'
    
    let whereClause = `WHERE user_id = $1`;
    const params = [userId];

    if (status === 'unpaid') {
        whereClause += ` AND is_paid = FALSE`;
    } else if (status === 'paid') {
        whereClause += ` AND is_paid = TRUE`;
    }
    
    try {
        const sql = `SELECT * FROM dettes ${whereClause} ORDER BY date_owed DESC`;
        const { rows } = await db.query(sql, params);
        res.json(rows);

    } catch (err) {
        console.error("Erreur DB GET /api/dettes:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// GET /api/dettes/summary (Résumé par contact)
app.get('/api/dettes/summary', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const sql = `
            SELECT 
                contact_name,
                COUNT(id) AS total_debts,
                SUM(CASE WHEN is_paid = FALSE THEN montant ELSE 0 END) AS total_unpaid_amount,
                SUM(montant) AS total_amount
            FROM dettes 
            WHERE user_id = $1
            GROUP BY contact_name
            ORDER BY total_unpaid_amount DESC
        `;
        const { rows } = await db.query(sql, [userId]);
        
        // Mettre en forme les résultats (assurer que les nombres sont en float)
        const summary = rows.map(row => ({
            contact_name: row.contact_name,
            total_debts: parseInt(row.total_debts, 10),
            total_unpaid_amount: parseFloat(row.total_unpaid_amount) || 0,
            total_amount: parseFloat(row.total_amount) || 0
        }));

        res.json(summary);

    } catch (err) {
        console.error("Erreur DB GET /api/dettes/summary:", err.message);
        res.status(500).json({ error: "Erreur serveur lors du calcul du résumé." });
    }
});


// PUT /api/dettes/:id/pay (Marquer une dette comme payée)
app.put('/api/dettes/:id/pay', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const debtId = req.params.id;
    
    try {
        const sql = `
            UPDATE dettes 
            SET is_paid = TRUE 
            WHERE id = $1 AND user_id = $2
            RETURNING id, contact_name
        `;
        const { rowCount } = await db.query(sql, [debtId, userId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Dette non trouvée ou non autorisée." });
        }
        res.json({ message: "Dette marquée comme payée.", id: debtId });

    } catch (err) {
        console.error("Erreur DB PUT /api/dettes/pay:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// DELETE /api/dettes/:id (Supprimer une dette)
app.delete('/api/dettes/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const debtId = req.params.id;
    
    try {
        const { rowCount } = await db.query(`DELETE FROM dettes WHERE id = $1 AND user_id = $2`, [debtId, userId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Dette non trouvée ou non autorisée" });
        }
        res.status(200).json({ message: "Dette supprimée." });

    } catch (err) {
        console.error(`Erreur DB DELETE /api/dettes/${debtId}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});
// src/pages/CommandesPage.jsx
import React, { useState, useEffect } from 'react';
import './CommandesPage.css'; // On garde le même CSS

// MODIFIÉ: La fonction extractIframeSrc n'est plus nécessaire, on la supprime.

function CommandesPage({ user, onUserUpdate }) {
  const [sheetUrl, setSheetUrl] = useState(user?.google_sheet_url || null);
  // MODIFIÉ: Renommé iframeInput en urlInput pour plus de clarté
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSheetUrl(user?.google_sheet_url || null);
  }, [user]);

  const handleSaveSheetUrl = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // MODIFIÉ: Utilise directement l'URL entrée par l'utilisateur
    const newUrl = urlInput.trim(); // trim() enlève les espaces au début/fin

    // MODIFIÉ: Vérification simple si l'URL semble valide (commence par http)
    if (!newUrl || !newUrl.startsWith('http')) {
      setError("Veuillez entrer une URL Google Sheet valide (elle doit commencer par http ou https).");
      setLoading(false);
      return;
    }

    // MODIFIÉ: On vérifie si l'URL contient bien '/edit' pour rappeler que c'est le lien d'édition
    if (!newUrl.includes('/edit')) {
       setError("Attention : Pour pouvoir modifier la feuille, assurez-vous d'utiliser le lien d'édition (celui qui contient '/edit' dans l'URL).");
       // On ne bloque pas la sauvegarde, mais on prévient l'utilisateur
    }


    try {
      const response = await fetch('http://localhost:3001/api/user/sheet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          // MODIFIÉ: Envoie la nouvelle URL directement
          google_sheet_url: newUrl
        }),
      });

      if (response.ok) {
        alert('Lien Google Sheet sauvegardé !');
        // MODIFIÉ: Met à jour l'utilisateur et vide le champ d'URL
        onUserUpdate({ ...user, google_sheet_url: newUrl });
        setUrlInput(''); // Vide le champ après sauvegarde
        // MODIFIÉ: Met à jour directement l'état local pour afficher l'iframe sans recharger
        setSheetUrl(newUrl);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Erreur lors de la sauvegarde.');
      }
    } catch (err) {
      setError('Erreur réseau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  // --- AFFICHAGE ---

  // CAS 1: L'utilisateur a déjà une URL sauvegardée
  if (sheetUrl) {
    return (
      <div className="commandes-page-content full-iframe-mode">
        <iframe
          src={sheetUrl}
          title="Google Sheet Commandes"
          className="google-sheet-iframe"
        ></iframe>
        {/* MODIFIÉ: Le bouton change l'état local pour revenir au formulaire */}
        <button onClick={() => setSheetUrl(null)} className="btn-change-sheet">
          Changer le lien Google Sheet
        </button>
      </div>
    );
  }

  // CAS 2: L'utilisateur n'a pas encore d'URL
  return (
    <div className="commandes-page-content setup-mode">
      <h2>Connecter votre Google Sheet</h2>
      {/* MODIFIÉ: Instructions mises à jour */}
      <p>Pour afficher et modifier vos commandes, collez l'URL d'édition de votre Google Sheet ici.</p>
      
      {/* MODIFIÉ: Instructions mises à jour */}
      <ol className="instructions">
        <li>Ouvrez votre Google Sheet dans votre navigateur.</li>
        <li>Copiez l'URL complète depuis la barre d'adresse. Elle doit ressembler à :<br /> `https://docs.google.com/spreadsheets/d/..../edit#gid=0`</li>
        <li>Assurez-vous que vous êtes connecté au bon compte Google dans ce navigateur et que ce compte a les permissions de modification sur la feuille.</li>
      </ol>

      <form className="setup-form" onSubmit={handleSaveSheetUrl}>
        {/* MODIFIÉ: Label mis à jour */}
        <label>Collez l'URL de votre Google Sheet ici :</label>
        {/* MODIFIÉ: Champ changé en input type="url" */}
        <input
          type="url" // Change le type pour une meilleure validation/clavier mobile
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          required
          style={{ // Ajout rapide de style pour l'input
             width: '100%',
             padding: '10px',
             borderRadius: '6px',
             border: '1px solid var(--border-color)',
             fontSize: '0.9rem',
             fontFamily: 'sans-serif', // Police normale
             boxSizing: 'border-box' // Pour que padding ne dépasse pas la largeur
          }}
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Sauvegarde...' : 'Sauvegarder et Afficher'}
        </button>
      </form>
    </div>
  );
}

export default CommandesPage;
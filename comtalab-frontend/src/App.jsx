import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

// Import des icônes Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faExchangeAlt, faBox, faClipboardList, faUndo, faSignOutAlt, faHandshake } from '@fortawesome/free-solid-svg-icons';

// Imports des Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import CommandesPage from './pages/CommandesPage';
import RetoursPage from './pages/RetoursPage';
import DettesPage from './pages/DettesPage';

// Imports des Composants
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardDepenses from './components/DashboardDepenses';
import DashboardRevenu from './components/DashboardRevenu';
import NetBenefitSummary from './components/NetBenefitSummary';

import './App.css';

// --- Composant Sidebar ---
function Sidebar({ handleLogout }) {
  return (
    <nav className="sidebar">
      <h3 className="sidebar-title">Menu</h3>
      <ul>
        <li> <Link to="/"> <FontAwesomeIcon icon={faHome} className="sidebar-icon" /> <span className="sidebar-text">Accueil</span> </Link> </li>
        <li> <Link to="/transactions"> <FontAwesomeIcon icon={faExchangeAlt} className="sidebar-icon" /> <span className="sidebar-text">Transactions</span> </Link> </li>
        <li> <Link to="/stock"> <FontAwesomeIcon icon={faBox} className="sidebar-icon" /> <span className="sidebar-text">Stock</span> </Link> </li>
        <li> <Link to="/commandes"> <FontAwesomeIcon icon={faClipboardList} className="sidebar-icon" /> <span className="sidebar-text">Commandes</span> </Link> </li>
        <li> <Link to="/retours"> <FontAwesomeIcon icon={faUndo} className="sidebar-icon" /> <span className="sidebar-text">Retours</span> </Link> </li>
        <li> <Link to="/dettes"> <FontAwesomeIcon icon={faHandshake} className="sidebar-icon" /> <span className="sidebar-text">Dettes</span> </Link> </li>
      </ul>
      <button onClick={handleLogout} className="logout-button-sidebar">
        <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" />
        <span className="sidebar-text">Déconnexion</span>
      </button>
    </nav>
  );
}
// --- FIN Sidebar ---


function App() {
  // --- États Globaux ---
  const [transactions, setTransactions] = useState([]);
  const [soldeTotal, setSoldeTotal] = useState(0); // 🚨 NOUVEL ÉTAT
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  // --- Fonctions Backend ---
  // Utilisation de useCallback pour stabiliser la fonction
  const refreshTransactions = useCallback(async () => {
    console.log("Déclenchement du rafraîchissement des transactions...");
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        
        // ✅ CORRECTION CRITIQUE ICI : lecture de la nouvelle structure {transactions, solde}
        if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          setSoldeTotal(data.solde || 0); // Mise à jour du solde
          console.log(`${data.transactions.length} transactions chargées.`);
        } else {
          setTransactions([]);
          setSoldeTotal(0);
          console.error("Erreur de format de données de transactions reçues.");
        }
        
      } else if (response.status === 401 || response.status === 403) {
        handleLogout();
      } else { 
        console.error("Erreur serveur lors de la récupération des transactions:", response.status);
        setTransactions([]); 
        setSoldeTotal(0);
      }
    } catch (error) { 
      console.error("Erreur réseau lors du rafraîchissement:", error);
      setTransactions([]);
      setSoldeTotal(0);
    }
  }, [token]);

  const runBackgroundSync = async () => {
    if (!token) return;
    console.log("Auto-Sync: Démarrage...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/import-sheets`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        console.error('Auto-Sync: Échec.');
      } else {
        const data = await response.json();
        console.log(`Auto-Sync: ${data.message}`);
        refreshTransactions(); // <-- Rafraîchit les transactions après la synchro
      }
    } catch (err) {
      console.error("Auto-Sync: Erreur réseau.", err);
    }
  };

  useEffect(() => {
    let syncTimer;
    if (token) {
      refreshTransactions(); // Premier appel pour charger les données
      runBackgroundSync(); // Premier appel pour la synchro
      syncTimer = setInterval(runBackgroundSync, 120000);
    } else {
      setTransactions([]);
      setSoldeTotal(0); // Réinitialiser le solde
    }
    return () => {
      if (syncTimer) {
        clearInterval(syncTimer);
      }
    };
  }, [token, refreshTransactions]);

  const handleLogin = (userObject, receivedToken) => {
    setCurrentUser(userObject);
    setToken(receivedToken);
    localStorage.setItem('user', JSON.stringify(userObject));
    localStorage.setItem('token', receivedToken);
    navigate('/');
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setTransactions([]);
    setSoldeTotal(0); // Réinitialiser le solde
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction);
    setSelectedDate(transaction.date);
  };

  const handleDelete = async (idASupprimer) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer cette transaction ?")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${idASupprimer}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        refreshTransactions();
        setTransactionToEdit(null);
      } else {
        const errData = await response.json();
        console.error(`Erreur lors de la suppression: ${errData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur réseau lors de la suppression:', error);
    }
  };
  // --- Fin Fonctions ---

  // --- Calculs ---
  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(tx => tx.date === selectedDate) : [];
  // soldeActuel est remplacé par soldeTotal provenant de l'API
  // --- Fin Calculs ---


  // --- Rendu JSX ---
  return (
    <Routes>
      {/* --- Route /login --- */}
      <Route path="/login" element={ token ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} /> } />

      {/* --- Route /transactions --- */}
      <Route
        path="/transactions"
        element={
          token ? (
            <div className="page-layout-with-sidebar">
              <Sidebar handleLogout={handleLogout} />
              <main className="main-page-content">
                <div className="main-content">
                  <div className="form-section">
                    <TransactionForm 
                      onFormSubmit={refreshTransactions} 
                      transactionToEdit={transactionToEdit} 
                      setTransactionToEdit={setTransactionToEdit} 
                      selectedDate={selectedDate} 
                      setSelectedDate={setSelectedDate} 
                      token={token} 
                    />
                  </div>
                  <div className="list-section"> 
                    <TransactionList 
                      displayedTransactions={filteredTransactions} 
                      onDelete={handleDelete} 
                      onEdit={handleEdit} 
                      selectedDate={selectedDate} 
                      onDateChange={setSelectedDate} 
                      totalDepensesJour={filteredTransactions.filter(tx => tx.type === 'depense').reduce((acc, tx) => acc + tx.montant, 0)}
                      soldeTotal={soldeTotal} // 🚨 NOUVEAU PROP PASSÉ
                    /> 
                  </div>
                </div>
                <div className="dashboards-container"> 
                  <DashboardDepenses allTransactions={transactions} selectedDate={selectedDate}/> 
                  <DashboardRevenu allTransactions={transactions} selectedDate={selectedDate}/> 
                </div>
                <NetBenefitSummary allTransactions={transactions} selectedDate={selectedDate} />
              </main>
            </div>
          ) : <Navigate to="/login" replace />
        }
      />

      {/* --- Route / (HomePage) --- */}
      <Route
        path="/"
        element={
          token ? (
            <div className="page-layout-with-sidebar">
              <Sidebar handleLogout={handleLogout} />
              <main className="main-page-content">
                <div className="app-container home-page-container">
                  <HomePage
                    username={currentUser?.username}
                    currentBalance={soldeTotal} // Utilise le solde fourni par l'API
                    token={token}
                    transactionsDuJour={filteredTransactions}
                  />
                </div>
              </main>
            </div>
          ) : <Navigate to="/login" replace />
        }
      />

      {/* --- Autres routes (stock, commandes, retours, dettes) inchangées --- */}
      <Route
        path="/stock"
        element={
          token ? (
            <div className="page-layout-with-sidebar">
              <Sidebar handleLogout={handleLogout} />
              <main className="main-page-content"> <StockPage token={token} /> </main>
            </div>
          ) : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/commandes"
        element={
          token ? (
            <div className="page-layout-with-sidebar">
              <Sidebar handleLogout={handleLogout} />
              <main className="main-page-content main-page-content-full-width">
                <CommandesPage user={currentUser} onUserUpdate={setCurrentUser} token={token} />
              </main>
            </div>
          ) : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/retours"
        element={
          token ? (
            <div className="page-layout-with-sidebar">
              <Sidebar handleLogout={handleLogout} />
              <main className="main-page-content">
                <RetoursPage token={token} />
              </main>
            </div>
          ) : <Navigate to="/login" replace />
        }
      />
      
      <Route
        path="/dettes"
        element={
          token ? (
            <div className="page-layout-with-sidebar">
              <Sidebar handleLogout={handleLogout} />
              <main className="main-page-content main-page-content-full-width">
                <DettesPage token={token} />
              </main>
            </div>
          ) : <Navigate to="/login" replace />
        }
      />

      {/* --- Route * (Fallback) --- */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />

    </Routes>
  );
}

export default App;
// src/App.jsx (Mis à jour avec la Page Retours)

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

// Import des icônes Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// *** MODIFIÉ : Ajout de faUndo ***
import { faHome, faExchangeAlt, faBox, faClipboardList, faUndo, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// Imports des Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import CommandesPage from './pages/CommandesPage';
import RetoursPage from './pages/RetoursPage'; // <-- NOUVEL IMPORT

// Imports des Composants
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardDepenses from './components/DashboardDepenses';
import DashboardRevenu from './components/DashboardRevenu';
import NetBenefitSummary from './components/NetBenefitSummary';

import './App.css';

// --- Composant Sidebar (MODIFIÉ) ---
function Sidebar({ handleLogout }) {
  return (
    <nav className="sidebar">
      <h3 className="sidebar-title">Menu</h3>
      <ul>
        <li> <Link to="/"> <FontAwesomeIcon icon={faHome} className="sidebar-icon" /> <span className="sidebar-text">Accueil</span> </Link> </li>
        <li> <Link to="/transactions"> <FontAwesomeIcon icon={faExchangeAlt} className="sidebar-icon" /> <span className="sidebar-text">Transactions</span> </Link> </li>
        <li> <Link to="/stock"> <FontAwesomeIcon icon={faBox} className="sidebar-icon" /> <span className="sidebar-text">Stock</span> </Link> </li>
        <li> <Link to="/commandes"> <FontAwesomeIcon icon={faClipboardList} className="sidebar-icon" /> <span className="sidebar-text">Commandes</span> </Link> </li>

        {/* --- NOUVEAU LIEN AJOUTÉ ICI --- */}
        <li>
          <Link to="/retours">
            <FontAwesomeIcon icon={faUndo} className="sidebar-icon" />
            <span className="sidebar-text">Retours</span>
          </Link>
        </li>
        {/* --- FIN DE L'AJOUT --- */}

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
  // --- États Globaux (Inchangés) ---
  const [transactions, setTransactions] = useState([]);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  // --- Fonctions Backend (Inchangées) ---
  const refreshTransactions = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3001/api/transactions', {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else if (response.status === 401 || response.status === 403) {
        handleLogout();
      } else { setTransactions([]); }
    } catch (error) { setTransactions([]);}
  };

  const runBackgroundSync = async () => {
    if (!token) return;
    console.log("Auto-Sync: Démarrage...");
    try {
      const response = await fetch('http://localhost:3001/api/import-sheets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        console.error('Auto-Sync: Échec.');
      } else {
        const data = await response.json();
        console.log(`Auto-Sync: ${data.message}`);
        refreshTransactions();
      }
    } catch (err) {
      console.error("Auto-Sync: Erreur réseau.", err);
    }
  };

  useEffect(() => {
    let syncTimer;
    if (token) {
      refreshTransactions();
      runBackgroundSync();
      syncTimer = setInterval(runBackgroundSync, 120000);
    } else {
      setTransactions([]);
    }
    return () => {
      if (syncTimer) {
        clearInterval(syncTimer);
        console.log("Auto-Sync: Timer arrêté.");
      }
    };
  }, [token]);

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
      const response = await fetch(`http://localhost:3001/api/transactions/${idASupprimer}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        console.log('Transaction supprimée !');
        refreshTransactions();
        setTransactionToEdit(null);
      } else {
        const errData = await response.json();
        alert(`Erreur lors de la suppression: ${errData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur: Impossible de contacter le serveur.');
    }
  };
  // --- Fin Fonctions ---

  // --- Calculs ---
  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(tx => tx.date === selectedDate) : [];
  const totalRevenusGlobal = Array.isArray(transactions) ? transactions.filter(tx => tx.type === 'revenu').reduce((acc, tx) => acc + tx.montant, 0) : 0;
  const totalDepensesGlobal = Array.isArray(transactions) ? transactions.filter(tx => tx.type === 'depense').reduce((acc, tx) => acc + tx.montant, 0) : 0;
  const soldeActuel = totalRevenusGlobal - totalDepensesGlobal;
  // --- Fin Calculs ---


  // --- Rendu JSX (MODIFIÉ) ---
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
                    <TransactionForm onFormSubmit={refreshTransactions} transactionToEdit={transactionToEdit} setTransactionToEdit={setTransactionToEdit} selectedDate={selectedDate} setSelectedDate={setSelectedDate} token={token} />
                  </div>
                  <div className="list-section"> <TransactionList displayedTransactions={filteredTransactions} onDelete={handleDelete} onEdit={handleEdit} selectedDate={selectedDate} onDateChange={setSelectedDate} totalDepensesJour={filteredTransactions.filter(tx => tx.type === 'depense').reduce((acc, tx) => acc + tx.montant, 0)}/> </div>
                </div>
                <div className="dashboards-container"> <DashboardDepenses allTransactions={transactions} selectedDate={selectedDate}/> <DashboardRevenu allTransactions={transactions} selectedDate={selectedDate}/> </div>
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
                    currentBalance={soldeActuel}
                    token={token}
                    transactionsDuJour={filteredTransactions}
                  />
                </div>
              </main>
            </div>
          ) : <Navigate to="/login" replace />
        }
      />

      {/* --- Route /stock --- */}
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

      {/* --- Route /commandes --- */}
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

      {/* --- NOUVELLE ROUTE AJOUTÉE ICI --- */}
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
      {/* --- FIN DE L'AJOUT --- */}

      {/* --- Route * (Fallback) --- */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />

    </Routes>
  );
}

export default App;
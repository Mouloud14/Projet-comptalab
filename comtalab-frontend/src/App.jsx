// src/App.jsx (Corrigé pour la gestion du Token JWT)
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faExchangeAlt, faBox, faClipboardList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// Imports des Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import CommandesPage from './pages/CommandesPage';

// Imports des Composants
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardDepenses from './components/DashboardDepenses';
import DashboardRevenu from './components/DashboardRevenu';
import NetBenefitSummary from './components/NetBenefitSummary';

import './App.css'; 

// --- Composant Sidebar (Inchangé) ---
function Sidebar({ handleLogout }) {
  return (
    <nav className="sidebar">
      <h3 className="sidebar-title">Menu</h3>
      <ul>
        <li> <Link to="/"> <FontAwesomeIcon icon={faHome} className="sidebar-icon" /> <span className="sidebar-text">Accueil</span> </Link> </li>
        <li> <Link to="/transactions"> <FontAwesomeIcon icon={faExchangeAlt} className="sidebar-icon" /> <span className="sidebar-text">Transactions</span> </Link> </li>
        <li> <Link to="/stock"> <FontAwesomeIcon icon={faBox} className="sidebar-icon" /> <span className="sidebar-text">Stock</span> </Link> </li>
        <li> <Link to="/commandes"> <FontAwesomeIcon icon={faClipboardList} className="sidebar-icon" /> <span className="sidebar-text">Commandes</span> </Link> </li>
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
  // --- États Globaux (MODIFIÉS) ---
  const [transactions, setTransactions] = useState([]);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  
  // NOUVEAU : Le Token est la source de vérité pour la connexion
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const navigate = useNavigate();

  // --- Fonctions Backend (MODIFIÉES) ---
  const refreshTransactions = async () => {
    if (!token) return; // Vérifie le token
    try {
      // AJOUTÉ : Headers d'authentification
      const response = await fetch('http://localhost:3001/api/transactions', { 
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else if (response.status === 401 || response.status === 403) {
        console.error("Session expirée, déconnexion...");
        handleLogout();
      } else { 
        console.error("Erreur lors de la récupération des transactions."); 
        setTransactions([]); 
      }
    } catch (error) { console.error("Erreur réseau:", error); setTransactions([]);}
  };

  // MODIFIÉ : Dépend de 'token'
  useEffect(() => {
    if (token) { 
      refreshTransactions(); 
    } else { 
      setTransactions([]); 
    }
  }, [token]); 

  const handleDelete = async (idASupprimer) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer cette transaction ?")) return;
    try {
      // AJOUTÉ : Headers d'authentification
      const response = await fetch(`http://localhost:3001/api/transactions/${idASupprimer}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert('Transaction supprimée !');
        refreshTransactions();
        setTransactionToEdit(null);
      } else { alert('Erreur lors de la suppression.'); }
    } catch (error) { console.error('Erreur réseau:', error); alert('Erreur: Impossible de contacter le serveur.'); }
  };

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction); setSelectedDate(transaction.date);
  };

  // MODIFIÉ : Accepte (user, token) de LoginPage
  const handleLogin = (userObject, receivedToken) => { 
    setCurrentUser(userObject);
    setToken(receivedToken);
    localStorage.setItem('user', JSON.stringify(userObject));
    localStorage.setItem('token', receivedToken);
    navigate('/'); 
  };

  // MODIFIÉ : Vide l'état ET le localStorage
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setTransactions([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  // --- Fin Fonctions ---

  // --- Calculs (Inchangés) ---
  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(tx => tx.date === selectedDate) : [];
  const totalRevenusGlobal = Array.isArray(transactions) ? transactions.filter(tx => tx.type === 'revenu').reduce((acc, tx) => acc + tx.montant, 0) : 0;
  const totalDepensesGlobal = Array.isArray(transactions) ? transactions.filter(tx => tx.type === 'depense').reduce((acc, tx) => acc + tx.montant, 0) : 0;
  const soldeActuel = totalRevenusGlobal - totalDepensesGlobal;
  // --- Fin Calculs ---

  // --- Rendu JSX (MODIFIÉ) ---
  return (
    <Routes>
      {/* --- Route /login --- */}
      <Route
        path="/login"
        element={ token ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} /> }
      />

      {/* --- Route /transactions --- */}
      <Route
        path="/transactions"
        element={
          token
            ? (
                <div className="page-layout-with-sidebar">
                  <Sidebar handleLogout={handleLogout} />
                  <main className="main-page-content">
                    <div className="main-content">
                      <div className="form-section"> 
                        {/* AJOUTÉ : Passe le token à TransactionForm */}
                        <TransactionForm onFormSubmit={refreshTransactions} transactionToEdit={transactionToEdit} setTransactionToEdit={setTransactionToEdit} selectedDate={selectedDate} setSelectedDate={setSelectedDate} token={token} /> 
                      </div>
                      <div className="list-section"> <TransactionList displayedTransactions={filteredTransactions} onDelete={handleDelete} onEdit={handleEdit} selectedDate={selectedDate} onDateChange={setSelectedDate} totalDepensesJour={filteredTransactions.filter(tx => tx.type === 'depense').reduce((acc, tx) => acc + tx.montant, 0)}/> </div>
                    </div>
                    <div className="dashboards-container"> <DashboardDepenses allTransactions={transactions} selectedDate={selectedDate}/> <DashboardRevenu allTransactions={transactions} selectedDate={selectedDate}/> </div>
                    <NetBenefitSummary allTransactions={transactions} selectedDate={selectedDate} />
                  </main>
                </div>
              )
            : <Navigate to="/login" replace />
        }
      />

      {/* --- Route / (HomePage) --- */}
      <Route
        path="/"
        element={
          token
            ? (
                <div className="page-layout-with-sidebar">
                   <Sidebar handleLogout={handleLogout} />
                   <main className="main-page-content">
                     <div className="app-container home-page-container">
                       <HomePage username={currentUser?.username} currentBalance={soldeActuel} />
                     </div>
                   </main>
                </div>
              )
            : <Navigate to="/login" replace />
        }
      />

        {/* --- Route /stock --- */}
       <Route
        path="/stock"
        element={
          token
            ? (
                <div className="page-layout-with-sidebar">
                  <Sidebar handleLogout={handleLogout} />
                  {/* AJOUTÉ : Passe le token à StockPage */}
                  <main className="main-page-content"> <StockPage token={token} /> </main>
                </div>
              )
            : <Navigate to="/login" replace />
        }
      />
      
        {/* --- Route /commandes --- */}
       <Route
        path="/commandes"
        element={
          token
            ? (
                <div className="page-layout-with-sidebar">
                  <Sidebar handleLogout={handleLogout} />
                  <main className="main-page-content main-page-content-full-width">
                    {/* AJOUTÉ : Passe le token à CommandesPage */}
                    <CommandesPage user={currentUser} onUserUpdate={setCurrentUser} token={token} />
                  </main>
                </div>
              )
            : <Navigate to="/login" replace />
        }
      />

      {/* --- Route * (Fallback) --- */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />

    </Routes>
  );
}

export default App;
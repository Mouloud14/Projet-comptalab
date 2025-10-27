// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

// Imports des Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import CommandesPage from './pages/CommandesPage'; // <-- CETTE LIGNE MANQUAIT PROBABLEMENT

// Imports des Composants
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardDepenses from './components/DashboardDepenses';
import DashboardRevenu from './components/DashboardRevenu';
import NetBenefitSummary from './components/NetBenefitSummary';

import './App.css'; // Importe le CSS principal

// --- Composant Sidebar Réutilisable ---
function Sidebar({ handleLogout }) {
  return (
    <nav className="sidebar">
      <h3>Menu</h3>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/stock">Stock</Link></li>
        <li><Link to="/commandes">Commandes</Link></li>
      </ul>
      <button onClick={handleLogout} className="logout-button-sidebar">Déconnexion</button>
    </nav>
  );
}
// --- FIN Sidebar ---


function App() {
  // --- États Globaux ---
  const [transactions, setTransactions] = useState([]);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Commence non connecté
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // --- useEffect pour la redirection APRÈS connexion ---
  useEffect(() => {
    if (isLoggedIn && window.location.pathname === '/login') {
       navigate('/'); // Redirige vers l'accueil
    }
  }, [isLoggedIn, navigate]);


  // --- Fonctions Backend ---
  const refreshTransactions = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch('http://localhost:3001/api/transactions', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else { console.error("Erreur lors de la récupération des transactions."); setTransactions([]); }
    } catch (error) { console.error("Erreur réseau:", error); setTransactions([]);}
  };

  useEffect(() => {
    if (isLoggedIn) { refreshTransactions(); } else { setTransactions([]); }
  }, [isLoggedIn]);

  const handleDelete = async (idASupprimer) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer cette transaction ?")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/transactions/${idASupprimer}`, { method: 'DELETE' });
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
  const handleLogin = (userObject) => { // Modifié pour accepter l'objet utilisateur
    setIsLoggedIn(true);
    setCurrentUser(userObject); // Stocke l'objet { id, username, google_sheet_url }
  };
  const handleLogout = () => {
     setIsLoggedIn(false);
     setCurrentUser(null);
     setTransactions([]);
     navigate('/login');
  };
  // --- Fin Fonctions ---

  // --- Calculs ---
  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(tx => tx.date === selectedDate) : [];
  const totalRevenusGlobal = Array.isArray(transactions) ? transactions.filter(tx => tx.type === 'revenu').reduce((acc, tx) => acc + tx.montant, 0) : 0;
  const totalDepensesGlobal = Array.isArray(transactions) ? transactions.filter(tx => tx.type === 'depense').reduce((acc, tx) => acc + tx.montant, 0) : 0;
  const soldeActuel = totalRevenusGlobal - totalDepensesGlobal;
  // --- Fin Calculs ---


  // --- Rendu JSX ---
  return (
    <Routes>
      {/* --- Route /login --- */}
      <Route
        path="/login"
        element={ isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} /> }
      />

      {/* --- Route /transactions --- */}
      <Route
        path="/transactions"
        element={
          isLoggedIn
            ? (
                <div className="page-layout-with-sidebar">
                  <Sidebar handleLogout={handleLogout} />
                  <main className="main-page-content">
                    <div className="main-content">
                      <div className="form-section"> <TransactionForm onFormSubmit={refreshTransactions} transactionToEdit={transactionToEdit} setTransactionToEdit={setTransactionToEdit} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/> </div>
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
          isLoggedIn
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
          isLoggedIn
            ? (
                <div className="page-layout-with-sidebar">
                  <Sidebar handleLogout={handleLogout} />
                  <main className="main-page-content"> <StockPage /> </main>
                </div>
              )
            : <Navigate to="/login" replace />
        }
      />
      
       {/* --- Route /commandes --- */}
       <Route
        path="/commandes"
        element={
          isLoggedIn
            ? (
                <div className="page-layout-with-sidebar">
                  <Sidebar handleLogout={handleLogout} />
                  <main className="main-page-content main-page-content-full-width">
                    {/* Passe l'objet utilisateur complet et la fonction de mise à jour */}
                    <CommandesPage user={currentUser} onUserUpdate={setCurrentUser} />
                  </main>
                </div>
              )
            : <Navigate to="/login" replace />
        }
      />

      {/* --- Route * (Fallback) --- */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />

    </Routes>
  );
}

export default App;
// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

// Imports des Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import CommandesPage from './pages/CommandesPage'; // Assure-toi que ce fichier existe
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardDepenses from './components/DashboardDepenses';
import DashboardRevenu from './components/DashboardRevenu';
import NetBenefitSummary from './components/NetBenefitSummary';
import './App.css';

// --- Composant Sidebar Réutilisable (MODIFIÉ) ---
function Sidebar({ handleLogout }) {
  return (
    <nav className="sidebar">
      <h3>Menu</h3>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/stock">Stock</Link></li>
        {/* === AJOUTÉ ICI === */}
        <li><Link to="/commandes">Commandes</Link></li>
        {/* === FIN AJOUT === */}
      </ul>
      <button onClick={handleLogout} className="logout-button-sidebar">Déconnexion</button>
    </nav>
  );
}
// --- FIN Sidebar ---


function App() {
  // --- États Globaux (inchangés) ---
  const [transactions, setTransactions] = useState([]);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // --- useEffect pour la redirection (inchangé) ---
  useEffect(() => {
    if (isLoggedIn && window.location.pathname === '/login') {
       navigate('/');
    }
  }, [isLoggedIn, navigate]);


  // --- Fonctions Backend (inchangées) ---
  const refreshTransactions = async () => { /* ... */ };
  useEffect(() => { if (isLoggedIn) { refreshTransactions(); } else { setTransactions([]); } }, [isLoggedIn]);
  const handleDelete = async (idASupprimer) => { /* ... */ };
  const handleEdit = (transaction) => { /* ... */ };
  const handleLogin = (username) => { setIsLoggedIn(true); setCurrentUser(username); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); setTransactions([]); navigate('/login'); };
  // --- Fin Fonctions ---

  // --- Calculs (inchangés) ---
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
                    {/* Contenu Transactions */}
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
                     <div className="app-container home-page-container"> <HomePage username={currentUser} currentBalance={soldeActuel} /> </div>
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

      {/* --- VÉRIFIE QUE CETTE ROUTE EST PRÉSENTE --- */}
      <Route
        path="/commandes"
        element={
          isLoggedIn
            ? (
                <div className="page-layout-with-sidebar">
                  <Sidebar handleLogout={handleLogout} />
                  <main className="main-page-content">
                    <CommandesPage />
                  </main>
                </div>
              )
            : <Navigate to="/login" replace />
        }
      />
      {/* --- FIN ROUTE COMMANDES --- */}


      {/* --- Route * (Fallback) --- */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />

    </Routes>
  );
}

export default App;
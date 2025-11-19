import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import './SponsorsPage.css';

const formatArgent = (amount) => {
    // Sécurité si undefined ou null
    const val = amount || 0;
    return new Intl.NumberFormat('fr-FR').format(Math.round(val)) + ' DZD';
};

function SponsorsPage({ token }) {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchCampaigns = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sponsors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error("Erreur chargement sponsors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchCampaigns();
    }, [token]);

    const handleAddSponsor = async (e) => {
        e.preventDefault();
        if (!name || !budget || !startDate || !endDate) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sponsors`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    name, 
                    budget: parseFloat(budget), 
                    start_date: startDate, 
                    end_date: endDate 
                })
            });

            if (response.ok) {
                setName(''); setBudget(''); setStartDate(''); setEndDate('');
                fetchCampaigns();
            } else {
                alert("Erreur lors de l'ajout.");
            }
        } catch (error) {
            console.error("Erreur ajout:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette campagne ?")) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/sponsors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCampaigns();
        } catch (error) {
            console.error("Erreur suppression:", error);
        }
    };

    return (
        <div className="sponsors-page-content">
            <div className="sponsors-header">
                <h2><FontAwesomeIcon icon={faBullhorn} /> Gestion des Campagnes & ROI</h2>
            </div>

            <form className="add-sponsor-form" onSubmit={handleAddSponsor}>
                <div className="form-group">
                    <label>Nom de la Campagne</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pub Facebook" required />
                </div>
                <div className="form-group">
                    <label>Budget (DZD)</label>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Ex: 20000" required />
                </div>
                <div className="form-group">
                    <label>Date Début</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Date Fin</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <button type="submit" className="btn-add-sponsor">Ajouter</button>
            </form>

            {loading ? <p>Chargement...</p> : (
                <div className="sponsors-grid">
                    {campaigns.length === 0 ? <p>Aucune campagne enregistrée.</p> : campaigns.map(camp => {
                        const { stats } = camp;
                        const isPositive = stats.resultatNet >= 0;

                        return (
                            <div key={camp.id} className="sponsor-card">
                                <div className="sponsor-card-header">
                                    <div className="sponsor-title">
                                        <h3>{camp.name}</h3>
                                        <div className="sponsor-dates">
                                            {camp.start_date} au {camp.end_date}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(camp.id)} className="btn-delete-sponsor">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>

                                <div className="sponsor-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Commandes (Valides)</span>
                                        <span className="stat-value">{stats.commandesCount} cmds</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Budget Pub</span>
                                        <span className="stat-value stat-budget">{formatArgent(camp.budget)}</span>
                                    </div>
                                    
                                    {/* --- ICI : LE BLOC DTF QUI MANQUAIT PEUT-ÊTRE --- */}
                                    <div className="stat-item">
                                        <span className="stat-label">Coût DTF</span>
                                        <span className="stat-value stat-costs" style={{ color: '#e67e22' }}>
                                            - {formatArgent(stats.totalDTF)}
                                        </span>
                                    </div>
                                    {/* ----------------------------------------------- */}

                                    <div className="stat-item">
                                        <span className="stat-label">Chiffre d'Affaires</span>
                                        <span className="stat-value stat-ca">{formatArgent(stats.totalVentes)}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Coûts (Art. + Livr.)</span>
                                        <span className="stat-value stat-costs">- {formatArgent(stats.totalCoutArticles + stats.totalLivraison)}</span>
                                    </div>
                                </div>

                                <div className="roi-section">
                                    <span className="roi-label">RÉSULTAT NET :</span>
                                    <span className={`roi-value ${isPositive ? 'roi-positive' : 'roi-negative'}`}>
                                        {isPositive ? '+' : ''}{formatArgent(stats.resultatNet)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default SponsorsPage;
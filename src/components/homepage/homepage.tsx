import React, { useState } from 'react';
import axios from 'axios';
import './homepage.scss';
import PlayerInfo from '../player-info/player-info.tsx';

interface PlayerInfoData {
  nickname: string;
  level: number;
  signature: string;
  worldLevel: number;
  finishAchievementNum: number;
  nameCardId: number;
  profilePicture: {
    id: number;
  };
  showAvatarInfoList: any[];
  showNameCardIdList: number[];
  towerFloorIndex: number;
  towerLevelIndex: number;
  fetterCount: number;
}

interface EnkaResponse {
  playerInfo: PlayerInfoData;
  avatarInfoList: any[];
  ttl: number;
  uid: string;
}

const HomePage = () => {
  const [uid, setUid] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerData, setPlayerData] = useState<EnkaResponse | null>(null);

  const handleSearch = async () => {
    if (!uid) {
      setError('Please enter a UID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get<EnkaResponse>(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://enka.network/api/uid/${uid}/`)}`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
      
      if (!response.data) {
        throw new Error('No data received');
      }

      setPlayerData(response.data);
      setError('');
    } catch (err) {
      console.error('Error details:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED' || err.response?.status === 408) {
          setError('La requête a pris trop de temps. Veuillez réessayer.');
        } else if (err.response?.status === 404) {
          setError('UID non trouvé. Vérifiez le numéro et réessayez.');
        } else if (err.response?.status === 429) {
          setError('Trop de requêtes. Veuillez attendre quelques minutes.');
        } else {
          setError(`Erreur lors de la récupération des données (${err.response?.status || 'inconnue'}). Veuillez réessayer.`);
        }
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage-container">
      <h1 className="title">Chercher un profil Genshin Impact</h1>
      <div className="search-container">
        <div className="search-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Enter Genshin Impact UID..."
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
          <button 
            className="search-button" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {playerData && <PlayerInfo data={playerData} />}
    </div>
  );
};

export default HomePage;

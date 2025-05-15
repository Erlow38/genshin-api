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

    // Vérification que l'UID contient exactement 9 chiffres
    if (!/^\d{9}$/.test(uid)) {
      setError("L'UID doit contenir exactement 9 chiffres");
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

      // Vérifier si les données essentielles sont présentes
      if (!response.data.playerInfo) {
        throw new Error('Profil non trouvé ou privé');
      }

      // S'assurer que les listes sont initialisées
      if (!Array.isArray(response.data.playerInfo.showAvatarInfoList)) {
        response.data.playerInfo.showAvatarInfoList = [];
      }
      if (!Array.isArray(response.data.playerInfo.showNameCardIdList)) {
        response.data.playerInfo.showNameCardIdList = [];
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
        } else if (err.message === 'Profil non trouvé ou privé') {
          setError('Profil non trouvé ou privé. Vérifiez que le profil est public dans les paramètres du jeu.');
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
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
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

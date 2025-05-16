import React, { useState, useEffect } from 'react';
import './player-info.scss';
import CharacterList from '../character-list/character-list.tsx';
import { getNamecardIcon } from '../../utils/character-icons.ts';

interface ProfilePicture {
  iconPath: string;
}

interface ProfilePictures {
  [key: string]: ProfilePicture;
}

interface PlayerInfo {
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
  playerInfo: PlayerInfo;
  avatarInfoList: any[];
  ttl: number;
  uid: string;
}

interface PlayerInfoProps {
  data: EnkaResponse;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ data }) => {
  const { playerInfo } = data;
  const [namecardUrl, setNamecardUrl] = useState<string>('');
  const [iconPath, setIconPath] = useState<string>('UI_AvatarIcon_PlayerGirl_Circle');

  useEffect(() => {
    const loadNamecard = async () => {
      try {
        const url = await getNamecardIcon(playerInfo.nameCardId);
        setNamecardUrl(url);
      } catch (error) {
        console.error('Error loading namecard:', error);
      }
    };

    loadNamecard();
  }, [playerInfo.nameCardId]);

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/pfps.json');
        if (!response.ok) {
          throw new Error('Failed to fetch profile pictures data');
        }
        
        const pfps: ProfilePictures = await response.json();
        const profilePic = pfps[playerInfo.profilePicture.id];
        
        if (profilePic) {
          setIconPath(profilePic.iconPath);
        } else {
          setIconPath('UI_AvatarIcon_PlayerGirl_Circle');
        }
      } catch (error) {
        console.error('Error loading profile picture:', error);
        setIconPath('UI_AvatarIcon_PlayerGirl_Circle');
      }
    };

    loadProfilePicture();
  }, [playerInfo.profilePicture.id]);

  return (
    <div className="player-info-container">
      <div className="player-header">
        <div className="player-namecard">
          <img 
            src={namecardUrl}
            alt="Player Namecard"
            className="namecard-background"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://enka.network/ui/UI_NameCardPic_0_P.png';
            }}
          />
          <div className="player-avatar">
            <img 
              src={`https://enka.network/ui/${iconPath}.png`}
              alt="Profile"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon/UI_AvatarIcon_PlayerGirl.png';
              }}
            />
          </div>
          <div className="player-details">
            <h2>{playerInfo.nickname}</h2>
            <p className="signature">{playerInfo.signature || "Pas de signature"}</p>
          </div>
        </div>
      </div>
      
      <div className="player-stats">
        <div className="stat-item">
          <span className="stat-label">Niveau d'aventure</span>
          <span className="stat-value">{playerInfo.level}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Niveau de monde</span>
          <span className="stat-value">{playerInfo.worldLevel}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Succès</span>
          <span className="stat-value">{playerInfo.finishAchievementNum}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Étage Abîme</span>
          <span className="stat-value">{playerInfo.towerFloorIndex}-{playerInfo.towerLevelIndex}</span>
        </div>
      </div>

      <CharacterList 
        characters={playerInfo.showAvatarInfoList}
        nameCards={playerInfo.showNameCardIdList}
      />
    </div>
  );
};

export default PlayerInfo;

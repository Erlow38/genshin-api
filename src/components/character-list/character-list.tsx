import React, { useState, useEffect } from 'react';
import './character-list.scss';
import { getCharacterIcon, buildIconUrl, getCharacterName, getNamecardIcon } from '../../utils/character-icons.ts';

interface CharacterInfo {
  avatarId: number;
  energyType: number;
  level: number;
}

interface CharacterListProps {
  characters: CharacterInfo[];
  nameCards: number[];
}

interface CharacterIconState {
  [avatarId: number]: string;
}

interface CharacterNameState {
  [avatarId: number]: string;
}

interface NamecardIconState {
  [cardId: number]: string;
}

interface NamecardData {
  [key: string]: {
    icon: string;
  };
}

const CharacterList: React.FC<CharacterListProps> = ({ characters, nameCards }) => {
  const [characterIcons, setCharacterIcons] = useState<CharacterIconState>({});
  const [characterNames, setCharacterNames] = useState<CharacterNameState>({});
  const [namecardIcons, setNamecardIcons] = useState<NamecardIconState>({});

  useEffect(() => {
    // Load character data
    const loadCharacterData = async () => {
      const dataPromises = characters.map(async (character) => {
        try {
          const [iconUrl, name] = await Promise.all([
            getCharacterIcon(character.avatarId, "SIDE"),
            getCharacterName(character.avatarId)
          ]);
          return { 
            avatarId: character.avatarId, 
            iconUrl, 
            name 
          };
        } catch (error) {
          console.error(`Error loading data for character ${character.avatarId}:`, error);
          return { 
            avatarId: character.avatarId, 
            iconUrl: buildIconUrl('UI_AvatarIcon_Side_PlayerGirl'),
            name: `Character ${character.avatarId}`
          };
        }
      });

      const characterData = await Promise.all(dataPromises);
      
      const iconMap = {} as CharacterIconState;
      const nameMap = {} as CharacterNameState;
      
      characterData.forEach(({ avatarId, iconUrl, name }) => {
        iconMap[avatarId] = iconUrl;
        nameMap[avatarId] = name;
      });

      setCharacterIcons(iconMap);
      setCharacterNames(nameMap);
    };

    // Load namecard data
    const loadNamecardData = async () => {
      try {
        // Fetch the namecard data from EnkaNetwork
        const response = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/namecards.json');
        const namecardData: NamecardData = await response.json();
        
        const iconMap = {} as NamecardIconState;
        
        nameCards.forEach((cardId) => {
          const namecardKey = cardId.toString();
          if (namecardData[namecardKey]) {
            iconMap[cardId] = namecardData[namecardKey].icon;
          } else {
            console.error(`Namecard ${cardId} not found in EnkaNetwork data`);
            iconMap[cardId] = 'UI_NameCardPic_0_P';
          }
        });

        setNamecardIcons(iconMap);
      } catch (error) {
        console.error('Error loading namecard data from EnkaNetwork:', error);
        // Fallback: set default namecard for all
        const iconMap = {} as NamecardIconState;
        nameCards.forEach((cardId) => {
          iconMap[cardId] = 'UI_NameCardPic_0_P';
        });
        setNamecardIcons(iconMap);
      }
    };

    loadCharacterData();
    loadNamecardData();
  }, [characters, nameCards]);

  return (
    <div className="character-list-container">
      <h3>Personnages</h3>
      <div className="characters-grid">
        {characters.map((character) => (
          <div key={character.avatarId} className="character-card">
            <img
              src={characterIcons[character.avatarId] || buildIconUrl('UI_AvatarIcon_Side_PlayerGirl')}
              alt={characterNames[character.avatarId] || `Character ${character.avatarId}`}
              className="character-avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = buildIconUrl('UI_AvatarIcon_Side_PlayerGirl');
              }}
            />
            <div className="character-info">
              <span className="character-name">{characterNames[character.avatarId] || '...'}</span>
              <span className="character-level">Nv. {character.level}</span>
            </div>
          </div>
        ))}
      </div>

      <h3>Thèmes</h3>
      <div className="namecards-grid">
        {nameCards.map((cardId) => (
          <div key={cardId} className="namecard">
            <img
              src={buildIconUrl(namecardIcons[cardId])}
              alt={`Namecard ${cardId}`}
              className="namecard-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = buildIconUrl('UI_NameCardPic_0_P');
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterList; 
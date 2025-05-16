interface CharacterIconTypes {
  SIDE: string;
  GACHA?: string;
  NAMECARD?: string;
  TALENT: {
    [key: string]: string;
  };
}

interface CharacterIcons {
  [characterId: string]: CharacterIconTypes;
}

interface EnkaNamecard {
  icon: string;
}

interface EnkaNamecardsResponse {
  [namecardId: string]: EnkaNamecard;
}

interface EnkaCharacterSkills {
  [key: string]: string;
}

interface EnkaCharacterData {
  Element: string;
  Consts: string[];
  SkillOrder: number[];
  Skills: EnkaCharacterSkills;
  ProudMap: { [key: string]: number };
  NameTextMapHash: number;
  SideIconName: string;
  QualityType: string;
  WeaponType: string;
  Costumes?: {
    [key: string]: {
      sideIconName: string;
      icon: string;
      art: string;
      avatarId: number;
    };
  };
}

interface EnkaCharactersResponse {
  [characterId: string]: EnkaCharacterData;
}

let characterIconsCache: CharacterIcons | null = null;
let characterNamesCache: { [characterId: string]: string } | null = null;
let namecardsCache: EnkaNamecardsResponse | null = null;

const NAMECARD_DATA: { [key: string]: { icon: string } } = {
  "210001": { "icon": "UI_NameCardPic_0_P" },
  "210002": { "icon": "UI_NameCardPic_Bp1_P" },
  // ... more namecard data will be added from the API
};

async function loadNamecards(): Promise<EnkaNamecardsResponse> {
  if (namecardsCache) {
    return namecardsCache;
  }

  try {
    const response = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/namecards.json');
    if (!response.ok) {
      throw new Error('Failed to fetch namecard data');
    }
    
    const data = await response.json() as EnkaNamecardsResponse;
    namecardsCache = data;
    return data;
  } catch (error) {
    console.error('Error loading namecards:', error);
    return {};
  }
}

async function loadCharacterIcons(): Promise<CharacterIcons> {
  if (characterIconsCache) {
    return characterIconsCache;
  }

  try {
    const response = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json');
    if (!response.ok) {
      throw new Error('Failed to fetch character data');
    }
    
    const data = await response.json() as EnkaCharactersResponse;
    const icons: CharacterIcons = {};
    
    // Transform the data into our format
    for (const [id, character] of Object.entries(data)) {
      // Skip special character variations (like traveler elements)
      if (id.includes('-')) continue;

      const skillValues = Object.values(character.Skills);
      
      icons[id] = {
        SIDE: character.SideIconName,
        TALENT: {
          NORMAL_ATTACK: skillValues[0] || "Skill_A_01",
          ELEMENTAL_SKILL: skillValues[1] || "Skill_S_01",
          ELEMENTAL_BURST: skillValues[2] || "Skill_E_01"
        }
      };

      // Add costume icons if they exist
      if (character.Costumes) {
        for (const costume of Object.values(character.Costumes)) {
          // Store costume side icon as an alternative
          icons[`${id}-${costume.sideIconName}`] = {
            SIDE: costume.sideIconName,
            TALENT: icons[id].TALENT // Keep same talents as base character
          };
        }
      }
    }
    
    characterIconsCache = icons;
    return icons;
  } catch (error) {
    console.error('Error loading character icons:', error);
    // Return empty object as fallback
    return {};
  }
}

export const getCharacterIcon = async (characterId: string | number, type: keyof CharacterIconTypes = "SIDE"): Promise<string> => {
  const id = characterId.toString();
  const icons = await loadCharacterIcons();
  
  if (!icons[id]) {
    // Return default icon if character not found
    return buildIconUrl("UI_AvatarIcon_PlayerGirl");
  }
  
  if (type === "TALENT") {
    // Talent icons should be handled separately as they have sub-types
    return buildIconUrl(icons[id].TALENT.NORMAL_ATTACK);
  }
  
  return buildIconUrl(icons[id][type] || "UI_AvatarIcon_PlayerGirl");
};

export const getCharacterTalentIcon = async (
  characterId: string | number, 
  talentType: keyof CharacterIconTypes["TALENT"]
): Promise<string> => {
  const id = characterId.toString();
  const icons = await loadCharacterIcons();
  
  if (!icons[id] || !icons[id].TALENT[talentType]) {
    // Return default talent icon if not found
    return buildIconUrl("Skill_A_01");
  }
  
  return buildIconUrl(icons[id].TALENT[talentType]);
};

// Fonction utilitaire pour obtenir juste le nom de l'icône sans l'URL
export const getCharacterIconName = async (characterId: string | number, type: keyof CharacterIconTypes = "SIDE"): Promise<string> => {
  const id = characterId.toString();
  const icons = await loadCharacterIcons();
  
  if (!icons[id]) {
    return "UI_AvatarIcon_PlayerGirl";
  }
  
  if (type === "TALENT") {
    return icons[id].TALENT.NORMAL_ATTACK;
  }
  
  return icons[id][type] || "UI_AvatarIcon_PlayerGirl";
};

export const buildIconUrl = (iconName: string): string => {
  return `https://enka.network/ui/${iconName}.png`;
};

export const getCharacterName = async (characterId: string | number): Promise<string> => {
  const id = characterId.toString();
  
  if (characterNamesCache?.[id]) {
    return characterNamesCache[id];
  }

  try {
    const response = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json');
    if (!response.ok) {
      throw new Error('Failed to fetch character data');
    }
    
    const data = await response.json() as EnkaCharactersResponse;
    
    // Initialize cache if needed
    if (!characterNamesCache) {
      characterNamesCache = {};
    }
    
    // Get character data
    const character = data[id];
    if (!character) {
      return `Character ${id}`;
    }

    // Extract name from icon name
    const name = extractNameFromIconName(character.SideIconName);
    characterNamesCache[id] = name || `Character ${id}`;
    
    return characterNamesCache[id];
  } catch (error) {
    console.error('Error loading character name:', error);
    return `Character ${id}`;
  }
};

// Helper function to extract character name from icon name
function extractNameFromIconName(iconName: string): string {
  if (!iconName) return '';
  
  // Format: "UI_AvatarIcon_Side_Klee" -> "Klee"
  const match = iconName.match(/UI_AvatarIcon_Side_(.+)/);
  if (match && match[1]) {
    return match[1]
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return '';
}

export async function getNamecardIcon(namecardId: number): Promise<string> {
  try {
    const formattedId = String(namecardId);
    const response = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/namecards.json');
    if (!response.ok) {
      throw new Error('Failed to fetch namecard data');
    }
    const data = await response.json();
    const namecardInfo = data[formattedId];
    
    if (namecardInfo) {
      return buildIconUrl(namecardInfo.icon);
    }
    
    // Fallback to default namecard if not found
    return buildIconUrl('UI_NameCardPic_0_P');
  } catch (error) {
    console.error('Error fetching namecard icon:', error);
    return buildIconUrl('UI_NameCardPic_0_P');
  }
} 
const family_elder_contact: Record<string, string> = {
  Dad: '2347067992388@c.us',
  Mum: '2348081986116@c.us',
  Sister: '2348058050407@c.us',
};

const male_friends: Record<string, string> = {
  Ayowole: '2348079682873@c.us',
  Tolugold: '2347059139192@c.us',
  Duke: '2347018418644@c.us',
  Enagmatic: '2348054381717@c.us',
  Oluwapelumi: '2348163113001@c.us',
  Cyrus: '2349067391039@c.us',
  Dave: '2347078171718@c.us',
};

const female_friends: Record<string, string> = {
  Rebecca: '2349042972932@c.us',
  moji: '2348131571039@c.us',
  Emma: '2348110984901@c.us',
};

export const contacts: Record<string, Record<string, string>>[] = [
  { family_elder_contact },
  { male_friends },
  { female_friends },
];

// 🔍 Function to find the category of a number
export const findContactGroup = (phoneNumber: string): string | null => {
  for (const groupObj of contacts) {
    const [groupName, groupData] = Object.entries(groupObj)[0]!;
    const allNumbers = Object.values(groupData);
    if (allNumbers.includes(phoneNumber)) {
      return groupName;
    }
  }

  return null; // Not found
};

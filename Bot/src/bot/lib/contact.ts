const family_elder_contact: Record<string, string> = {
  Dad: '2347067992388',
  Mum: '2348081986116',
  Sister: '2348058050407',
};

const male_friends: Record<string, string> = {
  Ayowole: '2348079682873',
  Tolugold: '2347059139192',
  // Duke: '2347018418644',
  Enagmatic: '2348054381717',
  Oluwapelumi: '2348163113001',
  Cyrus: '2349067391039',
  Dave: '2347078171718',
};

const female_friends: Record<string, string> = {
  Rebecca: '2349042972932',
  moji: '2348131571039',
  Emma: '2348110984901',
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

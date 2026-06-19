import { crewFriendIds } from '../profile';

describe('crewFriendIds', () => {
  it('puts the current identity first, then the crew ids', () => {
    const crew = [
      { id: 'marcus', name: 'Marcus', initial: 'M' },
      { id: 'sara', name: 'Sara', initial: 'S' },
    ];
    expect(crewFriendIds('uuid-me', crew)).toEqual(['uuid-me', 'marcus', 'sara']);
  });

  it('uses the passed self id (the hydrated user), not a hardcoded mock id', () => {
    expect(crewFriendIds('uuid-me', [])).toEqual(['uuid-me']);
  });
});

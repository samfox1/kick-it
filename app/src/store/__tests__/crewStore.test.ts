import { useCrewStore } from '../crewStore';

beforeEach(() => {
  useCrewStore.setState({
    members: [{ id: 'marcus', name: 'Marcus', initial: 'M' }],
    requests: [
      { id: 'tess', name: 'Tess', initial: 'T' },
      { id: 'rick', name: 'Rick', initial: 'R' },
    ],
  });
});

describe('crewStore', () => {
  it('accepting a request moves the person into your crew', () => {
    useCrewStore.getState().acceptRequest('tess');
    const { members, requests } = useCrewStore.getState();
    expect(members.map((m) => m.id)).toContain('tess');
    expect(requests.map((m) => m.id)).not.toContain('tess');
  });

  it('denying a request drops it without adding to the crew', () => {
    useCrewStore.getState().denyRequest('rick');
    const { members, requests } = useCrewStore.getState();
    expect(requests.map((m) => m.id)).not.toContain('rick');
    expect(members.map((m) => m.id)).not.toContain('rick');
  });

  it('ignores accepting an unknown request', () => {
    useCrewStore.getState().acceptRequest('nobody');
    expect(useCrewStore.getState().members).toHaveLength(1);
  });
});

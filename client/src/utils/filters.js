export function filterPeople(people, filters) {
  return people.filter(person => {
    if (filters.region && person.region !== filters.region) return false;
    if (filters.capability && !person.capabilities?.includes(filters.capability)) return false;
    if (filters.seniority && person.seniority !== filters.seniority) return false;
    if (filters.status && person.status !== filters.status) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const nameMatch = person.name?.toLowerCase().includes(s);
      const titleMatch = person.title?.toLowerCase().includes(s);
      if (!nameMatch && !titleMatch) return false;
    }
    return true;
  });
}

export function personMatchesFilters(person, filters) {
  return filterPeople([person], filters).length > 0;
}

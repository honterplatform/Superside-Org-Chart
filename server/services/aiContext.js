const Person = require('../models/Person');
const Account = require('../models/Account');
const Assignment = require('../models/Assignment');

let cachedSummary = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

async function buildSummary() {
  const now = Date.now();
  if (cachedSummary && (now - lastCacheTime) < CACHE_TTL) {
    return cachedSummary;
  }

  const [people, accounts, assignments] = await Promise.all([
    Person.find().lean(),
    Account.find().lean(),
    Assignment.find().populate('accountId', 'name teamName').lean()
  ]);

  // Build person -> assignments map
  const personAssignments = {};
  for (const a of assignments) {
    if (!personAssignments[a.personId]) personAssignments[a.personId] = [];
    personAssignments[a.personId].push({
      account: a.accountId?.name || 'Unknown',
      team: a.accountId?.teamName || '',
      priority: a.priority,
      modifier: a.modifier
    });
  }

  // Build person -> manager name map
  const personMap = {};
  for (const p of people) personMap[p._id.toString()] = p;

  const peopleSummary = people.map(p => {
    const manager = p.managerId ? personMap[p.managerId.toString()] : null;
    const assigns = personAssignments[p._id.toString()] || [];
    return `- ${p.name} | ${p.title || ''} | ${p.seniority} | ${p.region} | ${p.role} | Manager: ${manager?.name || 'none'} | Status: ${p.status} | Type: ${p.type} | Capabilities: ${p.capabilities?.join(', ') || 'none'} | Accounts: ${assigns.map(a => `${a.account}(${a.priority}${a.modifier ? ',' + a.modifier : ''})`).join(', ') || 'none'}${p.statusNote ? ' | Note: ' + p.statusNote : ''}`;
  }).join('\n');

  const accountsSummary = accounts.map(a => {
    const assigned = assignments.filter(as => as.accountId?._id?.toString() === a._id.toString());
    return `- ${a.name} | Team: ${a.teamName} | MRR: $${a.mrr?.toLocaleString()} | Region: ${a.region} | BU: ${a.businessUnit} | Assigned: ${assigned.length} people`;
  }).join('\n');

  cachedSummary = { peopleSummary, accountsSummary, peopleCount: people.length, accountsCount: accounts.length };
  lastCacheTime = now;
  return cachedSummary;
}

function invalidateCache() {
  cachedSummary = null;
  lastCacheTime = 0;
}

module.exports = { buildSummary, invalidateCache };

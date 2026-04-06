require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Person = require('../models/Person');
const Account = require('../models/Account');
const Assignment = require('../models/Assignment');
const Capability = require('../models/Capability');
const Region = require('../models/Region');
const SeniorityLevel = require('../models/SeniorityLevel');
const FreelancePool = require('../models/FreelancePool');
const ActivityLog = require('../models/ActivityLog');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spark-org-chart');
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    Person.deleteMany({}),
    Account.deleteMany({}),
    Assignment.deleteMany({}),
    Capability.deleteMany({}),
    Region.deleteMany({}),
    SeniorityLevel.deleteMany({}),
    FreelancePool.deleteMany({}),
    ActivityLog.deleteMany({})
  ]);
  console.log('Cleared all collections');

  // ── Regions ──
  const regions = await Region.insertMany([
    { name: 'AMERICAS', slug: 'americas', order: 0 },
    { name: 'EMEA', slug: 'emea', order: 1 },
    { name: 'APAC', slug: 'apac', order: 2 }
  ]);
  console.log(`Inserted ${regions.length} regions`);

  // ── Seniority Levels ──
  const seniorityData = [
    { name: '1b', slug: '1b', rank: 1 },
    { name: '1a', slug: '1a', rank: 2 },
    { name: '1.2', slug: '1-2', rank: 3 },
    { name: '2a', slug: '2a', rank: 4 },
    { name: '2b', slug: '2b', rank: 5 },
    { name: '3a', slug: '3a', rank: 6 },
    { name: '3b', slug: '3b', rank: 7 },
    { name: '4a', slug: '4a', rank: 8 },
    { name: '4b', slug: '4b', rank: 9 },
    { name: '5a', slug: '5a', rank: 10 },
    { name: '5b', slug: '5b', rank: 11 },
    { name: '6a', slug: '6a', rank: 12 },
    { name: '6b', slug: '6b', rank: 13 },
    { name: '7a', slug: '7a', rank: 14 },
    { name: '7b', slug: '7b', rank: 15 },
    { name: '8a', slug: '8a', rank: 16 }
  ];
  const seniorityLevels = await SeniorityLevel.insertMany(seniorityData.map((s, i) => ({ ...s, order: i })));
  console.log(`Inserted ${seniorityLevels.length} seniority levels`);

  // ── Capabilities ──
  const capabilities = await Capability.insertMany([
    { name: 'AI Capable', slug: 'ai_capable', icon: 'sparkle', color: '#F5C542', description: 'Can work on AI-related projects', order: 0 },
    { name: 'Customer Facing Capable', slug: 'customer_facing', icon: 'square', color: '#C4B5E0', description: 'Can interact directly with customers', order: 1 },
    { name: 'Workshop / Sales Capable', slug: 'workshop_sales', icon: 'presentation', color: '#5B9BD5', description: 'L4 Creatives only - workshop and sales', order: 2 },
    { name: 'Motion / Video', slug: 'motion', icon: 'camera', color: '#666666', description: 'Motion and video capabilities', order: 3 },
    { name: 'Temporary', slug: 'temporary', icon: 'circle', color: '#F4A582', description: 'Until Project Stabilizes - assignment modifier', order: 4 },
    { name: 'If Time Allows', slug: 'if_time_allows', icon: 'no-entry', color: '#E74C3C', description: 'Other accounts prioritized - assignment modifier', order: 5 }
  ]);
  console.log(`Inserted ${capabilities.length} capabilities`);

  // ── Accounts ──
  const accountsData = [
    { name: 'Albertsons', teamName: 'Albertsons', externalId: '49227', mrr: 12000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/albertsons.svg', color: '#0054A6' },
    { name: 'Albertsons', teamName: 'Albertsons Marketing and Partner Experience Team', externalId: '57677', mrr: 11000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/albertsons.svg', color: '#0054A6' },
    { name: 'AppFolio', teamName: 'AppFolio', externalId: '57773', mrr: 15000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/appfolio.svg', color: '#00B0F0' },
    { name: "Dick's Sporting Goods", teamName: "Dick's Sporting Goods 2", externalId: '57628', mrr: 135228, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/dicks.svg', color: '#2D5234' },
    { name: 'DoorDash', teamName: 'DoorDash', externalId: '57117', mrr: 10000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/doordash.svg', color: '#FF3008' },
    { name: 'Free People', teamName: 'Free People', externalId: '57776', mrr: 55000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/free-people.svg', color: '#B8860B' },
    { name: 'Giesecke & Devrient', teamName: 'Giesecke & Devrient - Germany', externalId: '57572', mrr: 42500, region: 'EMEA', businessUnit: 'BU 2 - 1', logoUrl: '/logos/gd.svg', color: '#003A70' },
    { name: 'Kaseya', teamName: 'Kaseya Creative Team', externalId: '56169', mrr: 25360, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/kaseya.svg', color: '#00A3E0' },
    { name: 'Marvell Technology', teamName: 'Marvell Technology, Inc.', externalId: '47475', mrr: 5000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/marvell.svg', color: '#8B0000' },
    { name: 'Microsoft', teamName: 'Microsoft Corporation', externalId: '55707', mrr: 45005, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/microsoft.svg', color: '#00A4EF' },
    { name: 'Microsoft', teamName: 'Microsoft-Commercial-Brand-Team', externalId: '57681', mrr: 91000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/microsoft.svg', color: '#00A4EF' },
    { name: 'Philips', teamName: 'Philips', externalId: '57209', mrr: 16000, region: 'EMEA', businessUnit: 'BU 2 - 1', logoUrl: '/logos/philips.svg', color: '#0B5ED7' },
    { name: 'Quest Diagnostics', teamName: 'Quest Diagnostics', externalId: '55297', mrr: 51000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/quest.svg', color: '#E87722' },
    { name: 'Grammarly', teamName: 'Grammarly', externalId: '48949', mrr: 111000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/grammarly.svg', color: '#15C39A' },
    { name: 'Grammarly', teamName: 'Grammarly Demand Gen', externalId: '53139', mrr: 36000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/grammarly.svg', color: '#15C39A' },
    { name: 'Thomson Reuters', teamName: 'Thomson Reuters Corporation', externalId: '56444', mrr: 15000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/thomson-reuters.svg', color: '#FF6600' },
    { name: 'Workday', teamName: 'Workday Enablement team', externalId: '56245', mrr: 16000, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/workday.svg', color: '#0072CE' },
    { name: 'AI', teamName: 'AI Initiative', externalId: 'INT-001', mrr: 0, region: 'AMERICAS', businessUnit: 'Internal', logoUrl: '/logos/ai.svg', color: '#9B59B6' },
    { name: 'Monday.com', teamName: 'Monday.com', externalId: 'MON-001', mrr: 0, region: 'AMERICAS', businessUnit: 'BU 2 - 1', logoUrl: '/logos/monday.svg', color: '#FF3D57' }
  ];
  const accounts = await Account.insertMany(accountsData);
  console.log(`Inserted ${accounts.length} accounts`);

  // Helper to find account by name/team
  const acct = (name, team) => {
    if (team) return accounts.find(a => a.name === name && a.teamName.includes(team));
    return accounts.find(a => a.name === name);
  };

  const dicks = acct("Dick's Sporting Goods");
  const msft = acct('Microsoft', 'Corporation');
  const msftBrand = acct('Microsoft', 'Commercial');
  const ai = acct('AI');
  const appfolio = acct('AppFolio');
  const quest = acct('Quest Diagnostics');
  const workday = acct('Workday');
  const grammarly = acct('Grammarly', 'Grammarly');
  const grammarlyDG = acct('Grammarly', 'Demand Gen');
  const freePeople = acct('Free People');
  const gd = acct('Giesecke & Devrient');
  const kaseya = acct('Kaseya');
  const doordash = acct('DoorDash');
  const philips = acct('Philips');
  const marvell = acct('Marvell Technology');
  const thomsonReuters = acct('Thomson Reuters');
  const monday = acct('Monday.com');

  // ── People ──
  // Level 0: ECD
  const alyssa = await Person.create({ name: 'alyssa.boisson', title: 'ECD', seniority: '8a', region: 'AMERICAS', role: 'manager', order: 0 });

  // Level 1: CDs reporting to alyssa
  const jiani = await Person.create({ name: 'jiani.lu', title: 'CD', seniority: '1a', region: 'AMERICAS', role: 'manager', managerId: alyssa._id, order: 0 });
  const lauren = await Person.create({ name: 'lauren.coetzee', title: 'CD', seniority: '1a', region: 'EMEA', role: 'manager', managerId: alyssa._id, order: 1 });
  const ezequiel = await Person.create({ name: 'ezequiel.chareca', title: 'CD', seniority: '1a', region: 'AMERICAS', role: 'manager', managerId: alyssa._id, order: 2 });
  const killian = await Person.create({ name: 'killian.cooper', title: '5b Manager', seniority: '5b', region: 'EMEA', role: 'manager', managerId: alyssa._id, order: 3 });
  const manuel = await Person.create({ name: 'manuel.huertas', title: 'CD', seniority: '3b', region: 'EMEA', role: 'manager', managerId: alyssa._id, capabilities: ['ai_capable'], order: 4 });

  // ── jiani.lu's reports ──
  const julian = await Person.create({ name: 'julian.garcia', title: 'AI ACD', seniority: '5a', region: 'AMERICAS', role: 'manager', managerId: jiani._id, capabilities: ['ai_capable'], order: 0 });
  const mariana = await Person.create({ name: 'mariana.caro', title: '4a', seniority: '4a', region: 'AMERICAS', role: 'ic', managerId: jiani._id, capabilities: ['ai_capable'], order: 1 });

  // julian.garcia's reports
  const clara = await Person.create({ name: 'clara.lipkau', title: '4b Manager', seniority: '4b', region: 'EMEA', role: 'manager', managerId: julian._id, order: 0 });

  // clara.lipkau's reports
  const axel = await Person.create({ name: 'axel.trujillo', title: 'UX/UI Designer', seniority: '3b', region: 'AMERICAS', role: 'ic', managerId: clara._id, order: 0 });

  // axel.trujillo's reports
  const alexR = await Person.create({ name: 'alex.rassool', title: '3a', seniority: '3a', region: 'EMEA', role: 'ic', managerId: axel._id, order: 0 });

  // mariana.caro's reports
  const gino = await Person.create({ name: 'gino.gropponi', title: '3a', seniority: '3a', region: 'AMERICAS', role: 'ic', managerId: mariana._id, status: 'new', order: 0 });
  const victoria = await Person.create({ name: 'victoria.parreno', title: '3a', seniority: '3a', region: 'AMERICAS', role: 'ic', managerId: mariana._id, order: 1 });

  // ── lauren.coetzee's reports ──
  const lucasYu = await Person.create({ name: 'lucas.yu', title: 'ACD', seniority: '5a', region: 'EMEA', role: 'ic', managerId: lauren._id, order: 0 });
  const pedro = await Person.create({ name: 'pedro.boreli', title: 'ACD', seniority: '6a', region: 'AMERICAS', role: 'manager', managerId: lauren._id, order: 1 });
  const diana = await Person.create({ name: 'diana.vigo', title: '4a', seniority: '4a', region: 'EMEA', role: 'ic', managerId: lauren._id, order: 2 });
  const javo = await Person.create({ name: 'javo.moreira', title: '3a', seniority: '3a', region: 'AMERICAS', role: 'ic', managerId: lauren._id, order: 3 });
  const paloma = await Person.create({ name: 'paloma.pizarro', title: 'Presentation', seniority: '2b', region: 'AMERICAS', role: 'ic', managerId: lauren._id, order: 4 });
  const miguelL = await Person.create({ name: 'miguel.leca', title: 'Web', seniority: '2a', region: 'EMEA', role: 'ic', managerId: lauren._id, order: 5 });

  // pedro.boreli's reports
  const augusto = await Person.create({ name: 'augusto.zambonato', title: '3b', seniority: '3b', region: 'AMERICAS', role: 'ic', managerId: pedro._id, order: 0 });
  const michelleR = await Person.create({ name: 'michelle.reyes', title: '3b', seniority: '3b', region: 'AMERICAS', role: 'ic', managerId: pedro._id, order: 1 });
  const titi = await Person.create({ name: 'titi.palumbo', title: '3a', seniority: '3a', region: 'AMERICAS', role: 'ic', managerId: pedro._id, order: 2 });

  // ── ezequiel.chareca's reports ──
  const georgios = await Person.create({ name: 'georgios.matzouranis', title: '4a', seniority: '4a', region: 'EMEA', role: 'ic', managerId: ezequiel._id, status: 'new', order: 0 });
  const jorgeM = await Person.create({ name: 'jorge.margarido', title: '3b', seniority: '3b', region: 'EMEA', role: 'ic', managerId: ezequiel._id, order: 1 });
  const miguelS = await Person.create({ name: 'miguel.silgado', title: '3b', seniority: '3b', region: 'EMEA', role: 'ic', managerId: ezequiel._id, order: 2 });

  // ── killian.cooper's reports ──
  const florencia = await Person.create({ name: 'florencia.luppi', title: 'ACD', seniority: '6a', region: 'AMERICAS', role: 'manager', managerId: killian._id, status: 'leaving', statusNote: 'Will leave starting May', order: 0 });

  // florencia.luppi's reports
  const michelleP = await Person.create({ name: 'michelle.pienaar', title: '4a', seniority: '4a', region: 'EMEA', role: 'ic', managerId: florencia._id, order: 0 });
  const jefferson = await Person.create({ name: 'jefferson.tomazella', title: '3b Motion', seniority: '3b', region: 'AMERICAS', role: 'manager', managerId: florencia._id, capabilities: ['motion'], order: 1 });
  const grace = await Person.create({ name: 'grace.cooper', title: 'Strategy', seniority: '3b', region: 'EMEA', role: 'ic', managerId: florencia._id, order: 2 });
  const julie = await Person.create({ name: 'julie.pughe-parry', title: '3b', seniority: '3b', region: 'EMEA', role: 'manager', managerId: florencia._id, order: 3 });
  const batia = await Person.create({ name: 'batia.efrat', title: '3b', seniority: '3b', region: 'EMEA', role: 'manager', managerId: florencia._id, order: 4 });

  // jefferson.tomazella's reports
  const cristina = await Person.create({ name: 'cristina.corat', title: '3a', seniority: '3a', region: 'AMERICAS', role: 'ic', managerId: jefferson._id, order: 0 });
  const santiago = await Person.create({ name: 'santiago.rodriguez', title: '2a', seniority: '2a', region: 'AMERICAS', role: 'ic', managerId: jefferson._id, order: 1 });
  const adrian = await Person.create({ name: 'Adrian Becerril Brto', title: 'Motion & 3D', seniority: '2a', region: 'AMERICAS', role: 'ic', managerId: jefferson._id, capabilities: ['motion'], order: 2 });

  // julie.pughe-parry's reports
  const lois = await Person.create({ name: 'lois.qutob', title: 'Concept', seniority: '2b', region: 'EMEA', role: 'ic', managerId: julie._id, order: 0 });

  // batia.efrat's reports
  const jillene = await Person.create({ name: 'jillene.baniqued', title: '2b', seniority: '2b', region: 'APAC', role: 'ic', managerId: batia._id, order: 0 });

  // ── manuel.huertas's reports ──
  const paula = await Person.create({ name: 'paula.delmas', title: '4b', seniority: '4b', region: 'EMEA', role: 'manager', managerId: manuel._id, order: 0 });
  const fabiano = await Person.create({ name: 'fabiano.cavalheiro', title: '4b', seniority: '4b', region: 'EMEA', role: 'ic', managerId: manuel._id, order: 1 });

  // paula.delmas's reports
  const andrea = await Person.create({ name: 'andrea.montelongo', title: '3b', seniority: '3b', region: 'AMERICAS', role: 'ic', managerId: paula._id, order: 0 });
  const gabrielA = await Person.create({ name: 'gabriel.abdala', title: '3b', seniority: '3b', region: 'AMERICAS', role: 'ic', managerId: paula._id, order: 1 });
  const andrey = await Person.create({ name: 'andrey.ramirez', title: '3b', seniority: '3b', region: 'AMERICAS', role: 'ic', managerId: paula._id, order: 2 });
  const danielD = await Person.create({ name: 'daniel.dzierwanowski', title: '2b', seniority: '2b', region: 'EMEA', role: 'ic', managerId: paula._id, order: 3 });
  const gabrielB = await Person.create({ name: 'gabriel.botha', title: '2b', seniority: '2b', region: 'EMEA', role: 'ic', managerId: paula._id, capabilities: ['motion'], order: 4 });
  const julianC = await Person.create({ name: 'julian.cristancho', title: '1.2', seniority: '1.2', region: 'AMERICAS', role: 'ic', managerId: paula._id, capabilities: ['motion'], order: 5 });

  // julian.cristancho's reports
  const diego = await Person.create({ name: 'diego.simonseif', title: '1b', seniority: '1b', region: 'AMERICAS', role: 'ic', managerId: julianC._id, order: 0 });

  // ── Standalone: flavio.treiger ──
  const flavio = await Person.create({ name: 'flavio.treiger', title: 'AI ACD', seniority: '5a', region: 'AMERICAS', role: 'ic', status: 'active', statusNote: 'Temporary assignment', type: 'employee', order: 0 });

  // ── Planned Roles ──
  await Person.insertMany([
    { name: 'Freelance ACD', title: 'DSK Seasonal', type: 'planned_role', status: 'planned', order: 0 },
    { name: 'Internal Retoucher 1', title: 'Retoucher', type: 'planned_role', status: 'planned', order: 1 },
    { name: 'Internal Retoucher 2', title: 'Retoucher', type: 'planned_role', status: 'planned', order: 2 },
    { name: 'Internal Retoucher 3', title: 'Retoucher', type: 'planned_role', status: 'planned', order: 3 }
  ]);

  console.log('Inserted all people');

  // ── Assignments ──
  // Helper: create assignment
  const assign = (personId, accountId, priority, modifier = null, order = 0) =>
    ({ personId, accountId, priority, modifier, order });

  const assignmentsData = [
    // jiani.lu
    assign(jiani._id, dicks._id, 'main', null, 0),
    assign(jiani._id, msft._id, 'secondary', null, 1),

    // julian.garcia
    assign(julian._id, ai._id, 'main', null, 0),
    assign(julian._id, dicks._id, 'secondary', null, 1),

    // clara.lipkau
    assign(clara._id, appfolio._id, 'main', null, 0),
    assign(clara._id, quest._id, 'secondary', null, 1),
    assign(clara._id, msft._id, 'additional', null, 2),

    // axel.trujillo
    assign(axel._id, workday._id, 'main', null, 0),
    assign(axel._id, grammarly._id, 'secondary', null, 1),
    assign(axel._id, gd._id, 'additional', null, 2),

    // alex.rassool
    assign(alexR._id, freePeople._id, 'main', null, 0),
    assign(alexR._id, msft._id, 'secondary', null, 1),
    assign(alexR._id, dicks._id, 'additional', null, 2),

    // mariana.caro
    assign(mariana._id, dicks._id, 'main', null, 0),
    assign(mariana._id, grammarly._id, 'secondary', null, 1),
    assign(mariana._id, freePeople._id, 'additional', null, 2),

    // gino.gropponi
    assign(gino._id, dicks._id, 'main', null, 0),
    assign(gino._id, grammarly._id, 'secondary', null, 1),

    // victoria.parreno
    assign(victoria._id, grammarly._id, 'main', null, 0),
    assign(victoria._id, msft._id, 'secondary', null, 1),
    assign(victoria._id, dicks._id, 'additional', null, 2),

    // lauren.coetzee
    assign(lauren._id, doordash._id, 'main', null, 0),
    assign(lauren._id, freePeople._id, 'secondary', null, 1),

    // lucas.yu
    assign(lucasYu._id, quest._id, 'main', null, 0),
    assign(lucasYu._id, gd._id, 'secondary', null, 1),
    assign(lucasYu._id, kaseya._id, 'additional', 'temporary', 2),

    // pedro.boreli
    assign(pedro._id, kaseya._id, 'main', null, 0),
    assign(pedro._id, workday._id, 'secondary', null, 1),
    assign(pedro._id, grammarly._id, 'additional', null, 2),

    // augusto.zambonato
    assign(augusto._id, dicks._id, 'main', null, 0),
    assign(augusto._id, grammarly._id, 'secondary', null, 1),
    assign(augusto._id, doordash._id, 'additional', null, 2),

    // michelle.reyes
    assign(michelleR._id, quest._id, 'main', null, 0),
    assign(michelleR._id, freePeople._id, 'secondary', null, 1),
    assign(michelleR._id, kaseya._id, 'additional', null, 2),

    // titi.palumbo
    assign(titi._id, gd._id, 'main', null, 0),
    assign(titi._id, grammarly._id, 'secondary', null, 1),
    assign(titi._id, kaseya._id, 'additional', null, 2),

    // diana.vigo
    assign(diana._id, doordash._id, 'main', null, 0),
    assign(diana._id, grammarly._id, 'secondary', null, 1),

    // javo.moreira
    assign(javo._id, grammarly._id, 'main', null, 0),
    assign(javo._id, workday._id, 'secondary', null, 1),
    assign(javo._id, freePeople._id, 'additional', null, 2),

    // paloma.pizarro
    assign(paloma._id, kaseya._id, 'main', null, 0),
    assign(paloma._id, msft._id, 'secondary', null, 1),
    assign(paloma._id, grammarly._id, 'additional', null, 2),

    // miguel.leca
    assign(miguelL._id, quest._id, 'main', null, 0),
    assign(miguelL._id, appfolio._id, 'secondary', null, 1),
    assign(miguelL._id, philips._id, 'additional', null, 2),

    // ezequiel.chareca
    assign(ezequiel._id, grammarly._id, 'main', null, 0),
    assign(ezequiel._id, quest._id, 'secondary', null, 1),

    // georgios.matzouranis
    assign(georgios._id, grammarly._id, 'main', null, 0),
    assign(georgios._id, gd._id, 'secondary', null, 1),
    assign(georgios._id, quest._id, 'additional', null, 2),

    // jorge.margarido
    assign(jorgeM._id, doordash._id, 'main', null, 0),
    assign(jorgeM._id, freePeople._id, 'secondary', null, 1),
    assign(jorgeM._id, grammarly._id, 'additional', null, 2),

    // miguel.silgado
    assign(miguelS._id, grammarly._id, 'main', null, 0),
    assign(miguelS._id, quest._id, 'secondary', null, 1),
    assign(miguelS._id, gd._id, 'additional', null, 2),

    // killian.cooper
    assign(killian._id, workday._id, 'main', null, 0),
    assign(killian._id, quest._id, 'secondary', null, 1),
    assign(killian._id, grammarly._id, 'additional', null, 2),

    // florencia.luppi
    assign(florencia._id, msft._id, 'main', null, 0),
    assign(florencia._id, grammarly._id, 'secondary', 'if_time_allows', 1),

    // michelle.pienaar
    assign(michelleP._id, quest._id, 'main', null, 0),
    assign(michelleP._id, marvell._id, 'secondary', null, 1),
    assign(michelleP._id, grammarly._id, 'additional', null, 2),

    // jefferson.tomazella
    assign(jefferson._id, quest._id, 'main', null, 0),
    assign(jefferson._id, grammarly._id, 'secondary', null, 1),

    // cristina.corat
    assign(cristina._id, grammarly._id, 'main', null, 0),
    assign(cristina._id, philips._id, 'secondary', null, 1),
    assign(cristina._id, thomsonReuters._id, 'additional', null, 2),

    // santiago.rodriguez
    assign(santiago._id, grammarly._id, 'main', null, 0),
    assign(santiago._id, gd._id, 'secondary', null, 1),

    // Adrian Becerril Brto
    assign(adrian._id, appfolio._id, 'main', null, 0),
    assign(adrian._id, philips._id, 'secondary', null, 1),

    // grace.cooper
    assign(grace._id, msft._id, 'main', null, 0),
    assign(grace._id, gd._id, 'secondary', null, 1),
    assign(grace._id, freePeople._id, 'additional', null, 2),
    assign(grace._id, grammarly._id, 'additional', null, 3),

    // julie.pughe-parry
    assign(julie._id, freePeople._id, 'main', null, 0),
    assign(julie._id, quest._id, 'secondary', null, 1),
    assign(julie._id, gd._id, 'additional', null, 2),

    // lois.qutob
    assign(lois._id, grammarly._id, 'main', null, 0),
    assign(lois._id, quest._id, 'secondary', null, 1),
    assign(lois._id, appfolio._id, 'additional', null, 2),

    // batia.efrat
    assign(batia._id, workday._id, 'main', null, 0),
    assign(batia._id, doordash._id, 'secondary', null, 1),
    assign(batia._id, kaseya._id, 'additional', null, 2),

    // jillene.baniqued
    assign(jillene._id, grammarly._id, 'main', null, 0),
    assign(jillene._id, philips._id, 'secondary', null, 1),

    // manuel.huertas
    assign(manuel._id, ai._id, 'main', null, 0),
    assign(manuel._id, dicks._id, 'secondary', null, 1),
    assign(manuel._id, grammarly._id, 'additional', null, 2),

    // paula.delmas
    assign(paula._id, msft._id, 'main', null, 0),
    assign(paula._id, quest._id, 'secondary', null, 1),

    // andrea.montelongo
    assign(andrea._id, quest._id, 'main', null, 0),
    assign(andrea._id, msft._id, 'secondary', null, 1),
    assign(andrea._id, grammarly._id, 'additional', null, 2),

    // gabriel.abdala
    assign(gabrielA._id, grammarly._id, 'main', null, 0),
    assign(gabrielA._id, msft._id, 'secondary', null, 1),

    // andrey.ramirez
    assign(andrey._id, grammarly._id, 'main', null, 0),
    assign(andrey._id, doordash._id, 'secondary', null, 1),

    // daniel.dzierwanowski
    assign(danielD._id, kaseya._id, 'main', null, 0),
    assign(danielD._id, dicks._id, 'secondary', null, 1),

    // gabriel.botha
    assign(gabrielB._id, grammarly._id, 'main', null, 0),
    assign(gabrielB._id, quest._id, 'secondary', null, 1),

    // julian.cristancho
    assign(julianC._id, workday._id, 'main', null, 0),

    // diego.simonseif
    assign(diego._id, kaseya._id, 'main', null, 0),
    assign(diego._id, doordash._id, 'secondary', null, 1),

    // fabiano.cavalheiro
    assign(fabiano._id, quest._id, 'main', null, 0),

    // flavio.treiger (no account assignments listed, but he manages freelance pool)
  ];

  await Assignment.insertMany(assignmentsData);
  console.log(`Inserted ${assignmentsData.length} assignments`);

  // ── Freelance Pool ──
  await FreelancePool.create({
    name: 'DSK Freelance Talent',
    ownerId: flavio._id,
    members: [
      { name: 'Alena Travkina', specialty: 'RETOUCH' },
      { name: 'Nathan Palmer', specialty: 'RETOUCH' },
      { name: 'Daniel V.', specialty: 'RETOUCH' },
      { name: 'Lucia', specialty: 'RETOUCH' },
      { name: 'Andy Moreno', specialty: 'RETOUCH' },
      { name: 'Andres Najera', specialty: 'RETOUCH' },
      { name: 'Pamela', specialty: 'RETOUCH' },
      { name: 'Luciano Borlenghi', specialty: 'RETOUCH' }
    ]
  });
  console.log('Inserted freelance pool');

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

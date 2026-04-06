// Reingold-Tilford style tree layout algorithm
const CARD_W = 180;
const CARD_H = 250;
const GAP_X = 40;
const GAP_Y = 60;

// Extract a raw ID string from a value that may be a string, ObjectId, or populated object
function toId(val) {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (val._id) return String(val._id);
  return String(val);
}

export function layoutTree(rootNode, collapsed = new Set()) {
  if (!rootNode) return { nodes: [], edges: [], width: 0, height: 0 };

  const nodes = [];
  const edges = [];

  // First pass: compute the minimum width each subtree needs
  function computeWidth(node) {
    if (collapsed.has(toId(node._id))) return CARD_W;
    const children = node.children || [];
    if (children.length === 0) return CARD_W;
    const childrenWidth = children.reduce((sum, c) => sum + computeWidth(c) + GAP_X, -GAP_X);
    return Math.max(CARD_W, childrenWidth);
  }

  // Second pass: recursively assign x,y positions
  function assignPositions(node, x, y, availableWidth) {
    const nodeX = x + availableWidth / 2 - CARD_W / 2;
    const nodeY = y;

    nodes.push({
      ...node,
      x: nodeX,
      y: nodeY,
      w: CARD_W,
      h: CARD_H,
      centerX: nodeX + CARD_W / 2,
      centerY: nodeY + CARD_H / 2
    });

    if (collapsed.has(toId(node._id))) return;
    const children = node.children || [];
    if (children.length === 0) return;

    const childWidths = children.map(c => computeWidth(c));
    const totalChildWidth = childWidths.reduce((s, w) => s + w + GAP_X, -GAP_X);
    let childX = x + (availableWidth - totalChildWidth) / 2;

    const parentCenterX = nodeX + CARD_W / 2;
    const parentBottomY = nodeY + CARD_H;
    const childTopY = y + CARD_H + GAP_Y;

    // Collect child center positions for the horizontal bar
    const childCenters = [];

    children.forEach((child, i) => {
      const childW = childWidths[i];
      const childNodeX = childX + childW / 2 - CARD_W / 2;
      const childCenterX = childNodeX + CARD_W / 2;

      childCenters.push(childCenterX);

      assignPositions(child, childX, childTopY, childW);
      childX += childW + GAP_X;
    });

    // Create edges: vertical from parent down to a horizontal bar, then vertical down to each child
    const midY = parentBottomY + GAP_Y / 2;

    if (children.length === 1) {
      // Single child: straight vertical line
      edges.push({
        id: `${toId(node._id)}-${toId(children[0]._id)}`,
        type: 'straight',
        from: { x: parentCenterX, y: parentBottomY },
        to: { x: childCenters[0], y: childTopY },
        dashed: false
      });
    } else {
      // Multiple children: parent stem down to midY
      edges.push({
        id: `${toId(node._id)}-stem`,
        type: 'vertical',
        from: { x: parentCenterX, y: parentBottomY },
        to: { x: parentCenterX, y: midY },
        dashed: false
      });

      // Horizontal bar connecting all children at midY
      const leftmost = Math.min(...childCenters);
      const rightmost = Math.max(...childCenters);
      edges.push({
        id: `${toId(node._id)}-bar`,
        type: 'horizontal',
        from: { x: leftmost, y: midY },
        to: { x: rightmost, y: midY },
        dashed: false
      });

      // Vertical drops from bar down to each child
      children.forEach((child, i) => {
        edges.push({
          id: `${toId(node._id)}-${toId(child._id)}`,
          type: 'vertical',
          from: { x: childCenters[i], y: midY },
          to: { x: childCenters[i], y: childTopY },
          dashed: false
        });
      });
    }
  }

  const totalWidth = computeWidth(rootNode);
  assignPositions(rootNode, 0, 0, totalWidth);

  // Compute bounds
  let maxX = 0, maxY = 0;
  for (const n of nodes) {
    if (n.x + n.w > maxX) maxX = n.x + n.w;
    if (n.y + n.h > maxY) maxY = n.y + n.h;
  }

  return { nodes, edges, width: maxX + GAP_X, height: maxY + GAP_Y };
}

export function buildTreeData(people, assignments, accounts) {
  const personMap = {};
  for (const p of people) {
    const id = toId(p._id);
    personMap[id] = { ...p, _id: id, children: [] };
  }

  // Normalize managerId to raw string IDs
  for (const p of Object.values(personMap)) {
    p.managerId = toId(p.managerId);
    p.secondaryManagerId = toId(p.secondaryManagerId);
  }

  // Build assignment lookup
  const assignmentMap = {};
  for (const a of assignments) {
    const pid = toId(a.personId?._id || a.personId);
    if (!assignmentMap[pid]) assignmentMap[pid] = [];
    const aid = toId(a.accountId?._id || a.accountId);
    assignmentMap[pid].push({
      ...a,
      account: a.accountId?.name ? a.accountId : accounts.find(ac => toId(ac._id) === aid)
    });
  }

  // Attach assignments to each person
  for (const id of Object.keys(personMap)) {
    personMap[id].assignmentsList = assignmentMap[id] || [];
  }

  // Build tree by linking children to parents
  const roots = [];
  for (const p of Object.values(personMap)) {
    if (p.managerId && personMap[p.managerId]) {
      personMap[p.managerId].children.push(p);
    } else if (!p.managerId || !personMap[p.managerId]) {
      if (p.type !== 'planned_role') roots.push(p);
    }
  }

  // Sort children by order
  for (const p of Object.values(personMap)) {
    p.children.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  return { roots, personMap };
}

export { CARD_W, CARD_H, GAP_X, GAP_Y, toId };

import React from 'react';
import { CARD_W, CARD_H, toId } from '../../utils/treeLayout';

const R = 10; // corner radius
const STROKE = '#9a9a9a';
const STROKE_W = 1.5;
const ARROW = 7;

// Build a rounded-corner orthogonal path from (x1,y1) down to midY, across to x2, then down to (x2,y2)
function roundedOrthoPath(x1, y1, x2, y2, midY) {
  const dx = x2 - x1;
  if (Math.abs(dx) < 1) {
    // Straight vertical line
    return `M ${x1} ${y1} L ${x1} ${y2}`;
  }

  const dir = dx > 0 ? 1 : -1;
  const r = Math.min(R, Math.abs(dx) / 2, Math.abs(midY - y1), Math.abs(y2 - midY));

  return [
    `M ${x1} ${y1}`,
    `L ${x1} ${midY - r}`,
    `Q ${x1} ${midY} ${x1 + dir * r} ${midY}`,
    `L ${x2 - dir * r} ${midY}`,
    `Q ${x2} ${midY} ${x2} ${midY + r}`,
    `L ${x2} ${y2}`
  ].join(' ');
}

// Vertical line with rounded corner turning into the horizontal bar
function stemToBarPath(parentCx, parentBot, midY, barX) {
  const dx = barX - parentCx;
  if (Math.abs(dx) < 1) {
    return `M ${parentCx} ${parentBot} L ${parentCx} ${midY}`;
  }
  const dir = dx > 0 ? 1 : -1;
  const r = Math.min(R, Math.abs(dx), Math.abs(midY - parentBot));
  return [
    `M ${parentCx} ${parentBot}`,
    `L ${parentCx} ${midY - r}`,
    `Q ${parentCx} ${midY} ${parentCx + dir * r} ${midY}`,
    `L ${barX} ${midY}`
  ].join(' ');
}

// Vertical drop from bar to child with rounded corner
function barToChildPath(cx, midY, childTop) {
  return `M ${cx} ${midY} L ${cx} ${childTop}`;
}

export default function TreeLines({ edges, nodePositions, personMap }) {
  if (!edges || edges.length === 0) return null;

  // Build secondary manager (dotted-line) edges
  const secondaryEdges = [];
  if (personMap && nodePositions) {
    for (const p of Object.values(personMap)) {
      if (!p.secondaryManagerId) continue;
      const childNode = nodePositions[toId(p._id)];
      const mgrNode = nodePositions[toId(p.secondaryManagerId)];
      if (childNode && mgrNode) {
        secondaryEdges.push({
          id: `secondary-${toId(p._id)}`,
          from: { x: mgrNode.x + CARD_W / 2, y: mgrNode.y + CARD_H },
          to: { x: childNode.x + CARD_W / 2, y: childNode.y }
        });
      }
    }
  }

  return (
    <svg style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', overflow: 'visible'
    }}>
      <defs>
        <marker id="arrow" markerWidth={ARROW} markerHeight={ARROW}
          refX={ARROW / 2} refY={ARROW / 2}
          orient="auto" markerUnits="userSpaceOnUse">
          <path d={`M 0 1 L ${ARROW} ${ARROW / 2} L 0 ${ARROW - 1}`}
            fill="none" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        </marker>
        <marker id="arrow-light" markerWidth={ARROW} markerHeight={ARROW}
          refX={ARROW / 2} refY={ARROW / 2}
          orient="auto" markerUnits="userSpaceOnUse">
          <path d={`M 0 1 L ${ARROW} ${ARROW / 2} L 0 ${ARROW - 1}`}
            fill="none" stroke="#bbb" strokeWidth={1} strokeLinejoin="round" />
        </marker>
      </defs>

      {edges.map(edge => {
        if (edge.type === 'ortho-single') {
          const { parentCx, parentBot, childCx, childTop, midY } = edge;
          const d = roundedOrthoPath(parentCx, parentBot, childCx, childTop, midY);
          return (
            <path key={edge.id} d={d}
              fill="none" stroke={STROKE} strokeWidth={STROKE_W}
              
            />
          );
        }

        if (edge.type === 'ortho-stem') {
          // Stem from parent center down to the horizontal bar level
          // Need to check if parent center aligns with bar — if not, curve into it
          return (
            <line key={edge.id}
              x1={edge.parentCx} y1={edge.parentBot}
              x2={edge.parentCx} y2={edge.midY}
              stroke={STROKE} strokeWidth={STROKE_W}
            />
          );
        }

        if (edge.type === 'ortho-bar') {
          return (
            <line key={edge.id}
              x1={edge.x1} y1={edge.y}
              x2={edge.x2} y2={edge.y}
              stroke={STROKE} strokeWidth={STROKE_W}
            />
          );
        }

        if (edge.type === 'ortho-drop') {
          return (
            <line key={edge.id}
              x1={edge.cx} y1={edge.midY}
              x2={edge.cx} y2={edge.childTop}
              stroke={STROKE} strokeWidth={STROKE_W}
              
            />
          );
        }

        return null;
      })}

      {/* Secondary manager dashed lines */}
      {secondaryEdges.map(edge => {
        const { from, to } = edge;
        const midY = from.y + (to.y - from.y) / 2;
        const d = roundedOrthoPath(from.x, from.y, to.x, to.y, midY);
        return (
          <path key={edge.id} d={d}
            fill="none" stroke="#bbb" strokeWidth={1}
            strokeDasharray="6,4"
            
          />
        );
      })}
    </svg>
  );
}

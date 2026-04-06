import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { buildTreeData, layoutTree, toId, CARD_W, CARD_H } from '../../utils/treeLayout';
import { personMatchesFilters } from '../../utils/filters';
import { formatName } from '../../utils/formatters';
import TreeCard from './TreeCard';
import TreeLines from './TreeLines';
import MiniMap from './MiniMap';
import api from '../../services/api';

export default function OrgTree() {
  const { people, setPeople, assignments, accounts, filters, setSelectedPersonId, fetchAll, locked } = useApp();
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const [zoom, setZoom] = useState(0.3);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [collapsed, setCollapsed] = useState(new Set());
  const [hasFitted, setHasFitted] = useState(false);
  const containerRef = useRef();

  // Interaction mode
  const modeRef = useRef('idle'); // 'idle' | 'panning' | 'dragging'
  const panStartRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const didDragRef = useRef(false);
  const [dragNodeId, setDragNodeId] = useState(null);

  // Local position overrides while dragging
  const [localOffsets, setLocalOffsets] = useState({});
  const localOffsetsRef = useRef(localOffsets);
  localOffsetsRef.current = localOffsets;

  // ── Connect mode state ──
  const [connectMode, setConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState(null); // nodeId of source card
  const [connectMouse, setConnectMouse] = useState(null); // { x, y } in tree space
  const [connectConfirm, setConnectConfirm] = useState(null); // { sourceId, targetId }

  const { roots, personMap } = useMemo(
    () => buildTreeData(people, assignments, accounts),
    [people, assignments, accounts]
  );

  const autoLayout = useMemo(() => {
    if (roots.length === 0) return { nodes: [], edges: [], width: 0, height: 0 };

    // Separate roots that have subtrees vs standalone
    const treeRoots = roots.filter(r => (r.children || []).length > 0);
    const standalone = roots.filter(r => (r.children || []).length === 0);

    // Layout each tree root individually, then stack them
    const allNodes = [];
    const allEdges = [];
    let cursorX = 0;

    for (const root of treeRoots) {
      const result = layoutTree(root, collapsed);
      // Offset all nodes/edges by cursorX
      for (const n of result.nodes) {
        allNodes.push({ ...n, x: n.x + cursorX, centerX: (n.centerX || n.x + CARD_W/2) + cursorX });
      }
      for (const e of result.edges) {
        const shifted = { ...e };
        if (shifted.from) shifted.from = { ...shifted.from, x: shifted.from.x + cursorX };
        if (shifted.to) shifted.to = { ...shifted.to, x: shifted.to.x + cursorX };
        allEdges.push(shifted);
      }
      cursorX += result.width + 60;
    }

    // Place standalone cards in a grid below all trees
    let maxTreeY = 0;
    for (const n of allNodes) {
      if (n.y + (n.h || CARD_H) > maxTreeY) maxTreeY = n.y + (n.h || CARD_H);
    }
    const gridStartY = allNodes.length > 0 ? maxTreeY + 60 : 0;
    const cols = 6;
    for (let i = 0; i < standalone.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (CARD_W + 20);
      const y = gridStartY + row * (CARD_H + 20);
      allNodes.push({
        ...standalone[i],
        x, y, w: CARD_W, h: CARD_H,
        centerX: x + CARD_W / 2,
        centerY: y + CARD_H / 2
      });
    }

    let maxX = 0, maxY = 0;
    for (const n of allNodes) {
      if (n.x + (n.w || CARD_W) > maxX) maxX = n.x + (n.w || CARD_W);
      if (n.y + (n.h || CARD_H) > maxY) maxY = n.y + (n.h || CARD_H);
    }

    return { nodes: allNodes, edges: allEdges, width: maxX + 100, height: maxY + 100 };
  }, [roots, collapsed]);

  // Check if a person has any assignments
  const personHasAssignments = useMemo(() => {
    const map = {};
    for (const a of assignments) {
      const pid = toId(a.personId?._id || a.personId);
      map[pid] = true;
    }
    return map;
  }, [assignments]);

  const getCardHeight = (nodeId) => {
    return personHasAssignments[nodeId] ? CARD_H : CARD_H - 50;
  };

  const treeData = useMemo(() => {
    const nodes = autoLayout.nodes.map(node => {
      if (node.virtual) return node;
      const id = toId(node._id);
      const person = personMap[id];
      const h = getCardHeight(id);
      if (localOffsets[id]) {
        const x = localOffsets[id].x, y = localOffsets[id].y;
        return { ...node, x, y, h, centerX: x + CARD_W / 2, centerY: y + h / 2 };
      }
      if (person && person.posX != null && person.posY != null) {
        const x = person.posX, y = person.posY;
        return { ...node, x, y, h, centerX: x + CARD_W / 2, centerY: y + h / 2 };
      }
      return { ...node, h };
    });

    const nodeMap = {};
    for (const n of nodes) nodeMap[toId(n._id)] = n;

    // Group children by parent for orthogonal connectors
    const childrenByParent = {};
    for (const n of nodes) {
      if (n.virtual) continue;
      const person = personMap[toId(n._id)];
      if (!person || !person.managerId) continue;
      const pid = person.managerId;
      if (!nodeMap[pid]) continue;
      if (!childrenByParent[pid]) childrenByParent[pid] = [];
      childrenByParent[pid].push(n);
    }

    const edges = [];
    for (const [parentId, children] of Object.entries(childrenByParent)) {
      const parent = nodeMap[parentId];
      if (!parent) continue;
      const parentCx = parent.x + CARD_W / 2;
      const parentBot = parent.y + (parent.h || CARD_H);

      const childCenters = children.map(c => ({
        id: toId(c._id),
        cx: c.x + CARD_W / 2,
        top: c.y
      }));

      // Midpoint Y between parent bottom and topmost child
      const topChild = Math.min(...childCenters.map(c => c.top));
      const midY = parentBot + (topChild - parentBot) / 2;

      if (children.length === 1) {
        // Single child: one straight orthogonal path
        const c = childCenters[0];
        edges.push({
          id: `${parentId}-${c.id}`,
          type: 'ortho-single',
          parentCx, parentBot,
          childCx: c.cx, childTop: c.top,
          midY
        });
      } else {
        // Multiple children: stem + bar + drops
        const leftmost = Math.min(...childCenters.map(c => c.cx));
        const rightmost = Math.max(...childCenters.map(c => c.cx));

        // Extend bar to include parent center if it falls outside child range
        const barLeft = Math.min(leftmost, parentCx);
        const barRight = Math.max(rightmost, parentCx);

        edges.push({
          id: `${parentId}-stem`,
          type: 'ortho-stem',
          parentCx, parentBot, midY
        });
        edges.push({
          id: `${parentId}-bar`,
          type: 'ortho-bar',
          y: midY, x1: barLeft, x2: barRight
        });

        for (const c of childCenters) {
          edges.push({
            id: `${parentId}-${c.id}-drop`,
            type: 'ortho-drop',
            cx: c.cx, midY, childTop: c.top
          });
        }
      }
    }

    let maxX = 0, maxY = 0;
    for (const n of nodes) {
      if (n.x + (n.w || CARD_W) > maxX) maxX = n.x + (n.w || CARD_W);
      if (n.y + (n.h || CARD_H) > maxY) maxY = n.y + (n.h || CARD_H);
    }
    return { nodes, edges, width: maxX + 100, height: maxY + 100 };
  }, [autoLayout, personMap, localOffsets]);

  const nodePositions = useMemo(() => {
    const map = {};
    for (const n of treeData.nodes) map[toId(n._id)] = n;
    return map;
  }, [treeData.nodes]);

  const hasFilters = Object.values(filters).some(Boolean);

  // ── Helpers ──
  const screenToTree = useCallback((screenX, screenY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

  const hitTestNode = useCallback((screenX, screenY) => {
    const { x: tx, y: ty } = screenToTree(screenX, screenY);
    for (const node of treeData.nodes) {
      if (node.virtual) continue;
      if (tx >= node.x && tx <= node.x + CARD_W && ty >= node.y && ty <= node.y + CARD_H) {
        return toId(node._id);
      }
    }
    return null;
  }, [treeData.nodes, screenToTree]);

  // ── Zoom ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.1, Math.min(2, z + (e.deltaY > 0 ? -0.05 : 0.05))));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Fit to view on first load ──
  useEffect(() => {
    if (hasFitted || treeData.nodes.length === 0) return;
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const tw = treeData.width || 1;
    const th = treeData.height || 1;
    const fitZoom = Math.min(cw / tw, ch / th, 1) * 0.9;
    const fitPanX = (cw - tw * fitZoom) / 2;
    const fitPanY = 20;
    setZoom(Math.max(0.15, fitZoom));
    setPan({ x: Math.max(0, fitPanX), y: fitPanY });
    setHasFitted(true);
  }, [treeData.nodes.length, hasFitted]);

  // ── Escape to cancel connect ──
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setConnectMode(false);
        setConnectSource(null);
        setConnectMouse(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Mouse handlers ──
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    if (connectMode) return; // connect mode uses click, not mousedown

    const cardEl = e.target.closest('[data-card]');
    if (cardEl) {
      if (lockedRef.current) return; // Don't allow dragging when locked
      const nodeId = cardEl.getAttribute('data-node-id');
      if (!nodeId) return;
      const node = nodePositions[nodeId];
      if (!node) return;

      modeRef.current = 'dragging';
      dragRef.current = {
        nodeId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        origX: node.x,
        origY: node.y
      };
      didDragRef.current = false;
      e.preventDefault();
    } else if (!e.target.closest('button')) {
      modeRef.current = 'panning';
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  }, [pan, nodePositions, connectMode]);

  const handleMouseMove = useCallback((e) => {
    // Update connect line position
    if (connectMode && connectSource) {
      const tp = screenToTree(e.clientX, e.clientY);
      setConnectMouse(tp);
    }

    if (modeRef.current === 'panning') {
      setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
    } else if (modeRef.current === 'dragging' && dragRef.current) {
      const dr = dragRef.current;
      const dx = (e.clientX - dr.startMouseX) / zoom;
      const dy = (e.clientY - dr.startMouseY) / zoom;
      if (!didDragRef.current && Math.abs(dx) + Math.abs(dy) > 3) {
        didDragRef.current = true;
        setDragNodeId(dr.nodeId);
      }
      if (didDragRef.current) {
        const GRID = 20;
        const snappedX = Math.round((dr.origX + dx) / GRID) * GRID;
        const snappedY = Math.round((dr.origY + dy) / GRID) * GRID;
        setLocalOffsets(prev => ({ ...prev, [dr.nodeId]: { x: snappedX, y: snappedY } }));
      }
    }
  }, [zoom, connectMode, connectSource, screenToTree]);

  const handleMouseUp = useCallback(async () => {
    const mode = modeRef.current;
    modeRef.current = 'idle';

    if (mode === 'dragging' && dragRef.current) {
      if (didDragRef.current) {
        const { nodeId } = dragRef.current;
        const offset = localOffsetsRef.current[nodeId];
        if (offset) {
          const posX = Math.round(offset.x);
          const posY = Math.round(offset.y);
          setPeople(prev => prev.map(p => {
            const pid = typeof p._id === 'object' ? p._id.toString() : p._id;
            return pid === nodeId ? { ...p, posX, posY } : p;
          }));
          api.put(`/api/people/${nodeId}/position`, { posX, posY }).catch(() => {});
        }
        setLocalOffsets(prev => { const next = { ...prev }; delete next[nodeId]; return next; });
      }
      setDragNodeId(null);
      dragRef.current = null;
      setTimeout(() => { didDragRef.current = false; }, 0);
    }
  }, [setPeople]);

  // ── Connect mode click handler ──
  const handleCardClick = useCallback((nodeId) => {
    if (didDragRef.current) return;

    if (connectMode) {
      if (!connectSource) {
        // First click: select source
        setConnectSource(nodeId);
      } else if (nodeId !== connectSource) {
        // Second click: confirm connection
        setConnectConfirm({ sourceId: connectSource, targetId: nodeId });
        setConnectSource(null);
        setConnectMouse(null);
      } else {
        // Clicked same card: cancel
        setConnectSource(null);
        setConnectMouse(null);
      }
    } else {
      setSelectedPersonId(nodeId);
    }
  }, [connectMode, connectSource, setSelectedPersonId]);

  // ── Execute connection ──
  const handleConnect = async (type) => {
    if (!connectConfirm) return;
    const { sourceId, targetId } = connectConfirm;
    try {
      if (type === 'manager') {
        // sourceId reports to targetId
        await api.put(`/api/people/${sourceId}/move`, { managerId: targetId });
      } else if (type === 'secondary') {
        // sourceId has dotted-line to targetId
        await api.put(`/api/people/${sourceId}`, { secondaryManagerId: targetId });
      } else if (type === 'remove') {
        // Remove connection between the two
        const source = personMap[sourceId];
        if (source?.managerId === targetId) {
          await api.put(`/api/people/${sourceId}/move`, { managerId: null });
        }
        if (source?.secondaryManagerId === targetId) {
          await api.put(`/api/people/${sourceId}`, { secondaryManagerId: null });
        }
      }
      await fetchAll();
    } catch { alert('Failed to update connection'); }
    setConnectConfirm(null);
  };

  const toggleCollapse = (id) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleResetLayout = async () => {
    try {
      await api.put('/api/people/positions/reset');
      await fetchAll();
    } catch { alert('Failed to reset layout'); }
  };

  // Source/target names for confirm dialog
  const confirmSourceName = connectConfirm ? personMap[connectConfirm.sourceId]?.name : '';
  const confirmTargetName = connectConfirm ? personMap[connectConfirm.targetId]?.name : '';

  // Compute the connect line (from source card center-bottom to mouse)
  const connectLineFrom = connectSource && nodePositions[connectSource]
    ? { x: nodePositions[connectSource].x + CARD_W / 2, y: nodePositions[connectSource].y + CARD_H }
    : null;

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, cursor: connectMode ? 'crosshair' : undefined }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0', position: 'absolute',
        minWidth: 4000, minHeight: 4000,
        width: Math.max(treeData.width, 4000), height: Math.max(treeData.height, 4000),
        cursor: connectMode ? 'crosshair' : (modeRef.current === 'panning' ? 'grabbing' : 'grab'),
      }}>
        <TreeLines edges={treeData.edges} nodePositions={nodePositions} personMap={personMap} />

        {/* Live connect line */}
        {connectSource && connectMouse && connectLineFrom && (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 3 }}>
            <line
              x1={connectLineFrom.x} y1={connectLineFrom.y}
              x2={connectMouse.x} y2={connectMouse.y}
              stroke="var(--accent)" strokeWidth={2} strokeDasharray="8,4"
            />
            <circle cx={connectMouse.x} cy={connectMouse.y} r={5} fill="var(--accent)" />
          </svg>
        )}

        {treeData.nodes.filter(n => !n.virtual).map(node => (
          <TreeCard
            key={node._id}
            node={node}
            dimmed={hasFilters && !personMatchesFilters(node, filters)}
            collapsed={collapsed.has(node._id)}
            hasChildren={(node.children || []).length > 0}
            onToggleCollapse={() => toggleCollapse(node._id)}
            onClick={() => handleCardClick(node._id)}
            isDragging={dragNodeId === node._id}
            isDropTarget={false}
            isConnectSource={connectSource === node._id}
            connectMode={connectMode}
          />
        ))}
      </div>


      {/* Controls */}
      <div style={styles.controls}>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={styles.zoomBtn}>+</button>
        <span style={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} style={styles.zoomBtn}>−</button>
      </div>

      {/* Connect mode banner */}
      {connectMode && (
        <div style={styles.banner}>
          {connectSource
            ? <>Click a target card to connect to <strong>{formatName(personMap[connectSource]?.name)}</strong> &nbsp;·&nbsp; <button onClick={() => { setConnectSource(null); setConnectMouse(null); }} style={styles.bannerBtn}>Cancel</button></>
            : <>Click a card to start a connection &nbsp;·&nbsp; Press <strong>Esc</strong> to exit</>
          }
        </div>
      )}

      {/* Connection type confirm dialog */}
      {connectConfirm && (
        <div style={styles.modalOverlay} onClick={() => setConnectConfirm(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, marginBottom: 4 }}>Connect Cards</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              <strong>{formatName(confirmSourceName)}</strong> → <strong>{formatName(confirmTargetName)}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => handleConnect('manager')} style={styles.optionBtn}>
                <span style={{ fontSize: 14 }}>━</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Direct Report</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatName(confirmSourceName)} reports to {formatName(confirmTargetName)}</div>
                </div>
              </button>
              <button onClick={() => handleConnect('secondary')} style={styles.optionBtn}>
                <span style={{ fontSize: 14 }}>┄</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Dotted Line</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Secondary/dotted-line manager relationship</div>
                </div>
              </button>
              <button onClick={() => handleConnect('remove')} style={{ ...styles.optionBtn, borderColor: 'var(--red)' }}>
                <span style={{ fontSize: 14, color: 'var(--red)' }}>✕</span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--red)' }}>Remove Connection</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Remove any existing link between these two</div>
                </div>
              </button>
            </div>
            <button onClick={() => setConnectConfirm(null)} style={{ marginTop: 12, width: '100%', padding: '8px', borderRadius: 9999, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%', height: '100%', overflow: 'hidden',
    position: 'relative', background: 'var(--bg)',
    backgroundImage: 'radial-gradient(circle, #e0e0e0 0.8px, transparent 0.8px)',
    backgroundSize: '20px 20px',
    userSelect: 'none'
  },
  controls: {
    position: 'absolute', bottom: 16, right: 16,
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'white', borderRadius: 'var(--radius-md)',
    padding: '4px 6px', boxShadow: 'var(--shadow-md)', zIndex: 10
  },
  zoomBtn: {
    width: 32, height: 32, borderRadius: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 600, cursor: 'pointer',
    color: 'var(--text-primary)'
  },
  zoomLabel: { fontSize: 12, color: 'var(--text-secondary)', minWidth: 36, textAlign: 'center' },
  divider: { width: 1, height: 20, background: 'var(--border)', margin: '0 2px' },
  connectBtn: {
    display: 'flex', alignItems: 'center', padding: '4px 10px',
    borderRadius: 9999, cursor: 'pointer', transition: 'all 0.15s'
  },
  banner: {
    position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
    background: 'var(--accent)', color: '#0A211F', padding: '8px 20px',
    borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500,
    boxShadow: 'var(--shadow-md)', zIndex: 10, whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 4
  },
  bannerBtn: {
    background: 'rgba(255,255,255,0.25)', color: 'white', padding: '2px 10px',
    borderRadius: 9999, fontSize: 12, cursor: 'pointer', fontWeight: 600
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
  },
  modal: {
    background: 'white', borderRadius: 'var(--radius-lg)', padding: 24,
    maxWidth: 400, width: '90%', boxShadow: 'var(--shadow-lg)'
  },
  optionBtn: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
    background: 'white', width: '100%'
  }
};

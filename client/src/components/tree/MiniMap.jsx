import React, { useRef } from 'react';

const MINIMAP_W = 180;
const MINIMAP_H = 120;

export default function MiniMap({ nodes, treeWidth, treeHeight, zoom, pan, setPan, containerRef }) {
  const mapRef = useRef();

  if (!nodes.length || !treeWidth || !treeHeight) return null;

  const scaleX = MINIMAP_W / (treeWidth + 200);
  const scaleY = MINIMAP_H / (treeHeight + 200);
  const scale = Math.min(scaleX, scaleY);

  const container = containerRef.current;
  const viewW = container ? container.clientWidth / zoom : 800;
  const viewH = container ? container.clientHeight / zoom : 600;

  const handleClick = (e) => {
    const rect = mapRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;
    setPan({
      x: -(clickX - viewW / 2) * zoom,
      y: -(clickY - viewH / 2) * zoom
    });
  };

  return (
    <div ref={mapRef} onClick={handleClick} style={{
      position: 'absolute', bottom: 16, right: 16,
      width: MINIMAP_W, height: MINIMAP_H,
      background: 'rgba(255,255,255,0.9)', borderRadius: 9999,
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden', cursor: 'crosshair', zIndex: 10
    }}>
      {/* Nodes as dots */}
      {nodes.filter(n => !n.virtual).map(n => (
        <div key={n._id} style={{
          position: 'absolute',
          left: n.x * scale, top: n.y * scale,
          width: Math.max(3, n.w * scale), height: Math.max(2, n.h * scale),
          background: n.role === 'manager' ? '#C4B5E0' : '#F0E68C',
          borderRadius: 1
        }} />
      ))}
      {/* Viewport rectangle */}
      <div style={{
        position: 'absolute',
        left: (-pan.x / zoom) * scale,
        top: (-pan.y / zoom) * scale,
        width: viewW * scale,
        height: viewH * scale,
        border: '1.5px solid var(--accent)',
        borderRadius: 2,
        pointerEvents: 'none'
      }} />
    </div>
  );
}

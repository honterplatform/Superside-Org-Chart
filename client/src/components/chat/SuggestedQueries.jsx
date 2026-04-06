import React from 'react';

const suggestions = [
  "Who has the most direct reports?",
  "Show all people on Quest",
  "What's the total MRR by region?",
  "Who's new on the team?",
  "List all Motion capable people",
  "Who works on Kaseya?",
  "Which accounts have no main focus?",
  "List all people with temporary assignments"
];

export default function SuggestedQueries({ onSelect }) {
  return (
    <div style={styles.container}>
      <p style={styles.intro}>Ask me anything about the team structure, accounts, or resource allocation.</p>
      <div style={styles.chips}>
        {suggestions.map(q => (
          <button key={q} onClick={() => onSelect(q)} style={styles.chip}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px 0' },
  intro: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    padding: '8px 14px', borderRadius: 20, fontSize: 12,
    border: '1px solid var(--border)', color: 'var(--text-primary)',
    cursor: 'pointer', transition: 'all 0.15s', background: 'white',
    textAlign: 'left'
  }
};

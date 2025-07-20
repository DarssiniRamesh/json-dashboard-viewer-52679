import React, { useState } from 'react';
import './WordCloudPage.css';

// Simple word cloud item, with size and color based on prominence factor
const getRandomColor = () => {
  const palette = [
    '#1976D2', '#388E3C', '#F44336', '#FFC107', '#9C27B0', '#E040FB', '#00B8D4',
    '#FF7043', '#8BC34A', '#5C6BC0', '#607D8B', '#795548'
  ];
  return palette[Math.floor(Math.random() * palette.length)];
};

function WordCloud({ data }) {
  return (
    <div className="wordcloud-container">
      {data.map((item, idx) => (
        <span
          key={idx}
          style={{
            fontSize: `${1 + item.prominence * 2}em`,
            color: getRandomColor(),
            margin: '0.25em',
            fontWeight: item.prominence > 0.5 ? 'bold' : '500',
            display: 'inline-block',
            verticalAlign: 'middle',
            transition: 'all 0.3s'
          }}
          className="wordcloud-word"
          title={item.desc}
        >
          {item.word}
        </span>
      ))}
    </div>
  );
}

function SentenceCloud({ sentences }) {
  return (
    <div className="sentencecloud-container">
      {sentences.map((item, idx) => (
        <div
          key={idx}
          style={{
            color: getRandomColor(),
            fontStyle: 'italic',
            fontSize: `${1 + item.prominence}em`,
            marginBottom: '0.7em',
            background: '#FAFAFA',
            borderRadius: '14px',
            boxShadow: '0 2px 7px rgba(50,50,70,0.09)',
            padding: '0.7em 1em',
            display: 'inline-block',
            transition: 'all 0.3s'
          }}
          className="sentencecloud-sentence"
        >
          {item.sentence}
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { key: 'integrations', name: 'Third-party Integrations' },
  { key: 'features', name: 'Unique Features' },
  { key: 'challenges', name: 'Challenges Faced' },
];

// Example mocked data - replace with dynamic data as needed
const DATA = {
  integrations: {
    words: [
      { word: 'Supabase', prominence: 0.9, desc: 'Real-time DB backend' },
      { word: 'Firebase', prominence: 0.7, desc: 'Alternative backend' },
      { word: 'OAuth2', prominence: 0.5, desc: 'Authentication protocol' },
      { word: 'GitHub', prominence: 0.4, desc: 'Repository hosting' },
      { word: 'Chart.js', prominence: 0.6, desc: 'Charting library' },
      { word: 'React Router', prominence: 0.3, desc: 'Routing' }
    ],
    sentences: [
      { sentence: 'Integration with Supabase enables real-time collaboration.', prominence: 0.7 },
      { sentence: 'OAuth2 is leveraged for secure authentication.', prominence: 0.6 },
      { sentence: 'GitHub workflows automate deployment.', prominence: 0.5 }
    ]
  },
  features: {
    words: [
      { word: 'Live Analytics', prominence: 0.8, desc: 'Shows real-time data' },
      { word: 'Dark Mode', prominence: 0.5, desc: 'User-selectable theme' },
      { word: 'Drag-and-Drop', prominence: 0.7, desc: 'Customizable dashboards' },
      { word: 'Notifications', prominence: 0.6, desc: 'Alert system' },
      { word: 'Responsive', prominence: 0.9, desc: 'Works on all devices' }
    ],
    sentences: [
      { sentence: 'Features customizable data widgets.', prominence: 0.7 },
      { sentence: 'Supports both light and dark UI themes.', prominence: 0.6 }
    ]
  },
  challenges: {
    words: [
      { word: 'API Limits', prominence: 0.7, desc: 'Faced API quota issues' },
      { word: 'Data Sync', prominence: 0.5, desc: 'Ensuring up-to-date data' },
      { word: 'Deployment', prominence: 0.6, desc: 'Multi-environment setup' },
      { word: 'Performance', prominence: 0.8, desc: 'Handling large data sets' }
    ],
    sentences: [
      { sentence: 'Optimizing performance for large word clouds required memoization.', prominence: 0.9 },
      { sentence: 'Dealing with third-party API downtime was a major hurdle.', prominence: 0.7 }
    ]
  }
};


export default function WordCloudPage() {
  const [tab, setTab] = useState('integrations');
  const selected = DATA[tab];

  return (
    <div className="wordcloud-main" style={{maxWidth: 1140, margin: '2em auto', background: '#fff', borderRadius: 20, padding: '2em 2.2em', boxShadow: '0 6px 32px rgba(44,77,140,0.11)'}}>
      <h2 style={{marginTop: 0, color: '#1976D2', fontWeight: 900, fontSize: '2.25em', letterSpacing: '-1px'}}>Insights Snapshot</h2>
      <div style={{display: 'flex', gap: 18, marginBottom: '2em'}}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`wordcloud-tab${tab === t.key ? ' active' : ''}`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 40}}>
        <div style={{flex: '1 1 55%', minWidth: 320}}>
          <h3 style={{color: '#424242', margin: '0 0 0.5em 0'}}>Word Cloud</h3>
          <WordCloud data={selected.words} />
        </div>
        <div style={{flex: '1 1 30%', minWidth: 260}}>
          <h3 style={{color: '#424242', margin: '0 0 0.5em 0'}}>Sentence Cloud</h3>
          <SentenceCloud sentences={selected.sentences} />
        </div>
      </div>
    </div>
  );
}

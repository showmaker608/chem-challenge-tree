import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { ChemGwent } from '../components/ChemGwent';
import { ErrorBoundary } from '../components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ChemGwent onBack={() => { window.location.href = '/'; }} />
      <footer style={{ textAlign: 'center', padding: '12px', fontSize: '12px', background: '#e8f0e8', color: '#456755' }}>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">豫ICP备2026043361号-1</a>
      </footer>
    </ErrorBoundary>
  </StrictMode>,
);

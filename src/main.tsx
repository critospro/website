import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initImagePreloading } from './utils/imagePreloader';
import { 
  initCriticalResourceHints,
  addTouchOptimizations,
  initMobileOptimizations,
  measurePerformance,
  loadCriticalFonts
} from './utils/performanceOptimizer';

// Initialize all performance optimizations
const initPerformanceOptimizations = async () => {
  // Remove loading placeholder
  const placeholder = document.querySelector('.loading-placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  // Initialize critical optimizations immediately
  initCriticalResourceHints();
  addTouchOptimizations();
  initMobileOptimizations();
  measurePerformance();
  
  // Load fonts and images after initial render
  requestIdleCallback(() => {
    loadCriticalFonts().catch(() => {});
    initImagePreloading();
  });
};

// Start performance optimizations
initPerformanceOptimizations();

createRoot(document.getElementById("root")!).render(<App />);

import { Component } from 'react';
import type { ReactNode } from 'react';

const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

function reportError(message: string, stack?: string) {
  if (!BASE) return;
  try {
    navigator.sendBeacon(`${BASE}/errorLog`, JSON.stringify({
      message,
      stack: stack || '',
      url: location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }));
  } catch {}
}

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    reportError(error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔧</div>
            <h2 className="text-lg font-bold text-white mb-2">页面出错了</h2>
            <p className="text-sm text-slate-400 mb-4">请刷新页面重试</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 全局 JS 错误上报
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    reportError(
      event.message || 'Unknown error',
      event.error?.stack || '',
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(
      `Unhandled Promise: ${String(event.reason)}`,
      '',
    );
  });
}

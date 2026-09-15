import type { FC } from 'react';
import { Link } from 'react-router-dom';

const Home: FC = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

      <main className="z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-surface-800/50 border border-slate-200 dark:border-surface-700 backdrop-blur-md mb-8 animate-fade-in shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary-500"></span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Mini SaaS 1.0 is live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 animate-slide-up">
          Collaboration <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
            Reimagined.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
          The all-in-one workspace that combines the best of Notion, Trello, and Slack into one unified, lightning-fast platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link
            to="/register"
            className="px-8 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-all shadow-glow hover:shadow-primary-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-xl bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-surface-700 hover:border-slate-300 dark:hover:border-surface-600 transition-all hover:bg-slate-50 dark:hover:bg-surface-850"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;

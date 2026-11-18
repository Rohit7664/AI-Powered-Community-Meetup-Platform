import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">InterestHub</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
              "Find Your People. Share Your Passion. Make Real Connections."
              The AI-powered social networking platform that automatically discovers like-minded communities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Built with React</span>
              <span>•</span>
              <span>Node.js</span>
              <span>•</span>
              <span>MongoDB</span>
              <span>•</span>
              <span>Sentence Transformers AI</span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/explore" className="hover:text-primary-600 transition-colors">
                  All Communities
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-primary-600 transition-colors">
                  Nearby Meetups
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary-600 transition-colors">
                  AI Matching Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Technology
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>all-MiniLM-L6-v2 Embeddings</li>
              <li>Geospatial 10 km Radius</li>
              <li>BullMQ Background Workers</li>
              <li>Socket.IO Real-time Chat</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} InterestHub. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Powered by Deep Learning & Natural Language Understanding
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

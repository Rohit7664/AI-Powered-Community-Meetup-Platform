import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Cpu,
  CheckCircle,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import Button from '../components/common/Button';

const LandingPage = () => {
  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center pt-12 pb-16">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-gradient-to-tr from-primary-400/20 via-indigo-400/20 to-accent-300/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Automatic Community Matching
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Meet People Who Love{' '}
            <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 bg-clip-text text-transparent">
              What You Love.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Let AI discover people who share your interests and automatically bring you together in meaningful communities. No manual search needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base shadow-xl shadow-primary-500/25">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base">
                Explore Communities
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            Autonomous Engine
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 mb-4">
            How InterestHub Discovers Your People
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Traditional platforms make you search through thousands of groups. InterestHub uses semantic intelligence to build the group for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Express Passions',
              desc: 'Select your hobbies or simply describe your passions in natural language.',
              icon: Sparkles,
            },
            {
              step: '02',
              title: 'Vector Embeddings',
              desc: 'Sentence Transformers map your interests into 384-dimensional semantic space.',
              icon: Cpu,
            },
            {
              step: '03',
              title: 'Auto Group Formation',
              desc: 'When at least 3 compatible users exist, AI creates an exclusive group and sends invites.',
              icon: Users,
            },
            {
              step: '04',
              title: 'Real-Life Meetups',
              desc: 'Chat in real time, plan weekend activities, and meet within a 10 km local radius.',
              icon: Calendar,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.step}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className="text-4xl font-black text-slate-100 group-hover:text-primary-100 transition-colors absolute top-4 right-4">
                  {card.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Matching Architecture Featurette */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-charcoal-900 via-indigo-950 to-charcoal-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-400">
                Pure Deep Learning
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2 mb-4 leading-tight">
                No Fake Percentages. Real Semantic AI Matching.
              </h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                InterestHub calculates cosine similarity using the <code>all-MiniLM-L6-v2</code> transformer model. If you say "I love trekking mountains" and someone else says "hiking adventure trips", the system understands they are compatible even though the words are different.
              </p>

              <div className="space-y-3">
                {[
                  'Interest Similarity (50% weighting)',
                  'Geospatial 10 km Radius Compatibility (20% weighting)',
                  'Activity Style & Format (15% weighting)',
                  'Indoor vs Outdoor Preferences (15% weighting)',
                  'Automated 3-member minimum activation & 10-member capacity',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2.5 text-xs text-slate-200">
                    <CheckCircle className="w-4 h-4 text-accent-400 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula visualization card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent-300 mb-4">
                Dynamic Matching Formula
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-primary-300 font-bold">Overall Score</span> = <br />
                  <span className="text-emerald-300">InterestSim</span> × 0.50 + <br />
                  <span className="text-blue-300">LocationScore</span> × 0.20 + <br />
                  <span className="text-amber-300">ActivityScore</span> × 0.15 + <br />
                  <span className="text-rose-300">PreferenceScore</span> × 0.15
                </div>
                <div className="flex justify-between text-[11px] text-slate-300 px-1">
                  <span>Threshold: 70%</span>
                  <span>Local Radius: 10 km</span>
                  <span>BullMQ Workers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Testimonials */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Demo Experiences
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            Real Connections Made Automatically
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Rahul, Aman & Priya',
              community: 'Travel & Cricket Explorers',
              quote:
                'We never knew each other. We all registered with Cricket and Travelling interests in Delhi, and within minutes InterestHub created a group for us. Now we play every Sunday!',
              match: '94%',
            },
            {
              name: 'Ananya & Sarah',
              community: 'Photography & Creative Walkers',
              quote:
                'I wrote in my bio that I loved weekend mountain shoots. The AI matched me with 4 photographers within 8 km. The real-time chat and meetup planner made coordination effortless.',
              match: '89%',
            },
            {
              name: 'Dev Community Group',
              community: 'AI & Web Innovators',
              quote:
                'Online community matching without borders. We have members discussing Machine Learning models and building startup projects together.',
              match: '96%',
            },
          ].map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
                  {t.match} Match
                </span>
                <span className="text-xs text-slate-400 font-medium">{t.community}</span>
              </div>
              <p className="text-xs text-slate-600 italic mb-4 leading-relaxed">"{t.quote}"</p>
              <p className="text-xs font-bold text-slate-800">{t.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Calendar, BarChart2, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { getLatestPrices, getDashboardSummary } from '@/api/public';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { COMMODITY_EMOJIS } from '@/utils/constants';
import { formatPriceShort } from '@/utils/formatters';
import { StatCard } from '@/components/ui/StatCard';

const features = [
  { icon: TrendingUp, title: 'Live Price Intelligence', desc: 'Track commodity prices updated by verified field agents across Accra, Kumasi, Tamale, Takoradi, and Cape Coast.', color: 'text-primary' },
  { icon: Calendar, title: 'Seasonal Buying Guide', desc: 'Know exactly which month to buy or sell each commodity based on years of historical price patterns.', color: 'text-accent' },
  { icon: BarChart2, title: 'Market Health Scores', desc: 'Every market rated A–F on data freshness, price stability, and commodity coverage.', color: 'text-primary' },
];

const HERO_IMAGES = [
  '/images/market3.jpg',
  '/images/Market2.jpg',
  '/images/istockphoto-2158596043-612x612.jpg'
];

const LandingPage: React.FC = () => {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { data: prices } = useQuery({
    queryKey: ['latest-prices-public'],
    queryFn: () => getLatestPrices().then(r => r.data?.data || r.data || []),
    staleTime: 60_000,
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardSummary().then(r => r.data?.data || r.data || {}),
  });

  const tickerItems = Array.isArray(prices) ? prices.slice(0, 10) : [];

  return (
    <div className="flex flex-col">
      <PublicNavbar />
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary min-h-screen flex items-center justify-center pt-20">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img
                src={HERO_IMAGES[heroIndex]}
                alt="Ghanaian Market"
                className="w-full h-full object-cover object-center animate-ken-burns"
              />
            </motion.div>
          </AnimatePresence>
          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0 hero-gradient-overlay z-10" />
          {/* Bottom Fade */}
          <div className="hero-bottom-fade" />
        </div>

        <div className="container relative z-30 mx-auto max-w-4xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl font-bold tracking-tight text-primary-foreground md:text-7xl text-shadow-ghana leading-tight"
          >
            Ghana's Commodity <br className="hidden md:block" /> Markets, Decoded.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-xl text-primary-foreground font-medium text-shadow-ghana leading-relaxed opacity-95"
          >
            Real-time price intelligence across 5 cities, 10 markets, and 6 essential commodities — powering smarter decisions for traders, consumers, and policymakers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/dashboard" className="w-full sm:w-auto rounded-xl bg-accent px-10 py-4 text-lg font-bold text-accent-foreground shadow-2xl hover:scale-105 transition-all active:scale-95">
              Explore Prices
            </Link>
            <Link to="/login" className="w-full sm:w-auto rounded-xl border-2 border-primary-foreground/40 px-10 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition backdrop-blur-sm">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ticker */}
      {tickerItems.length > 0 && (
        <div className="overflow-hidden border-b border-border bg-card py-3">
          <div className="ticker-animate flex whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item: any, i: number) => (
              <span key={i} className="mx-6 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <span>{COMMODITY_EMOJIS[item.commodity] || '📦'}</span>
                <span className="font-semibold">{item.commodity}</span>
                <span className="font-mono text-primary">{formatPriceShort(item.avgPrice || item.price)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Strip */}
      <section className="bg-primary py-10">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {[
            { title: 'Commodities Tracked', value: summary?.totalCommodities || 6 },
            { title: 'Active Markets', value: summary?.activeMarkets || 10 },
            { title: 'Cities', value: summary?.citiesCoverage || summary?.totalCities || 5 },
            { title: 'Price Records', value: summary?.totalRecords || 1200 },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-mono text-3xl font-bold text-primary-foreground">{stat.value.toLocaleString()}+</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <h2 className="heading-accent font-display text-2xl font-bold text-foreground text-center mx-auto w-fit">Why CommodityGH?</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-ghana p-6"
              >
                <f.icon className={`h-10 w-10 ${f.color}`} />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview CTA */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-accent font-display text-2xl font-bold text-foreground mx-auto w-fit">Live Market Snapshot</h2>
          <p className="mt-4 text-muted-foreground">Full city breakdown, historical trends, and export tools available with a free account.</p>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-bold text-accent-foreground shadow hover:opacity-90 transition">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

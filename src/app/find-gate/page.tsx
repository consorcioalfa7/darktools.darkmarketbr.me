'use client';

import { useState, useEffect } from 'react';
import { Lock, Clock, Zap, ChevronRight, Home, Shield, Database, Search } from 'lucide-react';
import Link from 'next/link';

interface Particle {
  left: number;
  top: number;
  duration: number;
  delay: number;
}

function generateParticles(): Particle[] {
  // Don't generate on server to avoid hydration mismatch
  if (typeof window === 'undefined') return [];

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 10 : 20;
  const particles: Particle[] = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10
    });
  }
  return particles;
}

export default function FindGatePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles] = useState<Particle[]>(() => generateParticles());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridMove 30s linear infinite'
        }}></div>

        {/* Diagonal Lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(139, 0, 0, 0.03) 15px, rgba(139, 0, 0, 0.03) 30px)',
          animation: 'diagonalMove 40s linear infinite'
        }}></div>

        {/* Particles */}
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full opacity-50"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `particleMove ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`
              }}
            ></div>
          ))}
        </div>

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mouse Follower Glow - Hidden on mobile */}
      <div
        className="fixed pointer-events-none w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-300 md:block hidden"
        style={{
          background: 'radial-gradient(circle, rgba(139, 0, 0, 0.6) 0%, transparent 70%)',
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      ></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-red-400 transition-colors" />
              <span className="text-gray-400 group-hover:text-red-400 transition-colors text-sm">Início</span>
            </Link>
            <div className="flex items-center gap-3">
              <img
                src="/darktools-logo.png"
                alt="DarkToolsLabs"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl"
              />
              <div className="text-right">
                <h1 className="text-lg sm:text-xl font-bold text-white">DarkToolsLabs</h1>
                <p className="text-xs text-gray-500">Laboratório Experimental</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 py-6 sm:py-10 max-w-7xl mx-auto">
          {/* Coming Soon Section */}
          <div className="min-h-[60vh] sm:min-h-[70vh] flex flex-col items-center justify-center text-center px-2 sm:px-0">
            {/* Icon */}
            <div className="relative mb-8 sm:mb-12">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto">
                {/* Animated Rings */}
                <div className="absolute inset-0 rounded-full border-4 border-red-600/30 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-4 border-red-600/40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-4 rounded-full border-4 border-red-600/50 animate-ping" style={{ animationDelay: '1s' }}></div>
                
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30">
                    <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-4 sm:mb-6"
              style={{
                fontFamily: 'Arial Black, Impact, sans-serif',
                background: 'linear-gradient(180deg, #8b0000 0%, #5a0000 50%, #3d0000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: `
                  0 0 8px rgba(139, 0, 0, 0.4),
                  0 0 16px rgba(139, 0, 0, 0.3),
                  2px 2px 3px rgba(0,0,0,0.9),
                  4px 4px 6px rgba(0,0,0,0.7)
                `,
                letterSpacing: '0.08em',
              }}
            >
              EM BREVE
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-400 mb-6 sm:mb-8">
              FIND GATE
            </p>

            {/* Description */}
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
              Sistema de varredura e análise de dados com detecção avançada de padrões e filtragem inteligente. 
              Em desenvolvimento pela equipe DarkToolsLabs.
            </p>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12">
              <div className="p-4 sm:p-6 rounded-xl bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Em Desenvolvimento</p>
              </div>
              <div className="p-4 sm:p-6 rounded-xl bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-gray-400">Alta Performance</p>
              </div>
              <div className="p-4 sm:p-6 rounded-xl bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Seguro & Privado</p>
              </div>
            </div>

            {/* Features Preview */}
            <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Funcionalidades Planejadas</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Database className="w-4 h-4 text-red-500" />
                  <span>Varredura Avançada</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Search className="w-4 h-4 text-red-500" />
                  <span>Filtragem Inteligente</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span>Análise de Padrões</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span>Exportação de Dados</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 sm:px-8 min-h-[44px] py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-900 sm:hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Voltar ao Início
            </Link>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes diagonalMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes particleMove {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

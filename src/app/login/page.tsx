'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, Zap, AlertCircle, Loader2, Eye, EyeOff, Clock, Calendar, CalendarDays, Infinity, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PlanId, ValidateResponse } from '@/lib/types/auth';
import { PLAN_NAMES } from '@/lib/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pricingPlans: Array<{
    id: PlanId;
    name: string;
    price: string;
    duration: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
    popular?: boolean;
    url: string;
  }> = [
    {
      id: PLAN_NAMES.DAILY,
      name: 'Diário',
      price: 'R$ 50,00',
      duration: '24 horas de acesso',
      icon: <Clock className="w-5 h-5" />,
      color: 'cyan',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400',
      url: process.env.NEXT_PUBLIC_PRICE_DAILY_URL || 'https://t.me/DarkMarket_Oficial'
    },
    {
      id: PLAN_NAMES.WEEKLY,
      name: 'Semanal',
      price: 'R$ 150,00',
      duration: '7 dias de acesso',
      icon: <Calendar className="w-5 h-5" />,
      color: 'emerald',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      url: process.env.NEXT_PUBLIC_PRICE_WEEKLY_URL || 'https://t.me/DarkMarket_Oficial'
    },
    {
      id: PLAN_NAMES.MONTHLY,
      name: 'Mensal',
      price: 'R$ 295,00',
      duration: '30 dias de acesso',
      icon: <CalendarDays className="w-5 h-5" />,
      color: 'amber',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      url: process.env.NEXT_PUBLIC_PRICE_MONTHLY_URL || 'https://t.me/DarkMarket_Oficial'
    },
    {
      id: PLAN_NAMES.LIFETIME,
      name: 'Vitalício',
      price: 'R$ 990,00',
      duration: 'Acesso permanente',
      icon: <Infinity className="w-5 h-5" />,
      color: 'purple',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      popular: true,
      url: process.env.NEXT_PUBLIC_PRICE_LIFETIME_URL || 'https://t.me/DarkMarket_Oficial'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Por favor, insira o token de acesso');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.darkmarketbr.me';
      const response = await fetch(`${apiUrl}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: token.trim() }), // Enviar 'code' em vez de 'token'
      });

      const data: ValidateResponse = await response.json().catch(() => ({ valid: false }));

      if (response.ok && data.valid && data.data) {
        // Usar dados da resposta da API (campos em camelCase)
        const { code, planId, expiresAt, createdAt } = data.data;
        
        localStorage.setItem('darktools_session', code);
        localStorage.setItem('darktools_session_expiry', expiresAt);
        localStorage.setItem('darktools_session_plan', planId);
        localStorage.setItem('darktools_session_created', createdAt);
        
        router.push('/');
      } else {
        setError(data.message || 'Código inválido ou expirado');
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(220, 38, 38, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 38, 38, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-4 py-4 border-b border-gray-800/50 bg-black/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="https://files.catbox.moe/ds7uje.jpg"
                alt="DarkToolsLabs"
                className="w-10 h-10 rounded-lg object-cover border border-red-500/30"
              />
              <div>
                <span className="text-white font-bold text-lg">DarkToolsLabs</span>
                <p className="text-gray-500 text-xs">Gatekeeper</p>
              </div>
            </Link>
            <a
              href="https://t.me/DarkMarket_Oficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 text-gray-300 hover:text-white transition-all text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Suporte
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Video & Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-3" style={{
                    fontFamily: 'Arial Black, Impact, sans-serif',
                  }}>
                    Acesso <span className="text-red-500">Premium</span>
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    Desbloqueie todas as ferramentas profissionais da suite DarkToolsLabs. 
                    Validação avançada, análise de dados e muito mais.
                  </p>
                </div>

                {/* Video Embed */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-gray-800/50 shadow-2xl">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/TzGrRvXtDSM?si=bbkAxKYgkAiRSMzo"
                    title="DarkToolsLabs Apresentação"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Features List */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'CHK AMEX V1.03',
                    'CHK CARDS V1.03',
                    'CC-GEN Generator',
                    'DARK GG FACTORY',
                    'DATABASE Completa',
                    'FIND GATE (Em breve)'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-gray-800/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-gray-300 text-xs sm:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Login & Pricing */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Login Card */}
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 sm:p-8 relative overflow-hidden">
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/40 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/40 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/40 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/40 rounded-br-2xl" />

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 mb-4 shadow-lg shadow-red-500/20">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Área Restrita</h2>
                    <p className="text-gray-400 text-sm">Insira seu token de acesso para continuar</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                        Token de Acesso
                      </label>
                      <div className="relative">
                        <input
                          type={showToken ? 'text' : 'password'}
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Cole seu token aqui..."
                          className="w-full px-4 py-3.5 bg-black/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm font-mono"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                        >
                          {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !token.trim()}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Validar Acesso</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 pt-5 border-t border-gray-800/50 flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-red-400" />
                      <span>Acesso Instantâneo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-red-400" />
                      <span>Conexão Segura</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 text-center">Planos de Acesso</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {pricingPlans.map((plan, index) => (
                      <motion.a
                        key={plan.id}
                        href={plan.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`relative p-4 rounded-xl border ${plan.borderColor} ${plan.bgColor} backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg overflow-hidden ${plan.popular ? 'ring-2 ring-purple-500/30' : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        {plan.popular && (
                          <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            POPULAR
                          </div>
                        )}
                        
                        <div className={`w-9 h-9 rounded-lg ${plan.bgColor} flex items-center justify-center mb-3 ${plan.textColor}`}>
                          {plan.icon}
                        </div>
                        
                        <h4 className="font-bold text-white text-sm mb-1">{plan.name}</h4>
                        
                        <div className="mb-2">
                          <span className={`text-xl font-black ${plan.textColor}`}>{plan.price}</span>
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-3">{plan.duration}</p>
                        
                        <div className={`py-2 px-3 rounded-lg text-center text-xs font-bold bg-gray-800/60 hover:bg-gray-700/60 transition-colors ${plan.textColor}`}>
                          Adquirir
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-4 py-6 border-t border-gray-800/50 bg-black/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              © 2026 DarkToolsLabs. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/DarkMarket_Oficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-400 transition-colors text-xs"
              >
                DarkMarket Oficial
              </a>
              <a
                href="https://t.me/darktoolslabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors text-xs"
              >
                DarkToolsLabs
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

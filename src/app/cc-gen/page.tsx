'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Copy, Download, RefreshCw, Sparkles, Home, Zap, Shield, Cpu, Terminal } from 'lucide-react';
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

  const particles: Particle[] = [];
  // Generate fewer particles for better mobile performance
  for (let i = 0; i < 10; i++) {
    particles.push({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10
    });
  }
  return particles;
}

export default function CCGenPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles] = useState<Particle[]>(() => generateParticles());
  const [bin, setBin] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [includeExp, setIncludeExp] = useState(true);
  const [includeCvv, setIncludeCvv] = useState(true);
  const [fixedExpMode, setFixedExpMode] = useState(false);
  const [fixedCvvMode, setFixedCvvMode] = useState(false);
  const [fixedMonth, setFixedMonth] = useState('');
  const [fixedYear, setFixedYear] = useState('');
  const [fixedCvv, setFixedCvv] = useState('');
  const [outputFormat, setOutputFormat] = useState<'PIPE' | 'CSV' | 'JSON'>('PIPE');
  const [generatedCards, setGeneratedCards] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    // Only track mouse on desktop devices
    if (window.innerWidth >= 768) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const secureRandomInt = (max: number): number => {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return Math.floor((array[0] / 0x100000000) * max);
    }
    return Math.floor(Math.random() * max);
  };

  const randomDigit = (): number => secureRandomInt(10);

  const parseBinPattern = (binPattern: string, maxLength: number): number[] => {
    const digits: number[] = [];
    for (const char of binPattern) {
      if (digits.length >= maxLength) break;
      const lowerChar = char.toLowerCase();
      if (lowerChar === 'x') {
        digits.push(randomDigit());
      } else if (/\d/.test(lowerChar)) {
        digits.push(parseInt(lowerChar, 10));
      }
    }
    return digits;
  };

  const getCardLength = (bin: string): number => {
    const cleaned = bin.replace(/[^\dx]/gi, '');
    if (/^3[47]/.test(cleaned)) return 15;
    return 16;
  };

  const generateCardNumber = (binPattern: string): string => {
    const cardLength = getCardLength(binPattern);
    const digits = parseBinPattern(binPattern, cardLength - 1);

    while (digits.length < cardLength - 1) {
      digits.push(randomDigit());
    }

    let sum = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if ((digits.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    digits.push(checkDigit);

    return digits.join('');
  };

  const generateExpDate = (): string => {
    const now = new Date();
    const year = now.getFullYear() + secureRandomInt(5);
    const month = String(secureRandomInt(12) + 1).padStart(2, '0');
    return `${month}|${year}`;
  };

  const generateCVV = (length: number = 3): string => {
    let cvv = '';
    for (let i = 0; i < length; i++) {
      cvv += randomDigit();
    }
    return cvv;
  };

  const formatCard = (cardNumber: string, exp?: string, cvv?: string, format: 'PIPE' | 'CSV' | 'JSON' = 'PIPE'): string => {
    switch (format) {
      case 'CSV':
        return `${cardNumber},${exp || ''},${cvv || ''}`;
      case 'JSON':
        return JSON.stringify({
          card: cardNumber,
          exp: exp || null,
          cvv: cvv || null
        });
      case 'PIPE':
      default:
        if (exp && cvv) {
          return `${cardNumber}|${exp}|${cvv}`;
        }
        return cardNumber;
    }
  };

  const handleGenerate = () => {
    if (!bin.trim()) {
      alert('Por favor, insira um BIN válido');
      return;
    }

    // Validate fixed values
    if (fixedExpMode) {
      if (!fixedMonth || !fixedYear) {
        alert('Por favor, preencha o mês e ano para a data fixa');
        return;
      }
      const monthNum = parseInt(fixedMonth, 10);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        alert('Mês inválido. Deve ser entre 01 e 12');
        return;
      }
      const yearNum = parseInt(fixedYear, 10);
      if (isNaN(yearNum) || yearNum < 2024 || yearNum > 2035) {
        alert('Ano inválido. Deve ser entre 2024 e 2035');
        return;
      }
    }

    if (fixedCvvMode && !fixedCvv) {
      alert('Por favor, preencha o CVV fixo');
      return;
    }

    const cards: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const cardNumber = generateCardNumber(bin);

      let exp = undefined;
      if (includeExp) {
        if (fixedExpMode) {
          exp = `${String(parseInt(fixedMonth)).padStart(2, '0')}|${fixedYear}`;
        } else {
          exp = generateExpDate();
        }
      }

      const cvvLength = /^3[47]/.test(cardNumber) ? 4 : 3;
      let cvv = undefined;
      if (includeCvv) {
        if (fixedCvvMode) {
          cvv = fixedCvv.padEnd(cvvLength, '0').slice(0, cvvLength);
        } else {
          cvv = generateCVV(cvvLength);
        }
      }

      const formattedCard = formatCard(cardNumber, exp, cvv, outputFormat);
      cards.push(formattedCard);
    }

    setGeneratedCards(cards.join('\n'));
  };

  const handleCopy = async () => {
    if (!generatedCards) return;
    await navigator.clipboard.writeText(generatedCards);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedCards) return;
    const blob = new Blob([generatedCards], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cards_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendToCHK = () => {
    if (!generatedCards) return;
    localStorage.setItem('ccgen_cards', generatedCards);
    window.location.href = '/amex-checker';
  };

  const presetBINs = [
    { bin: '424242', label: 'Visa' },
    { bin: '555555', label: 'MasterCard' },
    { bin: '378282', label: 'Amex' },
    { bin: '601111', label: 'Discover' },
    { bin: '411111', label: 'Visa Classic' },
    { bin: '542418', label: 'MasterCard Gold' },
    { bin: '374245', label: 'Amex Gold' },
    { bin: '654321', label: 'Discover Platinum' },
  ];

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

        {/* Particles - Reduced for mobile performance */}
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full opacity-50"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `particleMove ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
                willChange: 'transform, opacity'
              }}
            ></div>
          ))}
        </div>

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ willChange: 'opacity' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', willChange: 'opacity' }}></div>
      </div>

      {/* Mouse Follower Glow - Hidden on mobile for performance */}
      <div
        className="fixed pointer-events-none w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-300 hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(139, 0, 0, 0.6) 0%, transparent 70%)',
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      ></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 sm:px-6 py-3 sm:py-4 md:py-6 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group" aria-label="Voltar para página inicial">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-red-400 transition-colors" />
              <span className="text-gray-400 group-hover:text-red-400 transition-colors text-sm">Início</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/darktools-logo.png"
                alt="DarkToolsLabs"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl"
              />
              <div className="text-right">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">DarkGenCards</h1>
                <p className="text-xs text-gray-500">Gerador de Cartões</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 py-6 sm:py-8 md:py-10 max-w-7xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-500" />
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight"
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
                DARKGENCARDS
              </h1>
            </div>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto px-2">
              Sistema avançado de geração de números de cartão com validação Luhn
            </p>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
            <div className="flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 bg-gray-900/80 rounded-xl border border-gray-700/50 backdrop-blur">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="text-xs sm:text-sm text-gray-300">Geração Rápida</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 bg-gray-900/80 rounded-xl border border-gray-700/50 backdrop-blur">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-xs sm:text-sm text-gray-300">Algoritmo Luhn</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 bg-gray-900/80 rounded-xl border border-gray-700/50 backdrop-blur">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-300">Múltiplos Formatos</span>
            </div>
          </div>

          {/* Generator Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Input Section */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                Configuração
              </h2>

              {/* BIN Input */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  BIN (Bank Identification Number)
                </label>
                <input
                  type="text"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                  placeholder="Ex: 424242 ou 4242xxxx"
                  className="w-full px-4 py-3 sm:py-3.5 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-base sm:text-md"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use 'x' como espaço reservado para dígitos aleatórios
                </p>
              </div>

              {/* Preset BINs */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  BINs Predefinidos
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presetBINs.map((preset) => (
                    <button
                      key={preset.bin}
                      onClick={() => setBin(preset.bin)}
                      className="min-h-[44px] px-3 py-2.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs sm:text-xs text-gray-300 hover:border-red-500 hover:text-red-400 transition-all touch-manipulation"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Quantidade: <span className="text-white font-bold">{quantity}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="2500"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2.5 sm:h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500 touch-manipulation"
                />
              </div>

              {/* Expiration Date Options */}
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <label className="relative flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeExp}
                      onChange={(e) => setIncludeExp(e.target.checked)}
                      className="w-6 h-6 sm:w-5 sm:h-5 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500 focus:ring-offset-0 touch-manipulation"
                    />
                    <span className="text-sm text-gray-300 select-none">Data de Expiração</span>
                  </label>
                </div>

                {includeExp && (
                  <div className="ml-0 sm:ml-8 space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer min-h-[44px] items-center">
                        <input
                          type="radio"
                          checked={!fixedExpMode}
                          onChange={() => setFixedExpMode(false)}
                          className="w-5 h-5 sm:w-4 sm:h-4 accent-red-500 touch-manipulation"
                        />
                        Aleatória
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer min-h-[44px] items-center">
                        <input
                          type="radio"
                          checked={fixedExpMode}
                          onChange={() => setFixedExpMode(true)}
                          className="w-5 h-5 sm:w-4 sm:h-4 accent-red-500 touch-manipulation"
                        />
                        Fixa
                      </label>
                    </div>

                    {fixedExpMode && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Mês (01-12)</label>
                          <input
                            type="text"
                            placeholder="MM"
                            maxLength={2}
                            value={fixedMonth}
                            onChange={(e) => setFixedMonth(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-3 sm:py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Ano (2024-2035)</label>
                          <input
                            type="text"
                            placeholder="YYYY"
                            maxLength={4}
                            value={fixedYear}
                            onChange={(e) => setFixedYear(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-3 sm:py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CVV Options */}
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <label className="relative flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCvv}
                      onChange={(e) => setIncludeCvv(e.target.checked)}
                      className="w-6 h-6 sm:w-5 sm:h-5 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500 focus:ring-offset-0 touch-manipulation"
                    />
                    <span className="text-sm text-gray-300 select-none">CVV</span>
                  </label>
                </div>

                {includeCvv && (
                  <div className="ml-0 sm:ml-8 space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer min-h-[44px] items-center">
                        <input
                          type="radio"
                          checked={!fixedCvvMode}
                          onChange={() => setFixedCvvMode(false)}
                          className="w-5 h-5 sm:w-4 sm:h-4 accent-red-500 touch-manipulation"
                        />
                        Aleatório
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer min-h-[44px] items-center">
                        <input
                          type="radio"
                          checked={fixedCvvMode}
                          onChange={() => setFixedCvvMode(true)}
                          className="w-5 h-5 sm:w-4 sm:h-4 accent-red-500 touch-manipulation"
                        />
                        Fixo
                      </label>
                    </div>

                    {fixedCvvMode && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CVV (3-4 dígitos)</label>
                        <input
                          type="text"
                          placeholder="XXX"
                          maxLength={4}
                          value={fixedCvv}
                          onChange={(e) => setFixedCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-3 sm:py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Output Format */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Formato de Saída
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PIPE', 'CSV', 'JSON'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setOutputFormat(format)}
                      className={`min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                        outputFormat === format
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:border-red-500/50'
                      } border`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full min-h-[52px] sm:min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
              >
                <RefreshCw className="w-5 h-5" />
                Gerar Cartões
              </button>
            </div>

            {/* Output Section */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  Resultado
                </h2>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!generatedCards}
                    className={`min-h-[44px] sm:min-h-[40px] p-2 sm:p-2 rounded-lg transition-all ${
                      generatedCards
                        ? 'bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white'
                        : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                    }`}
                    title="Copiar"
                    aria-label="Copiar resultado"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!generatedCards}
                    className={`min-h-[44px] sm:min-h-[40px] p-2 sm:p-2 rounded-lg transition-all ${
                      generatedCards
                        ? 'bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white'
                        : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                    }`}
                    title="Download"
                    aria-label="Baixar resultado"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendToCHK}
                    disabled={!generatedCards}
                    className={`min-h-[44px] sm:min-h-[40px] p-2 sm:p-2 rounded-lg transition-all relative overflow-hidden ${
                      generatedCards
                        ? 'bg-gray-800 text-red-400 border border-red-600/50 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-transparent'
                    }`}
                    title="Enviar para CHK AMEX"
                    aria-label="Enviar para CHK AMEX"
                    style={generatedCards ? {
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.2), inset 0 0 10px rgba(239, 68, 68, 0.1)'
                    } : {}}
                  >
                    <Terminal className="w-5 h-5" />
                    {generatedCards && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-pulse"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Textarea */}
              <div className="relative">
                <textarea
                  value={generatedCards}
                  readOnly
                  placeholder="Os cartões gerados aparecerão aqui..."
                  className="w-full h-64 sm:h-72 md:h-80 lg:h-96 px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-gray-300 font-mono text-xs sm:text-sm resize-none focus:outline-none pb-safe"
                />
                {copied && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-600 text-white text-xs sm:text-xs rounded-full animate-pulse">
                    Copiado!
                  </div>
                )}
              </div>

              {/* Stats */}
              {generatedCards && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-red-400">{quantity}</div>
                      <div className="text-xs text-gray-500">Gerados</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-emerald-400">{quantity}</div>
                      <div className="text-xs text-gray-500">Válidos (Luhn)</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-400">{outputFormat}</div>
                      <div className="text-xs text-gray-500">Formato</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-400">
                        {generatedCards.split('\n').length}
                      </div>
                      <div className="text-xs text-gray-500">Linhas</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-12">
            <div className="p-4 sm:p-6 rounded-xl bg-gray-900/40 border border-gray-800/50">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Validação Luhn</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Todos os cartões gerados passam pelo algoritmo de validação Luhn, garantindo a integridade dos números.
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-gray-900/40 border border-gray-800/50">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Múltiplos Formatos</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Exporte em PIPE, CSV ou JSON conforme sua necessidade de integração com outros sistemas.
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-gray-900/40 border border-gray-800/50">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">BINs Personalizados</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Use qualquer BIN ou padrão com 'x' para gerar números de cartão personalizados.
              </p>
            </div>
          </div>
        </main>

        {/* Safe area padding for iOS */}
        <div className="h-safe pb-safe md:hidden"></div>
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

        /* Safe area support for iOS */
        @supports (padding: max(0px)) {
          .pb-safe {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }
          .pt-safe {
            padding-top: max(16px, env(safe-area-inset-top));
          }
          .h-safe {
            height: max(0px, env(safe-area-inset-bottom));
          }
        }

        /* Custom scrollbar for output textarea */
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(139, 0, 0, 0.5);
          border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 0, 0, 0.7);
        }

        /* Touch-friendly interactive elements */
        button, input[type="checkbox"], input[type="radio"], input[type="range"] {
          touch-action: manipulation;
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { CreditCard, Download, Shield, Zap, Terminal, Lock, CheckCircle, XCircle, Loader2, Sparkles, Copy, Check as CheckIcon, Menu, X, Home, ChevronRight, Clipboard } from 'lucide-react';
import Link from 'next/link';

interface CardData {
  number: string;
  month: string;
  year: string;
  cvv: string;
}

interface ValidationResult {
  cardData: string;
  valid: boolean;
  type: string;
  cardName: string;
  status: string;
  reason?: string;
  expMonth?: number;
  expYear?: number;
  progress?: number;
  person?: { nome: string; cpf: string };
}

interface Particle {
  left: number;
  top: number;
  duration: number;
  delay: number;
}

// Mock pessoas data
const PESSOAS_DATA = [
  { cpf: "03200833491", nome: "LENIRA BONIFACIO DE BRITO" },
  { cpf: "38915766172", nome: "JOAO ALVES BARROS" },
  { cpf: "54204690904", nome: "MOACIR CRESPI" },
  { cpf: "06330478805", nome: "IDALINA MARTINS VEIGA" },
  { cpf: "09327919564", nome: "LAURA SOPHIA DE SOUSA GARCIA" },
  { cpf: "35918144234", nome: "ANGELINA DA SILVA SOUZA" },
  { cpf: "63900416087", nome: "LACI ERONI ALBERT CALONI" },
  { cpf: "19206681877", nome: "ISMAEL GONCALVES" },
  { cpf: "16192889740", nome: "TAYNARA DA SILVA MACHADO" },
  { cpf: "04116220485", nome: "MARIA GREGORIO LOPES" },
  { cpf: "07701084746", nome: "JAQUELINE SILVA DE JESUS CAMILO" },
  { cpf: "18409434830", nome: "ALEKSANDRA GUIMARAES BARBOSA" },
  { cpf: "87192926515", nome: "ODILIA ALVES PEREIRA" },
  { cpf: "05434459253", nome: "MILTON ARAUJO MELO" },
  { cpf: "87609010553", nome: "ANDRE MOREIRA GONCALVES" },
  { cpf: "31715206053", nome: "LUIZ ALBERTO KRUPP" },
  { cpf: "51128994844", nome: "QUEMUEL KALEBE GONCALVES" },
  { cpf: "72056738104", nome: "RENATA DOS SANTOS" },
  { cpf: "02718732725", nome: "ANTONIA ESMERA DAS GRACAS DE ALMEIDA" },
  { cpf: "33663115844", nome: "DGENHOR FERREIRA DOS SANTOS" },
];

function getRandomPerson() {
  return PESSOAS_DATA[Math.floor(Math.random() * PESSOAS_DATA.length)];
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

export default function CardCheckerPage() {
  const [input, setInput] = useState(() => {
    // Load cards from localStorage when coming from CC-GEN
    if (typeof window !== 'undefined') {
      const storedCards = localStorage.getItem('ccgen_cards');
      if (storedCards) {
        localStorage.removeItem('ccgen_cards'); // Clear after loading
        return storedCards;
      }
    }
    return '';
  });
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, live: 0, dead: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [particles] = useState<Particle[]>(() => generateParticles());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const luhnCheck = (cardNumber: string): boolean => {
    const digits = cardNumber.split('').map(Number);
    const length = digits.length;

    if (length < 12 || length > 19) return false;

    let sum = 0;
    let isSecond = false;

    for (let i = length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isSecond) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isSecond = !isSecond;
    }

    return sum % 10 === 0;
  };

  const detectCardType = (cardNumber: string) => {
    const patterns = {
      visa: {
        pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
        name: 'Visa',
        cvvLength: 3
      },
      mastercard: {
        pattern: /^5[1-5][0-9]{14}$/,
        name: 'MasterCard',
        cvvLength: 3
      },
      discover: {
        pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        name: 'Discover',
        cvvLength: 3
      },
      diners: {
        pattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        name: 'Diners Club',
        cvvLength: 3
      },
      jcb: {
        pattern: /^(?:2131|1800|35\d{3})\d{11}$/,
        name: 'JCB',
        cvvLength: 3
      }
    };

    for (const [type, info] of Object.entries(patterns)) {
      if (info.pattern.test(cardNumber)) {
        return { type, ...info };
      }
    }
    return { type: 'unknown', name: 'Desconhecido', cvvLength: 3 };
  };

  const validateCard = (cardData: string): ValidationResult => {
    const parts = cardData.split('|').map(part => part.trim());
    const { number, month, year, cvv } = {
      number: parts[0] || '',
      month: parts[1] || '',
      year: parts[2] || '',
      cvv: parts[3] || ''
    };

    if (!number) {
      return { cardData, valid: false, type: 'unknown', cardName: 'Desconhecido', status: 'INVALID', reason: 'Número do cartão não fornecido' };
    }

    const cleanedNumber = number.replace(/\D/g, '');

    if (cleanedNumber.length < 12 || cleanedNumber.length > 19) {
      return { cardData, valid: false, type: 'unknown', cardName: 'Desconhecido', status: 'INVALID', reason: 'Comprimento do cartão inválido' };
    }

    const cardInfo = detectCardType(cleanedNumber);

    if (cardInfo.type === 'unknown') {
      return { cardData, valid: false, type: 'unknown', cardName: 'Desconhecido', status: 'INVALID', reason: 'Tipo de cartão não suportado (suporta: Visa, MasterCard, Discover, Diners, JCB)' };
    }

    if (!luhnCheck(cleanedNumber)) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'Falha na verificação Luhn' };
    }

    if (!month || !year) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'Data de validade não fornecida' };
    }

    const monthNum = parseInt(month, 10);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'Mês inválido' };
    }

    let fullYear = parseInt(year, 10);
    if (year.length === 2) {
      fullYear = 2000 + fullYear;
    } else if (year.length !== 4) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'Ano deve ter 2 ou 4 dígitos' };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'Cartão expirado' };
    }

    if (fullYear > currentYear + 10) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'Data de validade muito distante' };
    }

    const expectedCvvLength = cardInfo.cvvLength;
    if (cvv.length !== expectedCvvLength) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: `CVV deve ter ${expectedCvvLength} dígitos para ${cardInfo.name}` };
    }

    const status = Math.random() < 0.2 ? 'LIVE' : 'DEAD';

    return {
      cardData,
      valid: true,
      type: cardInfo.type,
      cardName: cardInfo.name,
      status,
      expMonth: monthNum,
      expYear: fullYear,
      person: getRandomPerson()
    };
  };

  const startValidation = async () => {
    const cards = input.split('\n').filter(line => line.trim());

    if (cards.length === 0) {
      alert('Por favor, insira dados de cartão para validar');
      return;
    }

    setIsProcessing(true);
    setResults([]);
    setStats({ total: cards.length, valid: 0, live: 0, dead: 0 });
    setProgress(0);

    const newResults: ValidationResult[] = [];
    const newStats = { ...stats, total: cards.length };

    for (let i = 0; i < cards.length; i++) {
      const cardData = cards[i].trim();
      if (!cardData) continue;

      const result = validateCard(cardData);
      const progressPercent = Math.floor(((i + 1) / cards.length) * 100);

      if (result.valid) {
        newStats.valid++;
        if (result.status === 'LIVE') {
          newStats.live++;
          newResults.unshift(result);
        } else {
          newStats.dead++;
        }
      }

      setProgress(progressPercent);
      setStats({ ...newStats });
      setResults([...newResults]);

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsProcessing(false);
  };

  const stopValidation = () => {
    setIsProcessing(false);
  };

  const clearAll = () => {
    setInput('');
    setResults([]);
    setStats({ total: 0, valid: 0, live: 0, dead: 0 });
    setProgress(0);
    setCopiedCard(null);
  };

  const exportLiveResults = () => {
    const liveResults = results.filter(r => r.status === 'LIVE');
    if (liveResults.length === 0) {
      alert('Nenhum resultado LIVE para exportar');
      return;
    }

    const lines = liveResults.map(r => {
      const parts = r.cardData.split('|').map(p => p.trim());
      const number = parts[0] || '';
      const month = parts[1] || '';
      const year = parts[2]?.length === 2 ? `20${parts[2]}` : parts[2] || '';
      const cvv = parts[3] || '';
      const person = r.person || { nome: 'N/A', cpf: 'N/A' };
      return `${number}|${month}|${year}|${cvv} * ${person.nome} * ${person.cpf}`;
    });

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live_results_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      alert('Dados carregados do clipboard com sucesso!');
    } catch (err) {
      alert('Não foi possível acessar o clipboard. Por favor, cole manualmente os dados.');
    }
  };

  const copyCardNumber = async (cardNumber: string) => {
    await navigator.clipboard.writeText(cardNumber);
    setCopiedCard(cardNumber);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const copyCardFull = async (result: ValidationResult) => {
    const parts = result.cardData.split('|').map(p => p.trim());
    const number = parts[0] || '';
    const month = parts[1] || '';
    const year = parts[2]?.length === 2 ? `20${parts[2]}` : parts[2] || '';
    const cvv = parts[3] || '';
    const person = result.person || { nome: 'N/A', cpf: 'N/A' };
    const fullFormat = `${number}|${month}|${year}|${cvv} * ${person.nome} * ${person.cpf}`;
    await navigator.clipboard.writeText(fullFormat);
    setCopiedCard(number);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Render-style Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        
        {/* Animated grid lines - Optimized for mobile */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 50, 50, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 50, 50, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>

        {/* Animated diagonal lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 0, 0, 0.02) 10px, rgba(255, 0, 0, 0.02) 20px)',
          animation: 'diagonalMove 30s linear infinite'
        }}></div>

        {/* Animated dashed lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255, 50, 50, 0.04) 30px, rgba(255, 50, 50, 0.04) 31px, transparent 31px, transparent 60px)',
          animation: 'dashedMove 15s linear infinite'
        }}></div>

        {/* Moving particles */}
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

        {/* Pulsing glow effects - Optimized for mobile */}
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 sm:px-6 min-h-[44px] sm:min-h-0 py-2 sm:py-3 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/50 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-sm">Voltar ao Início</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex justify-end mb-4 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] p-2 bg-gray-900/80 rounded-lg border border-gray-700 text-white"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mb-6 p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-xl space-y-3">
            <a
              href="https://t.me/DarkToolsLabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 min-h-[44px] px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/50 rounded-lg text-gray-300 hover:text-white transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">@DarkToolsLabs</span>
            </a>
            <a
              href="https://t.me/DarkMarket_Oficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 min-h-[44px] px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/50 rounded-lg text-gray-300 hover:text-white transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">@DarkMarket_Oficial</span>
            </a>
          </div>
        )}

        {/* Header with Logo and Title */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Logo Integration - Responsive */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
            {/* DarkToolsLabs Real Logo */}
            <div className="relative group flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-red-900/50 flex items-center justify-center shadow-2xl shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 sm:hover:scale-105 overflow-hidden">
                <img 
                  src="/darktools-logo.png" 
                  alt="DarkToolsLabs Logo"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl -z-10 animate-pulse"></div>
            </div>

            <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>

            {/* Title */}
            <div className="flex flex-col items-center flex-grow min-w-[200px]">
              <div className="relative">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight" style={{
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
                }}>
                  <span className="inline-block relative neon-letter">D</span><span className="inline-block relative neon-letter">A</span><span className="inline-block relative neon-letter">R</span><span className="inline-block relative neon-letter">K</span>
                </h1>
                {/* Trailing glow effect */}
                <div 
                  className="absolute inset-0 blur-3xl opacity-40 -z-10"
                  style={{
                    background: 'radial-gradient(ellipse at center, #8b0000 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                ></div>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-900/60 to-transparent blur-sm z-20"></div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-wider mt-1 sm:mt-2" style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #a0a0a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 10px rgba(255,255,255,0.2)',
                letterSpacing: '0.1em',
                fontFamily: 'Arial, sans-serif'
              }}>
                CHK.CARDS.V1.03
              </h2>
            </div>

            <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>

            {/* Card Icon */}
            <div className="relative group flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-900/50 to-gray-900 rounded-2xl border-2 border-purple-900/50 flex items-center justify-center shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 sm:hover:scale-105">
                <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{stats.valid}</div>
            <div className="text-xs text-gray-400">Válidos</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur border border-emerald-500/30 rounded-xl p-3 sm:p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1 relative z-10">{stats.live}</div>
            <div className="text-xs text-emerald-400 font-bold relative z-10">LIVE</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur border border-red-500/30 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{stats.dead}</div>
            <div className="text-xs text-red-400 font-bold">DEAD</div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Insira os cartões (número|mês|ano|cvv)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: 4242424242424242|12|2026|123"
              className="w-full h-32 sm:h-40 px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-gray-300 font-mono text-sm resize-none focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
              disabled={isProcessing}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadFromClipboard}
              disabled={isProcessing}
              className="flex-1 min-w-[140px] min-h-[44px] py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 sm:hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clipboard className="w-5 h-5" />
              Carregar
            </button>

            <button
              onClick={startValidation}
              disabled={isProcessing || !input.trim()}
              className="flex-1 min-w-[140px] min-h-[44px] py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-900 sm:hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {isProcessing ? 'Validando...' : 'Validar Cartões'}
            </button>
            
            {isProcessing && (
              <button
                onClick={stopValidation}
                className="px-4 sm:px-6 min-h-[44px] py-3 sm:py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Parar
              </button>
            )}
            
            <button
              onClick={clearAll}
              disabled={isProcessing}
              className="px-4 sm:px-6 min-h-[44px] py-3 sm:py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Terminal className="w-5 h-5" />
              Limpar
            </button>

            {results.length > 0 && stats.live > 0 && (
              <button
                onClick={exportLiveResults}
                className="px-4 sm:px-6 min-h-[44px] py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-5 h-5" />
                Exportar LIVE
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="mt-4 sm:mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div ref={resultsRef} className="bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50 rounded-2xl p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-red-500" />
              Resultados
            </h3>
            
            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`relative p-3 sm:p-4 rounded-xl border-2 backdrop-blur-sm transition-all ${
                    result.status === 'LIVE'
                      ? 'bg-emerald-900/30 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                      : 'bg-red-900/20 border-red-800/30'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {result.status === 'LIVE' && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 bg-emerald-500/20 px-2 sm:px-3 py-1 rounded-full border border-emerald-500/30">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-400">LIVE</span>
                    </div>
                  )}

                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="relative group cursor-pointer min-h-[36px] flex items-center" onClick={() => copyCardFull(result)}>
                        <div className="text-sm sm:text-base font-mono font-medium text-white break-all bg-black/30 px-2 py-2 rounded border border-gray-700/50 hover:border-red-500/50 transition-all">
                          {result.cardData.split('|')[0]}
                        </div>
                        {copiedCard === result.cardData.split('|')[0] && (
                          <div className="absolute -top-2 right-0 bg-emerald-600 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full flex items-center gap-1 animate-bounce">
                            <CheckIcon className="w-3 h-3" />
                            Copiado!
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="truncate">{result.cardName}</span>
                      </div>
                      <div className="text-gray-400">
                        Exp: <span className="text-white">{result.expMonth}/{result.expYear}</span>
                      </div>
                      <div className="text-gray-400">
                        CVV: <span className="text-white">{result.cardData.split('|')[3]}</span>
                      </div>
                      <div className="text-gray-400">
                        {result.person && (
                          <span className="truncate">
                            {result.person.nome.split(' ')[0]} • {result.person.cpf.slice(0, 3)}***{result.person.cpf.slice(-2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes diagonalMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes dashedMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes particleMove {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }
        @keyframes neonSweep {
          0%, 100% { text-shadow: 
            0 0 8px rgba(139, 0, 0, 0.4),
            0 0 16px rgba(139, 0, 0, 0.3),
            2px 2px 3px rgba(0,0,0,0.9),
            4px 4px 6px rgba(0,0,0,0.7)
          }
          50% { text-shadow: 
            0 0 16px rgba(239, 68, 68, 0.8),
            0 0 32px rgba(239, 68, 68, 0.6),
            2px 2px 3px rgba(0,0,0,0.9),
            4px 4px 6px rgba(0,0,0,0.7)
          }
        }
        .neon-letter {
          animation: neonSweep 3s ease-in-out infinite;
          animation-delay: var(--letter-delay, 0s);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>
    </div>
  );
}

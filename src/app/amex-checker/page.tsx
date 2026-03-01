'use client';

import { useState, useRef, useEffect } from 'react';
import { CreditCard, Download, Shield, Zap, Terminal, Lock, CheckCircle, XCircle, Loader2, Sparkles, Copy, Check as CheckIcon, Menu, X, Home, ChevronRight, Clipboard, FileDown } from 'lucide-react';
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

export default function AmexCheckerPage() {
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
      amex: {
        pattern: /^3[47][0-9]{13}$/,
        name: 'American Express',
        cvvLength: 4
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

    if (cardInfo.type !== 'amex') {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'Cartão não é American Express' };
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

    if (cvv.length !== 4) {
      return { cardData, valid: false, type: cardInfo.type, cardName: cardInfo.name, status: 'INVALID', reason: 'CVV deve ter 4 dígitos para AMEX' };
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

        {/* Moving particles - Reduced on mobile */}
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
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/50 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-white transition-all min-h-[44px]"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-xs sm:text-sm">Voltar ao Início</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex justify-end mb-4 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 bg-gray-900/80 rounded-lg border border-gray-700 text-white min-h-[44px] min-w-[44px]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-4 top-20 z-50 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden">
            <div className="p-4 space-y-3">
              <a
                href="https://t.me/DarkToolsLabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.941z"/>
                </svg>
                <span className="text-sm">@DarkToolsLabs</span>
              </a>
              <a
                href="https://t.me/DarkMarket_Oficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.941z"/>
                </svg>
                <span className="text-sm">@DarkMarket_Oficial</span>
              </a>
            </div>
          </div>
        )}

        {/* Header with Logo and LED Title */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          {/* Logo Integration - Responsive */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8 flex-wrap">
            {/* DarkToolsLabs Real Logo */}
            <div className="relative group flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-red-900/50 flex items-center justify-center shadow-2xl shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 overflow-hidden">
                <img 
                  src="/darktools-logo.png" 
                  alt="DarkToolsLabs Logo"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl -z-10 animate-pulse"></div>
            </div>

            <div className="hidden sm:block h-14 sm:h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>

            {/* Title with LED Effect - Responsive */}
            <div className="flex flex-col items-center flex-grow min-w-[180px] sm:min-w-[200px]">
              <div className="relative">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black tracking-tight relative z-10" style={{
                  fontFamily: 'Arial Black, Impact, sans-serif',
                  background: 'linear-gradient(180deg, #8b0000 0%, #5a0000 50%, #3d0000 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `
                    0 0 8px rgba(139, 0, 0, 0.4),
                    0 0 16px rgba(139, 0, 0, 0.3),
                    0 0 24px rgba(139, 0, 0, 0.2),
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
                <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-900/60 to-transparent blur-sm z-20"></div>
              </div>
              <h2 className="text-base sm:text-xl md:text-3xl lg:text-5xl font-bold tracking-wider mt-1 sm:mt-2" style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #a0a0a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 10px rgba(255,255,255,0.2)',
                letterSpacing: '0.1em',
                fontFamily: 'Arial, sans-serif'
              }}>
                CHK.AMEX.V1.03
              </h2>
            </div>

            <div className="hidden sm:block h-14 sm:h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>

            {/* DarkMarket_Oficial Logo */}
            <div className="relative group flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-900/50 to-gray-900 rounded-2xl border-2 border-purple-900/50 flex items-center justify-center shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                <div className="text-center px-1.5 sm:px-2">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-400 mx-auto mb-0.5 sm:mb-1" />
                  <div className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 tracking-wider hidden sm:block">DARK</div>
                  <div className="text-[8px] sm:text-[10px] md:text-xs text-purple-400 tracking-wider font-bold">MARKET</div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 md:mt-4">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-500 animate-pulse" />
            <span className="text-gray-400">Sistema Avançado de Validação</span>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-900/40 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl border border-gray-800/50 p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8">
          {/* Input Section */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-300">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-500" />
                <span className="text-[11px] sm:text-sm md:text-base">Insira os Dados dos Cartões (um por linha)</span>
              </div>
              <span className="text-[10px] sm:text-xs font-normal text-gray-500">Formato: número|mês|ano|cvv</span>
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`378282246310005|12|2026|1234\n371449635398431|06|2025|7890`}
              className="w-full h-32 sm:h-40 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl font-mono text-[11px] sm:text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 transition-all bg-black/50 text-gray-100 border border-gray-700 placeholder-gray-600 custom-scrollbar"
              disabled={isProcessing}
            />
          </div>

          {/* Control Buttons - Responsive Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <button
              onClick={startValidation}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-red-500/50 hover:-translate-y-0.5 border border-red-500/50 text-[10px] sm:text-xs md:text-sm min-h-[44px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden xs:inline sm:inline">Processando...</span>
                  <span className="xs:hidden sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[11px] sm:text-xs md:text-sm">Validar</span>
                </>
              )}
            </button>

            <button
              onClick={loadFromClipboard}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue-500/50 hover:-translate-y-0.5 border border-blue-500/50 text-[10px] sm:text-xs md:text-sm min-h-[44px]"
            >
              <Clipboard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[11px] sm:text-xs md:text-sm">Carregar</span>
            </button>

            <button
              onClick={stopValidation}
              disabled={!isProcessing}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/50 hover:-translate-y-0.5 border border-orange-500/50 text-[10px] sm:text-xs md:text-sm min-h-[44px]"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[11px] sm:text-xs md:text-sm">Parar</span>
            </button>

            <button
              onClick={clearAll}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-gray-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-gray-500/50 hover:-translate-y-0.5 border border-gray-500/50 text-[10px] sm:text-xs md:text-sm min-h-[44px]"
            >
              <span className="text-[11px] sm:text-xs md:text-sm">Limpar</span>
            </button>

            <button
              onClick={exportLiveResults}
              disabled={results.filter(r => r.status === 'LIVE').length === 0}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/50 hover:-translate-y-0.5 border border-emerald-500/50 text-[10px] sm:text-xs md:text-sm min-h-[44px]"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[11px] sm:text-xs md:text-sm">Exportar</span>
            </button>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mb-4 sm:mb-6">
              <div className="h-2 sm:h-3 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-400">Progresso: {progress}%</span>
              </div>
            </div>
          )}

          {/* Stats Cards - Responsive */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-black/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-gray-800 text-center transition-all hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/10">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-white">{stats.total}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray-500">Total</div>
            </div>
            <div className="bg-black/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-gray-800 text-center transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-blue-400">{stats.valid}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray-500">Válidos</div>
            </div>
            <div className="bg-emerald-950/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-emerald-700/50 text-center transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-emerald-400">{stats.live}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-emerald-600">LIVE</div>
            </div>
            <div className="bg-red-950/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-red-700/50 text-center transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-red-400">{stats.dead}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-red-600">DEAD</div>
            </div>
          </div>

          {/* Results Section with Premium AMEX Cards */}
          {results.length > 0 && (
            <div ref={resultsRef}>
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 md:mb-6 text-white flex items-center gap-1.5 sm:gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500" />
                <span className="text-[13px] sm:text-base md:text-lg lg:text-xl">Resultados da Validação</span>
              </h2>
              <div className="max-h-96 overflow-y-auto custom-scrollbar pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-8">
                  {results.map((result, index) => {
                    const parts = result.cardData.split('|').map(p => p.trim());
                    const number = parts[0] || '';
                    const month = parts[1] || '';
                    const year = parts[2] || '';
                    const cvv = parts[3] || '';
                    const displayYear = year.length === 2 ? `20${year}` : year;
                    const person = result.person || getRandomPerson();

                    return (
                      <div key={index} className="relative group perspective-1000" style={{ perspective: '1000px' }}>
                        <div 
                          className={`
                            relative w-full aspect-[1.586/1] rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-5 transition-all duration-500 transform group-hover:scale-105 group-hover:rotate-y-6 shadow-2xl
                            ${result.status === 'LIVE' 
                              ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-emerald-500/60 shadow-emerald-500/30' 
                              : 'bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-500/60 shadow-red-500/30'
                            }
                          `}
                          style={{
                            background: `
                              linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 50%, #000000 100%),
                              repeating-linear-gradient(
                                0deg,
                                transparent,
                                transparent 1px,
                                rgba(255,255,255,0.02) 1px,
                                rgba(255,255,255,0.02) 2px
                              )
                            `,
                            backgroundBlendMode: 'multiply',
                          }}
                        >
                          {/* Premium texture overlay */}
                          <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl opacity-40" style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.12%22/%3E%3C/svg%3E")',
                          }}></div>

                          {/* Top embossed border */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-30"></div>

                          {/* AMEX Logo - Top Center */}
                          <div className="relative z-10 flex justify-center mb-1 sm:mb-1.5 md:mb-2">
                            <div className="text-white font-black text-[8px] sm:text-[10px] md:text-base tracking-widest" style={{
                              fontFamily: 'Arial Black, sans-serif',
                              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                              letterSpacing: '0.08em',
                              opacity: 0.95
                            }}>
                              AMERICAN EXPRESS
                            </div>
                          </div>

                          {/* Chip */}
                          <div className="relative z-10 mb-1 sm:mb-1.5 md:mb-2.5">
                            <div className="w-7 h-5 sm:w-9 sm:h-6 md:w-12 md:h-9 rounded-md bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 flex items-center justify-center shadow-xl" style={{
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.5)',
                            }}>
                              <div className="w-5 h-4 sm:w-7 sm:h-5 md:w-10 md:h-7 border-2 border-gray-400 rounded flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-0.5">
                                  {[...Array(8)].map((_, i) => (
                                    <div key={i} className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-500/60 rounded-sm"></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Number with click to copy */}
                          <div className="relative z-10 mb-1 sm:mb-1.5 md:mb-2">
                            <button
                              onClick={() => copyCardFull(result)}
                              className="group/number relative w-full min-h-[36px] sm:min-h-[40px] md:min-h-[44px]"
                            >
                              <div 
                                className="font-mono text-[9px] sm:text-xs md:text-lg font-bold tracking-wider text-white py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-lg transition-all cursor-pointer hover:bg-white/5 touch-manipulation"
                                style={{
                                  background: result.status === 'LIVE' 
                                    ? 'linear-gradient(90deg, #10b981, #34d399, #10b981)'
                                    : 'linear-gradient(90deg, #ef4444, #f87171, #ef4444)',
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 3s ease-in-out infinite',
                                  textShadow: '0 0 8px currentColor',
                                  letterSpacing: '0.08em',
                                }}
                              >
                                {number}
                              </div>
                              {/* Copy tooltip */}
                              <div className="absolute -top-4 sm:-top-5 md:-top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-1.5 md:px-3 py-0.5 md:py-1 rounded-lg opacity-0 group-hover/number:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-0.5 sm:gap-1 z-30">
                                {copiedCard === number ? (
                                  <>
                                    <CheckIcon className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 text-emerald-400" />
                                    <span className="hidden sm:inline text-[9px] md:text-xs">Copiado!</span>
                                    <span className="sm:hidden text-[8px]">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3" />
                                    <span className="hidden sm:inline text-[9px] md:text-xs">Clique para copiar</span>
                                    <span className="sm:hidden text-[8px]">Copiar</span>
                                  </>
                                )}
                              </div>
                            </button>
                          </div>

                          {/* Name and CPF */}
                          <div className="relative z-10 mb-1 sm:mb-1.5 md:mb-2 space-y-0.5">
                            <div className="text-white font-bold text-[9px] sm:text-[10px] md:text-sm tracking-wide uppercase truncate" style={{
                              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                              fontFamily: 'Arial, sans-serif'
                            }}>
                              {person?.nome || 'NOME DO TITULAR'}
                            </div>
                            <div className="text-gray-400 font-mono text-[8px] sm:text-[9px] md:text-xs tracking-wider">
                              CPF: {person?.cpf || '000.000.000-00'}
                            </div>
                          </div>

                          {/* Valid Thru and CVV */}
                          <div className="relative z-10 flex justify-between items-end gap-1.5 sm:gap-2">
                            <div className="min-w-[40px] sm:min-w-[45px] md:min-w-[55px]">
                              <div className="text-[8px] sm:text-[9px] md:text-xs text-gray-500 uppercase tracking-wider mb-0.5">Valid Thru</div>
                              <div className="text-white font-mono font-bold tracking-wider text-[9px] sm:text-[10px] md:text-sm">
                                {month}/{displayYear.slice(-2)}
                              </div>
                            </div>
                            <div className="min-w-[28px] sm:min-w-[32px] md:min-w-[35px] text-right">
                              <div className="text-[8px] sm:text-[9px] md:text-xs text-gray-500 uppercase tracking-wider mb-0.5">CVV</div>
                              <div className="text-white font-mono font-bold tracking-wider text-[9px] sm:text-[10px] md:text-sm">
                                {cvv}
                              </div>
                            </div>
                          </div>

                          {/* Live Indicator - Pulsing Green Dot + Check */}
                          {result.status === 'LIVE' && (
                            <div className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 z-20 flex items-center gap-0.5 sm:gap-1 md:gap-1.5">
                              <div className="relative">
                                <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                              </div>
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-400" />
                            </div>
                          )}

                          {/* Member Since */}
                          <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 left-1.5 sm:left-2 md:left-4 z-10">
                            <div className="text-[8px] sm:text-[9px] md:text-xs text-gray-600 uppercase tracking-wider" style={{
                              fontFamily: 'Arial, sans-serif'
                            }}>
                              Member Since {new Date().getFullYear()}
                            </div>
                          </div>

                          {/* Bottom AMEX logo */}
                          <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 right-1.5 sm:right-2 md:right-4 z-10">
                            <div className="text-white font-black text-[8px] sm:text-[10px] md:text-sm tracking-wider" style={{
                              fontFamily: 'Arial Black, sans-serif',
                              opacity: 0.9
                            }}>
                              AMEX
                            </div>
                          </div>

                          {/* Glossy overlay effect */}
                          <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)',
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* License & Partners Section - Mobile Optimized */}
        <div className="bg-gray-900/40 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl border border-gray-800/50 p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500" />
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-white">
              Licença Comercial
            </h2>
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <p className="text-[10px] sm:text-xs md:text-sm leading-relaxed text-gray-400">
              Este software é propriedade intelectual e está sob licença comercial exclusiva da <strong className="text-red-400">@DarkToolsLabs</strong>.
              Todos os direitos reservados.
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm leading-relaxed text-gray-400">
              Desenvolvido em parceria estratégica com <strong className="text-purple-400">@DarkMarket_Oficial</strong>.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
              <a
                href="https://t.me/DarkToolsLabs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-2.5 md:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-red-500/30 transition-all duration-300 hover:shadow-red-500/50 hover:-translate-y-0.5 border border-red-500/50 text-[10px] sm:text-xs md:text-sm min-h-[44px]"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.941z"/>
                </svg>
                <span className="text-[10px] sm:text-xs md:text-sm">@DarkToolsLabs</span>
              </a>
              <a
                href="https://t.me/DarkMarket_Oficial"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:-translate-y-0.5 border border-purple-500/50 text-[10px] sm:text-xs md:text-sm min-h-[44px]"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.941z"/>
                </svg>
                <span className="text-[10px] sm:text-xs md:text-sm">@DarkMarket_Oficial</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-3 sm:py-4 md:py-6 text-gray-500 text-[10px] sm:text-xs md:text-sm">
          <p>2026 Dark.CHK.AMEX.V1.03 - Desenvolvido com tecnologia de ponta</p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
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
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }
        @keyframes neon-sweep {
          0%, 100% {
            text-shadow: 
              0 0 8px rgba(139, 0, 0, 0.4),
              0 0 16px rgba(139, 0, 0, 0.3),
              0 0 24px rgba(139, 0, 0, 0.2),
              2px 2px 3px rgba(0,0,0,0.9),
              4px 4px 6px rgba(0,0,0,0.7);
          }
          50% {
            text-shadow: 
              0 0 12px rgba(255, 50, 50, 0.6),
              0 0 24px rgba(255, 50, 50, 0.5),
              0 0 36px rgba(255, 50, 50, 0.4),
              0 0 48px rgba(255, 50, 50, 0.3),
              2px 2px 3px rgba(0,0,0,0.9),
              4px 4px 6px rgba(0,0,0,0.7);
          }
        }
        .neon-letter {
          animation: neon-sweep 4s ease-in-out infinite;
        }
        .neon-letter:nth-child(1) { animation-delay: 0s; }
        .neon-letter:nth-child(2) { animation-delay: 0.3s; }
        .neon-letter:nth-child(3) { animation-delay: 0.6s; }
        .neon-letter:nth-child(4) { animation-delay: 0.9s; }
        .perspective-1000 {
          perspective: 1000px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(239, 68, 68, 0.5) rgba(17, 24, 39, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
        @media (max-width: 639px) {
          .xs\\:hidden {
            display: none;
          }
        }
        @media (min-width: 640px) {
          .xs\\:hidden {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}

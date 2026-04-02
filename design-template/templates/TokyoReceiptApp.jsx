import React, { useState, useEffect, useRef } from 'react';

// --- Scroll Trigger Wrapper Component ---
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isIntersected, setIsIntersected] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  // 1. 화면에 들어왔는지 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  // 2. 화면에 들어온 후 설정된 delay만큼 기다렸다가 애니메이션 트리거 (핵심 수정 사항)
  useEffect(() => {
    if (isIntersected) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isIntersected, delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {typeof children === 'function' ? children(isVisible) : children}
    </div>
  );
};

// --- Icons & Dynamic Components ---
const DynamicBarcode = ({ isVisible = true }) => {
  // 촘촘한 실제 바코드 패턴으로 업데이트 (더 얇고 많은 바)
  const finalBars = [
    { x: 0, w: 2 }, { x: 3, w: 1 }, { x: 6, w: 1 }, { x: 10, w: 3 }, { x: 14, w: 1 }, { x: 17, w: 2 },
    { x: 21, w: 4 }, { x: 27, w: 1 }, { x: 30, w: 2 }, { x: 34, w: 1 }, { x: 37, w: 1 }, { x: 40, w: 3 },
    { x: 45, w: 1 }, { x: 48, w: 2 }, { x: 52, w: 1 }, { x: 55, w: 4 }, { x: 61, w: 1 }, { x: 64, w: 1 },
    { x: 67, w: 2 }, { x: 71, w: 1 }, { x: 74, w: 3 }, { x: 79, w: 1 }, { x: 82, w: 2 }, { x: 86, w: 1 },
    { x: 89, w: 4 }, { x: 95, w: 1 }, { x: 98, w: 1 }, { x: 101, w: 2 }, { x: 105, w: 1 }, { x: 108, w: 3 },
    { x: 113, w: 2 }, { x: 117, w: 1 }, { x: 120, w: 1 }, { x: 123, w: 4 }, { x: 129, w: 1 }, { x: 132, w: 2 },
    { x: 136, w: 1 }, { x: 139, w: 3 }, { x: 144, w: 1 }, { x: 147, w: 1 }, { x: 150, w: 2 }, { x: 154, w: 4 },
    { x: 160, w: 1 }, { x: 163, w: 2 }, { x: 167, w: 1 }, { x: 170, w: 1 }, { x: 173, w: 3 }, { x: 178, w: 1 },
    { x: 181, w: 2 }, { x: 185, w: 1 }, { x: 188, w: 4 }, { x: 194, w: 1 }, { x: 197, w: 2 }
  ];
  const [bars, setBars] = useState([]);

  useEffect(() => {
    if (!isVisible) return; // isVisible이 true가 된 순간부터 scramble 시작
    
    let interval;
    let elapsed = 0;
    const duration = 1200; // 1.2s scramble effect
    const fps = 30; // update interval

    interval = setInterval(() => {
      elapsed += fps;
      if (elapsed >= duration) {
        clearInterval(interval);
        setBars(finalBars);
      } else {
        const randomBars = [];
        let currentX = 0;
        while (currentX < 200) {
          // 스크램블 효과 중에도 더 촘촘하게 보이도록 너비(w)와 간격(gap) 축소
          const w = Math.floor(Math.random() * 4) + 1; 
          const gap = Math.floor(Math.random() * 3) + 1; 
          if (currentX + w <= 200) randomBars.push({ x: currentX, w });
          currentX += w + gap;
        }
        setBars(randomBars);
      }
    }, fps);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <svg width="100%" height="40" preserveAspectRatio="none" viewBox="0 0 200 40" fill="black" xmlns="http://www.w3.org/2000/svg">
      {bars.map((bar, i) => (
        <rect key={i} x={bar.x} y="0" width={bar.w} height="40" />
      ))}
    </svg>
  );
};

// --- 신규: 잉크로 그려진 듯한 회전 지구본 컴포넌트 ---
const SpinningGlobe = () => (
  <div className="w-8 h-8 opacity-80">
    <svg 
      viewBox="0 0 24 24" 
      className="w-full h-full text-[#111]" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeDasharray="1.5 1.5" 
      strokeLinecap="round"
    >
      {/* 고정된 외곽선 및 위도선 */}
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M3.5 8c2.5 1.5 6 2.5 8.5 2.5s6-1 8.5-2.5" />
      <path d="M3.5 16c2.5-1.5 6-2.5 8.5-2.5s6 1 8.5 2.5" />
      {/* 회전하는 경도선 */}
      <g className="globe-spin" style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' }}>
        <ellipse cx="12" cy="12" rx="4.5" ry="10" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </g>
    </svg>
  </div>
);

const FlightLine = ({ delay = 0 }) => (
  <FadeIn delay={delay}>
    {(isVisible) => (
      <div className="relative w-full h-8 my-4 overflow-hidden">
        {/* Faint background line */}
        <div className="absolute top-1/2 w-full border-t border-dashed border-gray-300"></div>
        
        {/* Animated drawing line (isVisible에 따라 클래스 부여) */}
        <div className={`absolute top-1/2 left-0 border-t-2 border-dashed border-black h-0 ${isVisible ? 'flight-line' : ''}`}></div>
        
        {/* Airplane icon flying - Enlarged & Flies off screen (110%) */}
        <div className={`absolute top-1/2 -translate-y-1/2 text-[#111] ${isVisible ? 'flight-plane' : ''}`} style={{ left: '0%' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90">
            <path d="M21,16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1 3.5,1v-1.5L13,19v-5.5L21,16z" />
          </svg>
        </div>
      </div>
    )}
  </FadeIn>
);

const App = () => {
  // --- State ---
  const [items, setItems] = useState([
    { id: 1, name: 'SHINJUKU RAMEN', category: 'FOOD', price: 3200, excluded: false, qty: 2 },
    { id: 2, name: 'UBER TO HOTEL', category: 'TRANSPORT', price: 5000, excluded: true, qty: 1 },
    { id: 3, name: 'MATCHA LATTE', category: 'CAFE', price: 1800, excluded: false, qty: 3 },
    { id: 4, name: 'DONQUIJOTE', category: 'SHOPPING', price: 14500, excluded: false, qty: 1 },
    { id: 5, name: 'TOKYO METRO 24H', category: 'TRANSPORT', price: 1600, excluded: false, qty: 2 },
    { id: 6, name: 'SUSHI ZANMAI', category: 'FOOD', price: 12500, excluded: false, qty: 1 },
    { id: 7, name: 'LAWSON SNACKS', category: 'MART', price: 850, excluded: false, qty: 1 },
    { id: 8, name: 'TOKYO TOWER TICKET', category: 'TOUR', price: 2400, excluded: true, qty: 1 },
    { id: 9, name: 'UNIQLO SHIBUYA', category: 'SHOPPING', price: 8900, excluded: false, qty: 1 }
  ]);
  const [inputValue, setInputValue] = useState('');
  const listEndRef = useRef(null);

  // --- Logic ---
  const toggleExclude = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, excluded: !item.excluded } : item));
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newItem = {
      id: Date.now(),
      name: inputValue.toUpperCase(),
      category: 'MISC',
      price: Math.floor(Math.random() * 5000) + 500,
      excluded: false,
      qty: 1
    };
    
    setItems([...items, newItem]);
    setInputValue('');
    
    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totalMembers = 3;
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const excludedTotal = items.filter(i => i.excluded).reduce((acc, item) => acc + item.price, 0);
  const calculableTotal = subtotal - excludedTotal;
  const perPerson = Math.floor(calculableTotal / totalMembers);

  return (
    <>
      {/* Import Web Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=VT323&family=Oswald:wght@500&display=swap');
        
        .font-pixel { font-family: 'VT323', monospace; }
        .font-mono-data { font-family: 'Space Mono', monospace; }
        .font-condensed { font-family: 'Oswald', sans-serif; letter-spacing: 0.05em; }
        
        .receipt-bg { background-color: #F4F4F0; }
        .receipt-text { color: #111111; }
        .receipt-accent { color: #FF4500; }
        .border-accent { border-color: #FF4500; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Animation Keyframes */
        @keyframes drawLine {
          0% { width: 0%; }
          100% { width: 110%; }
        }
        @keyframes flyPlane {
          0% { left: 0%; }
          100% { left: 110%; }
        }
        .flight-line {
          animation: drawLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .flight-plane {
          animation: flyPlane 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        /* 지구본 3D 회전 애니메이션 */
        @keyframes spinY {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .globe-spin {
          animation: spinY 4s linear infinite;
        }
      `}</style>

      {/* Background / Environment */}
      <div className="min-h-screen bg-neutral-300 flex items-center justify-center p-4 font-mono-data">
        
        {/* Mobile Device Mockup Frame */}
        <div className="w-[375px] h-[812px] bg-black rounded-[48px] shadow-2xl relative p-3 flex flex-col overflow-hidden border-gray-800 border-4">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50"></div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 bg-neutral-900 rounded-[36px] overflow-hidden flex flex-col relative">
            
            <div className="flex-1 overflow-y-auto no-scrollbar receipt-bg receipt-text relative pb-32">
              
              {/* Sticky Header Section */}
              <div className="sticky top-0 z-30 receipt-bg px-6 pt-12 pb-4">
                <FadeIn delay={100}>
                  <div className="text-center flex flex-col items-center">
                    {/* 타이틀 컨테이너에 relative inline-flex를 주어 Tokyo는 중앙정렬 유지, 지구본은 우측에 띄움 */}
                    <div className="relative inline-flex items-center mb-2">
                      <h1 className="font-pixel text-6xl tracking-widest uppercase leading-none">Tokyo</h1>
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2">
                        <SpinningGlobe />
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest border-t border-b border-black py-1 mb-1 w-full">
                      Established in Seoul - 2026
                    </p>
                    <p className="text-[9px] tracking-widest">- IN VARIETATE CONCORDIA -</p>
                  </div>
                </FadeIn>
              </div>
              
              {/* Non-sticky Header Info */}
              <div className="px-6 pb-4">
                <FlightLine delay={300} /> {/* 딜레이 재조정 */}

                <FadeIn delay={500}>
                  {(isVisible) => (
                    <div className="w-full mb-4">
                      <DynamicBarcode isVisible={isVisible} />
                    </div>
                  )}
                </FadeIn>

                <FadeIn delay={600}>
                  <div className="flex justify-between items-end pb-2 text-xs font-bold">
                    <div className="flex flex-col">
                      <span>DATE: 2026.03.15</span>
                      <span>TRIP: JP-TYO-001</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px]">MEMBERS:</span>
                      <span className="text-2xl font-pixel">{totalMembers}*</span>
                    </div>
                  </div>
                </FadeIn>
              </div>

              {/* Items Table Header */}
              <FadeIn delay={700}>
                <div className="px-6 flex justify-between font-condensed uppercase text-lg border-b border-black mx-6 pb-1 mb-4">
                  <span>Values</span>
                  <span>Amount(¥)</span>
                </div>
              </FadeIn>

              {/* Expense Items List */}
              <div className="px-6 space-y-4">
                {items.map((item, index) => (
                  <FadeIn key={item.id} delay={800 + (index * 150)}>
                    <div 
                      onClick={() => toggleExclude(item.id)}
                      className="cursor-pointer group relative"
                    >
                      {item.excluded && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-80">
                          <div className="h-[2px] w-full bg-[#FF4500] absolute"></div>
                          <span className="receipt-accent border-2 border-accent px-2 py-0.5 text-[10px] font-bold transform -rotate-12 bg-[#F4F4F0]">
                            *EXCLUDED*
                          </span>
                        </div>
                      )}

                      <div className={`flex justify-between items-start transition-opacity duration-300 ${item.excluded ? 'opacity-40 grayscale' : ''}`}>
                        <div className="flex-1">
                          <div className="flex text-sm font-bold">
                            <span className="mr-2">{item.qty}x</span>
                            <span className="font-condensed text-base tracking-wide uppercase">{item.name}</span>
                          </div>
                          <div className="text-[10px] text-gray-600 mt-0.5 flex items-center">
                            <span>{item.category}</span>
                            <span className="mx-1">•</span>
                            <span>{item.excluded ? 'Personal' : `Split 1/${totalMembers}`}</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-right ml-4">
                          {item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
                <div ref={listEndRef} />
              </div>

              {/* Footer Summary (뷰포트 진입 시 즉각적으로 나타나도록 delay 단축) */}
              <div className="mt-8 px-6">
                <FlightLine delay={100} /> 
                
                <FadeIn delay={300}>
                  <div className="space-y-1 text-xs mt-4">
                    <div className="flex justify-between">
                      <span>SUBTOTAL</span>
                      <span>{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between receipt-accent">
                      <span>EXCLUDED (PERSONAL)</span>
                      <span>-{excludedTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CALCULABLE AMOUNT</span>
                      <span>{calculableTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t-2 border-black flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="font-condensed text-xl uppercase leading-none">Total Unity Cost</span>
                      <span className="text-[9px] text-gray-500 mt-1">* PER PERSON (1/{totalMembers})</span>
                    </div>
                    <div className="text-2xl font-bold font-pixel">
                      ¥{perPerson.toLocaleString()}
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={500}>
                  <div className="mt-8 text-center border border-black p-2 bg-black text-[#F4F4F0]">
                    <p className="text-[10px] uppercase mb-1">Swipe left to exclude item</p>
                    <p className="text-[10px] uppercase">Tap to toggle personal expense</p>
                  </div>
                </FadeIn>
                
                <FadeIn delay={700}>
                  {(isVisible) => (
                    <div className="mt-6 mb-8 opacity-50">
                      <DynamicBarcode isVisible={isVisible} />
                    </div>
                  )}
                </FadeIn>
              </div>
            </div>

            {/* Bottom Fixed Input (CLI Style) */}
            <div className="absolute bottom-0 w-full bg-[#111111] border-t border-gray-800 p-4 pb-8 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <form onSubmit={handleInputSubmit} className="flex items-center">
                <span className="text-[#FF4500] mr-3 animate-pulse">_{'>'}</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g., 로손 편의점 1500엔..."
                  className="flex-1 bg-transparent text-[#F4F4F0] text-sm outline-none placeholder-gray-600 font-mono-data"
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className="ml-2 px-3 py-1 text-[10px] font-bold text-[#111] bg-[#F4F4F0] uppercase tracking-wider active:bg-[#FF4500] active:text-white transition-colors"
                >
                  Enter
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default App;

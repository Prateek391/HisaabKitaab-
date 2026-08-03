import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Expense {
  id: string;
  amount: number;
  categoryEN: string;
  categoryHI: string;
  note: string;
  date: string;
  monthEN: string; 
  monthHI: string; 
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'track' | 'account'>('home');
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(40000);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [budgetInput, setBudgetInput] = useState<string>('40000');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('hisaab_kitaab_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [inputCategoryIndex, setInputCategoryIndex] = useState<number>(0);
  const [inputNote, setInputNote] = useState<string>('');
  
  const currentMonthEN = new Date().toLocaleString('en-US', { month: 'short' }); 
  const [inputMonthEN, setInputMonthEN] = useState<string>(currentMonthEN);

  React.useEffect(() => {
    try {
      localStorage.setItem('hisaab_kitaab_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  const categoriesRegistry = [
    { en: '🛒 Groceries (Ration)', hi: '🛒 राशन (किराना)' },
    { en: '🥦 Veg & Fruits', hi: '🥦 फल और सब्जियां' },
    { en: '🥛 Milk & Dairy', hi: '🥛 दूध और डेयरी' },
    { en: '🧹 Maid & Helpers', hi: '🧹 कामवाली और हेल्पर' },
    { en: '⚡ Bills (Light/Water)', hi: '⚡ बिजली/पानी का बिल' },
    { en: '📱 Mobile & Internet', hi: '📱 मोबाइल और इंटरनेट' },
    { en: '⛽ Fuel & Travel', hi: '⛽ पेट्रोल और यात्रा' },
    { en: '💊 Health & Medicine', hi: '💊 स्वास्थ्य और दवा' },
    { en: '🍔 Food & Snacks', hi: '🍔 बाहर का खाना' },
    { en: '🛍️ Shopping', hi: '🛍️ शॉपिंग और कपड़े' },
    { en: '🎓 Education & Fees', hi: '🎓 शिक्षा और ट्यूशन' },
    { en: '🏠 Rent & Maintenance', hi: '🏠 किराया/मेंटेनेंस' },
    { en: '✨ Miscellaneous', hi: '✨ अन्य खर्चे' }
  ];

  const calendarMonthsEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const calendarMonthsHI = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  const text = {
    home: { EN: 'Home', HI: 'मुख्य' },
    track: { EN: 'Track', HI: 'ग्राफ' },
    account: { EN: 'Account', HI: 'सेटिंग' },
    balanceLeft: { EN: 'Available Balance', HI: 'बचा हुआ कुल पैसा' },
    monthlyLimit: { EN: 'Monthly Limit', HI: 'महीने की बजट लिमिट' },
    totalSpent: { EN: 'Total Spent', HI: 'कुल खर्च' },
    recentExpenses: { EN: 'Recent Expenses', HI: 'हालिया खर्चे' },
    addExpenseBtn: { EN: 'Add Expense', HI: 'नया खर्च जोड़ें' },
    updateExpenseBtn: { EN: 'Update Expense', HI: 'खर्च अपडेट करें' },
    noEntries: { EN: 'No entries logged for this month.', HI: 'इस महीने कोई खर्च नहीं जोड़ा गया।' },
    langSelectLabel: { EN: 'Select Language', HI: 'भाषा चुनें' },
    changeLimit: { EN: 'Change Limit', HI: 'लिमिट बदलें' },
    save: { EN: 'Save', HI: 'सुरक्षित करें' },
    cancel: { EN: 'Cancel', HI: 'रद्द करें' },
    amountLabel: { EN: 'Enter Amount (₹)', HI: 'रकम (₹)' },
    categoryLabel: { EN: 'Select Category', HI: 'श्रेणी चुनें' },
    monthLabel: { EN: 'Select Month', HI: 'महीना चुनें' },
    noteLabel: { EN: 'Short Note', HI: 'खर्च का विवरण' },
    premiumLabel: { EN: 'Premium Account', HI: 'प्रीमियम अकाउंट' },
    trialNotice: { EN: 'Free 30-Day Trial active. Pay ₹50/month for secure cloud backup.', HI: '30 दिनों का फ्री ट्रायल चालू है। सुरक्षित क्लाउड के लिए ₹50/महीना भुगतान करें।' },
    qrPlaceholder: { EN: 'Scan to Pay Prateek Maurya', HI: 'प्रतीक मौर्य को भुगतान करने के लिए स्कैन करें' },
    trendTitle: { EN: '12-Month Trend', HI: '12-महीने का ग्राफ' },
    trendSub: { EN: 'Tap a category below to filter the graph', HI: 'इतिहास देखने के लिए नीचे किसी श्रेणी पर टैप करें' },
    clearFilter: { EN: 'Show All', HI: 'कुल खर्च देखें' }
  };

  const homeFilteredExpenses = expenses.filter(e => e.monthEN === currentMonthEN);
  const homeTotalSpent = homeFilteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const homeMoneyLeft = monthlyBudget - homeTotalSpent;

  const getMonthlyTotalForGraph = (mthEN: string) => {
    return expenses
      .filter(item => item.monthEN === mthEN)
      .filter(item => selectedCategory === null || item.categoryEN === selectedCategory)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const graphDataPoints = calendarMonthsEN.map(m => getMonthlyTotalForGraph(m));
  const peakSpendingValue = Math.max(...graphDataPoints, 1);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAmount || Number(inputAmount) <= 0) return;
    const monthIndex = calendarMonthsEN.indexOf(inputMonthEN);
    const associatedMonthHI = calendarMonthsHI[monthIndex];

    if (editingExpenseId) {
      setExpenses(expenses.map(item => item.id === editingExpenseId ? {
        ...item,
        amount: Number(inputAmount),
        categoryEN: categoriesRegistry[inputCategoryIndex].en,
        categoryHI: categoriesRegistry[inputCategoryIndex].hi,
        note: inputNote,
        monthEN: inputMonthEN,
        monthHI: associatedMonthHI
      } : item));
      setEditingExpenseId(null);
    } else {
      const safeId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15);
        
      const newEntry: Expense = {
        id: safeId,
        amount: Number(inputAmount),
        categoryEN: categoriesRegistry[inputCategoryIndex].en,
        categoryHI: categoriesRegistry[inputCategoryIndex].hi,
        note: inputNote,
        date: new Date().toISOString().split('T')[0],
        monthEN: inputMonthEN,
        monthHI: associatedMonthHI
      };
      setExpenses([newEntry, ...expenses]);
    }
    setInputAmount('');
    setInputNote('');
    setIsFormOpen(false);
  };

  const triggerEditFlow = (item: Expense) => {
    setEditingExpenseId(item.id);
    setInputAmount(item.amount.toString());
    const catIndex = categoriesRegistry.findIndex(c => c.en === item.categoryEN);
    setInputCategoryIndex(catIndex >= 0 ? catIndex : 0);
    setInputNote(item.note);
    setInputMonthEN(item.monthEN);
    setIsFormOpen(true);
  };

  const triggerDeleteFlow = (id: string) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] flex justify-center text-slate-800 font-sans">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col justify-between relative shadow-2xl pb-24 border-x border-slate-100">
        
        <header className="bg-white px-5 py-4 sticky top-0 shadow-sm z-10 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black tracking-tight text-[#0f8181] mt-1">Hisaab Kitaab</h1>
          </div>
          <button 
            type="button"
            onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
            className="text-xs bg-[#fbfaf8] border border-slate-200 text-[#3b49a5] px-3 py-1.5 rounded-lg font-bold shadow-sm"
          >
            {language}
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto space-y-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#0f8181] to-[#3b49a5] rounded-3xl p-6 text-white shadow-lg space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-teal-100 uppercase block tracking-wider opacity-90">
                    {text.balanceLeft[language]} ({language === 'EN' ? currentMonthEN : calendarMonthsHI[calendarMonthsEN.indexOf(currentMonthEN)]})
                  </span>
                  <div className={"text-4xl font-black tracking-tight " + (homeMoneyLeft < 0 ? "text-red-300" : "")}>
                    ₹{homeMoneyLeft.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 text-sm">
                  <div>
                    <span className="text-xxs text-teal-100 block opacity-80">{text.monthlyLimit[language]}</span>
                    <span className="font-bold text-base">₹{monthlyBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-xxs text-teal-100 block opacity-80">{text.totalSpent[language]}</span>
                    <span className="font-bold text-base">₹{homeTotalSpent.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  {text.recentExpenses[language]}
                </h3>
                
                {homeFilteredExpenses.length === 0 ? (
                  <div className="bg-[#fbfaf8] border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm font-medium">
                    {text.noEntries[language]}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {homeFilteredExpenses.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl p-2.5 bg-[#fbfaf8] rounded-xl shadow-inner">
                            {item.categoryEN.split(' ')[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                              {item.note || (language === 'EN' ? item.categoryEN.split(' ').slice(1).join(' ') : item.categoryHI.split(' ').slice(1).join(' '))}
                            </h4>
                            <p className="text-xxs text-[#0f8181] font-bold">
                              {language === 'EN' ? item.monthEN : item.monthHI}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <span className="font-black text-slate-700 block">₹{item.amount}</span>
                          <div className="flex space-x-2 text-xxs font-bold">
                            <button type="button" onClick={() => triggerEditFlow(item)} className="text-[#3b49a5] hover:underline">✏️ Edit</button>
                            <button type="button" onClick={() => triggerDeleteFlow(item.id)} className="text-red-500 hover:underline">🗑️ Del</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="button"
                onClick={() => { setEditingExpenseId(null); setIsFormOpen(true); }}
                className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[#3b49a5] hover:bg-indigo-800 text-white rounded-full px-7 py-4 shadow-xl flex items-center space-x-2 border-4 border-white active:scale-95 transition-transform z-20"
              >
                <span className="text-2xl font-black leading-none">+</span>
                <span className="font-bold tracking-wide text-xs uppercase">{text.addExpenseBtn[language]}</span>
              </button>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#0f8181]">{text.trendTitle[language]}</h2>
                <p className="text-xs text-slate-400 font-medium">{text.trendSub[language]}</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#3b49a5] bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                    {selectedCategory 
                      ? (language === 'EN' ? selectedCategory : categoriesRegistry.find(c => c.en === selectedCategory)?.hi)
                      : (language === 'EN' ? 'All Expenses' : 'संपूर्ण खर्च')}
                  </span>
                  {selectedCategory && (
                    <button type="button" onClick={() => setSelectedCategory(null)} className="text-slate-500 hover:text-red-500 text-xs font-bold bg-[#fbfaf8] border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-sm">
                      {text.clearFilter[language]} ×
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="flex items-end justify-between h-48 pt-6 pb-2 px-2 bg-[#fbfaf8] rounded-2xl shadow-inner relative min-w-[500px]">
                    {calendarMonthsEN.map((mth, index) => {
                      const monthlySum = graphDataPoints[index];
                      const barHeightRatio = (monthlySum / peakSpendingValue) * 100;
                      const labelMonth = language === 'EN' ? mth : calendarMonthsHI[index];

                      return (
                        <div key={mth} className="flex flex-col items-center flex-1 space-y-2 mx-1">
                          <span className="text-xxs font-black text-slate-500">
                            {monthlySum > 0 ? "₹" + (monthlySum / 1000).toFixed(1) + "k" : "₹0"}
                          </span>
                          <div className="w-6 bg-white border border-slate-200 rounded-t-md h-28 flex items-end overflow-hidden shadow-sm">
                            <div className="w-full bg-[#5ebb56] rounded-t-sm transition-all duration-500 ease-out" style={{ height: barHeightRatio + "%" }} />
                          </div>
                          <span className="text-xxs font-bold text-slate-400 uppercase">{labelMonth}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {categoriesRegistry.map(cat => {
                  const itemTotal = expenses.filter(e => e.categoryEN === cat.en).reduce((sum, e) => sum + e.amount, 0);
                  const isSelected = selectedCategory === cat.en;

                  return (
                    <div
                      key={cat.en}
                      onClick={() => setSelectedCategory(isSelected ? null : cat.en)}
                      className={"p-4 rounded-2xl flex justify-between items-center cursor-pointer border transition-all shadow-sm " + (isSelected ? "border-[#0f8181] bg-teal-50 ring-2 ring-[#0f8181]/20" : "border-slate-100 bg-white hover:bg-slate-50")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-xl p-2 bg-[#fbfaf8] rounded-xl border border-slate-100">{cat.en.split(' ')[0]}</div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {language === 'EN' ? cat.en.split(' ').slice(1).join(' ') : cat.hi.split(' ').slice(1).join(' ')}
                        </h4>
                      </div>
                      <span className="font-black text-slate-700 text-sm">₹{itemTotal.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <label className="text-xs font-bold text-[#0f8181] uppercase tracking-wide block">{text.monthlyLimit[language]}</label>
                {isEditingBudget ? (
                  <div className="flex space-x-3">
                    <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} className="bg-[#fbfaf8] p-3 border border-slate-200 rounded-xl font-bold flex-grow text-base focus:outline-none focus:border-[#3b49a5]" />
                    <button type="button" onClick={() => { if(Number(budgetInput) > 0) { setMonthlyBudget(Number(budgetInput)); setIsEditingBudget(false); } }} className="bg-[#3b49a5] text-white font-bold px-5 rounded-xl text-sm shadow-md">{text.save[language]}</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-[#fbfaf8] p-4 rounded-xl border border-slate-200">
                    <span className="text-xl font-black text-slate-800">₹{monthlyBudget.toLocaleString('en-IN')}</span>
                    <button type="button" onClick={() => setIsEditingBudget(true)} className="text-xs font-bold text-[#3b49a5] uppercase underline">{text.changeLimit[language]}</button>
                  </div>
                )}
              </div>

              <div className="bg-white p-1 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#f7b500] to-yellow-400 px-5 py-3 flex justify-between items-center">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">{text.premiumLabel[language]}</h3>
                   <span className="bg-white text-yellow-600 text-xxs font-bold px-2 py-1 rounded-md uppercase">Pro</span>
                </div>
                <div className="p-5 text-center space-y-4">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{text.trialNotice[language]}</p>
                  
                  <div className="bg-[#fbfaf8] border-2 border-slate-100 rounded-2xl p-4 max-w-[220px] mx-auto shadow-inner flex flex-col items-center">
                    <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                      <QRCodeSVG value="upi://pay?pa=prateekmaurya391@okicici&pn=Prateek%20Maurya&cu=INR" size={150} />
                    </div>
                    <p className="text-xxs font-bold text-[#3b49a5]">{text.qrPlaceholder[language]}</p>
                    <p className="text-[10px] text-slate-400 mt-1 break-all">prateekmaurya391@okicici</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {isFormOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-end">
            <form onSubmit={handleSaveExpense} className="bg-white w-full rounded-t-[2rem] p-6 space-y-5 shadow-2xl border-t border-slate-100">
              <div className="flex justify-between items-center border-b pb-4 border-slate-100">
                <h3 className="font-black text-[#0f8181] text-lg">
                  {editingExpenseId ? text.updateExpenseBtn[language] : text.addExpenseBtn[language]}
                </h3>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-sm font-bold text-slate-400 hover:text-red-500 bg-slate-

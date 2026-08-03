import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

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
  const [activeTab, setActiveTab] = useState<"home" | "track" | "account">("home");
  const [language, setLanguage] = useState<"EN" | "HI">("EN");

  const [monthlyBudget, setMonthlyBudget] = useState(40000);
  const [budgetInput, setBudgetInput] = useState("40000");
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem("hisaab_kitaab_expenses");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "hisaab_kitaab_expenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [inputAmount, setInputAmount] = useState("");
  const [inputCategoryIndex, setInputCategoryIndex] = useState(0);
  const [inputNote, setInputNote] = useState("");

  const currentMonthEN = new Date().toLocaleString("en-US", {
    month: "short",
  });

  const [inputMonthEN, setInputMonthEN] = useState(currentMonthEN);

  const categoriesRegistry = [
    { en: "🛒 Groceries (Ration)", hi: "🛒 राशन (किराना)" },
    { en: "🥦 Veg & Fruits", hi: "🥦 फल और सब्जियां" },
    { en: "🥛 Milk & Dairy", hi: "🥛 दूध और डेयरी" },
    { en: "🧹 Maid & Helpers", hi: "🧹 कामवाली और हेल्पर" },
    { en: "⚡ Bills", hi: "⚡ बिजली बिल" },
    { en: "📱 Mobile", hi: "📱 मोबाइल" },
    { en: "⛽ Fuel", hi: "⛽ पेट्रोल" },
    { en: "💊 Medical", hi: "💊 दवा" },
    { en: "🍔 Food", hi: "🍔 खाना" },
    { en: "🛍 Shopping", hi: "🛍 शॉपिंग" },
    { en: "🎓 Education", hi: "🎓 शिक्षा" },
    { en: "🏠 Rent", hi: "🏠 किराया" },
    { en: "✨ Misc", hi: "✨ अन्य" },
  ];

  const calendarMonthsEN = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const calendarMonthsHI = [
    "जनवरी",
    "फरवरी",
    "मार्च",
    "अप्रैल",
    "मई",
    "जून",
    "जुलाई",
    "अगस्त",
    "सितंबर",
    "अक्टूबर",
    "नवंबर",
    "दिसंबर",
  ];

  const text = {
    home: { EN: "Home", HI: "मुख्य" },
    track: { EN: "Track", HI: "ग्राफ" },
    account: { EN: "Account", HI: "खाता" },
    balance: { EN: "Available Balance", HI: "बचा हुआ पैसा" },
    spent: { EN: "Total Spent", HI: "कुल खर्च" },
    budget: { EN: "Monthly Budget", HI: "मासिक बजट" },
    add: { EN: "Add Expense", HI: "खर्च जोड़ें" },
    edit: { EN: "Edit Expense", HI: "खर्च बदलें" },
    save: { EN: "Save", HI: "सेव करें" },
    cancel: { EN: "Cancel", HI: "रद्द करें" },
    graph: { EN: "12 Month Graph", HI: "12 महीने का ग्राफ" },
    premium: { EN: "Premium", HI: "प्रीमियम" },
    amountLabel: { EN: "Amount", HI: "राशि" },
    categoryLabel: { EN: "Category", HI: "श्रेणी" },
    monthLabel: { EN: "Month", HI: "महीना" },
    noteLabel: { EN: "Note", HI: "विवरण" },
    addExpenseBtn: { EN: "Add Expense", HI: "खर्च जोड़ें" },
    updateExpenseBtn: { EN: "Update Expense", HI: "खर्च अपडेट करें" },
  };

  const currentMonthExpenses = expenses.filter(
    (e) => e.monthEN === currentMonthEN
  );

  const totalSpent = currentMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const balanceLeft = monthlyBudget - totalSpent;

  const graphData = calendarMonthsEN.map((month) =>
    expenses
      .filter(
        (e) =>
          e.monthEN === month &&
          (selectedCategory === null ||
            e.categoryEN === selectedCategory)
      )
      .reduce((sum, e) => sum + e.amount, 0)
  );

  const highestValue = Math.max(...graphData, 1);

  const handleSaveExpense = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!inputAmount) return;

    const monthIndex =
      calendarMonthsEN.indexOf(inputMonthEN);

    const newExpense: Expense = {
      id: editingExpenseId ?? crypto.randomUUID(),
      amount: Number(inputAmount),
      categoryEN: categoriesRegistry[inputCategoryIndex].en,
      categoryHI: categoriesRegistry[inputCategoryIndex].hi,
      note: inputNote,
      date: new Date().toISOString(),
      monthEN: inputMonthEN,
      monthHI: calendarMonthsHI[monthIndex],
    };

    if (editingExpenseId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingExpenseId ? newExpense : item
        )
      );
      setEditingExpenseId(null);
    } else {
      setExpenses((prev) => [newExpense, ...prev]);
    }

    setInputAmount("");
    setInputCategoryIndex(0);
    setInputNote("");
    setInputMonthEN(currentMonthEN);
    setIsFormOpen(false);
  };

  const triggerEditFlow = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setInputAmount(expense.amount.toString());
    setInputNote(expense.note);
    setInputMonthEN(expense.monthEN);

    const index = categoriesRegistry.findIndex(
      (c) => c.en === expense.categoryEN
    );

    setInputCategoryIndex(index >= 0 ? index : 0);
    setIsFormOpen(true);
  };

  const triggerDeleteFlow = (id: string) => {
    if (!window.confirm("Delete this expense?")) return;

    setExpenses((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (    <div className="min-h-screen bg-[#f7f8fc] text-slate-800 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white shadow-xl relative pb-24">

        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-white border-b px-5 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-teal-700">
            Hisaab Kitaab
          </h1>

          <button
            onClick={() =>
              setLanguage(language === "EN" ? "HI" : "EN")
            }
            className="px-3 py-2 rounded-lg border font-bold"
          >
            {language}
          </button>
        </header>

        <main className="p-4 space-y-6">

          {activeTab === "home" && (
            <>
              <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-indigo-700 text-white p-6">
                <p className="text-sm opacity-80">
                  {text.balance[language]}
                </p>

                <h2 className="text-4xl font-black mt-2">
                  ₹{balanceLeft.toLocaleString("en-IN")}
                </h2>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-xs opacity-80">
                      {text.budget[language]}
                    </p>

                    <h3 className="text-lg font-bold">
                      ₹{monthlyBudget.toLocaleString("en-IN")}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs opacity-80">
                      {text.spent[language]}
                    </p>

                    <h3 className="text-lg font-bold">
                      ₹{totalSpent.toLocaleString("en-IN")}
                    </h3>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingExpenseId(null);
                  setInputAmount("");
                  setInputNote("");
                  setInputCategoryIndex(0);
                  setInputMonthEN(currentMonthEN);
                  setIsFormOpen(true);
                }}
                className="w-full rounded-xl bg-indigo-700 text-white py-4 font-bold"
              >
                + {text.add[language]}
              </button>

              <div className="space-y-3">
                {currentMonthExpenses.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    No Expenses Yet
                  </div>
                ) : (
                  currentMonthExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="border rounded-2xl p-4 flex justify-between items-start"
                    >
                      <div>
                        <h3 className="font-bold">
                          {language === "EN"
                            ? expense.categoryEN
                            : expense.categoryHI}
                        </h3>

                        {expense.note && (
                          <p className="text-sm text-slate-500">
                            {expense.note}
                          </p>
                        )}

                        <p className="text-xs text-slate-400">
                          {expense.monthEN}
                        </p>
                      </div>

                      <div className="text-right">
                        <h3 className="font-black">
                          ₹{expense.amount.toLocaleString("en-IN")}
                        </h3>

                        <div className="mt-2 flex gap-2 justify-end">
                          <button
                            onClick={() => triggerEditFlow(expense)}
                            className="text-blue-600 text-sm font-medium"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              triggerDeleteFlow(expense.id)
                            }
                            className="text-red-600 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}          {activeTab === "track" && (
            <>
              <div className="rounded-3xl bg-white border p-5">
                <h2 className="text-xl font-black mb-5">
                  {text.graph[language]}
                </h2>

                <div className="mb-5">
                  <select
                    value={selectedCategory ?? ""}
                    onChange={(e) =>
                      setSelectedCategory(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 p-3"
                  >
                    <option value="">
                      {language === "EN"
                        ? "All Categories"
                        : "सभी श्रेणियाँ"}
                    </option>

                    {categoriesRegistry.map((cat) => (
                      <option key={cat.en} value={cat.en}>
                        {language === "EN" ? cat.en : cat.hi}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-between gap-2 h-64 border-b border-l px-2 pb-2">
                  {graphData.map((value, index) => (
                    <div
                      key={calendarMonthsEN[index]}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-full rounded-t-lg bg-teal-600 transition-all"
                        style={{
                          height: `${
                            (value / highestValue) * 180
                          }px`,
                          minHeight: value > 0 ? "6px" : "0px",
                        }}
                      />

                      <span className="mt-2 text-[10px] font-semibold">
                        {language === "EN"
                          ? calendarMonthsEN[index]
                          : calendarMonthsHI[index]}
                      </span>

                      <span className="text-[10px] text-slate-500">
                        ₹{value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}          {activeTab === "track" && (
            <>
              <div className="rounded-3xl bg-white border p-5">
                <h2 className="text-xl font-black mb-5">
                  {text.graph[language]}
                </h2>

                <div className="mb-5">
                  <select
                    value={selectedCategory ?? ""}
                    onChange={(e) =>
                      setSelectedCategory(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 p-3"
                  >
                    <option value="">
                      {language === "EN"
                        ? "All Categories"
                        : "सभी श्रेणियाँ"}
                    </option>

                    {categoriesRegistry.map((cat) => (
                      <option key={cat.en} value={cat.en}>
                        {language === "EN" ? cat.en : cat.hi}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-between gap-2 h-64 border-b border-l px-2 pb-2">
                  {graphData.map((value, index) => (
                    <div
                      key={calendarMonthsEN[index]}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-full rounded-t-lg bg-teal-600 transition-all"
                        style={{
                          height: `${
                            (value / highestValue) * 180
                          }px`,
                          minHeight: value > 0 ? "6px" : "0px",
                        }}
                      />

                      <span className="mt-2 text-[10px] font-semibold">
                        {language === "EN"
                          ? calendarMonthsEN[index]
                          : calendarMonthsHI[index]}
                      </span>

                      <span className="text-[10px] text-slate-500">
                        ₹{value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "account" && (
            <>
              <div className="rounded-3xl border bg-white p-5 space-y-5">

                <div>
                  <h2 className="text-xl font-black">
                    {text.budget[language]}
                  </h2>

                  {isEditingBudget ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        value={budgetInput}
                        onChange={(e) =>
                          setBudgetInput(e.target.value)
                        }
                        className="flex-1 rounded-xl border border-slate-300 p-3"
                      />

                      <button
                        onClick={() => {
                          const value = Number(budgetInput);
                          if (!isNaN(value) && value > 0) {
                            setMonthlyBudget(value);
                          }
                          setIsEditingBudget(false);
                        }}
                        className="rounded-xl bg-teal-700 px-4 text-white font-bold"
                      >
                        {text.save[language]}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between">
                      <h3 className="text-2xl font-black">
                        ₹{monthlyBudget.toLocaleString("en-IN")}
                      </h3>

                      <button
                        onClick={() => {
                          setBudgetInput(
                            monthlyBudget.toString()
                          );
                          setIsEditingBudget(true);
                        }}
                        className="rounded-lg border px-4 py-2"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-5">
                  <h3 className="font-bold mb-3">
                    UPI QR
                  </h3>

                  <div className="flex justify-center">
                    <QRCodeSVG
                      value="upi://pay?pa=demo@upi&pn=HisaabKitaab&cu=INR"
                      size={180}
                    />
                  </div>
                </div>
              </div>
            </>
          )}        </main>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={handleSaveExpense}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <h2 className="mb-6 text-2xl font-black">
                {editingExpenseId
                  ? text.edit[language]
                  : text.add[language]}
              </h2>

              <div className="space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold">
                    {text.amountLabel[language]}
                  </span>

                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) =>
                      setInputAmount(e.target.value)
                    }
                    placeholder="₹0"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    {text.categoryLabel[language]}
                  </span>

                  <select
                    value={inputCategoryIndex}
                    onChange={(e) =>
                      setInputCategoryIndex(
                        Number(e.target.value)
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                  >
                    {categoriesRegistry.map((cat, index) => (
                      <option key={cat.en} value={index}>
                        {language === "EN"
                          ? cat.en
                          : cat.hi}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    {text.monthLabel[language]}
                  </span>

                  <select
                    value={inputMonthEN}
                    onChange={(e) =>
                      setInputMonthEN(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                  >
                    {calendarMonthsEN.map((month, index) => (
                      <option key={month} value={month}>
                        {language === "EN"
                          ? month
                          : calendarMonthsHI[index]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    {text.noteLabel[language]}
                  </span>

                  <input
                    type="text"
                    value={inputNote}
                    onChange={(e) =>
                      setInputNote(e.target.value)
                    }
                    placeholder={
                      language === "EN"
                        ? "Optional note"
                        : "विवरण (वैकल्पिक)"
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                  />
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-700 py-3 font-bold text-white"
                  >
                    {editingExpenseId
                      ? text.updateExpenseBtn[language]
                      : text.addExpenseBtn[language]}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingExpenseId(null);
                      setInputAmount("");
                      setInputNote("");
                      setInputCategoryIndex(0);
                      setInputMonthEN(currentMonthEN);
                    }}
                    className="flex-1 rounded-xl border border-slate-300 py-3 font-bold"
                  >
                    {text.cancel[language]}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}        <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-around border-t bg-white py-3 shadow-lg">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center ${
              activeTab === "home"
                ? "text-teal-700 font-bold"
                : "text-slate-500"
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs">
              {text.home[language]}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("track")}
            className={`flex flex-col items-center ${
              activeTab === "track"
                ? "text-teal-700 font-bold"
                : "text-slate-500"
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs">
              {text.track[language]}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`flex flex-col items-center ${
              activeTab === "account"
                ? "text-teal-700 font-bold"
                : "text-slate-500"
            }`}
          >
            <span className="text-xl">👤</span>
            <span className="text-xs">
              {text.account[language]}
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}

          

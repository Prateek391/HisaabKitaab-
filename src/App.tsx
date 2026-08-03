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

  const [inputMonthEN, setInputMonthEN] =
    useState(currentMonthEN);

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
      id:
        editingExpenseId ??
        crypto.randomUUID(),
      amount: Number(inputAmount),
      categoryEN:
        categoriesRegistry[inputCategoryIndex].en,
      categoryHI:
        categoriesRegistry[inputCategoryIndex].hi,
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

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800 flex justify-center">
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
                      className="border rounded-2xl p-4 flex justify-between"
                    >
                      <div>
                        <h3 className="font-bold">
                          {language === "EN"
                            ? expense.categoryEN
                            : expense.categoryHI}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {expense.note}
                        </p>

                        <p className="text-xs text-slate-400">
                          {expense.monthEN}
                        </p>
                      </div>

                      <div className="text-right">

                        <h3 className="font-black">
                          ₹{expense.amount}
                        </h3>

                        <button
                          onClick={() =>
                            triggerEditFlow(expense)
                          }
                          className="text-blue-600 text-sm mr-2"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            triggerDeleteFlow(expense.id)
                          }
                          className="text-red-600 text-sm"
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  ))
                )}

              </div>
            </>
          )}

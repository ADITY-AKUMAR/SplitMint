// Lightweight NLP heuristics for MintSense feature
export function parseNaturalExpense(
  text,
  participants = [],
  currentUser = null,
) {
  const t = (text || "").trim();
  const lower = t.toLowerCase();
  const now = new Date();

  // amount: look for $ or numbers
  const amtMatch = t.match(/\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  const amount = amtMatch ? parseFloat(amtMatch[1]) : null;

  // date: look for ISO date or keywords
  let date = null;
  const isoMatch = t.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) date = isoMatch[1];
  else if (lower.includes("today")) date = now.toISOString().split("T")[0];
  else if (lower.includes("yesterday")) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    date = d.toISOString().split("T")[0];
  }

  // payer: default to current user if 'I paid' or 'I paid for'
  let payerName = null;
  if (
    /\bi paid\b/.test(lower) ||
    /^paid\b/.test(lower) ||
    /i paid for/.test(lower)
  ) {
    payerName = currentUser?.name || "You";
  } else {
    const paidByMatch = t.match(/([A-Z][a-z]+) paid/);
    if (paidByMatch) payerName = paidByMatch[1];
  }

  // participants: look for 'for X and Y' or 'with X, Y'
  let participantNames = [];
  const forMatch = t.match(/(?:for|with)\s+([A-Za-z0-9.,&\s]+)/i);
  if (forMatch) {
    const raw = forMatch[1]
      .split(/,| and | & /i)
      .map((s) => s.trim())
      .filter(Boolean);
    participantNames = raw;
  }

  // If no participants found but text contains some known participant names, match those
  if (
    participantNames.length === 0 &&
    participants &&
    participants.length > 0
  ) {
    participants.forEach((p) => {
      const name = (p.name || (p.userId && p.userId.name) || "").toLowerCase();
      if (name && lower.includes(name)) participantNames.push(p.name || name);
    });
  }

  // map participant names to ids when possible
  const participantObjs = (
    participantNames.length > 0
      ? participantNames
      : participants.map((p) => p.name || (p.userId && p.userId.name))
  ).map((nm) => {
    const match = participants.find((p) => {
      const candidate = (
        p.name ||
        (p.userId && p.userId.name) ||
        ""
      ).toLowerCase();
      return candidate && nm && candidate.includes(nm.toLowerCase());
    });
    return {
      userId: match ? match.userId?._id || match.userId : null,
      name: match ? match.name || (match.userId && match.userId.name) : nm,
      amount: 0,
    };
  });

  // description: try to strip common phrases
  let description = t;
  description = description
    .replace(/\$?[0-9]+(?:\.[0-9]{1,2})?/, "")
    .replace(/\b(today|yesterday|on\s+\d{4}-\d{2}-\d{2})\b/i, "")
    .trim();

  // split mode heuristic
  const splitMode = /equal|equally|split equally|split between/.test(lower)
    ? "equal"
    : "custom";

  // category heuristic
  const categories = {
    food: [
      "dinner",
      "lunch",
      "coffee",
      "restaurant",
      "pizza",
      "food",
      "diner",
      "cafe",
      "breakfast",
    ],
    travel: [
      "uber",
      "taxi",
      "flight",
      "train",
      "bus",
      "gas",
      "parking",
      "toll",
    ],
    groceries: ["grocery", "groceries", "supermarket"],
    utilities: ["rent", "electric", "water", "internet", "utility", "wifi"],
    entertainment: ["movie", "concert", "game", "netflix", "tickets"],
  };

  let category = "other";
  Object.entries(categories).forEach(([cat, kw]) => {
    kw.forEach((k) => {
      if (lower.includes(k)) category = cat;
    });
  });

  return {
    amount,
    date,
    payerName,
    participants: participantObjs,
    description:
      description ||
      (participantNames.length
        ? `${participantNames.join(", ")}`
        : "Misc expense"),
    splitMode,
    category,
    notes: "",
  };
}

export function generateGroupSummary(
  expenses = [],
  participants = [],
  topN = 3,
) {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const byPayer = {};
  const byCategory = {};

  expenses.forEach((e) => {
    const payer = e.payerName || (e.payer && e.payer.name) || "Unknown";
    byPayer[payer] = (byPayer[payer] || 0) + (e.amount || 0);
    const cat = e.category || "other";
    byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
  });

  const topSpenders = Object.entries(byPayer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  let text = `Group spent ${total.toFixed(2)} in total.`;
  if (topSpenders.length) {
    text += ` Top spenders: ${topSpenders.map((t) => `${t[0]} (${t[1].toFixed(2)})`).join(", ")}.`;
  }
  if (topCategories.length) {
    text += ` Common categories: ${topCategories.map((t) => `${t[0]} (${t[1].toFixed(2)})`).join(", ")}.`;
  }

  return text;
}

// Generate settlement suggestions from balances array
export function suggestSettlementsFromBalances(balances = []) {
  // compute net per user
  const net = {};
  balances.forEach((b) => {
    const debtorId = b.debtor?._id
      ? String(b.debtor._id)
      : String(b.debtor || "");
    const creditorId = b.creditor?._id
      ? String(b.creditor._id)
      : String(b.creditor || "");
    const amount = b.amount || 0;
    net[debtorId] = (net[debtorId] || 0) - amount;
    net[creditorId] = (net[creditorId] || 0) + amount;
  });

  const debtors = [];
  const creditors = [];
  Object.entries(net).forEach(([id, amt]) => {
    if (amt < -0.005)
      debtors.push({ id, amt: -amt }); // owes
    else if (amt > 0.005) creditors.push({ id, amt });
  });

  debtors.sort((a, b) => b.amt - a.amt);
  creditors.sort((a, b) => b.amt - a.amt);

  const suggestions = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const payAmount = Math.min(debtors[i].amt, creditors[j].amt);
    suggestions.push({
      from: debtors[i].id,
      to: creditors[j].id,
      amount: payAmount,
    });
    debtors[i].amt -= payAmount;
    creditors[j].amt -= payAmount;
    if (Math.abs(debtors[i].amt) < 0.01) i++;
    if (Math.abs(creditors[j].amt) < 0.01) j++;
  }

  return suggestions;
}

export default {
  parseNaturalExpense,
  generateGroupSummary,
  suggestSettlementsFromBalances,
};

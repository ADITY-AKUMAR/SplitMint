// Balance calculation engine - minimizes settlements using greedy algorithm
export const calculateBalances = async (expenses, groupId, Balance) => {
  try {
    // Clear existing balances for this group
    await Balance.deleteMany({ group: groupId });

    // Create a map to track net balances
    const balanceMap = new Map();

    // Process each expense
    for (const expense of expenses) {
      const payerId = expense.payer._id.toString();

      // For each participant, calculate how much they owe/are owed
      for (const participant of expense.participants) {
        const participantId = participant.userId.toString();

        if (payerId === participantId) {
          // Payer gets credit for what others owe them
          const key = `${participantId}-${payerId}`;
          balanceMap.set(key, (balanceMap.get(key) || 0) + participant.amount);
        } else {
          // Participant owes the payer
          const key = `${participantId}-${payerId}`;
          balanceMap.set(key, (balanceMap.get(key) || 0) + participant.amount);
        }
      }
    }

    // Convert balance map to net balances
    const netBalances = new Map();

    for (const [key, amount] of balanceMap.entries()) {
      const [personA, personB] = key.split("-");
      const reverseKey = `${personB}-${personA}`;

      if (netBalances.has(reverseKey)) {
        const reverseAmount = netBalances.get(reverseKey);
        const difference = amount - reverseAmount;

        if (difference > 0) {
          netBalances.delete(reverseKey);
          netBalances.set(key, difference);
        } else if (difference < 0) {
          netBalances.delete(reverseKey);
          netBalances.set(reverseKey, Math.abs(difference));
        } else {
          netBalances.delete(reverseKey);
        }
      } else if (!netBalances.has(key)) {
        netBalances.set(key, amount);
      }
    }

    // Create Balance documents
    const balanceDocuments = [];
    const userMap = new Map();

    // Build user map for reference
    for (const expense of expenses) {
      userMap.set(expense.payer._id.toString(), {
        id: expense.payer._id,
        name: expense.payerName || expense.payer.name,
      });
      for (const participant of expense.participants) {
        userMap.set(participant.userId.toString(), {
          id: participant.userId,
          name: participant.name,
        });
      }
    }

    for (const [key, amount] of netBalances.entries()) {
      if (amount > 0.01) {
        // Only create balance if amount is significant (avoid floating point issues)
        const [debtorId, creditorId] = key.split("-");
        const debtor = userMap.get(debtorId);
        const creditor = userMap.get(creditorId);

        if (debtor && creditor) {
          balanceDocuments.push({
            group: groupId,
            debtor: debtor.id,
            debtorName: debtor.name,
            creditor: creditor.id,
            creditorName: creditor.name,
            amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
          });
        }
      }
    }

    // Save all balances
    if (balanceDocuments.length > 0) {
      await Balance.insertMany(balanceDocuments);
    }

    return balanceDocuments;
  } catch (error) {
    console.error("Error calculating balances:", error);
    throw error;
  }
};

// Validate and normalize split amounts with proper rounding
export const normalizeSplit = (participants, totalAmount, splitMode) => {
  if (splitMode === "equal") {
    // Equal split: distribute amount equally, with rounding remainder to first participant
    const perPerson = totalAmount / participants.length;
    const rounded = participants.map((p) => ({
      ...p,
      amount: Math.round(perPerson * 100) / 100,
    }));

    // Check for rounding errors and adjust first participant
    const sum = rounded.reduce((s, p) => s + p.amount, 0);
    const diff = totalAmount - sum;
    if (Math.abs(diff) > 0.001) {
      rounded[0].amount = parseFloat((rounded[0].amount + diff).toFixed(2));
    }

    return rounded;
  }

  if (splitMode === "percentage") {
    // Percentage split: validate percentages sum to 100
    const total = participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error("Percentages must sum to 100");
    }
    const amounts = participants.map((p) => ({
      ...p,
      amount: Math.round(totalAmount * (p.percentage / 100) * 100) / 100,
    }));

    // Adjust for rounding errors
    const sum = amounts.reduce((s, p) => s + p.amount, 0);
    const diff = totalAmount - sum;
    if (Math.abs(diff) > 0.001) {
      amounts[0].amount = parseFloat((amounts[0].amount + diff).toFixed(2));
    }

    return amounts;
  }

  if (splitMode === "custom") {
    // Custom split: validate amounts sum to total
    const total = participants.reduce((sum, p) => sum + (p.amount || 0), 0);
    if (Math.abs(total - totalAmount) > 0.01) {
      throw new Error(
        `Custom amounts must sum to total expense (${totalAmount}). Current sum: ${total}`,
      );
    }
    return participants.map((p) => ({
      ...p,
      amount: parseFloat(p.amount.toFixed(2)),
    }));
  }

  return participants;
};

export const roundAmount = (amount) => {
  return Math.round(amount * 100) / 100;
};

// Compute minimal settlement suggestions
// Converts net bilateral balances to minimal settlement transactions
export const computeSettlements = (balances) => {
  try {
    // Build net balance per person (positive = owed money, negative = owes money)
    const netBalances = {};

    // Initialize all participants with 0
    for (const balance of balances) {
      if (!netBalances[balance.debtor.toString()]) {
        netBalances[balance.debtor.toString()] = {
          id: balance.debtor,
          name: balance.debtorName,
          net: 0,
        };
      }
      if (!netBalances[balance.creditor.toString()]) {
        netBalances[balance.creditor.toString()] = {
          id: balance.creditor,
          name: balance.creditorName,
          net: 0,
        };
      }

      // Debtor owes creditor, so debtor is negative, creditor is positive
      netBalances[balance.debtor.toString()].net -= balance.amount;
      netBalances[balance.creditor.toString()].net += balance.amount;
    }

    // Generate settlements using greedy algorithm
    const settlements = [];
    const debtors = [];
    const creditors = [];

    // Separate debtors and creditors
    for (const [id, balance] of Object.entries(netBalances)) {
      if (balance.net < -0.01) {
        debtors.push(balance);
      } else if (balance.net > 0.01) {
        creditors.push(balance);
      }
    }

    // Match debtors with creditors
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // Amount that debtor owes (convert to positive)
      const debtorAmount = Math.abs(debtor.net);
      const creditorAmount = creditor.net;

      // Settle the minimum amount
      const settlementAmount = Math.min(debtorAmount, creditorAmount);

      settlements.push({
        from: debtor.id,
        fromName: debtor.name,
        to: creditor.id,
        toName: creditor.name,
        amount: roundAmount(settlementAmount),
      });

      // Update balances
      debtor.net += settlementAmount; // Debt reduced (becomes less negative)
      creditor.net -= settlementAmount; // Credit reduced

      // Move to next debtor or creditor if settled
      if (Math.abs(debtor.net) < 0.01) {
        i++;
      }
      if (Math.abs(creditor.net) < 0.01) {
        j++;
      }
    }

    return settlements;
  } catch (error) {
    console.error("Error computing settlements:", error);
    return [];
  }
};

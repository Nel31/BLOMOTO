const { FedaPay, Transaction } = require("fedapay");

FedaPay.setApiKey(process.env.FEDAPAY_API_KEY);
FedaPay.setEnvironment(process.env.FEDAPAY_ENV || "live");

exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      currency,
      customerEmail,
      customerPhone,
      customerName,
      firstname,
      lastname,
      email,
      phone,
      appointmentId,
      invoiceId,
    } = req.body;

    const resolvedEmail = customerEmail || email;
    const resolvedPhone = customerPhone || phone;

    const fullName = (customerName || `${firstname || ""} ${lastname || ""}`).trim();
    const safeFirstname = (firstname || fullName.split(" ")[0] || "Client").trim();
    const safeLastname =
      (lastname || fullName.split(" ").slice(1).join(" ") || "Promoto").trim();

    if (!amount) {
      return res.status(400).json({ success: false, message: "Montant requis" });
    }
    if (!resolvedEmail) {
      return res.status(400).json({ success: false, message: "Email requis" });
    }

    const transaction = await Transaction.create({
      description: "Paiement Blomoto",
      amount: amount,
      currency: { iso: currency || "XOF" },
      callback_url: process.env.FEDAPAY_CALLBACK_URL,
      metadata: {
        referenceType: appointmentId ? "appointment" : invoiceId ? "invoice" : "unknown",
        referenceId: appointmentId || invoiceId || null,
      },
      customer: {
        firstname: safeFirstname,
        lastname: safeLastname,
        email: resolvedEmail,
        ...(resolvedPhone ? { phone_number: resolvedPhone } : {}),
      },
    });

    const payment_url = FedaPay.environment === "live"
      ? `https://live.fedapay.com/checkout/${transaction.id}`
      : `https://checkout.fedapay.com/checkout/${transaction.id}`;

    return res.json({
      success: true,
      message: "Transaction créée",
      transactionId: String(transaction.id),
      paymentUrl: payment_url,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur paiement",
      error: error.message,
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const transaction = await Transaction.find(transactionId);
    return res.json({
      success: true,
      status: transaction.status,
      transaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification du paiement",
      error: error.message,
    });
  }
};

exports.fedaPayCallback = async (req, res) => {
  const transactionId = req.query.transaction_id || req.body?.transaction_id || req.body?.id;

  try {
    const transaction = await Transaction.find(transactionId);

    if (transaction.status === "paid") {
      // Paiement réussi : tu peux mettre à jour MongoDB ici
      return res.send("Paiement réussi !");
    } else if (transaction.status === "pending") {
      return res.send("Paiement en attente.");
    } else {
      return res.send("Paiement échoué ou annulé.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la vérification du paiement.");
  }
};
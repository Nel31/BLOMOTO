const { FedaPay, Transaction } = require("fedapay");

FedaPay.setApiKey(process.env.FEDAPAY_API_KEY);
FedaPay.setEnvironment(process.env.FEDAPAY_ENV || "live");

exports.createPayment = async (req, res) => {
  try {
    const { amount, firstname, lastname, email } = req.body;

    const transaction = await Transaction.create({
      description: "Paiement Blomoto",
      amount: amount,
      currency: { iso: "XOF" },
      callback_url: process.env.FEDAPAY_CALLBACK_URL,
      customer: {
        firstname: firstname,
        lastname: lastname,
        email: email
      }
    });

    const payment_url = FedaPay.environment === "live"
      ? `https://live.fedapay.com/checkout/${transaction.id}`
      : `https://checkout.fedapay.com/checkout/${transaction.id}`;

    return res.json({
      message: "Transaction créée",
      transaction_id: transaction.id,
      payment_url
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur paiement",
      error: error.message
    });
  }
};

exports.fedaPayCallback = async (req, res) => {
  const transactionId = req.query.transaction_id;

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
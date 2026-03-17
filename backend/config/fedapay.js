const { FedaPay } = require("fedapay");

FedaPay.setApiKey(process.env.FEDAPAY_API_KEY);
FedaPay.setEnvironment(process.env.FEDAPAY_ENV || "live");

module.exports = FedaPay;
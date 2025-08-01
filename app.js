const contractAddress = "0xaA8AA19D7257ABf33Ed968102045DAF69F7dDa43";

// Tu ABI aquí ↓ (pegalo completo)
const contractABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_subtractedValue", "type": "uint256"}
    ],
    "name": "decreaseApproval",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_addedValue", "type": "uint256"}
    ],
    "name": "increaseApproval",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_initialSupply", "type": "uint256"},
      {"name": "_name", "type": "string"},
      {"name": "_symbol", "type": "string"},
      {"name": "_decimals", "type": "uint8"}
    ],
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "spender", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
]; // Pega aquí el ABI que me mandaste

let web3;
let provider;
let contract;

window.addEventListener('load', async () => {
  if (window.localStorage.getItem('walletConnected') === 'true') {
    await connectWallet();
    showToast("✅ Reconexión automática activada");
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.visibility = "visible";
  setTimeout(() => {
    toast.style.visibility = "hidden";
  }, 3000);
}

async function connectWallet() {
  if (window.ethereum) {
    provider = window.ethereum;
    await provider.request({ method: "eth_requestAccounts" });
    web3 = new Web3(provider);
  } else {
    provider = new WalletConnectProvider({
      rpc: { 56: "https://bsc-dataseed.binance.org/" }
    });
    await provider.enable();
    web3 = new Web3(provider);
  }

  contract = new web3.eth.Contract(contractABI, contractAddress);
  const fee = await contract.methods.feeBasisPoints().call();
  document.getElementById("feeValue").textContent = fee;
  localStorage.setItem('walletConnected', 'true');
  showToast("🚀 Conexión exitosa, bro 😎 estás listo para romper el mercado");
}

async function disconnectWallet() {
  localStorage.removeItem('walletConnected');
  if (provider && provider.disconnect) await provider.disconnect();
  showToast("🔒 Sesión cerrada. Vuelve cuando estés listo pa' romper el mercado.");
}

async function claimSwap() {
  const accounts = await web3.eth.getAccounts();
  const sender = document.getElementById("tokenSentSymbol").value;
  const receiver = document.getElementById("tokenReceivedSymbol").value;
  const amount = document.getElementById("amount").value;

  const decimals = {
    DOLLARL: 4,
    USDT: 18
  };

  const parsedAmount = web3.utils.toWei(amount, 'ether');
  const adjustedAmount = BigInt(parsedAmount) / BigInt(10 ** (18 - decimals[sender]));

  try {
    await contract.methods.claimSwap(sender, receiver, adjustedAmount.toString())
      .send({ from: accounts[0] });

    showToast("✅ Swap realizado con éxito 🔥");
  } catch (err) {
    console.error(err);
    showToast("❌ Error al ejecutar swap");
  }
}

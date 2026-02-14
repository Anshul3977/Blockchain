# 🎥 Private Limit Order Agent - Demo Walkthrough

## 1. Pre-Recording Setup
Run these commands to reset the state:
```bash
# 1. Set Price HIGH (so order doesn't execute immediately)
node scripts/set-price.js 65

# 2. Kill any running monitor
pkill -f monitor-and-execute.js
```
*Ensure your Dashboard shows "No orders" or just Order #10 (Waiting).*

---

## 2. The Script (Talking Points)

### **Step 1: The Problem**
"Hi! This is the Private Limit Order Agent. On public blockchains, everyone can see your limit orders, leading to MEV and front-running."
"We solved this using **Skale's Enclave Encryption**."

### **Step 2: Placing the Order**
*(Show Terminal)*
"I'm placing a buy order for ETH if it hits **$0.50**. But I want this price to remain secret."
```bash
node scripts/place-encrypted-order.js
```
*(Show Dashboard)*
"The order is placed. You can see it here. But on-chain, the data is just random bytes. No one knows my limit calculation."

### **Step 3: The "Agent"**
"Address the 'Missing Button' Question: "
"You'll notice there is no 'Execute' button. That's the point! This is an **Agent**."
"I start my monitor script locally (or on a cloud server)."
```bash
node scripts/monitor-and-execute.js
```
*(Point to Logs)*
"The Agent is watching. It decrypts my order inside the secure environment."
"It sees the price is **$0.65**. My limit is **$0.50**. So it waits."

### **Step 4: The Trigger**
"Now, let's simulate a market flash crash."
```bash
node scripts/set-price.js 45
```
*(Switch quickly to Monitor Terminal)*

### **Step 5: Execution**
"The Oracle updates to **$0.45**."
"The Agent detects `0.45 <= 0.50`. **It fires immediately!**"
*(Show Monitor Logs: "TRIGGER ACTIVATED")*

*(Switch to Dashboard)*
"The dashboard updates. My order is **EXECUTED**."
"I bought the dip without revealing my intent until the very last second."

---

## 3. Code Walkthrough (If asked)
**`monitor-and-execute.js`**:
1. **Fetches Orders**: Loops through the contract.
2. **Decrypts**: Uses the private key to unlock `encryptedData`.
3. **Compares**: Checks `currentPrice <= limitPrice` strictly off-chain.
4. **Executes**: Calls `executeOrder(id)` only when conditions are met.

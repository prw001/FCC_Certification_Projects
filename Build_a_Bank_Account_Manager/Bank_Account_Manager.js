const transaction = (type, amount) => {
    return {
        "type": type,
        "amount": amount,
        "isDepo": function () {return this.type === "deposit"}
    };
}

class BankAccount{
    constructor()
    {
        this.balance = 0;
        this.transactions = [];
    }

    deposit(amount)
    {
        if (amount > 0)
        {
            this.transactions.push(transaction("deposit", amount));
            this.balance += amount;
            return `Successfully deposited $${amount}. New balance: $${this.balance}`;
        }
        return `Deposit amount must be greater than zero.`;
    }

    withdraw(amount)
    {
        if (amount > 0 && amount <= this.balance)
        {
            this.transactions.push(transaction("withdraw", amount));
            this.balance -= amount;
            return `Successfully withdrew $${amount}. New balance: $${this.balance}`;
        }
        return `Insufficient balance or invalid amount.`;
    }

    checkBalance()
    {
        return `Current balance: $${this.balance}`;
    }

    listAllDeposits()
    {
        let str = `Deposits: `;
        this.transactions.filter(transaction => transaction.isDepo()).forEach(trans => {
            str += `${trans.amount},`;
        })
        return str.substring(0, str.length - 1);
    }

    listAllWithdrawals()
    {
        let str = `Withdrawals: `;
        this.transactions.filter(transaction => !transaction.isDepo()).forEach(trans => {
            str += `${trans.amount},`;
        })
        return str.substring(0, str.length - 1);
    }
}

const myAccount = new BankAccount();
myAccount.deposit(2000);
myAccount.deposit(50);
myAccount.withdraw(1750);
myAccount.withdraw(200);
myAccount.deposit(725);
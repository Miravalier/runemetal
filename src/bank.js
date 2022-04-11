class Bank {
    constructor() {
        this.resources = {};
    }

    add(resources) {
        for (let [resource, amount] of Object.entries(resources)) {
            const existing_amount = this.resources[resource];
            if (typeof existing_amount === 'undefined') {
                this.resources[resource] = amount;
            }
            else {
                this.resources[resource] = existing_amount + amount;
            }
        }
    }

    has(resources) {
        for (let [resource, amount] of Object.entries(resources)) {
            const existing_amount = this.resources[resource] || 0;
            if (amount > existing_amount) {
                return false;
            }
        }
        return true;
    }

    remove(resources) {
        for (let [resource, amount] of Object.entries(resources)) {
            const existing_amount = this.resources[resource] || 0;
            this.resources[resource] = existing_amount - amount;
        }
    }
}


export const BANK = new Bank();

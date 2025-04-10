class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    getSize() {
        return this.size;
    }

    isEmpty() {
        return this.size === 0;
    }

    forEachNode(callback) {
        let current = this.head;
        while (current) {
            if (current.value !== null && current.value !== undefined) {
                callback(current.value);
            } else {
                console.log("Skipping node with null or undefined value");
            }
            current = current.next;
        }
    }

    toArray() {
        const result = [];
        this.forEachNode((value) => result.push(value));
        return result;
    }

    map(callback) {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(callback(current.value));
            current = current.next;
        }
        return result;
    }

    find(callback) {
        let current = this.head;
        while (current) {
            if (callback(current.value)) {
                return current.value;
            }
            current = current.next;
        }
        return null;
    }

    filter(callback) {
        const filteredList = new LinkedList();
        let current = this.head;
        while (current) {
            if (callback(current.value)) {
                filteredList.insertLast(current.value);
            }
            current = current.next;
        }
        return filteredList;
    }

    slice(start, end) {
        const resultList = new LinkedList();
        let current = this.head;
        let index = 0;

        while (current && index < end) {
            if (index >= start) {
                resultList.insertLast(current.value);
            }
            current = current.next;
            index++;
        }

        return resultList;
    }

    sort(compareFn) {
        if (this.size < 2) return;
    
        const values = this.toArray();
        values.sort(compareFn);

        this.head = null;
        this.tail = null;
        this.size = 0;

        for (const value of values) {
            this.insertLast(value);
        }
    }
    
    insertFirst(value) {
        const newNode = new Node(value);
        newNode.next = this.head;
        this.head = newNode;
        if (this.size === 0) {
            this.tail = newNode;
        }
        this.size++;
    }

    removeFirst() {
        if (!this.head) return;
        this.head = this.head.next;
        if (!this.head) {
            this.tail = null;
        }
        this.size--;
    }

    insertLast(value) {
        const newNode = new Node(value);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    removeLast() {
        if (!this.head) return;
        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
            this.size--;
            return;
        }

        let current = this.head;
        while (current.next !== this.tail) {
            current = current.next;
        }

        current.next = null;
        this.tail = current;
        this.size--;
    }

    removeAllNodes(callback) {
        let current = this.head;
        let prev = null;
    
        while (current) {
            if (callback(current.value)) {
                if (prev) {
                    prev.next = current.next;
                } else {
                    this.head = current.next;
                }
    
                if (current === this.tail) {
                    this.tail = prev;
                }
    
                this.size--;
            } else {
                prev = current;
            }
            current = current.next;
        }
    
        if (this.size === 0) {
            this.tail = null; 
        }
    }
}

module.exports = LinkedList;

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

    removeByName(name) {
        let current = this.head;
        let prev = null;
    
        while (current) {
            if (current.value && current.value.name === name) {
                if (prev) {
                    prev.next = current.next;
                } else {
                    this.head = current.next;
                }
    
                if (current === this.tail) {
                    this.tail = prev;
                }
    
                this.size--;
                return;
            }
            prev = current;
            current = current.next;
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
        if (this.head) {
            this.head = this.head.next;
            if (!this.head) {
                this.tail = null;
            }
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

    forEachNode(callback) {
        let current = this.head;
        while (current) {
            if (current.value !== null && current.value !== undefined) {
                try {
                    callback(current.value);
                } catch (error) {
                    console.error("Error in callback function:", error);
                }
            } else {
                console.log("Skipping node with null or undefined value");
            }
            current = current.next;
        }
    }

}

module.exports = LinkedList;
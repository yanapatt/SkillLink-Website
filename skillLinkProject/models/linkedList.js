class Node {
    constructor (value, next=null) {
        this.value = value;
        this.next = next; 
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    //Get current size on linked list
    getSize() {
        return this.size;
    }

    //Convert to array list
    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.value);
            current = current.next;
        }
        return result;
    }
}

module.exports = LinkedList;
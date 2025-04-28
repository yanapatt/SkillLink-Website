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
        console.time('forEachNode');
        let current = this.head;
        while (current) {
            if (current.value !== null && current.value !== undefined) {
                callback(current.value);
            }
            current = current.next;
        }
        console.timeEnd('forEachNode');
    }

    toArray() {
        console.time('toArray');
        const result = [];
        this.forEachNode((value) => result.push(value));
        console.timeEnd('toArray');
        return result;
    }

    map(callback) {
        console.time('map');
        const result = [];
        let current = this.head;
        while (current) {
            result.push(callback(current.value));
            current = current.next;
        }
        console.timeEnd('map');
        return result;
    }

    find(callback) {
        console.time('find');
        let current = this.head;
        while (current) {
            if (callback(current.value)) {
                console.timeEnd('find');
                return current.value;
            }
            current = current.next;
        }
    }

    filter(callback) {
        console.time('filter');
        const filteredList = new LinkedList();
        let current = this.head;
        while (current) {
            if (callback(current.value)) {
                filteredList.insertLast(current.value);
            }
            current = current.next;
        }
        console.timeEnd('filter');
        return filteredList;
    }

    slice(start, end) {
        console.time('slice');
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

        console.timeEnd('slice');
        return resultList;
    }

    sort(compareFn) {
        console.time('sort');
        if (this.size < 2) {
            console.timeEnd('sort');
            return;
        }

        const values = this.toArray();
        values.sort(compareFn);

        this.head = null;
        this.tail = null;
        this.size = 0;

        for (const value of values) {
            this.insertLast(value);
        }
        console.timeEnd('sort');
    }

    getNodeValue(index) {
        console.time('getNodeValue');
        if (index < 0 || index >= this.size) {
            console.log("Invalid index.");
            console.timeEnd('getNodeValue');
            return null;
        }
        let current = this.head;
        let count = 0;
        while (current) {
            if (count === index) {
                console.timeEnd('getNodeValue');
                return current.value;
            }
            count++;
            current = current.next;
            console.timeEnd('getNodeValue');
        }
    }

    insertFirst(value) {
        console.time('insertFirst');
        const newNode = new Node(value);
        newNode.next = this.head;
        this.head = newNode;
        if (this.size === 0) {
            this.tail = newNode;
        }
        this.size++;
        console.timeEnd('insertFirst');
    }

    removeFirst() {
        console.time('removeFirst');
        if (!this.head) {
            console.timeEnd('removeFirst');
            return;
        }
        this.head = this.head.next;
        if (!this.head) {
            this.tail = null;
        }
        this.size--;
        console.timeEnd('removeFirst');
    }

    insertLast(value) {
        console.time('insertLast');
        const newNode = new Node(value);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
        console.timeEnd('insertLast');
    }

    removeLast() {
        console.time('removeLast');
        if (!this.head) {
            console.timeEnd('removeLast');
            return;
        }
        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
            this.size--;
            console.timeEnd('removeLast');
            return;
        }

        let current = this.head;
        while (current.next !== this.tail) {
            current = current.next;
        }

        current.next = null;
        this.tail = current;
        this.size--;
        console.timeEnd('removeLast');
    }

    removeAllNodes(callback) {
        console.time('removeAllNodes');
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
        console.timeEnd('removeAllNodes');
    }
}

module.exports = LinkedList;

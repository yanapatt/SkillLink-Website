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

    //Get current size on linked list
    getSize() {
        return this.size;
    }

    //Convert to array list
    toArray() {
        const result = [];
        this.forEachNode((value) => result.push(value));
        return result;
    }

    //Filter function
    removeByName(name) {
        let current = this.head;
        let prev = null;

        while (current) {
            if (current.value.name === name) {
                if (prev) {
                    prev.next = current.next;
                } else {
                    this.head = current.next;
                }
                this.size--;
                return; // ลบเจอแล้วออกจากฟังก์ชัน
            }
            prev = current;
            current = current.next;
        }
    }

    //Insert value into head linked list
    insertFirst(value) {
        const newNode = new Node(value);
        newNode.next = this.head;
        this.head = newNode;
        if (this.size === 0) {
            this.tail = newNode;
        }
        this.size++;
    }

    //Remove first value from linked list
    removeFirst() {
        if (this.head) {
            this.head = this.head.next;
            if (!this.head) {
                this.tail = null;
            }
        }
        this.size--;
    }

    //Insert value into tail linked list
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

    //Remove last value from linked list
    removeLast() {
        if (!this.head) return;  // ถ้า LinkedList ว่าง
        if (this.head === this.tail) {  // ถ้ามีเพียง node เดียว
            this.head = null;
            this.tail = null;
            this.size--;
            return;
        }

        let current = this.head;
        while (current.next !== this.tail) {
            current = current.next;
        }

        current.next = null;  // ตัดการเชื่อมต่อกับ node สุดท้าย
        this.tail = current;  // เปลี่ยน tail เป็น node ใหม่
        this.size--; 
    }

    forEachNode(callback) {
        let current = this.head;
        while (current) {
            callback(current.value);
            current = current.next;
        }
    }
}

module.exports = LinkedList;
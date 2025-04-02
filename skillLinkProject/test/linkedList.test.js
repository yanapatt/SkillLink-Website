const LinkedList = require("../models/linkedList");

describe("LinkedList", () => {
    let linkedList;

    // Create a new LinkedList before each test case
    // สร้าง LinkedList ใหม่ก่อนการทดสอบแต่ละเคส
    beforeEach(() => {
        linkedList = new LinkedList();
    });

    describe("insertFirst", () => {
        it("should add a node at the beginning of the LinkedList", () => {
            // ควรเพิ่ม Node ที่จุดเริ่มต้นของ LinkedList
            linkedList.insertFirst({ postTitle: "First Post" });
            linkedList.insertFirst({ postTitle: "Second Post" });

            const result = linkedList.toArray();
            expect(result.length).toBe(2); // Expect the LinkedList to have 2 nodes
            expect(result[0].postTitle).toBe("Second Post"); // The first node should be "Second Post"
            expect(result[1].postTitle).toBe("First Post"); // The second node should be "First Post"
        });
    });

    describe("insertLast", () => {
        it("should add a node at the end of the LinkedList", () => {
            // ควรเพิ่ม Node ที่จุดท้ายของ LinkedList
            linkedList.insertLast({ postTitle: "First Post" });
            linkedList.insertLast({ postTitle: "Second Post" });

            const result = linkedList.toArray();
            expect(result.length).toBe(2); // Expect the LinkedList to have 2 nodes
            expect(result[0].postTitle).toBe("First Post"); // The first node should be "First Post"
            expect(result[1].postTitle).toBe("Second Post"); // The second node should be "Second Post"
        });
    });

    describe("removeByPostTitle", () => {
        it("should remove a node with the specified postTitle", () => {
            // ควรลบ Node ที่มี postTitle ตรงกับค่าที่กำหนด
            linkedList.insertLast({ postTitle: "First Post" });
            linkedList.insertLast({ postTitle: "Second Post" });

            linkedList.removeByPostTitle("First Post");
            const result = linkedList.toArray();

            expect(result.length).toBe(1); // Expect the LinkedList to have 1 node after removal
            expect(result[0].postTitle).toBe("Second Post"); // The remaining node should be "Second Post"
        });

        it("should log a message when the specified postTitle is not found", () => {
            // ควรแสดงข้อความแจ้งเตือนเมื่อไม่พบ Node ที่ต้องการลบ
            console.log = jest.fn(); // Mock console.log

            linkedList.insertLast({ postTitle: "First Post" });
            linkedList.removeByPostTitle("Nonexistent Post");

            expect(console.log).toHaveBeenCalledWith('Post with title "Nonexistent Post" not found.');
        });
    });

    describe("removeFirst", () => {
        it("should do nothing when LinkedList is empty", () => {
            // ควรไม่ทำอะไรเมื่อ LinkedList ว่างเปล่า
            linkedList.removeFirst();
            expect(linkedList.getSize()).toBe(0); // LinkedList size should remain 0
        });

        it("should remove the only node when LinkedList has one node", () => {
            // ควรลบ Node เดียวเมื่อ LinkedList มีเพียง 1 Node
            linkedList.insertFirst({ postTitle: "First Post" });
            linkedList.removeFirst();

            expect(linkedList.getSize()).toBe(0); // LinkedList size should be 0
            expect(linkedList.toArray()).toEqual([]); // LinkedList should be empty
        });

        it("should remove the first node when LinkedList has multiple nodes", () => {
            // ควรลบ Node แรกเมื่อ LinkedList มีหลาย Node
            linkedList.insertFirst({ postTitle: "First Post" });
            linkedList.insertFirst({ postTitle: "Second Post" });
            linkedList.removeFirst();

            const result = linkedList.toArray();
            expect(result.length).toBe(1); // LinkedList should have 1 node left
            expect(result[0].postTitle).toBe("First Post"); // The remaining node should be "First Post"
        });
    });

    describe("removeLast", () => {
        it("should do nothing when LinkedList is empty", () => {
            // ควรไม่ทำอะไรเมื่อ LinkedList ว่างเปล่า
            linkedList.removeLast();
            expect(linkedList.getSize()).toBe(0); // LinkedList size should remain 0
        });

        it("should remove the only node when LinkedList has one node", () => {
            // ควรลบ Node เดียวเมื่อ LinkedList มีเพียง 1 Node
            linkedList.insertLast({ postTitle: "First Post" });
            linkedList.removeLast();

            expect(linkedList.getSize()).toBe(0); // LinkedList size should be 0
            expect(linkedList.toArray()).toEqual([]); // LinkedList should be empty
        });

        it("should remove the last node when LinkedList has multiple nodes", () => {
            // ควรลบ Node สุดท้ายเมื่อ LinkedList มีหลาย Node
            linkedList.insertLast({ postTitle: "First Post" });
            linkedList.insertLast({ postTitle: "Second Post" });
            linkedList.removeLast();

            const result = linkedList.toArray();
            expect(result.length).toBe(1); // LinkedList should have 1 node left
            expect(result[0].postTitle).toBe("First Post"); // The remaining node should be "First Post"
        });
    });

    describe("forEachNode", () => {
        it("should skip nodes with null or undefined values", () => {
            // ควรข้าม Node ที่มีค่า null หรือ undefined
            linkedList.insertLast(null);
            linkedList.insertLast({ postTitle: "Valid Post" });
            linkedList.insertLast(undefined);

            const result = [];
            linkedList.forEachNode((nodeValue) => {
                result.push(nodeValue);
            });

            expect(result).toEqual([{ postTitle: "Valid Post" }]); // Only valid nodes should be processed
        });
    });

    describe("toArray", () => {
        it("should return an empty array when LinkedList is empty", () => {
            // ควรคืนค่า Array ว่างเมื่อ LinkedList ว่างเปล่า
            const result = linkedList.toArray();
            expect(result).toEqual([]);
        });

        it("should convert the LinkedList to an array", () => {
            // ควรแปลง LinkedList เป็น Array ได้อย่างถูกต้อง
            linkedList.insertLast({ postTitle: "First Post" });
            linkedList.insertLast({ postTitle: "Second Post" });

            const result = linkedList.toArray();
            expect(result).toEqual([
                { postTitle: "First Post" },
                { postTitle: "Second Post" },
            ]);
        });
    });

    describe("getSize", () => {
        it("should return the size of the LinkedList", () => {
            // ควรคืนค่าขนาดของ LinkedList ได้อย่างถูกต้อง
            expect(linkedList.getSize()).toBe(0); // Initially, the size should be 0

            linkedList.insertLast({ postTitle: "First Post" });
            expect(linkedList.getSize()).toBe(1); // After adding one node, the size should be 1

            linkedList.insertLast({ postTitle: "Second Post" });
            expect(linkedList.getSize()).toBe(2); // After adding another node, the size should be 2
        });
    });

    describe("isEmpty", () => {
        it("should return true when the LinkedList is empty", () => {
            // ควรคืนค่า true เมื่อ LinkedList ว่างเปล่า
            expect(linkedList.isEmpty()).toBe(true);
        });

        it("should return false when the LinkedList has nodes", () => {
            // ควรคืนค่า false เมื่อ LinkedList มี Node
            linkedList.insertLast({ postTitle: "First Post" });
            expect(linkedList.isEmpty()).toBe(false);
        });
    });
});
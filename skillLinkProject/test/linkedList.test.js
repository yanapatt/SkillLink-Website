const LinkedList = require("../models/linkedList");

describe("LinkedList Basic Operations", () => {
    let list;

    beforeEach(() => {
        list = new LinkedList();
    });

    test("should initialize an empty LinkedList", () => {
        expect(list.getSize()).toBe(0);
        expect(list.isEmpty()).toBe(true);
        expect(list.head).toBeNull();
        expect(list.tail).toBeNull();
    });

    test("insertFirst should add a node at the beginning", () => {
        list.insertFirst(10);
        expect(list.getSize()).toBe(1);
        expect(list.head.value).toBe(10);
        expect(list.tail.value).toBe(10);

        list.insertFirst(20);
        expect(list.getSize()).toBe(2);
        expect(list.head.value).toBe(20);
        expect(list.tail.value).toBe(10);
    });

    test("insertLast should add a node at the end", () => {
        list.insertLast(10);
        expect(list.getSize()).toBe(1);
        expect(list.head.value).toBe(10);
        expect(list.tail.value).toBe(10);

        list.insertLast(20);
        expect(list.getSize()).toBe(2);
        expect(list.head.value).toBe(10);
        expect(list.tail.value).toBe(20);
    });

    test("removeFirst should remove the first node", () => {
        list.insertFirst(10);
        list.insertFirst(20);
        list.removeFirst();
        expect(list.getSize()).toBe(1);
        expect(list.head.value).toBe(10);
    });

    test("removeFirst should set tail to null when the last node is removed", () => {
        list.insertFirst(10);
        expect(list.getSize()).toBe(1);
        expect(list.head).not.toBeNull();
        expect(list.tail).not.toBeNull();

        list.removeFirst();
        expect(list.getSize()).toBe(0);
        expect(list.head).toBeNull();
        expect(list.tail).toBeNull();
    });

    test("removeFirst should do nothing if the LinkedList is empty", () => {
        expect(list.getSize()).toBe(0);
        list.removeFirst();
        expect(list.getSize()).toBe(0);
        expect(list.head).toBeNull();
        expect(list.tail).toBeNull();
    });

    test("removeLast should remove the last node", () => {
        list.insertFirst(10);
        list.insertLast(20);
        list.removeLast();
        expect(list.getSize()).toBe(1);
        expect(list.head.value).toBe(10);
    });

    test("removeLast should set head and tail to null when the last node is removed", () => {
        list.insertLast(10);
        expect(list.getSize()).toBe(1);
        expect(list.head).not.toBeNull();
        expect(list.tail).not.toBeNull();

        list.removeLast();
        expect(list.getSize()).toBe(0);
        expect(list.head).toBeNull();
        expect(list.tail).toBeNull();
    });

    test("removeLast should traverse the list to find the second-to-last node", () => {
        list.insertLast(10);
        list.insertLast(20);
        list.insertLast(30);

        expect(list.getSize()).toBe(3);
        expect(list.tail.value).toBe(30);

        list.removeLast();
        expect(list.getSize()).toBe(2);
        expect(list.tail.value).toBe(20);
    });

    test("removeLast should do nothing if the LinkedList is empty", () => {
        expect(list.getSize()).toBe(0);
        list.removeLast();
        expect(list.getSize()).toBe(0);
        expect(list.head).toBeNull();
        expect(list.tail).toBeNull();
    });
});

describe("LinkedList Higher-Order Methods", () => {
    let list;

    beforeEach(() => {
        list = new LinkedList();
        list.insertLast(10);
        list.insertLast(20);
        list.insertLast(30);
    });

    test("toArray should convert LinkedList to an array", () => {
        expect(list.toArray()).toEqual([10, 20, 30]);
    });

    test("map should apply a callback to each node and return a new array", () => {
        const result = list.map((value) => value * 2);
        expect(result).toEqual([20, 40, 60]);
    });

    test("find should return the first node that matches the condition", () => {
        const result = list.find((value) => value === 20);
        expect(result).toBe(20);
    });

    test("filter should return a new LinkedList with nodes that match the condition", () => {
        const filteredList = list.filter((value) => value > 10);
        expect(filteredList.toArray()).toEqual([20, 30]);
    });

    test("slice should return a new LinkedList with nodes in the specified range", () => {
        const slicedList = list.slice(1, 3);
        expect(slicedList.toArray()).toEqual([20, 30]);
    });

    test("forEachNode should skip nodes with null or undefined values", () => {
        list.insertLast(null);
        list.insertLast(undefined);

        const result = [];
        list.forEachNode((value) => result.push(value));

        expect(result).toEqual([10, 20, 30]);
    });
});

describe("LinkedList Utility Methods", () => {
    let list;

    beforeEach(() => {
        list = new LinkedList();
        list.insertLast(30);
        list.insertLast(10);
        list.insertLast(20);
    });

    test("should not sort if the LinkedList has less than 2 nodes", () => {
        list.removeLast();
        list.removeLast();
        list.sort((a, b) => a - b);

        expect(list.toArray()).toEqual([30]);
    });

    test("should sort if the LinkedList has 2 or more nodes", () => {
        list.sort((a, b) => a - b);

        expect(list.toArray()).toEqual([10, 20, 30]);
    });

    test("getNodeValue should return the value at the specified index", () => {
        expect(list.getNodeValue(0)).toBe(30);
        expect(list.getNodeValue(1)).toBe(10);
        expect(list.getNodeValue(2)).toBe(20);
        expect(list.getNodeValue(3)).toBeNull();
    });

    test("removeAllNodes should remove all nodes that match the condition", () => {
        list.removeAllNodes((value) => value > 15);
        expect(list.toArray()).toEqual([10]);
    });

    test("removeAllNodes should set tail to null when all nodes are removed", () => {
        expect(list.getSize()).toBe(3);
        list.removeAllNodes(() => true);

        expect(list.getSize()).toBe(0);
        expect(list.head).toBeNull();
        expect(list.tail).toBeNull();
    });
});
const Task = require("../models/task");
const LinkedList = require("../models/linkedList");

jest.mock("../models/linkedList"); // Mock LinkedList เพื่อไม่ต้องใช้จริง

describe("Task Class Tests", () => {
    let taskManager;

    beforeEach(() => {
        taskManager = new Task();
        taskManager.tasks = new LinkedList(); // Mock LinkedList instance
        taskManager.tasks.toArray = jest.fn(() => []); // mock toArray() function
        taskManager.tasks.insertLast = jest.fn(); // mock insertLast() function
        taskManager.tasks.forEachNode = jest.fn((callback) => { }); // mock forEachNode() function
    });

    test("should add a task", () => {
        const task = { name: "Test Task", priority: 1, username: "admin" };

        taskManager.addTask(task);

        // ตรวจสอบว่า insertLast ถูกเรียกด้วย task ที่ถูกเพิ่มเข้าไป
        expect(taskManager.tasks.insertLast).toHaveBeenCalledWith(task);
    });

    test("should get all encrypted tasks", () => {
        taskManager.tasks.toArray = jest.fn(() => [
            { name: "Task 1", priority: 2, username: "admin" },
            { name: "Task 2", priority: 1, username: "user" },
        ]);

        taskManager.tasks.forEachNode = jest.fn((callback) => {
            taskManager.tasks.toArray().forEach(callback);
        });

        const tasks = taskManager.getAllTasks();

        // ตรวจสอบจำนวน task ที่ได้
        expect(tasks).toHaveLength(2);
        // ตรวจสอบว่า task ที่ได้มีการเข้ารหัส username
        expect(tasks[0]).toHaveProperty("username");
    });

    test("should summarize tasks by priority", () => {
        taskManager.tasks.forEachNode = jest.fn((callback) => {
            callback({ priority: 1 });
            callback({ priority: 2 });
            callback({ priority: 1 });
        });

        const summary = taskManager.summarizeByPriority();

        // ตรวจสอบการสรุป task ตาม priority
        expect(summary).toEqual({ 1: 2, 2: 1 });
    });

    test("should sort tasks by priority", () => {
        taskManager.tasks.toArray = jest.fn(() => [
            { name: "Task A", priority: 3, username: "alice" },
            { name: "Task B", priority: 1, username: "bob" },
            { name: "Task C", priority: 2, username: "charlie" },
        ]);

        const sortedTasks = taskManager.sortByPriority();

        // ตรวจสอบการจัดเรียง tasks ตาม priority
        expect(sortedTasks[0].priority).toBe(1);
        expect(sortedTasks[1].priority).toBe(2);
        expect(sortedTasks[2].priority).toBe(3);
    });

    test("should search tasks by name", () => {
        taskManager.tasks.forEachNode = jest.fn((callback) => {
            callback({ name: "Homework", priority: 2, username: "student" });
            callback({ name: "Project", priority: 1, username: "worker" });
        });

        const searchResult = taskManager.searchByName("home");

        // ตรวจสอบว่ามี task ที่ค้นหาจากชื่อได้
        expect(searchResult).toHaveLength(1);
        expect(searchResult[0].name).toBe("Homework");
    });

    test("should save tasks to file", () => {
        const fs = require("fs");
        jest.spyOn(fs, "writeFileSync").mockImplementation(() => { });

        taskManager.tasks.toArray = jest.fn(() => [
            { name: "Task A", priority: 1 },
        ]);

        taskManager.saveTasksToFile("test.json");

        // ตรวจสอบว่า fs.writeFileSync ถูกเรียกกับข้อมูลที่ถูกต้อง
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            "test.json",
            JSON.stringify([{ name: "Task A", priority: 1 }], null, 2)
        );
    });

    test("should load tasks from file", () => {
        const fs = require("fs");
        jest.spyOn(fs, "existsSync").mockReturnValue(true);
        jest.spyOn(fs, "readFileSync").mockReturnValue(
            JSON.stringify([{ name: "Task A", priority: 1 }])
        );

        taskManager.loadTasksFromFile("test.json");

        // ตรวจสอบว่า insertLast ถูกเรียกด้วย task ที่โหลดจากไฟล์
        expect(taskManager.tasks.insertLast).toHaveBeenCalledWith({
            name: "Task A",
            priority: 1,
        });
    });

    // เพิ่มกรณีทดสอบอื่น ๆ
    test("should not add a task with missing name", () => {
        const task = { priority: 1, username: "admin" };

        taskManager.addTask(task);

        // คาดว่าไม่ควรเพิ่ม task ที่ไม่มีชื่อ
        expect(taskManager.tasks.insertLast).not.toHaveBeenCalled();
    });

    test("should return empty array when no tasks exist", () => {
        taskManager.tasks.toArray = jest.fn(() => []);

        const tasks = taskManager.getAllTasks();

        // คาดว่าเมื่อไม่มี task ควรจะได้ array ว่าง
        expect(tasks).toEqual([]);
    });
});

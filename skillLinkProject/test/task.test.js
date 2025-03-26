import { expect } from '@jest/globals'; // ใช้ expect ของ Jest
import fs from 'fs';
import Task from './task';  // เปลี่ยนเป็น path ที่ถูกต้อง
import LinkedList from './linkedList';  // เปลี่ยนเป็น path ที่ถูกต้อง

// สร้าง mock ของ task
const mockTask = {
    name: 'Test Task',
    description: 'Test Description',
    priority: 1,
    username: 'testuser',
    imageUrl: null
};

// Mocking fs module
jest.mock('fs');

describe('Task Class', () => {
    let taskInstance;

    beforeEach(() => {
        taskInstance = new Task();
    });

    describe('addTask()', () => {
        it('should add a task to the list', () => {
            taskInstance.addTask(mockTask);
            expect(taskInstance.getAllTasks()).toHaveLength(1);
        });
    });

    describe('getAllTasks()', () => {
        it('should return encrypted tasks', () => {
            taskInstance.addTask(mockTask);
            const tasks = taskInstance.getAllTasks();
            expect(tasks[0].username).not.toEqual(mockTask.username); // คาดว่า username ถูกเข้ารหัสแล้ว
        });
    });

    describe('summarizeByPriority()', () => {
        it('should summarize tasks by priority', () => {
            taskInstance.addTask(mockTask);
            const summary = taskInstance.summarizeByPriority();
            expect(summary[mockTask.priority]).toBe(1);
        });
    });

    describe('sortByPriority()', () => {
        it('should sort tasks by priority', () => {
            taskInstance.addTask({ name: 'Task A', priority: 2 });
            taskInstance.addTask({ name: 'Task B', priority: 1 });

            const sortedTasks = taskInstance.sortByPriority();
            expect(sortedTasks[0].priority).toBe(1);
            expect(sortedTasks[1].priority).toBe(2);
        });
    });

    describe('searchByName()', () => {
        it('should return tasks matching search query', () => {
            taskInstance.addTask(mockTask);
            const foundTasks = taskInstance.searchByName('test');
            expect(foundTasks).toHaveLength(1);
            expect(foundTasks[0].name).toBe(mockTask.name);
        });
    });

    describe('saveTasksToFile()', () => {
        it('should save tasks to a file', async () => {
            const filePath = './tasks.json';
            taskInstance.addTask(mockTask);
            taskInstance.saveTasksToFile(filePath);

            // Mock fs.writeFileSync for testing
            fs.writeFileSync.mockImplementation((path, data, callback) => {
                callback(null);  // Simulate successful write
            });

            // ตรวจสอบว่าไฟล์ถูกบันทึกแล้ว
            await fs.writeFileSync(filePath, JSON.stringify([mockTask], null, 2));
            expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(String), expect.any(Function));
        });
    });

    describe('loadTasksFromFile()', () => {
        it('should load tasks from a file', async () => {
            const filePath = './tasks.json';
            taskInstance.addTask(mockTask);
            taskInstance.saveTasksToFile(filePath);

            // Mock fs.readFileSync for testing
            fs.readFileSync.mockReturnValueOnce(JSON.stringify([mockTask]));  // Simulate reading from file

            // สร้าง instance ใหม่เพื่อทดสอบโหลดจากไฟล์
            const newTaskInstance = new Task();
            newTaskInstance.loadTasksFromFile(filePath);

            const tasks = newTaskInstance.getAllTasks();
            expect(tasks).toHaveLength(1);
            expect(tasks[0].name).toBe(mockTask.name);
        });
    });
});

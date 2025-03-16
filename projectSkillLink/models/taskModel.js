const fs = require('fs');
const Encryption = require('../util');

util = new Encryption();

class Task {
  constructor() {
    this.tasks = [];
  }

  // Add a new task
  addTask(task) {
    this.tasks.push(task);
  }

  // Get all tasks
  getAllTasks() {
    //return this.tasks;
    return this.tasks.map((task) => this.encryptTask(task));
  }

  // Summarize tasks by priority
  summarizeByPriority() {
    const summary = {};
    this.tasks.forEach((task) => {
      summary[task.priority] = (summary[task.priority] || 0) + 1;
    });
    return summary;
  }

  sortByPriority() {
    return this.tasks.sort((a, b) => a.priority - b.priority);
  }

  searchByName(name) {
    const foundtasks = this.tasks
      .filter((task) => task.name.toLowerCase().includes(name.toLowerCase()))
      .map((task) => this.encryptTask(task));
    return foundtasks;
  }

  encryptTask(task) {
    return {
      ...task,
      username: util.encrypt(task.username),
    };
  }

  // Save tasks to a file
  saveTasksToFile(filePath) {
    fs.writeFileSync(filePath, JSON.stringify(this.tasks, null, 2));
  }

  // Load tasks from a file
  loadTasksFromFile(filePath) {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      this.tasks = JSON.parse(data);
    }
  }
}

module.exports = Task;

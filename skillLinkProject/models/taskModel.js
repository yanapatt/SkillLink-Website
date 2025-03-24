const fs = require('fs');
const Encryption = require('../util');
const LinkedList = require('./linkedList');

util = new Encryption();

class Task {
  constructor() {
    this.tasks = new LinkedList();
  }

  // Add a new task
  addTask(task) {
    this.tasks.insertLast(task);
  }

  // Get all tasks
  getAllTasks() {
    //return this.tasks;
    const encryptedTasks = [];
    this.tasks.forEachNode((task) => {
      encryptedTasks.push(this.encryptTask(task))
    });
    return encryptedTasks;
  }

  // Summarize tasks by priority
  summarizeByPriority() {
    const summary = {};
    this.tasks.forEachNode((task) => {
      summary[task.priority] = (summary[task.priority] || 0) + 1;
    });
    return summary;
  }

  sortByPriority() {
    const sortedTasks = this.tasks.toArray().sort((a, b) => a.priority - b.priority);
    return sortedTasks.map(task => this.encryptTask(task));
  }

  searchByName(name) {
    const foundTasks = new LinkedList();
    this.tasks.forEachNode((task) => {
      if (task.name.toLowerCase().includes(name.toLowerCase())) {
        foundTasks.insertLast(task);
      }
    });
    return foundTasks.toArray().map(task => this.encryptTask(task));
  }

  searchByDescription(description) {
    const foundTasks = new LinkedList();
    this.tasks.forEachNode((task) => {
      if (task.description.toLowerCase().includes(description.toLowerCase())) {
        foundTasks.insertLast(task); 
      }
    });
    return foundTasks.toArray().map(task => this.encryptTask(task)); 
  }

  encryptTask(task) {
    return task.username
      ? { ...task, username: util.encrypt(task.username) } : task;
  }

  // Save tasks to a file
  saveTasksToFile(filePath) {
    console.log("Save to file successful!");
    console.log("Tasks Data:", this.tasks.toArray());
    fs.writeFileSync(filePath, JSON.stringify(this.tasks.toArray(), null, 2));
  }

  // Load tasks from a file
  loadTasksFromFile(filePath) {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath));
      data.forEach((task) => this.addTask(task));
    }
  }
}

module.exports = Task;

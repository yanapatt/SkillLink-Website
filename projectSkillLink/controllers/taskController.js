const path = require('path');
const Task = require('../models/taskModel');

// Initialize the Task model
const taskModel = new Task();
const tasksFilePath = path.join(__dirname, '../tasks.json');

// Load tasks from file on app start
taskModel.loadTasksFromFile(tasksFilePath);

exports.deleteMultipleTasks = (req, res) => {
  const { taskNames } = req.body; // Array of task names to delete
  taskModel.tasks = taskModel.tasks.filter((task) => !taskNames.includes(task.name));
  taskModel.saveTasksToFile(tasksFilePath);
  res.redirect('/');
};


// Controller functions
exports.getTasks = (req, res) => {
  const tasks = taskModel.getAllTasks();
  const summary = taskModel.summarizeByPriority();
  res.render('index', { tasks, summary });
};

exports.addTask = (req, res) => {
  const task = {
    name: req.body.name,
    username: req.body.username,
    description: req.body.description,
    priority: req.body.priority
  };
  taskModel.addTask(task);
  console.log("new task has been added");
  taskModel.saveTasksToFile(tasksFilePath);
  res.redirect('/');
};

exports.viewTask = (req, res) => {
  const taskName = req.params.name;
  const task = taskModel.getAllTasks().find((task) => task.name === taskName);
  res.render('task', { task });
};

exports.deleteTask = (req, res) => {
  const taskName = req.params.name;
  taskModel.tasks = taskModel.tasks.filter((task) => task.name !== taskName);
  taskModel.saveTasksToFile(tasksFilePath);
  res.redirect('/');
};

exports.sortTasksByPriority = (req, res) => {
  const sortedTasks = taskModel.sortByPriority();
  const summary = taskModel.summarizeByPriority();
  res.render('index', { tasks: sortedTasks, summary });
};

exports.searchTasksByName = (req, res) => {
  const { searchName } = req.body;
  const foundTasks = taskModel.searchByName(searchName);
  const summary = taskModel.summarizeByPriority(foundTasks);
  res.render('index', { tasks: foundTasks, summary });
};



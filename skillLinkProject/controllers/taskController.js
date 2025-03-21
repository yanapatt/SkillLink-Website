const path = require('path');
const Task = require('../models/taskModel');
const LinkedList = require('../models/linkedList');
const multer = require('multer');

// Initialize the Task model
const taskModel = new Task();
const tasksFilePath = path.join(__dirname, '../tasks.json');

const upload = multer({ dest: 'uploads/' });

function convertImageToBase64(imgPath) {
  const image = fs.readFileSync(imgath);
  return image.toSrting('base64');
}

// Load tasks from file on app start
taskModel.loadTasksFromFile(tasksFilePath);

exports.deleteMultipleTasks = (req, res) => {
  let { taskNames, priority, action } = req.body; // Array of task names to delete

  if (action === 'removeByPriority') {
    // ลบ task ตาม Priority ที่เลือก
    const taskArray = taskModel.tasks.toArray(); // แปลงเป็น Array ก่อน
    const filteredTasks = taskArray.filter((task) => task.priority != priority);

    taskModel.tasks = new LinkedList();
    filteredTasks.forEach((task) => taskModel.tasks.insertLast(task)); // เพิ่มงานที่เหลือกลับเข้าไป
  }

  if (taskNames) {
    taskNames = Array.isArray(taskNames) ? taskNames : [taskNames];
    taskNames.forEach((name) => {
      taskModel.tasks.removeByName(name);
    });
  }

  taskModel.saveTasksToFile(tasksFilePath);
  console.log(taskModel.tasks.getSize());
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

  if (req.file) {
    const imgPath = req.file.path;

  }
  taskModel.addTask(task);
  console.log("New task has been added");
  taskModel.saveTasksToFile(tasksFilePath);
  console.log(taskModel.tasks.getSize());
  res.redirect('/');
};

exports.viewTask = (req, res) => {
  const taskName = req.params.name;
  const task = taskModel.getAllTasks().find((task) => task.name === taskName);
  res.render('task', { task });
};

exports.deleteTask = (req, res) => {
  const taskName = req.params.name;
  taskModel.tasks.removeByName(taskName);
  taskModel.saveTasksToFile(tasksFilePath);
  console.log(taskModel.tasks.getSize());
  res.redirect('/');
};

exports.sortTasksByPriority = (req, res) => {
  const sortedTasks = taskModel.sortByPriority();
  const summary = taskModel.summarizeByPriority();
  res.render('index', { tasks: sortedTasks, summary });
};

exports.searchTasksByName = (req, res) => {
  const { searchName } = req.body;
  const foundTasksLinkedList = taskModel.searchByName(searchName);

  // ตรวจสอบก่อนว่าเป็น LinkedList หรือ Array
  let foundTasks;
  if (foundTasksLinkedList instanceof LinkedList) {
    foundTasks = foundTasksLinkedList.toArray(); // ถ้าเป็น LinkedList ให้แปลงเป็น Array
  } else {
    foundTasks = foundTasksLinkedList; // ถ้าเป็น Array อยู่แล้ว ใช้เลย
  }

  const summary = taskModel.summarizeByPriority();
  res.render('index', { tasks: foundTasks, summary });
};

exports.deleteOldestTask = (req, res) => {
  if (taskModel.tasks.getSize() > 0) {  // ตรวจสอบว่ามี task ใน LinkedList หรือไม่
    taskModel.tasks.removeFirst();  // ลบงานแรก
    taskModel.saveTasksToFile(tasksFilePath);  // บันทึกการเปลี่ยนแปลง
    console.log("First task has been removed");  // ตรวจสอบว่าได้ลบหรือไม่
  } else {
    console.log("No tasks to remove");  // ถ้าไม่มีงานใน LinkedList
  }
  console.log(taskModel.tasks.getSize());
  res.redirect('/');  // เปลี่ยนเส้นทางไปยังหน้าหลัก
};

exports.deleteNewestTask = (req, res) => {
//TODO
};





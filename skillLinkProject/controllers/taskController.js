const fs = require('fs');
const path = require('path');
const Task = require('../models/taskModel');
const LinkedList = require('../models/linkedList');
const multer = require('multer');

// Initialize the Task model
const taskModel = new Task();
const tasksFilePath = path.join(__dirname, '../tasks.json');

// Load tasks from file on app start
taskModel.loadTasksFromFile(tasksFilePath);

const uploadsDir = path.resolve(__dirname, '../uploads');

// ตรวจสอบว่าโฟลเดอร์ 'uploads' มีอยู่แล้วหรือไม่
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);  // สร้างโฟลเดอร์ถ้ายังไม่มี
}

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // เก็บไฟล์ในโฟลเดอร์ uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // ตั้งชื่อไฟล์ใหม่
  }
});

const upload = multer({ storage: storage });

// ฟังก์ชัน addTask ที่ใช้ multer เพื่อจัดการไฟล์และข้อมูลที่ส่งมาในฟอร์ม
exports.addTask = [upload.single('image'), (req, res) => {
  // เช็คว่ามีข้อมูลในฟอร์มหรือไม่
  const task = {
    name: req.body.name,
    username: req.body.username,
    description: req.body.description,
    priority: req.body.priority
  };

  // เช็คว่าไฟล์มีหรือไม่
  if (req.file) {
    task.imageUrl = `/uploads/${req.file.filename}`;  // บันทึกรูปภาพที่อัพโหลด
  }

  // เพิ่ม task ลงในฐานข้อมูล
  taskModel.addTask(task);
  console.log("New task has been added");

  // บันทึก task ลงในไฟล์ JSON
  const tasksFilePath = path.join(__dirname, '../tasks.json');
  taskModel.saveTasksToFile(tasksFilePath);

  res.redirect('/');
}];

exports.deleteMultipleTasks = (req, res) => {
  let { taskNames, priority, action } = req.body; // Array of task names to delete

  if (action === 'removeByPriority') {
    // ลบ task ตาม Priority ที่เลือก
    const taskArray = taskModel.tasks.toArray(); // แปลงเป็น Array ก่อน
    const tasksToRemove = taskArray.filter((task) => task.priority === priority);  // หา task ที่ตรงกับ priority ที่เลือก

    // ลบไฟล์ภาพที่เกี่ยวข้องกับ task ที่จะถูกลบ
    tasksToRemove.forEach((task) => {
      if (task.imageUrl) {
        const imagePath = path.join(__dirname, '..', task.imageUrl);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log('Error deleting image:', err);
          } else {
            console.log(`Image for task "${task.name}" deleted`);
          }
        });
      }
    });

    // กรอง task ที่ไม่ตรงกับ priority ที่เลือกออกมา และเพิ่มกลับเข้าไปใน LinkedList
    const filteredTasks = taskArray.filter((task) => task.priority !== priority);

    taskModel.tasks = new LinkedList();  // สร้าง LinkedList ใหม่
    filteredTasks.forEach((task) => taskModel.tasks.insertLast(task));  // เพิ่ม task ที่เหลือกลับเข้าไป
  }

  if (taskNames) {
    taskNames = Array.isArray(taskNames) ? taskNames : [taskNames];
    taskNames.forEach((name) => {
      // ก่อนลบ task, ต้องค้นหาว่ามี imageUrl หรือไม่ใน task ที่ชื่อ `name`
      const task = taskModel.tasks.toArray().find(task => task.name === name);

      if (task && task.imageUrl) {
        // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
        const imagePath = path.join(__dirname, '..', task.imageUrl);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log('Error deleting image:', err);
          } else {
            console.log(`Image for task "${name}" deleted`);
          }
        });
      }

      // ลบ task จาก LinkedList
      taskModel.tasks.removeByName(name);
    });
  }

  // บันทึกการเปลี่ยนแปลงลงในไฟล์ tasks.json
  taskModel.saveTasksToFile(tasksFilePath);
  console.log(taskModel.tasks.getSize());
  res.redirect('/');  // เปลี่ยนเส้นทางไปยังหน้าหลัก
};

// Controller functions
exports.getTasks = (req, res) => {
  const tasks = taskModel.getAllTasks();
  const summary = taskModel.summarizeByPriority();
  res.render('index', { tasks, summary });
};

exports.viewTask = (req, res) => {
  const taskName = req.params.name;
  const task = taskModel.getAllTasks().find((task) => task.name === taskName);
  res.render('task', { task });
};

exports.deleteTask = (req, res) => {
  const taskName = req.params.name;

  // ค้นหา task ที่ตรงกับชื่อที่รับมา
  const task = taskModel.tasks.toArray().find(task => task.name === taskName);

  if (task && task.imageUrl) {
    // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
    const imagePath = path.join(__dirname, '..', task.imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.log('Error deleting image:', err);
      } else {
        console.log(`Image for task "${taskName}" deleted`);
      }
    });
  }

  // ลบ task จาก LinkedList
  taskModel.tasks.removeByName(taskName);

  // บันทึกการเปลี่ยนแปลงลงในไฟล์ tasks.json
  taskModel.saveTasksToFile(tasksFilePath);
  console.log(taskModel.tasks.getSize());

  // เปลี่ยนเส้นทางไปยังหน้าหลัก
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

// ฟังก์ชันในการลบงานแรก (Oldest Task)
exports.deleteOldestTask = (req, res) => {
  if (taskModel.tasks.getSize() > 0) {  // ตรวจสอบว่ามี task ใน LinkedList หรือไม่
    const task = taskModel.tasks.toArray()[0];  // หางานแรก
    if (task && task.imageUrl) {
      // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
      const imagePath = path.join(__dirname, '..', task.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log('Error deleting image:', err);
        } else {
          console.log(`Image for task "${task.name}" deleted`);
        }
      });
    }

    // ลบงานแรกจาก LinkedList
    taskModel.tasks.removeFirst();
    taskModel.saveTasksToFile(tasksFilePath);  // บันทึกการเปลี่ยนแปลง
    console.log("First task has been removed");
  } else {
    console.log("No tasks to remove");  // ถ้าไม่มีงานใน LinkedList
  }

  console.log(taskModel.tasks.getSize());
  res.redirect('/');  // เปลี่ยนเส้นทางไปยังหน้าหลัก
};

// ฟังก์ชันในการลบงานล่าสุด (Last Task)
exports.deleteNewestTask = (req, res) => {
  if (taskModel.tasks.getSize() > 0) {  // ตรวจสอบว่ามี task ใน LinkedList หรือไม่
    const task = taskModel.tasks.toArray().slice(-1)[0];  // หางานล่าสุด (Last task)
    if (task && task.imageUrl) {
      // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
      const imagePath = path.join(__dirname, '..', task.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log('Error deleting image:', err);
        } else {
          console.log(`Image for task "${task.name}" deleted`);
        }
      });
    }

    // ลบงานล่าสุดจาก LinkedList
    taskModel.tasks.removeLast();
    taskModel.saveTasksToFile(tasksFilePath);  // บันทึกการเปลี่ยนแปลง
    console.log("Last task has been removed");
  } else {
    console.log("No tasks to remove");  // ถ้าไม่มีงานใน LinkedList
  }

  console.log(taskModel.tasks.getSize());
  res.redirect('/');  // เปลี่ยนเส้นทางไปยังหน้าหลัก
};





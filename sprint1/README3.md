# **SkillLink**

## **จัดทำโดย**

นายพสุนธรา แป้นไผ่ รหัสนิสิต 66102010147

นายญาณภัทร ปานเกษม รหัสนิสิต 66102010236

นายแอนดี้ ทองขลิบ รหัสนิสิต 66102010247

## **เสนอ**

ผู้ช่วยศาสตราจารย์ ดร. วีรยุทธ เจริญเรืองกิจ

## **กลุ่ม**

hunza

โครงงานนี้เป็นส่วนหนึ่งของการศึกษารายวิชา คพ252 วิศวกรรมซอฟต์แวร์ มหาวิทยาลัยศรีนครินทรวิโรฒ ภาคการศึกษาที่ 2 ปีการศึกษา 2567

## **Update Requirement**
**Use Case Diagram**

:::mermaid
graph LR;
    User --> A[Login]
    User --> B[View Posts and Rating]
    User --> C[Create Posts]
    User --> D[Manage own post]

    Admin --> E[Login]
    Admin --> F[Manage all posts]
:::

**คำอธิบาย**

**ผู้ใช้ทั่วไป จะสามารถ**
1.  ล็อคอินเข้าสู่ระบบ ในฐานะ User
2.  ดูและให้คะแนน Ratting โพสต์คนอื่นได้
3.  โพสต์รูปภาพและเขียนรายละเอียดเกี่ยวกับโพสต์ของตนเองได้
4.  แก้ไขได้เฉพาะโพสต์ตัวเองเท่านั้น

**อาสาสมัค จะสามารถ**
1.  ล็อคอินเข้าสู่ระบบ ในฐานะ Admin
2.  จ้ดการโพสต์ทั้งหมดในเว๊ปไซต์ได้

**Functional Requirement**
1.  ปรับแต่ง UI หรือแก้ไขเว็บไซต์เพื่อวัตถุประสงค์อื่นโดยใช้โครงสร้างเดิม ของ taskdemo
2.  เพิ่ม function search: สำหรับค้นหา by "title" โดยต้องใช้การค้นหาเชิงเส้น (Linear Search) โดยทำการวนลูปผ่านโครงสร้างข้อมูล
3.  เพิ่ม function คำนวณค่าต่อไปนี้ของ Priority (หรือค่าที่คุณใช้ เช่น rating) และ แสดงผล
4.  Improve the performance of the website
5.  Create button to remove the task with a given priority
6.  Create button to remove the oldest task (first task in the linkedlist)
7.  Create button to remove the newest task (last task in the linkedlist)
8.  ผู้ใช้ทั่วไปต้องสามารถโหวตคะแนน Rating บนโพสต์ของคนอื่น เพื่อที่ฉันจะได้ตรวจสอบความน่าเชื่อถือโพสต์นั้น ๆ ได้
9.  เว็ปไซต์ต้องมีระบบจัดอันดับโพสต์ที่ได้รับความนิยมและน่าเชื่อถือแสดงอยู่บนหน้าจอในลำดับต้น ๆ เพื่อให้ผู้ใช้ทั่วไปเห็นได้อย่างชัดเจน
10. เว๊ปไซต์ต้องมีช่องทางในการโพสต์ข้อความและรูปภาพ เพื่อให้ผู้ใช้ทั่วไปสามารถโพสต์ขอความช่วยเหลือจากคนอื่นได้

**Non Functional Requirement**
1.  ผู้ใช้ต้องการเห็นหน้าตา UI ของเว๊ปไซต์ที่สวยงาม และมีประสบการณ์ใช้งานเว๊บไซต์ที่ดี UX
2.  เว๊บไซต์ต้องมีความใช้งานง่าย เหมาะสมกับทุกเพศทุกวัย
3.  เว๊บไซต์ต้องมีความเสถียร ตอบสนองได้อย่างรวดเร็ว


## **Unit Test**

**Test Case Table Description**

**Linked List**

| **Test Suite**         | **Describe**                   | **Test Unit**                                                                 | **Description**                                                                                     |
|-------------------------|--------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| linkedList.test.js    | `LinkedList`                  | `should add a node at the beginning of the LinkedList`                     | ตรวจสอบการเพิ่ม Node ที่จุดเริ่มต้นของ LinkedList                                                 |
| linkedList.test.js    | `LinkedList`                  | `should add a node at the end of the LinkedList`                           | ตรวจสอบการเพิ่ม Node ที่จุดท้ายของ LinkedList                                                      |
| linkedList.test.js    | `LinkedList`                  | `should remove a node with the specified postTitle`                        | ตรวจสอบการลบ Node ที่มี `postTitle` ตรงกับค่าที่กำหนด                                              |
| linkedList.test.js    | `LinkedList`                  | `should log a message when the specified postTitle is not found`           | ตรวจสอบการแสดงข้อความแจ้งเตือนเมื่อไม่พบ Node ที่ต้องการลบ                                          |
| linkedList.test.js    | `LinkedList`                  | `should do nothing when LinkedList is empty`                               | ตรวจสอบว่าไม่มีการเปลี่ยนแปลงเมื่อ LinkedList ว่างเปล่า                                            |
| linkedList.test.js    | `LinkedList`                  | `should remove the only node when LinkedList has one node`                 | ตรวจสอบการลบ Node เดียวเมื่อ LinkedList มีเพียง 1 Node                                             |
| linkedList.test.js    | `LinkedList`                  | `should remove the first node when LinkedList has multiple nodes`          | ตรวจสอบการลบ Node แรกเมื่อ LinkedList มีหลาย Node                                                 |
| linkedList.test.js    | `LinkedList`                  | `should remove the last node when LinkedList has multiple nodes`           | ตรวจสอบการลบ Node สุดท้ายเมื่อ LinkedList มีหลาย Node                                              |
| linkedList.test.js    | `LinkedList`                  | `should skip nodes with null or undefined values`                          | ตรวจสอบการข้าม Node ที่มีค่า `null` หรือ `undefined`                                               |
| linkedList.test.js    | `LinkedList`                  | `should return an empty array when LinkedList is empty`                    | ตรวจสอบการคืนค่า Array ว่างเมื่อ LinkedList ว่างเปล่า                                              |
| linkedList.test.js    | `LinkedList`                  | `should convert the LinkedList to an array`                                | ตรวจสอบการแปลง LinkedList เป็น Array                                                               |
| linkedList.test.js    | `LinkedList`                  | `should return the size of the LinkedList`                                 | ตรวจสอบการคืนค่าขนาดของ LinkedList                                                                 |
| linkedList.test.js    | `LinkedList`                  | `should return true when the LinkedList is empty`                          | ตรวจสอบการคืนค่า `true` เมื่อ LinkedList ว่างเปล่า                                                 |
| linkedList.test.js    | `LinkedList`                  | `should return false when the LinkedList has nodes`                        | ตรวจสอบการคืนค่า `false` เมื่อ LinkedList มี Node                                                  |
| linkedList.test.js    | `LinkedList`                  | `should apply the callback to each node and return a new array`            | ตรวจสอบการแปลงค่าของแต่ละ Node และคืนค่าเป็น Array ใหม่                                             |
| linkedList.test.js    | `LinkedList`                  | `should remove a node in the middle of the LinkedList`                     | ตรวจสอบการลบ Node ตรงกลางของ LinkedList                                                           |
| linkedList.test.js    | `LinkedList`                  | `should update the tail when the last node is removed`                     | ตรวจสอบการอัปเดต tail เมื่อ Node สุดท้ายถูกลบ                                                     |
| linkedList.test.js    | `LinkedList`                  | `should handle errors in the callback function gracefully`                 | ตรวจสอบการจัดการข้อผิดพลาดใน callback function                                                    |
| linkedList.test.js    | `LinkedList`                  | `should update the tail correctly after removing the last node`            | ตรวจสอบการอัปเดต tail อย่างถูกต้องหลังจากลบ Node สุดท้าย                                           |

**Post Repository**
| **Test Suite**         | **Describe**                   | **Test Unit**                                                                 | **Description**                                                                                     |
|-------------------------|--------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| postRepository.test.js | `PostRepository - alreadyExistence` | `should create the directory if it does not exist`                         | ตรวจสอบว่าฟังก์ชันสร้างโฟลเดอร์ใหม่เมื่อโฟลเดอร์ยังไม่มีอยู่                                       |
| postRepository.test.js | `PostRepository - alreadyExistence` | `should not create the directory if it already exists`                     | ตรวจสอบว่าฟังก์ชันไม่สร้างโฟลเดอร์ใหม่เมื่อโฟลเดอร์มีอยู่แล้ว                                      |
| postRepository.test.js | `PostRepository - saveToFile` | `should save posts to a file`                                              | ตรวจสอบว่าฟังก์ชันบันทึกโพสต์ลงในไฟล์ JSON อย่างถูกต้อง                                            |
| postRepository.test.js | `PostRepository - saveToFile` | `should handle errors during saving`                                       | ตรวจสอบการจัดการข้อผิดพลาดระหว่างการบันทึกโพสต์ลงไฟล์                                              |
| postRepository.test.js | `PostRepository - loadFromFile` | `should load posts from a file`                                            | ตรวจสอบว่าฟังก์ชันโหลดโพสต์จากไฟล์ JSON และเพิ่มลงใน LinkedList อย่างถูกต้อง                        |
| postRepository.test.js | `PostRepository - loadFromFile` | `should handle errors during loading`                                      | ตรวจสอบการจัดการข้อผิดพลาดระหว่างการโหลดโพสต์จากไฟล์                                                |
| postRepository.test.js | `PostRepository - updatePost` | `should update an existing post's description`                             | ตรวจสอบการอัปเดตคำอธิบายของโพสต์ที่มีอยู่                                                          |
| postRepository.test.js | `PostRepository - updatePost` | `should update an existing post's image URL`                               | ตรวจสอบการอัปเดต URL รูปภาพของโพสต์ที่มีอยู่                                                       |
| postRepository.test.js | `PostRepository - updatePost` | `should update both description and image URL`                             | ตรวจสอบการอัปเดตทั้งคำอธิบายและ URL รูปภาพของโพสต์                                                 |
| postRepository.test.js | `PostRepository - updatePost` | `should return an error if the post does not exist`                        | ตรวจสอบการคืนค่าข้อผิดพลาดเมื่อไม่พบโพสต์ที่ต้องการอัปเดต                                           |
| postRepository.test.js | `PostRepository - updatePost` | `should log an error and return failure if an exception occurs`            | ตรวจสอบการจัดการข้อผิดพลาดเมื่อเกิดข้อยกเว้นระหว่างการอัปเดตโพสต์                                  |
| postRepository.test.js | `PostRepository - retrieveByPostTitle` | `should retrieve a post by its title`                                      | ตรวจสอบการดึงโพสต์ตามชื่อที่ระบุ                                                                    |
| postRepository.test.js | `PostRepository - retrieveByPostTitle` | `should return null if the post is not found`                              | ตรวจสอบการคืนค่า `null` เมื่อไม่พบโพสต์ที่ตรงกับชื่อ                                                |
| postRepository.test.js | `PostRepository - insertPosts` | `should insert a new post if it does not already exist`                    | ตรวจสอบการเพิ่มโพสต์ใหม่ลงใน LinkedList เมื่อโพสต์นั้นยังไม่มีอยู่                                   |
| postRepository.test.js | `PostRepository - insertPosts` | `should not insert a post if it already exists`                            | ตรวจสอบการไม่เพิ่มโพสต์ที่มีชื่อซ้ำใน LinkedList                                                    |
| postRepository.test.js | `PostRepository - insertPosts` | `should log an error if a post with the same title already exists`         | ตรวจสอบการแสดงข้อความข้อผิดพลาดเมื่อมีโพสต์ที่มีชื่อซ้ำอยู่แล้ว                                    |
| postRepository.test.js | `PostRepository - removePosts` | `should remove a post by its title`                                        | ตรวจสอบการลบโพสต์ตามชื่อที่ระบุ                                                                     |
| postRepository.test.js | `PostRepository - removePosts` | `should log a message if no posts are available to remove`                 | ตรวจสอบการแสดงข้อความเมื่อไม่มีโพสต์ให้ลบ                                                          |
| postRepository.test.js | `PostRepository - removeFirst` | `should remove the first post`                                             | ตรวจสอบการลบโพสต์แรกใน LinkedList                                                                  |
| postRepository.test.js | `PostRepository - removeFirst` | `should log a message and return failure if no posts are available to remove` | ตรวจสอบการแสดงข้อความและคืนค่าความล้มเหลวเมื่อไม่มีโพสต์ให้ลบ                                      |
| postRepository.test.js | `PostRepository - removeLast` | `should remove the last post`                                              | ตรวจสอบการลบโพสต์สุดท้ายใน LinkedList                                                              |
| postRepository.test.js | `PostRepository - removeLast` | `should log a message and return failure if no posts are available to remove` | ตรวจสอบการแสดงข้อความและคืนค่าความล้มเหลวเมื่อไม่มีโพสต์ให้ลบ                                      |





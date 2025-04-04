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

**แอดมิน จะสามารถ**
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

## **อธิบายการทำงานของ Data Structure**

:::mermaid
classDiagram
    class Node {
        -value
        -next
        +constructor(value)
    }

    class LinkedList {
        -head
        -tail
        -size
        +constructor()
        +getSize() int
        +isEmpty() boolean
        +toArray() Array
        +map(callback) Array
        +insertFirst(value) void
        +insertLast(value) void
        +removeFirst() void
        +removeLast() void
        +removeByPostTitle(postTitle) void
        +forEachNode(callback) void
    }

    LinkedList --> Node : uses

:::

เราได้ใช้ Linked List Data Structure เป็นระบบเบื้องหลังในการทำงานของฟังก์ชันต่าง ๆ บนเว๊ปไซต์ ประกอบไปด้วย Node ซึ่งทำหน้าที่เก็บค่าของข้อมูล และ Pointer ที่ชี้ไปยัง Node ถัดไป โดย Head จะชี้ไปที่ Node แรก Tail จะชี้ไปที่ Node สุดท้าย และ Size ที่บอกขนาดของ Linked List การเพิ่มข้อมูลจึงมี 2 รูปแบบ คือ insertFirst คือการเพิ่มข้อมูลที่ตำแหน่งแรกสุดของ LinkedList และ insertLast คือการเพิ่มข้อมูลที่ตำแหน่งท้ายสุดของ LinkedList ต่อมาคือการลบข้อมูลซึ่งมีอยู่ด้วยกัน 3 รูปแบบได้แก่ removeFirst ลบข้อมูลแรกสุด removeLast ลบข้อมูลตัวสุดท้าย และ removeByTitle ลบข้อมูลตามชื่อที่ระบุ นอกจากนี้ยังมี getSize ในการเข้าถึงขนาดของ LinkedList isEmpty ในการเช็คว่า LinkedList นั้นมีข้อมูลหรือไม่ toArray ในการแปลงข้อมูล LinkedList เป็น ArrayList map ในการ mapping ข้อมูล และ forEachNode ในการวนลูปผ่านโครงสร้างข้อมูล

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

**Image Repository**
| **Test Suite**         | **Describe**                   | **Test Unit**                                                                 | **Description**                                                                                     |
|-------------------------|--------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| imageRepository.test.js | `ImageRepository`            | `should store files in the correct directory with a unique filename`       | ตรวจสอบการจัดเก็บไฟล์ในโฟลเดอร์ที่ถูกต้องพร้อมชื่อไฟล์ที่ไม่ซ้ำกัน                                |
| imageRepository.test.js | `ImageRepository`            | `should generate a unique filename`                                        | ตรวจสอบการสร้างชื่อไฟล์ที่ไม่ซ้ำกัน                                                                 |
| imageRepository.test.js | `ImageRepository - uploadImage` | `should return a multer middleware function`                               | ตรวจสอบว่าฟังก์ชันคืนค่า middleware ของ multer                                                     |
| imageRepository.test.js | `ImageRepository - uploadImage` | `should process file upload correctly`                                     | ตรวจสอบการอัปโหลดไฟล์ผ่าน middleware                                                               |
| imageRepository.test.js | `ImageRepository - saveImageToFolder` | `should return the correct image URL when a valid file is provided`         | ตรวจสอบการคืนค่า URL ของภาพเมื่อไฟล์ที่ถูกต้องถูกส่งเข้าไป                                          |
| imageRepository.test.js | `ImageRepository - saveImageToFolder` | `should throw an error if the file is invalid`                              | ตรวจสอบการโยนข้อผิดพลาดเมื่อไฟล์ไม่ถูกต้อง                                                         |
| imageRepository.test.js | `ImageRepository - removeImageFromFolder` | `should delete the image file successfully`                                | ตรวจสอบการลบไฟล์ภาพสำเร็จ                                                                          |
| imageRepository.test.js | `ImageRepository - removeImageFromFolder` | `should handle errors during image deletion`                               | ตรวจสอบการจัดการข้อผิดพลาดระหว่างการลบไฟล์ภาพ                                                     |

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

**Post Service**

| **Test Suite**       | **Describe**                     | **Test Unit**                                                                 | **Description**                                                                                     |
|-----------------------|----------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| postService.test.js | `PostService`                  | `should format post data correctly with all fields provided`               | ตรวจสอบการจัดรูปแบบข้อมูลโพสต์เมื่อมีข้อมูลครบทุกฟิลด์                                              |
| postService.test.js | `PostService`                  | `should use default values if optional fields are missing`                 | ตรวจสอบการจัดรูปแบบข้อมูลโพสต์เมื่อไม่มีฟิลด์บางส่วน                                                |
| postService.test.js | `PostService - createPost`     | `should create a post with an image`                                       | ตรวจสอบการสร้างโพสต์พร้อมภาพ                                                                        |
| postService.test.js | `PostService - createPost`     | `should create a post without an image`                                    | ตรวจสอบการสร้างโพสต์โดยไม่มีภาพ                                                                     |
| postService.test.js | `PostService - createPost`     | `should handle errors during post creation`                                | ตรวจสอบการจัดการข้อผิดพลาดระหว่างการสร้างโพสต์                                                     |
| postService.test.js | `PostService - ratePost`       | `should update the rating for an existing user`                            | ตรวจสอบการให้คะแนนโพสต์จากผู้ใช้ที่มีอยู่                                                           |
| postService.test.js | `PostService - ratePost`       | `should add a new rating for a new user`                                   | ตรวจสอบการให้คะแนนโพสต์จากผู้ใช้ใหม่                                                                |
| postService.test.js | `PostService - ratePost`       | `should return an error if the post is not found`                          | ตรวจสอบการให้คะแนนโพสต์ที่ไม่มีอยู่ในระบบ                                                           |
| postService.test.js | `PostService - ratePost`       | `should handle errors during the update process`                           | ตรวจสอบการจัดการข้อผิดพลาดระหว่างการอัปเดตคะแนนโพสต์                                               |
| postService.test.js | `PostService - sortPostsByRating` | `should sort posts by rating in descending order`                          | ตรวจสอบการเรียงโพสต์ตามคะแนนในลำดับที่ถูกต้อง                                                      |
| postService.test.js | `PostService - sortPostsByRating` | `should return an empty array if there are no posts`                       | ตรวจสอบกรณีไม่มีโพสต์ในระบบ                                                                        |
| postService.test.js | `PostService - sortPostsByRating` | `should handle posts with the same rating`                                 | ตรวจสอบการจัดการโพสต์ที่มีคะแนนเท่ากัน                                                              |
| postService.test.js | `PostService - calculateAverageRating` | `should calculate the average rating correctly`                            | ตรวจสอบการคำนวณค่าเฉลี่ยของคะแนน                                                                    |
| postService.test.js | `PostService - calculateAverageRating` | `should return 0 if there are no ratings`                                  | ตรวจสอบการคำนวณค่าเฉลี่ยเมื่อไม่มีคะแนน                                                              |
| postService.test.js | `PostService - calculateAverageRating` | `should handle a single rating`                                            | ตรวจสอบการคำนวณค่าเฉลี่ยเมื่อมีคะแนนเพียงค่าเดียว                                                   |
| postService.test.js | `PostService - searchPosts`    | `should find posts by title`                                               | ค้นหาโพสต์ตามชื่อ                                                                                   |
| postService.test.js | `PostService - searchPosts`    | `should find posts by author`                                              | ค้นหาโพสต์ตามผู้เขียน                                                                               |
| postService.test.js | `PostService - searchPosts`    | `should return an empty array if no posts match the title`                 | ค้นหาโพสต์ที่ไม่มีชื่อที่ตรงกัน                                                                     |
| postService.test.js | `PostService - searchPosts`    | `should return an empty array if no posts match the author`                | ค้นหาโพสต์ที่ไม่มีผู้เขียนที่ตรงกัน                                                                 |
| postService.test.js | `PostService - searchPosts`    | `should log an error if the account is not found`                          | ตรวจสอบกรณีไม่พบผู้เขียนในระบบ                                                                      |
| postService.test.js | `PostService - searchPosts`    | `should log an error for an invalid search type`                           | ตรวจสอบกรณีประเภทการค้นหาไม่ถูกต้อง                                                                |
| postService.test.js | `PostService - getTopRatedPosts` | `should return the top 5 posts by rating`                                  | ตรวจสอบการดึงโพสต์ที่มีคะแนนสูงสุด 5 โพสต์                                                          |
| postService.test.js | `PostService - getTopRatedPosts` | `should return all posts if there are less than 5 posts`                   | คืนโพสต์ทั้งหมดหากมีน้อยกว่า 5 โพสต์                                                               |
| postService.test.js | `PostService - getTopRatedPosts` | `should return an empty array if there are no posts`                       | ตรวจสอบกรณีไม่มีโพสต์ในระบบ                                                                        |
| postService.test.js | `PostService - getTopRatedPosts` | `should handle posts with the same rating`                                 | ตรวจสอบกรณีโพสต์ที่มีคะแนนเท่ากัน                                                                   |
| postService.test.js | `PostService - getMyPosts`     | `should return posts for the given account ID`                             | ตรวจสอบการดึงโพสต์ตาม ID ของผู้ใช้                                                                  |
| postService.test.js | `PostService - getMyPosts`     | `should return an empty array if no posts match the account ID`            | ตรวจสอบกรณีไม่มีโพสต์ที่ตรงกับ ID ของผู้ใช้                                                         |
| postService.test.js | `PostService - getMyPosts`     | `should log an error and return an empty array if account ID is not provided` | ตรวจสอบกรณีไม่มีการส่ง accountId                                                                    |
| postService.test.js | `PostService - getPostByTitle` | `should return the post with the given title`                              | คืนโพสต์ที่ตรงกับชื่อ                                                                               |
| postService.test.js | `PostService - getPostByTitle` | `should return an error message if the post is not found`                  | ตรวจสอบกรณีไม่มีโพสต์ที่ตรงกับชื่อ                                                                  |
| postService.test.js | `PostService - getAllPosts`    | `should return all posts`                                                  | คืนโพสต์ทั้งหมดในระบบ                                                                               |
| postService.test.js | `PostService - getAllPosts`    | `should return an empty array if there are no posts`                       | ตรวจสอบกรณีไม่มีโพสต์ในระบบ                                                                        |
| postService.test.js | `PostService - updatePost`     | `should update the post description`                                       | อัปเดตคำอธิบายโพสต์                                                                                |
| postService.test.js | `PostService - updatePost`     | `should remove the image if deleteImage is true`                           | ลบภาพประกอบของโพสต์                                                                                |
| postService.test.js | `PostService - updatePost`     | `should upload a new image if provided`                                    | อัปโหลดภาพใหม่                                                                                      |
| postService.test.js | `PostService - updatePost`     | `should handle errors when removing the old image`                         | จัดการข้อผิดพลาดระหว่างการลบภาพ                                                                    |
| postService.test.js | `PostService - updatePost`     | `should handle errors when uploading a new image`                          | จัดการข้อผิดพลาดระหว่างการอัปโหลดภาพ                                                               |
| postService.test.js | `PostService - updatePost`     | `should return an error if the post is not found`                          | ตรวจสอบกรณีไม่พบโพสต์                                                                              |
| postService.test.js | `PostService - updatePost`     | `should handle errors during the update process`                           | จัดการข้อผิดพลาดระหว่างการอัปเดตโพสต์                                                              |
| postService.test.js | `PostService - removePostsByRating` | `should remove posts with rating less than or equal to the given value`    | ลบโพสต์ที่มีคะแนนน้อยกว่าหรือเท่ากับค่าที่กำหนด                                                   |
| postService.test.js | `PostService - removePostsByRating` | `should return an error if no posts match the rating criteria`             | ตรวจสอบกรณีไม่มีโพสต์ที่ตรงกับเงื่อนไข                                                             |
| postService.test.js | `PostService - removePostsByRating` | `should return an error if the rating value is invalid`                    | ตรวจสอบกรณีค่าคะแนนไม่ถูกต้อง                                                                      |
| postService.test.js | `PostService - removePostsByRating` | `should handle errors during post deletion`                                | จัดการข้อผิดพลาดระหว่างการลบโพสต์                                                                 |
| postService.test.js | `PostService - removePostsByRating` | `should handle unexpected errors gracefully`                               | จัดการข้อผิดพลาดที่ไม่คาดคิดระหว่างการลบโพสต์                                                     |
| postService.test.js | `PostService - removePostsByRating` | `should handle errors during image deletion gracefully`                    | ตรวจสอบการจัดการข้อผิดพลาดระหว่างการลบภาพ                                                          |
| postService.test.js | `PostService - removePostByTitle` | `should remove a post by title and delete its image`                       | ลบโพสต์พร้อมภาพประกอบ                                                                              |
| postService.test.js | `PostService - removePostByTitle` | `should remove a post by title without an image`                           | ลบโพสต์โดยไม่มีภาพประกอบ                                                                           |
| postService.test.js | `PostService - removePostByTitle` | `should return an error if the post is not found`                          | ตรวจสอบกรณีไม่พบโพสต์                                                                              |
| postService.test.js | `PostService - removePostByTitle` | `should handle errors during image deletion`                               | จัดการข้อผิดพลาดระหว่างการลบภาพ                                                                    |
| postService.test.js | `PostService - removePostByTitle` | `should handle errors during post deletion`                                | จัดการข้อผิดพลาดระหว่างการลบโพสต์                                                                 |
| postService.test.js | `PostService - removeMultiplePosts` | `should remove multiple posts successfully`                                | ลบโพสต์หลายรายการสำเร็จ                                                                            |
| postService.test.js | `PostService - removeMultiplePosts` | `should return an error if no posts are selected for deletion`             | ตรวจสอบกรณีไม่มีโพสต์ที่เลือกสำหรับการลบ                                                          |
| postService.test.js | `PostService - removeMultiplePosts` | `should handle errors during deletion of individual posts`                 | จัดการข้อผิดพลาดระหว่างการลบโพสต์บางรายการ                                                        |
| postService.test.js | `PostService - removeMultiplePosts` | `should handle errors gracefully when retrieving posts`                    | จัดการข้อผิดพลาดระหว่างการดึงข้อมูลโพสต์                                                          |
| postService.test.js | `PostService - removeMultiplePosts` | `should handle errors during multiple post deletion`                       | จัดการข้อผิดพลาดระหว่างที่โพสต์หลายรายการถูกลบ                                                    |
| postService.test.js | `PostService - removeFirstPost` | `should remove the first post successfully`                                | ลบโพสต์แรกสำเร็จ                                                                                   |
| postService.test.js | `PostService - removeFirstPost` | `should return an error if there are no posts to remove`                   | ตรวจสอบกรณีไม่มีโพสต์ในระบบ                                                                       |
| postService.test.js | `PostService - removeFirstPost` | `should handle errors during the removal of the first post`                | จัดการข้อผิดพลาดระหว่างการลบโพสต์แรก                                                              |
| postService.test.js | `PostService - removeLastPost` | `should remove the last post successfully`                                 | ลบโพสต์สุดท้ายสำเร็จ                                                                               |
| postService.test.js | `PostService - removeLastPost` | `should return an error if there are no posts to remove`                   | ตรวจสอบกรณีไม่มีโพสต์ในระบบ                                                                       |
| postService.test.js | `PostService - removeLastPost` | `should handle errors during the removal of the last post`                 | จัดการข้อผิดพลาดระหว่างการลบโพสต์สุดท้าย     


**AccountRepository**

| **Test Suite**       | **Describe**                     | **Test Unit**                                                                 | **Description**                                                                                     |
|-----------------------|----------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| accountRepository.test.js| `accountRepository -  alreadyExistence`                  | `should create directory if it does not exist`                 |  ควรสร้าง directory ถ้าไม่มีอยู่    
| accountRepository.test.js| `accountRepository -  alreadyExistence`                  | `should not create directory if it already exists`                 | ควรไม่สร้าง directory ถ้ามีอยู่แล้ว 
| accountRepository.test.js| `accountRepository -  saveToFile`                  | ` should save accounts to file`| สามารถบันทึกข้อมูลบัญชีลงในไฟล์ได้อย่างถูกต้อง โดยการตรวจสอบว่า fs.writeFileSync()และ fs.renameSync()ถูกเรียกใช้เพื่อบันทึกไฟล์ในตำแหน่งที่ถูกต้อง|
| accountRepository.test.js| `accountRepository -  saveToFile`                  | `should return if accounts.json does not exist`| ควรไม่ทำอะไรถ้าไฟล์ accounts.json ไม่มีอยู่|
| accountRepository.test.js| `accountRepository -  saveToFile`                  | `should return if accounts.json is empty`| ควรไม่ทำอะไรถ้าไฟล์ accounts.json ว่างเปล่า|
| accountRepository.test.js| `accountRepository -  retrieveAllAccounts`|` should retrieve all accounts`| ตรวจสอบว่า ฟังก์ชัน retrieveAllAccounts() ตรวจสอบว่า ฟังก์ชัน retrieveAllAccounts() สามารถดึงข้อมูลบัญชีทั้งหมดได้อย่างถูกต้องจาก LinkedList และคืนค่าข้อมูลที่ถูกต้องในรูปแบบอาร์เรย์|
| accountRepository.test.js| `accountRepository -retrieveAccountById`|` should retrieve account by ID`| ตรวจสอบว่า ฟังก์ชัน retrieveAllAccounts() ตรวจสอบว่า ฟังก์ชัน retrieveAccountById()ในคลาส AccountRepository สามารถดึงข้อมูลบัญชีที่มีaccIdตรงกับค่าที่ส่งเข้ามาได้อย่างถูกต้อง โดยต้องตรวจสอบว่า ฟังก์ชัน forEachNode() ถูกเรียก และข้อมูลที่ดึงออกมาตรงกับข้อมูลที่คาดหวัง|
| accountRepository.test.js| `accountRepository -retrieveAccountById`|` should throw an error if account ID is missing`| ควรโยนข้อผิดพลาดหากไม่มี Account ID|
| accountRepository.test.js| `accountRepository -retrieveAccountByUsername`| `should retrieve account by username`| ตรวจสอบว่า ฟังก์ชัน forEachNode() ถูกเรียก และข้อมูลที่ดึงออกมาตรงกับข้อมูลที่คาดหวัง|
| accountRepository.test.js| `accountRepository - loadFromFile`                  | `should load accounts from file`| ตรวจสอบว่า ฟังก์ชัน loadFromFile() ทำงานถูกต้องหรือไม่|
| accountRepository.test.js| `accountRepository - loadFromFile`                  | `should log error if loadFromFile fails`|ตรวจสอบว่าเมื่อ directory ไม่มีอยู่จริงแล้วฟังก์ชันalreadyExistence()จะสร้าง directoryขึ้นมาหรือไม่ซึ่งจะทำการทดสอบโดยการ mock ฟังก์ชันfs.existsSync และfs.mkdirSyncให้ทำงานตามที่ต้องการ|
| accountRepository.test.js| `accountRepository -  insertAccounts`                  | `should insert an account if it does not already exist`| Test: ควร insert บัญชีใหม่ถ้ายังไม่มีในระบบ|
| accountRepository.test.js| `accountRepository -  insertAccounts`                  | `should not insert account if it already exists`| Test: ควรไม่ insert ข้อมูลถ้าบัญชีมีอยู่แล้ว|

**AccountService**

| **Test Suite**       | **Describe**                     | **Test Unit**                                                                 | **Description**                                                                                     |
|-----------------------|----------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| accountService.test.js| `accountService-createAccount`                  | `should create an account successfully`|ควรสร้างบัญชีสำเร็จ|
| accountService.test.js| `accountService-createAccount`                  | `should return null when required fields are missing`|ควรส่งคืนค่า null เมื่อฟิลด์ที่จำเป็นหายไป|
| accountService.test.js| `accountService- authenticateAccount`                  | `should authenticate account with valid credentials`|ควรตรวจสอบบัญชีด้วยข้อมูลประจำตัวที่ถูกต้อง|
| accountService.test.js| `accountService- authenticateAccount`                  | `should return null for incorrect password`|ควรส่งคืนค่า null สำหรับรหัสผ่านที่ไม่ถูกต้อง|
| accountService.test.js| `accountService- authenticateAccount`                  | `should return null if account does not exist`|ควรส่งคืนค่า null ถ้าบัญชีไม่มีอยู่|
| accountService.test.js| `accountService-getAllEncryptAccounts`                  | `should return all accounts with masked passwords`|ควรคืนบัญชีทั้งหมดที่มีรหัสผ่านที่ถูกปกปิด|

## **Test coverage**
รายงานผลการทดสอบที่ได้ ภาพบางส่วน
 
![image.png](/.attachments/image-f8d393ce-9673-4cc5-bc75-92df1d306044.png)

![image.png](/.attachments/image-3baeab8a-98a6-4730-9fe1-19affaa71db4.png)

![image.png](/.attachments/image-1ac89adf-134d-49b4-894e-1309c99b3a09.png)

## **Grunt Test**

![image.png](/.attachments/image-12ba3b6a-a7f1-46fc-b4e1-146a8647356d.png)

![image.png](/.attachments/image-576ad9ef-a40d-4def-ab32-e441604e69b1.png)

## **ตัวอย่าง Test Case Code**                                     

### **linkedList.test.js**

![image.png](/.attachments/image-047d2dbb-7f04-40bc-8235-32be87d8b25e.png)

![image.png](/.attachments/image-4830628c-d654-4e14-a3bf-d69dda4ca731.png)

### **ImageRepository.test.js**
![image.png](/.attachments/image-cec3f244-041e-4330-97ad-c3e967098304.png)

![image.png](/.attachments/image-478149fa-39e0-4368-9638-3edc5570daeb.png)

### **postRepository.test.js**

![image.png](/.attachments/image-67e8b6c0-88bb-4463-a199-b28b0a7e3e26.png)

![image.png](/.attachments/image-1e41d694-2bf2-4f7b-a2ee-0d1323d0ad7a.png)

### **postService.test.js**

![image.png](/.attachments/image-e65c33e2-226e-4bdd-9d65-bdf2b2fe735c.png)

![image.png](/.attachments/image-7b1deb90-8d82-4662-8b17-b076f36800bf.png)

### **accountRepository.test.js**
![image.png](/.attachments/image-31bf95c6-1809-42dd-9372-5bcfa202d491.png)
![image.png](/.attachments/image-cca981f9-f8a4-4d4a-8b4c-1dbd470a27f0.png)
![image.png](/.attachments/image-d926b441-d556-49dd-9c35-7dbda060f080.png)
![image.png](/.attachments/image-e40c83d9-f9b6-46f6-9c20-c0acfb88e86c.png)
![image.png](/.attachments/image-d54209cd-80f2-40a9-bf5a-7e06c0d5bc1c.png)

### **accountService.test.js**
![image.png](/.attachments/image-f28342e8-db38-4678-9384-058012ad1bc8.png)
![image.png](/.attachments/image-66b32ea7-d373-41f1-9f15-db08b670bde8.png)
![image.png](/.attachments/image-349db7ad-5baa-4d8a-9fff-0e0445c188f6.png)


## **Static profiling**
**Screenshort**

![image.png](/.attachments/image-955830b3-88f6-4b53-952e-758c6234d50f.png)

![image.png](/.attachments/image-31a46d18-b55e-4c71-9abd-ef512decde6e.png)

**ข้อสรุปโดยภาพรวม**

![image.png](/.attachments/image-b59bb16f-14e5-44da-a9c3-65e8fb67e365.png)

- จำหวนโค๊ดในโฟล์เดอร์ Models มีทั้งสิ้น 906 บรรทัด และมีจำนวนบรรทัดโดยเฉลี่ย 151 บรรทัด
- มีค่าการบำรุงรักษาโดยเฉลี่ย 70.41 ถือว่าอยู่ในระดับปานกลาง

**ค่าการบำรุงรักษา**

![image.png](/.attachments/image-17288b5e-fadd-414d-b1df-41bc876bc371.png)

จะเห็นได้ว่า imageRepository มีค่าการบำรุงรักษาสูงที่สุดอยู่ 75.93 ลองลงมาคือ accountRepository, accountService, linkedList, postRepository และ postService โดยมีค่า 74.62, 68.83, 68.73, 68.6 และ 65.78 ตามลำดับ

**จำนวนบรรทัดของโค๊ด**
![image.png](/.attachments/image-f18a0a2b-0daf-46fe-bba3-7721284ca8bd.png)

จะเห็นได้ว่า postService มีจำนวนบรรทัดสูงที่สุดอยู่ที่ 359 บรรทัด ลองลงมาคือ postRepository, linkedList, accountRepository, accountService และ imageRepository โดยมีค่า 166, 137, 93, 92 และ 59 ตามลำดับ

**การประเมิณข้อผิดพลาดโดยประมาณจากการใช้งาน**

![image.png](/.attachments/image-d2cfd445-e091-40ac-b5b3-ebcf473445bd.png)

จะเห็นได้ว่า postService มีข้อผิดพลาดโดยประมาณจากการใช้งานสูงที่สุดอยู่ที่ 3.43 ลองลงมาคือ postRepository, linkedList, accountRepository, accountService และ imageRepository โดยมีค่า 1.23, 0.8, 0.63, 0.48 และ 0.45 ตามลำดับ

**การประเมิณโอกาสเกิดข้อผิดพลาด**

![image.png](/.attachments/image-a4e2f9fb-d8aa-4365-a333-5e4c8d6ba8f4.png)

จะเห็นได้ว่า postService มีโอกาสเกิดข้อผิดพลาดสูงที่สุดอยู่ที่ 51 ลองลงมาคือ postRepository, accountService  imageRepository, accountRepository และ linkedList โดยมีค่า 24, 21, 18, 15 และ 14 ตามลำดับ

**สรุปในรูปแบบตาราง**

| **File Name** | **Maintainability** | **Lines of Code** | **Difficulty** | **Estimated Errors** |
|---------------|---------------------|-------------------|----------------|----------------------|
| **accountRepository.js** | **74.62** | **93** | **22.71** | **0.63** |
| **accountService.js** | **68.83** | **92** | **22.43** | **0.48** |
| **imageRepository.js** | **75.93** | **59** | **15.61** | **0.45** |
| **linkedList.js** | **68.73** | **137** | **61.20** | **0.80** |
| **postRepository.js** | **68.60** | **166** | **31.95** | **1.23** |
| **postService.js** | **65.78** | **359** | **64.64** | **3.43** |

## **Dynamic profiling**

![image.png](/.attachments/image-8bfe9b67-0561-4722-8226-8768a2edaed7.png)

แสดงให้เห็นว่าต้องใช้เวลาประมาณเท่าใดสำหรับแสดงผลหน้า Website ในแต่ละหน้า โดยเราได้มีการบันทึกผลดังนี้
- Loading 37 ms
- Rendering 41 ms
- Painting 7 ms
- Scripting 538 ms
- System 82 ms
- Total 727 ms

![image.png](/.attachments/image-edc0f7c8-ef85-4c45-8582-5e7fe7ed4ac6.png)

จากการ Audits ได้ผลดังนี้
เว็ปไซต์ SkillLink มีค่า Performance อยู๋ 81 ค่า Accessibility อยู่ท 79 Best Practices อยู่ 100 และ SEO อยู่ที่ 91 ตามลำดับ

## **สิ่งที่ยังไม่สมบูรณ์ใน Sprint ที่ 3**
สามารถแยกเป็น 2 หัวข้อใหญ่ ๆ ได้ดังนี้

ระบบ User Interface
1. หน้า User Interface ยังตอบสนองความต้องการได้ไม่ครบถ้วน ยังคงแสดงผลได้ไม่ถูกต้อง
2. การจัดระเบียบโค๊ดยังไม่ดีพอ

ระบบ Backend
1. ยังไม่สามารถรับมือกับ Error ที่อาจจะเกิดขึ้นได้ดีพอส่งผลให้ทำงานผิดพลาดถึงขั้นที่เว๊ปไซต์หยุดทำงานได้
2. โค๊ดมีความซับซ้อนสูง แก้ไขยาก ขยายต่อไปได้ยาก มีโอกาสเจอ Error จากโค๊ดสูง
3. บาง Method ไม่สามารถดึงประสิทธิภาพของ LinkedList ได้ไม่ดีพอ เนื่องจากต้องมีการใช้ toArray อยู่บ่อยครั้ง

## **Website Screenshorts**
- หน้า login
เมื่อเข้าใช้ในเว็บครั้งแรกจะมาอยู่ที่หน้าของLogin และเมื่อไม่มีบัญชีให้กดปุ่มRegister

![Image](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/5803b1f8-d714-432a-a172-343c2d394dd7?fileName=image.png)

- หน้า Register
เป็นการสมัครบัญชีเริ่มแรกเมื่อเข้าใช้ โดยเมื่อลงทะเบียนเสร็จจะกลับไปยังหน้า Login

![Image](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/fec04bde-f5bf-44b9-8465-446775f2dbba?fileName=image.png)

- หน้า edit post
เป็นการ edit post เฉพาะเจ้าของ ของpostนั้นๆ และเมื่อเสร็จจะกลับไปยังหน้าหลัก
![Image](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/c7c7ff97-735e-47ef-ab96-9ecd804e3229?fileName=image.png)

- หน้า Post Details เป็นหน้าที่บอกรายละเอียดของPostนั้นๆ และยังสามารถให้ Rating ของ Postนั้นได้ด้วยและเมื่อเสร็จถ้าเป็นเจ้าของ Postจะสามารถแก้ไขได้หรือจะกลับไปยังหน้า Home
![Image](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/6e78ed92-f421-4a52-b03a-4d397d8da7b0?fileName=image.png)

-หน้า Home โดยหน้านี้จะแบ่งออกเป็น 2 หน้า โดยจะมีของ Admin และ User
 -หน้า Home สำหรับ Admin จะสามารถลบ Post หรือ ลบRating ของ Post นั้นได้และยังลบ NewPost กับ OldPost ได้อีกด้วย

  ![Image](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/8a1fbdd6-4002-49ad-82d9-8cd0feee95c3?fileName=image.png)

 -หน้า Home สำหรับ User จะสามารถค้นหาหรือดูPost ที่ Rating สูงสุด 5 อันดับได้ตามลำดับ และยัง Post ได้ด้วย

![Image](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/23159ab7-0738-4386-9e19-ce6200c5f768?fileName=image.png)

## **สรุปการประชุมและคลิปวีดีโอ Retrospective ใน Sprint ที่ 3**
   จากที่กลุ่มของเราได้มีการประชุมผ่าน google meet ระบบออนไลน์ได้มีการพูดคุยเกี่ยวกับสิ่งที่ทุกคนได้ไปทำแล้วที่ทำได้ดี และคิดวา่าสามารุปรับปรุงอะไรที่จะมาทำในPhase ถัดไปเป็นการทำให้รับรู้ถึงปัญหาที่แต่ละคนกำลังเจอทุกคนจะได้สามารถช่วยเหลือกันแก้ไขให้ดีขึ้นได้ โดยใน Phaseนี้ ทุกคนมีความเห็นว่าทุกคนสามารถรับผิดชอบงานที่ได้รับมอบหมายให้เสร็จได้ทันเวลาครับ
### ปัญหาที่เจอระหว่างการทำงานใน Phase 3
การสื่อสารเกี่ยวกับ Commit Message ไม่ชัดเจน:
ทำให้เกิดความสับสนในการรับผิดชอบ Issue และล่าช้าในการ merge code  

**แนวทางแก้ไข:** กำหนดมาตรฐานการตั้งชื่อ Commit ที่ชัดเจน และตรวจสอบซึ่งกันและกันก่อน push

**การบริหารเวลาไม่ดีพอ:**  สมาชิกบางคนมีเวลาว่างไม่ตรงกัน ส่งผลให้งานบางส่วนล่าช้า  

**แนวทางแก้ไข:** วางแผนและแบ่งงานให้เหมาะสมกับตารางเวลาของแต่ละคน รวมถึงเริ่มงานให้เร็วขึ้นและปัญหาเกี่ยวกับ UI:เวลาที่มีน้อยทำให้ UI ยังไม่สมบูรณ์ มีบัคเล็กน้อย และบางส่วนไม่ตรงกับ Figma  

**แนวทางแก้ไข:** ปรับปรุง UI ให้ตรงกับ Figma และเพิ่มรอบตรวจสอบก่อนส่งงาน

### สิ่งที่ดำเนินการได้ดี

**การส่งมอบงานตามเวลาที่กำหนด:**  สมาชิกในทีมรับผิดชอบงานของตนเองได้ดี และส่งงานได้ตรงเวลา

**การทดสอบระบบ (Testing):** 1. ทดสอบครอบคลุมทุกกรณี ทั้งปกติและกรณีผิดพลาด2.Test ทั้งหมดผ่านครบ 100%
3.Coverage สูงกว่า 90% ทุกหมวดหมู่
    
**การทำงานร่วมกัน:** 1.แบ่งงานตามความถนัดของแต่ละคน 2.มีการช่วยเหลือกันเมื่อพบปัญหา
### สิ่งที่ต้องปรับปรุง

**การจัดสรรเวลาสำหรับ UI:**  
ใช้เวลาน้อยเกินไป ทำให้คุณภาพ UI ยังไม่ดีพอ  
**แนวทางแก้ไข:** จัดเวลาเฉพาะสำหรับ UI และทดสอบก่อนส่ง
**การสื่อสารไม่ต่อเนื่อง:**  
แม้จะมีการประชุมออนไลน์ แต่บางช่วงยังขาดการติดตามงาน  

**สิ่งที่จะนำไปปรับปรุงใน Phase 4 :** เพิ่มความถี่ในการประชุมผ่าน Discord เพื่อประสานงานและอัปเดตสถานะงาน วางแผน Scrum Meeting อย่างน้อย 2 ครั้งต่อสัปดาห์และแบ่งเวลาให้กับ UI อย่างเหมาะสม และทบทวนงานให้ตรงกับ Figma มากขึ้น แล้วเพิ่ม edge case และ integration test ใน Sprint ถัดไป

**Link การประชุม Retrospective ใน Sprint ที่ 3**
https://www.youtube.com/watch?v=1RbFEtS06U0
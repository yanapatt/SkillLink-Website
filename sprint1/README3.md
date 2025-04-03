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
| postService.test.js | `PostService - removeLastPost` | `should handle errors during the removal of the last post`                 | จัดการข้อผิดพลาดระหว่างการลบโพสต์สุดท้าย                                                          |







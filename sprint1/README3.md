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

| **Test Suite** | **Describe**        | **Test Unit**                                      | **Describe**                                   |
|---------------|---------------------|--------------------------------------------------|----------------------------------------------|
| LinkedList   | insertFirst         | เพิ่ม Node ที่จุดเริ่มต้นของ LinkedList          | เช็คว่าข้อมูลที่เพิ่มเข้ามาอยู่ลำดับแรกสุด  |
| LinkedList   | insertLast          | เพิ่ม Node ที่จุดท้ายของ LinkedList              | เช็คว่าข้อมูลที่เพิ่มเข้ามาอยู่ลำดับสุดท้าย |
| LinkedList   | removeByPostTitle   | ลบ Node ที่มี postTitle ตรงกับค่าที่กำหนด       | ตรวจสอบว่า Node ถูกลบออกจาก LinkedList   |
| LinkedList   | removeByPostTitle   | แสดงข้อความแจ้งเตือนเมื่อไม่พบ postTitle        | ตรวจสอบว่า console.log แสดงข้อความที่ถูกต้อง |
| LinkedList   | removeFirst         | ไม่ทำอะไรเมื่อ LinkedList ว่าง                   | ตรวจสอบว่าไม่มีการเปลี่ยนแปลงเมื่อว่าง    |
| LinkedList   | removeFirst         | ลบ Node เดียวเมื่อมีเพียง 1 Node                 | ตรวจสอบว่า LinkedList ว่างหลังจากลบ     |
| LinkedList   | removeFirst         | ลบ Node แรกเมื่อมีหลาย Node                     | ตรวจสอบว่า Node ถัดไปกลายเป็นตัวแรกสุด  |
| LinkedList   | removeLast          | ไม่ทำอะไรเมื่อ LinkedList ว่าง                   | ตรวจสอบว่าไม่มีการเปลี่ยนแปลงเมื่อว่าง    |
| LinkedList   | removeLast          | ลบ Node เดียวเมื่อมีเพียง 1 Node                 | ตรวจสอบว่า LinkedList ว่างหลังจากลบ     |
| LinkedList   | removeLast          | ลบ Node สุดท้ายเมื่อมีหลาย Node                 | ตรวจสอบว่า Node ถัดจากสุดท้ายกลายเป็นตัวสุดท้าย |
| LinkedList   | removeLast          | อัปเดต tail ให้ถูกต้องหลังจากลบ Node สุดท้าย   | ตรวจสอบว่า tail ชี้ไปที่ Node ก่อนหน้าตัวที่ถูกลบ |
| LinkedList   | forEachNode         | ข้าม Node ที่มีค่า null หรือ undefined          | ตรวจสอบว่า callback ไม่ถูกเรียกใช้กับ null หรือ undefined |
| LinkedList   | forEachNode         | จัดการ error ใน callback function อย่างถูกต้อง  | ตรวจสอบว่า error ถูกจับและแสดงผลใน console.error |
| LinkedList   | toArray             | คืนค่าเป็น [] เมื่อ LinkedList ว่าง              | ตรวจสอบว่า array ที่ return เป็น []     |
| LinkedList   | toArray             | แปลง LinkedList เป็น array ได้อย่างถูกต้อง      | ตรวจสอบค่าใน array ว่าตรงกับข้อมูลที่เพิ่มเข้ามา |
| LinkedList   | getSize             | คืนค่าขนาดของ LinkedList อย่างถูกต้อง          | ตรวจสอบว่า getSize() ตรงกับจำนวน Node ที่มี |
| LinkedList   | isEmpty             | คืนค่า true เมื่อ LinkedList ว่าง                | ตรวจสอบว่า isEmpty() return true เมื่อไม่มี Node |
| LinkedList   | isEmpty             | คืนค่า false เมื่อ LinkedList มี Node           | ตรวจสอบว่า isEmpty() return false เมื่อมี Node |
| LinkedList   | map                 | ใช้ callback function เพื่อแปลงค่าของแต่ละ Node | ตรวจสอบว่า array ที่ return มีค่าที่แปลงแล้ว |
| LinkedList   | map                 | คืนค่า [] เมื่อ LinkedList ว่าง                  | ตรวจสอบว่า map() return [] เมื่อไม่มี Node |







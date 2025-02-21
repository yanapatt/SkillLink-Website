**SkillLink**

**จัดทำโดย**

นายพสุนธรา แป้นไผ่ รหัสนิสิต 66102010147 

นายญาณภัทร ปานเกษม รหัสนิสิต 66102010236 

นายแอนดี้ ทองขลิบ รหัสนิสิต 66102010247

**เสนอ**

ผู้ช่วยศาสตราจารย์ ดร. วีรยุทธ เจริญเรืองกิจ

**กลุ่ม** 

hunza

โครงงานนี้เป็นส่วนหนึ่งของการศึกษารายวิชา คพ252 วิศวกรรมซอฟต์แวร์ มหาวิทยาลัยศรีนครินทรวิโรฒ ภาคการศึกษาที่ 2 ปีการศึกษา 2567 



**Design and Prototype**

**Architectural design**
![Image](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/b8dd2702-f20b-4bf0-9c2e-7af9801c8057?fileName=image.png)
Class Diagram ที่แสดงโครงสร้างของระบบที่ใช้ Linked List ในการจัดการข้อมูลเกี่ยวกับ User และ Volunteer

**Use Case Diagram**
![Use_Case_Diagram.png](https://dev.azure.com/yanapattpankaseam/51ab0631-0619-4c9d-960d-e98a46ec2fb6/_apis/wit/attachments/cbc1a26b-f5eb-49e4-ac3c-de349ffcb95e?fileName=Use_Case_Diagram.png)
**คำอธิบาย Use Case Diagram** 

**ผู้ใช้ทั่วไป จะสามารถ**

1.  โพสต์รูปภาพและเขียนรายละเอียดเกี่ยวกับโพสต์ของตนเองได้
2.  ค้นหาอาสาสมัครและเลือกจับคู่กับอาสาสมัครที่สนใจได้
3.  ให้คะแนน Ratting แก่อาสาสมัครได้
4.  ล็อคอินเข้าสู่ระบบ ในฐานะ User

**อาสาสมัคจะสามารถ**

1.  กดรับ Order ที่ร้องขอจาก User ทั่วไปได้
2.  จัดการลำดับความสำคัญของงานแต่ละงาน และเลือกยืนยันหรือลบ Order ได้ (Endpoint)
3.  ล็อคอินเข้าสู่ระบบ ในฐานะ อาสาสมัคร

**UI Design**

ออกแบบ UI ด้วย Figma

หน้าที่ 1 Register

![image.png](/.attachments/image-38731cd2-27e9-445b-b2e9-fe5e27f83679.png)

หน้าที่ 2 Login

![image.png](/.attachments/image-daabba72-5648-4066-8548-fc423b167f2f.png)

หน้าที่ 3 Home

![image.png](/.attachments/image-8bf9b521-075b-46af-beea-14f0484e31ba.png)

หน้าที่ 4 Create Post

![image.png](/.attachments/image-6ff6ab0e-5d44-4612-872e-c1f5c846fa92.png)

หน้าที่ 5 Volunteen List

![image.png](/.attachments/image-1b7b9ff4-b48d-4215-9634-8704e2e34d5c.png)

หน้าที่ 6 Volunteen Detail

![image.png](/.attachments/image-6f652e8d-1079-4045-89ff-57b67c25f9e3.png)

หน้าที่ 7 Post

![image.png](/.attachments/image-00efa4dd-5a0e-4186-8199-5e51a078f3cd.png)

หน้าที่ 8 Manager (End Point)

![image.png](/.attachments/image-82fe0347-24cc-4754-8899-6e01499d552b.png)
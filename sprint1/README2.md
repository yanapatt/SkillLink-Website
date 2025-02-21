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

![image.png](/.attachments/image-e0d93d6c-e922-472c-8ac3-0a72750c2294.png)

หน้าที่ 2 Login

![image.png](/.attachments/image-df413f26-efa8-4d3f-bb4c-6022a0676767.png)

หน้าที่ 3 Home

![image.png](/.attachments/image-66489df5-fe4f-4b9f-b211-27e3a8aa366b.png)

หน้าที่ 4 Create Post

![image.png](/.attachments/image-156fdad6-6724-4bbf-b083-c4fb7904a32e.png)

หน้าที่ 5 Volunteen List

![image.png](/.attachments/image-45d38b2f-316b-4e26-971d-2e4f85fa3c52.png)

หน้าที่ 6 Volunteen Detail

![image.png](/.attachments/image-568eb76d-e128-4ab5-98a1-61da7e51b1df.png)

หน้าที่ 7 Post

![image.png](/.attachments/image-f97e908d-71dc-484a-b2f6-376779e7c82c.png)
หน้าที่ 8 Manager (End Point)

![image.png](/.attachments/image-4e5ae271-922b-478d-81d5-aa6e25580d68.png)
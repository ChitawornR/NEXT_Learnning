import { createConnect } from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

export async function getUsers(): Promise<User[]> {
  const db = await createConnect();

  const query = "SELECT * FROM users";
  const [rows] = await db.query<RowDataPacket[]>(query);

  return rows as User[];
}

export async function getUser(id: number): Promise<User | null> {
  const db = await createConnect();

  const query = "SELECT * FROM users WHERE id = ?";
  const [rows] = await db.query<RowDataPacket[]>(query, [id]); // [rows] คือ array ของ RowDataPacket[]

  const userRow = rows[0];

  // ตรวจสอบว่าพบผู้ใช้หรือไม่
  if (!userRow) {
    return null; // หรือ throw new Error('User not found'); ถ้าคุณไม่ต้องการให้เป็น null
  }

  // userRow ควรเป็น RowDataPacket ที่มีโครงสร้างตรงกับ User
  return userRow as User;
}

export async function createUser(user: NewUser): Promise<User> {
  const db = await createConnect();

  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  // แฮชรหัสผ่านก่อนเก็บ
  const hashedPassword = await bcrypt.hash(user.password, 10);

  // [result] คือ ResultSetHeader (มี insertId)
  const [result] = await db.query<ResultSetHeader>(query, [user.name, user.email, hashedPassword]);

  // 💡 แนะนำ: สร้าง User Object ใหม่ โดยเพิ่ม ID ที่เพิ่งถูกสร้างขึ้น
  const newUserWithId: User = {
    id: result.insertId,
    name: user.name,
    email: user.email,
    password: hashedPassword,
  };

  return newUserWithId;
}

export async function updateUser(user: User): Promise<User> {
  const db = await createConnect();

  const query = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";

  // หาก password ที่ส่งมาเป็น plaintext ให้แฮชก่อน (ถ้าเป็น hashed อยู่แล้ว ให้ข้าม)
  let passwordToStore = user.password;
  if (!passwordToStore.startsWith("$2")) {
    passwordToStore = await bcrypt.hash(passwordToStore, 10);
  }

  // result เป็น ResultSetHeader
  const [result] = await db.query<ResultSetHeader>(query, [user.name, user.email, passwordToStore, user.id]);

  // 💡 แนะนำ: ตรวจสอบว่ามีการอัปเดตเกิดขึ้นจริง
  if (result.affectedRows === 0) {
    // โยน Error หากไม่พบ User นั้น
    throw new Error(`User with ID ${user.id} not found or no changes were made.`);
  }

  // ⭐️ แนวทางปฏิบัติที่ดีที่สุด: เรียกข้อมูลที่อัปเดตแล้วกลับมา
  // เพื่อให้มั่นใจว่าข้อมูล (เช่น updatedAt timestamp) ตรงกับ DB
  // ต้องแน่ใจว่าฟังก์ชัน getUser(id) ถูก Import เข้ามาแล้ว
  const updatedUser = await getUser(user.id);
  
  if (updatedUser === null) {
      // โยน error หากอัปเดตสำเร็จแต่ดึงข้อมูลกลับมาไม่ได้ (ไม่น่าจะเกิดขึ้น)
      throw new Error("Failed to retrieve updated user.");
  }
  
  return updatedUser;
  // หากไม่ต้องการ Fetch ใหม่ ให้ return user; แต่ต้องรับความเสี่ยงเรื่องความไม่สมบูรณ์ของข้อมูล
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const db = await createConnect();
  const query = "SELECT * FROM users WHERE email = ?";
  const [rows] = await db.query<RowDataPacket[]>(query, [email]);
  return rows[0] as User | null;
}

export async function deleteUser(id: number): Promise<void> {
  const db = await createConnect();
  
  // 💡 การตรวจสอบ ID ก่อนเริ่ม Query
  if (typeof id !== 'number' || isNaN(id) || id <= 0) {
    throw new Error(`Invalid ID for deletion: ${id}`);
  }

  const query = "DELETE FROM users WHERE id = ?";
  await db.query(query, [id]);
}
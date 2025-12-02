import { getUser, deleteUser, updateUser } from "@/app/lib/users";
import { NextResponse } from "next/server";

//  Helper function to safely parse ID and handle errors
function getUserId(idParam: string): number | null {
  const id = parseInt(idParam);
  // ตรวจสอบว่า id เป็นตัวเลขที่ถูกต้องหรือไม่ (Number(params.id) อาจคืนค่า NaN)
  if (isNaN(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  const ids = getUserId(id);

  if (ids === null) {
    return NextResponse.json(
      { message: "Invalid user ID format" },
      { status: 400 }
    );
  }

  const user = await getUser(ids);

  // ✅ จัดการกรณีที่ User ไม่ถูกพบ (null)
  if (!user) {
    return NextResponse.json(
      { message: `User with ID ${ids} not found` },
      { status: 404 }
    );
  }

  // ลบ password ออกก่อนส่งกลับไปหา Client เพื่อความปลอดภัย
  const { password, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ids = getUserId(id);

  if (ids === null) {
    return NextResponse.json(
      { message: "Invalid user ID format" },
      { status: 400 }
    );
  }

  // 1. ตรวจสอบว่าผู้ใช้มีอยู่จริงก่อนลบ
  const existingUser = await getUser(ids);
  if (!existingUser) {
    return NextResponse.json(
      { message: `User with ID ${ids} not found` },
      { status: 404 }
    );
  }

  // 2. ✅ ทำการลบผู้ใช้
  await deleteUser(ids);

  // 3. ✅ คืนค่า 204 No Content เพื่อบ่งชี้ว่าลบสำเร็จ
  return new NextResponse(null, { status: 204 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const {id } = await params
  const ids = getUserId(id);

  if (ids === null) {
    return NextResponse.json(
      { message: "Invalid user ID format" },
      { status: 400 }
    );
  }

  // 1. ✅ อ่าน Body ของ Request เพื่อรับข้อมูลอัปเดต
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json(
      { message: "Invalid JSON body provided" },
      { status: 400 }
    );
  }

  // 2. ตรวจสอบว่าผู้ใช้มีอยู่จริงก่อนอัปเดต
  const existingUser = await getUser(ids);
  if (!existingUser) {
    return NextResponse.json(
      { message: `User with ID ${id} not found` },
      { status: 404 }
    );
  }

  // 3. ✅ ผสานข้อมูลเดิมกับข้อมูลใหม่เพื่อสร้าง User Object ที่สมบูรณ์สำหรับการอัปเดต
  const userToUpdate = {
    id: ids,
    name: body.name || existingUser.name,
    email: body.email || existingUser.email,
    password: body.password || existingUser.password,
  };

  try {
    // 4. ✅ ส่ง User Object ใหม่ที่มี ID, name, email, password ไปอัปเดต
    const userUpdated = await updateUser(userToUpdate);

    // ลบ password ออกก่อนส่งกลับไปหา Client เพื่อความปลอดภัย
    const { password, ...safeUserUpdated } = userUpdated;
    return NextResponse.json(safeUserUpdated, { status: 200 });
  } catch (error) {
    // จัดการข้อผิดพลาดที่มาจาก updateUser (เช่น DB Error)
    console.error("Update failed:", error);
    return NextResponse.json(
      { message: "Update failed due to server error" },
      { status: 500 }
    );
  }
}

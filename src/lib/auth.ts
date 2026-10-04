import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  school: string | null;
  subjects: string | null;
  grades: string | null;
}

const SESSION_COOKIE_NAME = "edumind_session_id";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
      const user = await prisma.user.findUnique({
        where: { id: sessionId },
      });
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          school: user.school,
          subjects: user.subjects,
          grades: user.grades,
        };
      }
    }

    // Default fallback to first teacher in DB so the demo works smoothly
    const defaultTeacher = await prisma.user.findFirst();
    if (defaultTeacher) {
      return {
        id: defaultTeacher.id,
        name: defaultTeacher.name,
        email: defaultTeacher.email,
        role: defaultTeacher.role,
        avatar: defaultTeacher.avatar,
        school: defaultTeacher.school,
        subjects: defaultTeacher.subjects,
        grades: defaultTeacher.grades,
      };
    }

    return null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

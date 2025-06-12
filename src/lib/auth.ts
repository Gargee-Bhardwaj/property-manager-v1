import { cookies } from "next/headers";

export type User = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  is_active?: boolean;
  is_superuser?: boolean;
};

export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");

    if (!userCookie?.value) {
      return null;
    }

    return JSON.parse(userCookie.value);
  } catch (error) {
    return null;
  }
}

"use server";

import { CurrencyProps } from "../components/Forms/ChangeLocalCurrencyForm";

import { isEmailBlacklisted } from "../lib/isEmailBlackListed";


import db from "@/app/lib/db";
import { UserProps } from "../types/types";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { hash } from "@node-rs/argon2"; // <-- node-rs argon2



export async function createUser(data: UserProps) {
  const {
    email,
    password,
    firstName,
    lastName,
    name,
    phone,
    image,
    roleproject,
    country,
    location,
    userId,
    companyDescription,
    companyName,
    clientType,
    username, // <-- artık username zorunlu
  } = data;

  try {
    // Email blacklist kontrolü
    if (isEmailBlacklisted(email)) {
      return {
        error: `Lütfen geçerli, geçici olmayan bir e-posta adresi kullanın.`,
        status: 409,
        data: null,
      };
    }

    // Şifreyi Argon2 ile hashle
    const hashedPassword = await hash(password);

    // Email zaten varsa hata döndür
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return {
        error: `Bu e-posta zaten kayıtlı`,
        status: 409,
        data: null,
      };
    }

    // Yeni kullanıcı oluştur
    const newUser = await db.user.create({
      data: {
        id: randomUUID(),
        email,
        passwordHash: hashedPassword, // passwordHash alanına kaydediyoruz
        plain: roleproject === "CLIENT" ? password : "",
        firstName,
        lastName,
        name,
        phone,
        image,
        roleproject,
        country,
        location,
        userId,
        companyDescription,
        companyName,
        clientType,
        username, // username ekledik
      },
    });

    // Cache'i revalidate et
    revalidatePath("/oneproject/dashboard/clients");
    revalidatePath("/oneproject/dashboard/users");

    return {
      error: null,
      status: 200,
      data: newUser,
    };
  } catch (error) {
    console.log(error);
    return {
      error: `Bir şeyler ters gitti, lütfen tekrar deneyin`,
      status: 500,
      data: null,
    };
  }
}




export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        projects: true,
      },
    });
    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Acentenin kullanıcıları (acente bazlı kullanıcı yönetimi). */
export async function getAgencyUsers(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const users = await db.user.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      include: { projects: true },
    });
    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function deleteUser(id: string) {
  try {
    const deletedUser = await db.user.delete({
      where: {
        id,
      },
    });
    revalidatePath("/oneproject/dashboard/users");
    return {
      ok: true,
      data: deletedUser,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
  }
}



export type ExistingUser = {
  id: string;
  name: string;
  email: string;
  username:string;
};



export async function getExistingUsers() {
  try {
    const users = await db.user.findMany({
      where: {
        roleGayrimenkul: "AGENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username:true
      },
    });
    return users;
  } catch (error) {
    console.log(error);
  }
}

 export async function updateUserById(id: string, data: UserProps) {
   try {
     const updatedUser = await db.user.update({
       where: {
         id,
       },
       data,
     });
        revalidatePath("/oneproject/dashboard/clients");
     return updatedUser;
   } catch (error) {
     console.log(error);
   }
 }


// export async function updateUserPassword(id: string, data: PasswordProps) {
//   const existingUser = await db.user.findUnique({
//     where: {
//       id,
//     },
//   });
//   // Check if the Old Passw = User Pass
//   let passwordMatch: boolean = false;
//   //Check if Password is correct
//   if (existingUser && existingUser.passwordHash) {
//     // if user exists and password exists
//     passwordMatch = await compare(data.oldPassword, existingUser.passwordHash);
//   }
//   if (!passwordMatch) {
//     return { error: "Old Password Incorrect", status: 403 };
//   }
//   const hashedPassword = await bcrypt.hash(data.newPassword, 10);
//   try {
//     const updatedUser = await db.user.update({
//       where: {
//         id,
//       },
//       data: {
//         password: hashedPassword,
//       },
//     });
//     revalidatePath("/dashboard/clients");
//     return { error: null, status: 200 };
//   } catch (error) {
//     console.log(error);
//   }
// }



export async function updateLocalCurrency(id: string, data: CurrencyProps) {
  const existingUser = await db.user.findUnique({
    where: {
      id,
    },
  });
  // Check if the Old Passw = User Pass
  if (!existingUser) {
    return { error: "No User Found", status: 403 };
  }
  try {
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        localCurrency: data.localCurrency,
        defaultCurrency: data.defaultCurrency,
      },
    });
     revalidatePath("/oneproject/dashboard/currency");
    return { error: null, status: 200 };
  } catch (error) {
    console.log(error);
  }
}
